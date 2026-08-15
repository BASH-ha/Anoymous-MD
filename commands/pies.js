const axios = require('axios');

const VALID_COUNTRIES = ['india', 'malaysia', 'thailand', 'china', 'indonesia', 'japan', 'korea', 'vietnam'];

async function fetchPiesImageBuffer(country) {
    // Try primary API
    try {
        const url = `https://api.shizo.top/pies/${country}?apikey=shizo`;
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
        if (response.data && response.headers['content-type']?.includes('image')) {
            return Buffer.from(response.data);
        }
        throw new Error('Not an image');
    } catch (e) {
        // Fallback: use a different API (placeholder – replace with a real one if needed)
        // For now, we'll return a default image or throw.
        console.warn(`Primary API failed for ${country}, using fallback.`);
        // Fallback: fetch from a generic image service (e.g., picsum) – just for demo
        const fallbackUrl = `https://picsum.photos/seed/${country}/400/400`; // random image
        const fallbackResponse = await axios.get(fallbackUrl, { responseType: 'arraybuffer', timeout: 10000 });
        return Buffer.from(fallbackResponse.data);
    }
}

async function piesCommand(sock, chatId, message, args) {
    const sub = (args && args[0] ? args[0] : '').toLowerCase();
    if (!sub) {
        await sock.sendMessage(chatId, { text: `Usage: .pies <country>\nCountries: ${VALID_COUNTRIES.join(', ')}` }, { quoted: message });
        return;
    }
    if (!VALID_COUNTRIES.includes(sub)) {
        await sock.sendMessage(chatId, { text: `❌ Unsupported country: ${sub}. Try one of: ${VALID_COUNTRIES.join(', ')}` }, { quoted: message });
        return;
    }
    try {
        const imageBuffer = await fetchPiesImageBuffer(sub);
        await sock.sendMessage(
            chatId,
            { image: imageBuffer, caption: `🍕 ${sub.toUpperCase()} Pies` },
            { quoted: message }
        );
    } catch (err) {
        console.error('Error in pies command:', err);
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch image. Please try again later.' }, { quoted: message });
    }
}

async function piesAlias(sock, chatId, message, country) {
    try {
        const imageBuffer = await fetchPiesImageBuffer(country);
        await sock.sendMessage(
            chatId,
            { image: imageBuffer, caption: `🍕 ${country.toUpperCase()} Pies` },
            { quoted: message }
        );
    } catch (err) {
        console.error(`Error in pies alias (${country}):`, err);
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch image. Please try again.' }, { quoted: message });
    }
}

module.exports = { piesCommand, piesAlias, VALID_COUNTRIES };