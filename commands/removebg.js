const axios = require('axios');
const FormData = require('form-data');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    exec: async (sock, message, args) => {
        try {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage) {
                await sock.sendMessage(message.key.remoteJid, {
                    text: '❌ Please reply to an image with .removebg'
                }, { quoted: message });
                return;
            }

            // Download the image
            const buffer = await downloadMediaMessage(
                { message: quoted },
                'buffer',
                {},
                { logger: undefined }
            );

            if (!buffer) {
                throw new Error('Failed to download image');
            }

            // Upload to free API (Siputzx)
            const form = new FormData();
            form.append('image', buffer, 'image.jpg');

            const response = await axios.post('https://api.siputzx.my.id/api/tools/removebg', form, {
                headers: { ...form.getHeaders() },
                responseType: 'arraybuffer',
                timeout: 30000,
            });

            if (response.status === 200 && response.data) {
                await sock.sendMessage(message.key.remoteJid, {
                    image: response.data,
                    caption: '✅ Background removed successfully!'
                }, { quoted: message });
            } else {
                throw new Error('API returned status ' + response.status);
            }
        } catch (error) {
            console.error('RemoveBG error:', error);
            await sock.sendMessage(message.key.remoteJid, {
                text: '❌ Failed to remove background. Please try again later.'
            }, { quoted: message });
        }
    }
};