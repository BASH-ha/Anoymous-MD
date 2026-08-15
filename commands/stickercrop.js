const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const Jimp = require('jimp');

async function stickercropCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.stickerMessage && !quoted?.imageMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ Reply to a sticker or image with .crop to crop it to a square.'
            }, { quoted: message });
            return;
        }

        // Determine media type
        const mediaType = quoted.stickerMessage ? 'sticker' : 'image';
        const buffer = await downloadMediaMessage(
            { message: quoted },
            'buffer',
            {},
            { logger: undefined }
        );
        if (!buffer) throw new Error('Failed to download media');

        // Crop to square using Jimp (center crop)
        const image = await Jimp.read(buffer);
        const size = Math.min(image.bitmap.width, image.bitmap.height);
        const x = (image.bitmap.width - size) / 2;
        const y = (image.bitmap.height - size) / 2;
        const cropped = image.crop(x, y, size, size);
        const croppedBuffer = await cropped.getBufferAsync(Jimp.MIME_PNG);

        // Send as image (or you can convert back to sticker if desired)
        await sock.sendMessage(chatId, {
            image: croppedBuffer,
            caption: '✅ Cropped to square!'
        }, { quoted: message });

    } catch (error) {
        console.error('Stickercrop error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to crop media. Make sure you replied to a valid sticker or image.'
        }, { quoted: message });
    }
}

module.exports = stickercropCommand;