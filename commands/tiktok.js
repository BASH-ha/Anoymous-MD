/**
 * .tiktok – Download TikTok videos without watermark
 * Adapted from Crynova for Anoymous MD
 */
const axios = require('axios');

async function tiktokCommand(sock, chatId, message, args) {
    try {
        let url = args[0]?.trim();

        // Check if replying to a message with TikTok URL
        if (!url || !url.includes('tiktok.com')) {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                const quotedText = quoted.conversation || quoted.extendedTextMessage?.text || '';
                const urlMatch = quotedText.match(/(https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+)/);
                if (urlMatch) url = urlMatch[0];
            }
        }

        if (!url || !url.includes('tiktok.com')) {
            await sock.sendMessage(chatId, {
                text: '❌ *Provide a valid TikTok URL!*\n\n' +
                      'Example:\n' +
                      '`.tt https://www.tiktok.com/@user/video/123456789`\n' +
                      '`.tt https://vt.tiktok.com/ZSxxxxxx/`\n\n' +
                      '📱 _Or reply to a message with a TikTok link_'
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { react: { text: '🎵', key: message.key } });

        // Send progress message
        const progressMsg = await sock.sendMessage(chatId, {
            text: `🎵 *Fetching TikTok...*\n\n▰▱▱▱▱▱▱▱▱▱ 0%\n\n🔍 Resolving URL...`
        });

        const updateProgress = async (percent, phase) => {
            const filled = Math.round(percent / 10);
            const bar = '▰'.repeat(filled) + '▱'.repeat(10 - filled);
            await sock.sendMessage(chatId, {
                text: `🎵 *Fetching TikTok...*\n\n${bar} ${percent}%\n\n🔍 ${phase}`,
                edit: progressMsg.key
            });
        };

        await updateProgress(15, 'Connecting to API...');

        // API list
        const apis = [
            // API 1: TikWM
            async () => {
                const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
                    timeout: 45000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const data = res.data?.data;
                return {
                    video: data?.play,
                    music: data?.music,
                    title: data?.title,
                    author: data?.author?.unique_id,
                    likes: data?.digg_count
                };
            },
            // API 2: TiklyDown
            async () => {
                const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, {
                    timeout: 45000
                });
                const data = res.data;
                return {
                    video: data?.video?.noWatermark,
                    music: data?.music?.play,
                    title: data?.title,
                    author: data?.author?.unique_id,
                    likes: data?.stats?.likeCount
                };
            },
            // API 3: tiktokdownload.online
            async () => {
                const res = await axios.get(`https://tiktokdownload.online/api/tiktok?url=${encodeURIComponent(url)}`, {
                    timeout: 45000
                });
                return {
                    video: res.data?.data?.play
                };
            }
        ];

        let result = null;
        let apiIndex = 0;

        for (const api of apis) {
            apiIndex++;
            try {
                await updateProgress(20 + (apiIndex * 20), `Trying API ${apiIndex}...`);
                const data = await api();
                if (data?.video) {
                    result = data;
                    break;
                }
            } catch (err) {
                console.log('[TIKTOK API FAILED]', err.response?.status || err.message);
            }
        }

        if (!result || !result.video) {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            await sock.sendMessage(chatId, {
                text: '❌ All APIs failed. Try again later.',
                edit: progressMsg.key
            });
            return;
        }

        await updateProgress(75, 'Downloading video...');

        const caption =
            `🎵 *TikTok Downloader*\n\n` +
            `Title: ${result.title || 'Untitled'}\n` +
            `Author: @${result.author || 'Unknown'}\n` +
            `Likes: ${result.likes || 'N/A'}\n` +
            `Downloaded by *Anoymous MD*`;

        await updateProgress(90, 'Processing...');
        await updateProgress(100, 'Done!');
        await new Promise(r => setTimeout(r, 400));

        // Delete progress message
        await sock.sendMessage(chatId, { delete: progressMsg.key });

        // Send video
        await sock.sendMessage(chatId, {
            video: { url: result.video },
            mimetype: 'video/mp4',
            caption,
            fileName: 'tiktok-video.mp4'
        }, { quoted: message });

        // Send audio if available
        if (result.music) {
            await sock.sendMessage(chatId, {
                audio: { url: result.music },
                mimetype: 'audio/mp4'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (error) {
        console.error('TikTok error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to process TikTok video. Please try again later.'
        }, { quoted: message });
    }
}

module.exports = tiktokCommand;