/**
 * .deep – Apply deep‑voice effect to audio/voice
 */
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function deepCommand(sock, chatId, message) {
    try {
        // 1. Check if replying to audio/voice
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            await sock.sendMessage(chatId, {
                text: '❌ Reply to an audio or voice note with .deep'
            }, { quoted: message });
            return;
        }

        const audioMsg = quoted.audioMessage || quoted.voiceMessage;
        if (!audioMsg) {
            await sock.sendMessage(chatId, {
                text: '❌ The replied message is not an audio or voice note.'
            }, { quoted: message });
            return;
        }

        // 2. Download audio
        const buffer = await downloadMediaMessage(
            { message: quoted },
            'buffer',
            {},
            { logger: undefined }
        );
        if (!buffer) {
            await sock.sendMessage(chatId, { text: '❌ Failed to download audio.' }, { quoted: message });
            return;
        }

        // 3. Create temp files
        const tmpDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        const inputPath = path.join(tmpDir, `input_${Date.now()}.mp3`);
        const outputPath = path.join(tmpDir, `deep_${Date.now()}.mp3`);

        fs.writeFileSync(inputPath, buffer);

        // 4. Apply deep effect using ffmpeg
        //    Slower tempo, lower pitch, and boost volume
        const ffmpegCmd = `
            ffmpeg -i "${inputPath}" \
            -af "asetrate=44100*0.75,atempo=0.9,volume=2" \
            "${outputPath}"
        `;

        await execPromise(ffmpegCmd);

        // 5. Read output and send back as voice note
        const outputBuffer = fs.readFileSync(outputPath);

        await sock.sendMessage(chatId, {
            audio: outputBuffer,
            mimetype: 'audio/mpeg',
            fileName: 'deep_audio.mp3',
            ptt: true   // send as voice note
        }, { quoted: message });

        // 6. Cleanup temp files
        try {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        } catch {}

    } catch (error) {
        console.error('Deep error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to apply deep effect. Make sure ffmpeg is installed.'
        }, { quoted: message });
    }
}

module.exports = deepCommand;