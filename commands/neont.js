/**
 * .neont – Create a colorful neon light text effect
 * Adapted from Crynova for Anoymous MD
 */
const mumaker = require('mumaker');

async function neontCommand(sock, chatId, message, args) {
    try {
        const text = args.join(' ');

        if (!text) {
            await sock.sendMessage(chatId, {
                text: `❌ *Provide text*\n\nUsage: .neont <text>\nExample: .neont Anoymous`
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { react: { text: '💫', key: message.key } });

        // Generate neon text effect
        const result = await mumaker.ephoto('https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html', text);

        if (!result || !result.image) {
            throw new Error('No image URL received from the API');
        }

        await sock.sendMessage(chatId, {
            image: { url: result.image },
            caption: `✨ *Neon Text Effect*\n\nText: ${text}`
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '🌟', key: message.key } });

    } catch (err) {
        console.error('[NEONT ERROR]', err.message);
        await sock.sendMessage(chatId, {
            text: `❌ Failed to generate neon text: ${err.message}`
        }, { quoted: message });
    }
}

module.exports = neontCommand;