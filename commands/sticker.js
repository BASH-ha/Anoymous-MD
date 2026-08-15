const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function stickerCommand(sock, chatId, message) {
    let targetMessage = message;

    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const q = message.message.extendedTextMessage.contextInfo;
        targetMessage = {
            key: {
                remoteJid: chatId,
                id: q.stanzaId,
                participant: q.participant
            },
            message: q.quotedMessage
        };
    }

    const media =
        targetMessage.message?.imageMessage ||
        targetMessage.message?.videoMessage ||
        targetMessage.message?.documentMessage;

    if (!media) {
        return sock.sendMessage(
            chatId,
            { 
                text: `Reply to an image or video with *.sticker*\n\n🔗 Channel:\nhttps://whatsapp.com/channel/0029VbCTghVBA1f3zXA50Z1z`
            },
            { quoted: message }
        );
    }

    try {
        const buffer = await downloadMediaMessage(
            targetMessage,
            'buffer',
            {},
            { reuploadRequest: sock.updateMediaMessage }
        );

        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        const input = path.join(tmpDir, `input_${Date.now()}`);
        const output = path.join(tmpDir, `output_${Date.now()}.webp`);
        fs.writeFileSync(input, buffer);

        const animated =
            media.mimetype?.includes('video') ||
            media.mimetype?.includes('gif') ||
            media.seconds > 0;

        const ffmpegCmd = animated
            ? `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -loop 0 -pix_fmt yuva420p -quality 70 -compression_level 6 "${output}"`
            : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -loop 0 -pix_fmt yuva420p -quality 80 -compression_level 6 "${output}"`;

        await new Promise((res, rej) => exec(ffmpegCmd, e => (e ? rej(e) : res())));

        let webpBuffer = fs.readFileSync(output);

        if (animated && webpBuffer.length > 900 * 1024) {
            const fallback = path.join(tmpDir, `fallback_${Date.now()}.webp`);
            const fallbackCmd =
                `ffmpeg -y -i "${input}" -t 2 -vf "scale=320:320:force_original_aspect_ratio=decrease,fps=8,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -loop 0 -pix_fmt yuva420p -quality 35 -compression_level 6 "${fallback}"`;

            await new Promise((res, rej) => exec(fallbackCmd, e => (e ? rej(e) : res())));
            webpBuffer = fs.readFileSync(fallback);
            try { fs.unlinkSync(fallback); } catch {}
        }

        const img = new webp.Image();
        await img.load(webpBuffer);

        const exifData = {
            'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
            'sticker-pack-name': settings.packname || 'Anoymous MD',
            'sticker-pack-publisher': settings.author || 'Anoymous MD',
            emojis: ['🤖']
        };

        const exifAttr = Buffer.from([
            0x49, 0x49, 0x2A, 0x00,
            0x08, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x41, 0x57,
            0x07, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x16, 0x00,
            0x00, 0x00
        ]);

        const json = Buffer.from(JSON.stringify(exifData), 'utf8');
        const exif = Buffer.concat([exifAttr, json]);
        exif.writeUIntLE(json.length, 14, 4);

        img.exif = exif;
        const finalSticker = await img.save(null);

        await sock.sendMessage(chatId, { sticker: finalSticker }, { quoted: message });

        try {
            fs.unlinkSync(input);
            fs.unlinkSync(output);
        } catch {}

    } catch (err) {
        console.error('[STICKER ERROR]', err);
        await sock.sendMessage(
            chatId,
            { 
                text: `❌ Failed to create sticker. Try again later.`
            },
            { quoted: message }
        );
    }
}

module.exports = stickerCommand;