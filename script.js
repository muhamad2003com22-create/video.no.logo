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

// یارمەتیدەر بۆ ڕێکخستنی لینکەکە
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

// فەنکشنی زۆرەملێکردنی داونلۆد بۆ ئەوەی ڕاستەوخۆ دابەزێت نەک بکرێتەوە
async function forceDownload(url, button, label) {
    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> تکایە چاوەڕێ بکە...';
    button.style.pointerEvents = 'none';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response error");
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `Video_${Date.now()}.mp4`; // ناوی فایلەکە
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
        // ئەگەر بەهۆی سکیوریتی (CORS) سێرڤەرەکەی یوتیوبەوە بلۆک کرا، ئەوا ڕاستەوخۆ دەیکاتەوە
        console.warn("Direct download blocked by CORS, falling back to new tab.", err);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = `Video_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } finally {
        button.innerHTML = originalHtml;
        button.style.pointerEvents = 'auto';
    }
}

function renderResult(data) {
    downloadOptions.innerHTML = '';
    
    videoTitle.textContent = data.title || "ڤیدیۆکە ئامادەیە!";
    videoDesc.textContent = "ئێستا دەتوانیت ڕاستەوخۆ ڤیدیۆکە دابەزێنیت.";

    let hasVideo = false;
    
    if (data.medias && data.medias.length > 0) {
        let videos = data.medias.filter(m => m.type === 'video' && m.quality !== 'audio');
        videos.sort((a, b) => getQualityScore(b) - getQualityScore(a));

        if (videos.length > 0) {
            hasVideo = true;
            videos.forEach((video, index) => {
                const button = document.createElement('button');
                
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
                
                button.addEventListener('click', () => forceDownload(video.url, button, label));
                downloadOptions.appendChild(button);
            });
        }
    } 
    
    if (!hasVideo && data.url) {
        hasVideo = true;
        const button = document.createElement('button');
        button.className = 'download-btn primary';
        button.innerHTML = '<i class="fa-solid fa-download"></i> داگرتن بە بەرزترین کوالیتی';
        button.addEventListener('click', () => forceDownload(data.url, button, 'HD'));
        downloadOptions.appendChild(button);
    }

    if (!hasVideo) {
        showError("نەتوانرا لینکی ڤیدیۆکە بدۆزرێتەوە لەناو داتاکەدا.");
        return;
    }

    resultSection.classList.remove('hidden');
}
