const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const Jimp = require('jimp');
const fs = require('fs');   // <-- ADD THIS
const path = require('path');

const tempDir = './temp';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const scheduleFileDeletion = (filePath) => {
    setTimeout(async () => {
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (_) { /* ignore */ }
    }, 10000);
};

async function simageCommand(sock, quotedMessage, chatId) {
    try {
        // Ensure we have a sticker message
        const stickerMsg = quotedMessage?.stickerMessage || quotedMessage;
        if (!stickerMsg) {
            await sock.sendMessage(chatId, { text: '❌ Reply to a sticker with .simage to convert it.' });
            return;
        }

        // Download sticker buffer
        const buffer = await downloadMediaMessage(
            { message: quotedMessage },
            'buffer',
            {},
            { logger: undefined }
        );
        if (!buffer) throw new Error('Failed to download sticker');

        // Convert using Jimp (handles webp natively)
        const image = await Jimp.read(buffer);
        const pngBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

        await sock.sendMessage(chatId, {
            image: pngBuffer,
            caption: '✅ Converted sticker to image.'
        });

        console.log('✅ Sticker converted successfully');
    } catch (error) {
        console.error('❌ simage error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to convert sticker. Make sure you replied to a valid sticker.'
        });
    }
}

module.exports = simageCommand;