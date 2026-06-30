const form = document.getElementById('download-form');
const urlInput = document.getElementById('video-url');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.querySelector('.btn-text');
const btnIcon = document.querySelector('.btn-icon');
const loader = document.querySelector('.loader');

const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

const resultSection = document.getElementById('result-section');
const downloadOptions = document.getElementById('download-options');
const videoTitle = document.getElementById('video-title');
const videoDesc = document.getElementById('video-desc');

function formatUrl(url) {
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
        if (formattedUrl.startsWith('youtube.com') || formattedUrl.startsWith('youtu.be') || formattedUrl.startsWith('tiktok.com') || formattedUrl.startsWith('instagram.com') || formattedUrl.startsWith('facebook.com') || formattedUrl.startsWith('twitter.com') || formattedUrl.startsWith('x.com')) {
            formattedUrl = 'https://www.' + formattedUrl;
        } else if (formattedUrl.startsWith('www.')) {
            formattedUrl = 'https://' + formattedUrl;
        } else {
            formattedUrl = 'https://' + formattedUrl;
        }
    }
    return formattedUrl;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let rawUrl = urlInput.value;
    if (!rawUrl) return;

    const finalUrl = formatUrl(rawUrl);
    urlInput.value = finalUrl;

    setLoading(true);
    hideError();
    resultSection.classList.add('hidden');

    try {
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '9ef8751e16msh4319c8141f8d539p1d8ce0jsn031deca0bbea',
                'x-rapidapi-host': 'download-all-in-one-lite.p.rapidapi.com'
            }
        };

        const apiUrl = `https://download-all-in-one-lite.p.rapidapi.com/autolink?url=${encodeURIComponent(finalUrl)}`;
        const response = await fetch(apiUrl, options);
        const result = await response.json();
        
        console.log("API Response:", result);

        if (!response.ok || result.error) {
            throw new Error(result.message || "هەڵەیەک ڕوویدا لە هێنانی ڤیدیۆکە.");
        }

        renderResult(result);
    } catch (err) {
        showError(err.message || "نەتوانرا پەیوەندی بە سێرڤەرەوە بکرێت. دڵنیابە لە ئینتەرنێتەکەت.");
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    if (isLoading) {
        btnText.classList.add('hidden');
        btnIcon.classList.add('hidden');
        loader.classList.remove('hidden');
        submitBtn.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        btnIcon.classList.remove('hidden');
        loader.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

function showError(msg) {
    errorText.textContent = msg;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function getQualityScore(media) {
    if (media.type !== 'video' || media.quality === 'audio') return -1;
    const label = (media.label || media.quality || "").toLowerCase();
    const match = label.match(/(\d+)p/);
    if (match) {
        return parseInt(match[1]); 
    }
    return 0; 
}

function renderResult(data) {
    downloadOptions.innerHTML = '';
    
    videoTitle.textContent = data.title || "ڤیدیۆکە ئامادەیە!";
    // ڕێنمایی بۆ بەکارهێنەر ئەگەر ڤیدیۆکە کرایەوە
    videoDesc.innerHTML = "ڤیدیۆکە ئامادەیە بۆ داگرتن.<br><span style='color: #fbbf24; font-size: 0.9em; display: inline-block; margin-top: 5px;'><i class='fa-solid fa-circle-info'></i> تێبینی: ئەگەر ڤیدیۆکە کرایەوە، کلیک لە سێ خاڵەکە (⋮) بکە لە خوارەوە بۆ داگرتنی.</span>";

    let hasVideo = false;
    
    if (data.medias && data.medias.length > 0) {
        let videos = data.medias.filter(m => m.type === 'video' && m.quality !== 'audio');
        videos.sort((a, b) => getQualityScore(b) - getQualityScore(a));

        if (videos.length > 0) {
            hasVideo = true;
            videos.forEach((video, index) => {
                const button = document.createElement('a');
                button.href = video.url;
                button.target = '_blank';
                // هەوڵی داونلۆدکردن دەدات، ئەگەر براوسەر ڕێگەی نەدا دەیکاتەوە
                button.setAttribute('download', 'video.mp4'); 
                
                let label = video.label || video.quality || 'بەرزترین کوالیتی';
                if (index === 0) {
                    button.className = 'download-btn primary';
                    button.innerHTML = `<i class="fa-solid fa-star"></i> داگرتن بە بەرزترین کوالیتی (${label})`;
                } else {
                    button.className = 'download-btn';
                    button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    button.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    button.innerHTML = `<i class="fa-solid fa-download"></i> داگرتن بە کوالیتی نزمتر (${label})`;
                }
                
                downloadOptions.appendChild(button);
            });
        }
    } 
    
    if (!hasVideo && data.url) {
        hasVideo = true;
        const button = document.createElement('a');
        button.href = data.url;
        button.target = '_blank';
        button.setAttribute('download', 'video.mp4'); 
        button.className = 'download-btn primary';
        button.innerHTML = '<i class="fa-solid fa-download"></i> داگرتن بە بەرزترین کوالیتی';
        downloadOptions.appendChild(button);
    }

    if (!hasVideo) {
        showError("نەتوانرا لینکی ڤیدیۆکە بدۆزرێتەوە لەناو داتاکەدا.");
        return;
    }

    resultSection.classList.remove('hidden');
}

// -----------------------------------------
// PWA Custom Install Banner Logic
// -----------------------------------------
let deferredPrompt;
const pwaBanner = document.getElementById('pwa-install-banner');
const installBtn = document.getElementById('pwa-install-btn');
const dismissBtn = document.getElementById('pwa-dismiss');

// گرتنی ئیڤێنتەکە ئەگەر لەسەر ئینتەرنێت بوو
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// پیشاندانی بانەرەکە بە زۆرەملێ تەنانەت ئەگەر لەسەر فایلی لۆکاڵیش بێت بۆ بینینی دیزاینەکە
setTimeout(() => {
    if (!localStorage.getItem('pwa-dismissed')) {
        pwaBanner.classList.remove('hidden');
        setTimeout(() => pwaBanner.classList.add('show'), 50);
    }
}, 3000);

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        pwaBanner.classList.remove('show');
        setTimeout(() => pwaBanner.classList.add('hidden'), 500);
    } else {
        // ئەگەر لەسەر فایلی لۆکاڵ بوو (file://)
        alert('بۆ ئەوەی وەک ئەپ دابەزێت، پێویستە ئەم وێبسایتە لەسەر ئینتەرنێت بێت (یان هۆست بکرێت). لەسەر کۆمپیوتەر بە فایلی ئاسایی کار ناکات چونکە سکیوریتی براوسەر ڕێگە نادات!');
        pwaBanner.classList.remove('show');
        setTimeout(() => pwaBanner.classList.add('hidden'), 500);
    }
});

dismissBtn.addEventListener('click', () => {
    pwaBanner.classList.remove('show');
    setTimeout(() => pwaBanner.classList.add('hidden'), 500);
    localStorage.setItem('pwa-dismissed', 'true');
});
