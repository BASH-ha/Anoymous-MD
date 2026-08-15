const yts = require('yt-search');
const axios = require('axios');

const BOT_IMAGE = 'https://files.catbox.moe/vpj3vt.jpg';

// Fallback MP3 APIs (tries one by one)
const AUDIO_APIS = [
    url => `https://apis-keith.vercel.app/download/dlmp3?url=${url}`,
    url => `https://api.giftedtech.my.id/api/download/ytmp3?url=${url}`,
    url => `https://api.davidcyriltech.my.id/download/ytmp3?url=${url}`
];

async function playCommand(sock, chatId, message) {
    try {
        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            '';

        const query = text.split(' ').slice(1).join(' ').trim();
        if (!query) {
            return sock.sendMessage(chatId, {
                text: '🎵 Tell me the song name'
            });
        }

        // Search YouTube
        const { videos } = await yts(query);
        if (!videos || !videos.length) {
            return sock.sendMessage(chatId, {
                text: '❌ No results found'
            });
        }

        const video = videos[0];
        const ytUrl = video.url;

        await sock.sendMessage(chatId, {
            text: `🎧 Downloading *${video.title}*...\nPlease wait`
        });

        let audioData = null;

        // Try APIs one by one
        for (const api of AUDIO_APIS) {
            try {
                const res = await axios.get(api(ytUrl), { timeout: 20000 });
                const data = res.data;

                if (data?.status && data?.result?.downloadUrl) {
                    audioData = {
                        url: data.result.downloadUrl,
                        title: data.result.title || video.title
                    };
                    break;
                }
            } catch (e) {
                continue; // try next API
            }
        }

        if (!audioData) {
            return sock.sendMessage(chatId, {
                text: '❌ Download failed, try another song'
            });
        }

        // Send audio with image thumbnail
        await sock.sendMessage(
            chatId,
            {
                audio: { url: audioData.url },
                mimetype: 'audio/mpeg',
                fileName: `${audioData.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: audioData.title,
                        body: 'Anonymous MD',
                        mediaType: 2,
                        thumbnailUrl: BOT_IMAGE,
                        renderLargerThumbnail: true,
                        sourceUrl: ytUrl
                    }
                }
            },
            { quoted: message }
        );

    } catch (err) {
        console.error('Play command error:', err);
        await sock.sendMessage(chatId, {
            text: '⚠️ Error while downloading, try again later'
        });
    }
}

module.exports = playCommand;
