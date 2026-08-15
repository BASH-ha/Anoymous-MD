const axios = require('axios');

async function facebookCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let url = '';

        if (quoted?.conversation) {
            url = quoted.conversation.trim();
        } else if (quoted?.extendedTextMessage?.text) {
            url = quoted.extendedTextMessage.text.trim();
        } else {
            const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
            const args = text.split(' ');
            if (args.length > 1) {
                url = args[1].trim();
            }
        }

        if (!url || !url.includes('facebook.com') && !url.includes('fb.watch')) {
            return await sock.sendMessage(chatId, {
                text: '❌ Please provide a valid Facebook video URL.\nExample: .facebook https://www.facebook.com/...'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

        // Try multiple APIs
        let videoUrl = null;
        let title = 'Facebook Video';

        try {
            const apiUrls = [
                `https://api.siputzx.my.id/api/dl/fb?url=${encodeURIComponent(url)}`,
                `https://api.akuari.my.id/downloader/facebook?url=${encodeURIComponent(url)}`
            ];

            for (const apiUrl of apiUrls) {
                try {
                    const response = await axios.get(apiUrl, { timeout: 15000 });
                    if (response.data?.data?.url || response.data?.result?.url || response.data?.video) {
                        videoUrl = response.data.data?.url || response.data.result?.url || response.data.video;
                        title = response.data.title || 'Facebook Video';
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
        } catch (e) {
            console.error('Facebook API error:', e.message);
        }

        if (!videoUrl) {
            return await sock.sendMessage(chatId, {
                text: '❌ Failed to download video. Please try another link.'
            }, { quoted: message });
        }

        // Download and send
        try {
            const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 });
            await sock.sendMessage(chatId, {
                video: Buffer.from(videoBuffer.data),
                mimetype: 'video/mp4',
                caption: `📹 *${title}*\n\nDownloaded by Anoymous MD`
            }, { quoted: message });
        } catch (downloadError) {
            // Fallback: send as link
            await sock.sendMessage(chatId, {
                text: `✅ Download link: ${videoUrl}`
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('Facebook command error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to process Facebook video. Please try again later.'
        }, { quoted: message });
    }
}

module.exports = facebookCommand;