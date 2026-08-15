/**
 * .purplet – Create a purple text effect
 * Adapted from Crynova for Anoymous MD
 */
const mumaker = require('mumaker');

async function purpletCommand(sock, chatId, message, args) {
    try {
        const text = args.join(' ');

        if (!text) {
            await sock.sendMessage(chatId, {
                text: `❌ *Provide text*\n\nUsage: .purplet <text>\nExample: .purplet Anoymous`
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { react: { text: '💜', key: message.key } });

        const result = await mumaker.ephoto('https://en.ephoto360.com/purple-text-effect-online-100.html', text);

        if (!result || !result.image) {
            throw new Error('No image URL received from the API');
        }

        await sock.sendMessage(chatId, {
            image: { url: result.image },
            caption: `💜 *Purple Text Effect*\n\nText: ${text}`
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '🟣', key: message.key } });

    } catch (err) {
        console.error('[PURPLET ERROR]', err.message);
        await sock.sendMessage(chatId, {
            text: `❌ Failed to generate purple text: ${err.message}`
        }, { quoted: message });
    }
}

module.exports = purpletCommand;