/**
 * .apk – Download APK files
 * Adapted from Crynova for Anoymous MD
 */
const axios = require('axios');

async function apkCommand(sock, chatId, message, args) {
    try {
        const query = args.join(' ').trim();

        if (!query) {
            await sock.sendMessage(chatId, {
                text: '❌ *Provide app name*\n_Example: .apk whatsapp_'
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });

        await sock.sendMessage(chatId, {
            text: '⏳ _Searching for APK..._'
        }, { quoted: message });

        // Kord APK Search API
        const searchApi = `https://api.kord.live/api/apk?q=${encodeURIComponent(query)}`;
        const searchRes = await axios.get(searchApi, { timeout: 30000 });
        const data = searchRes.data;

        if (!data || data.error) {
            await sock.sendMessage(chatId, {
                text: '❌ _APK not found._'
            }, { quoted: message });
            return;
        }

        const appName = data.app_name || query;
        const downloadLink = data.download_url;

        if (!downloadLink) {
            await sock.sendMessage(chatId, {
                text: '❌ _Download link not found._'
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, {
            text: `✅ Found *${appName}*\n⏳ Downloading APK...`
        }, { quoted: message });

        // Download APK file
        const fileRes = await axios.get(downloadLink, {
            responseType: 'arraybuffer',
            timeout: 120000
        });

        const buffer = Buffer.from(fileRes.data);

        if (!buffer.length) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to download APK.'
            }, { quoted: message });
            return;
        }

        // 250MB Limit
        const maxSize = 250 * 1024 * 1024;
        if (buffer.length > maxSize) {
            await sock.sendMessage(chatId, {
                text: '❌ APK too large (Max 250MB).'
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, {
            document: buffer,
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${appName}.apk`,
            caption: `╭─❍ *APK DOWNLOADER*\n│ ✦ ${appName}\n╰────────────────`
        }, { quoted: message });

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (err) {
        console.error('[APK ERROR]', err.message);
        await sock.sendMessage(chatId, {
            text: `❌ APK download failed\nReason: ${err.message}`
        }, { quoted: message });
    }
}

module.exports = apkCommand;