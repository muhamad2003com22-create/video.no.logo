/**
 * Fetches the video download URL from Cobalt API
 * @param {string} url - The URL of the social media video
 * @returns {Promise<Object>} - The JSON response from Cobalt
 */
async function fetchCobaltVideo(url) {
    const apiUrl = 'https://api.cobalt.tools/api/json';
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Cobalt API error:", error);
        throw error;
    }
}
