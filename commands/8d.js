/**
 * .8d – Apply 8D audio effect to a voice note or audio
 */
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function eightDCommand(sock, chatId, message) {
    try {
        // 1. Check if replying to audio/voice
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            await sock.sendMessage(chatId, {
                text: '❌ Reply to an audio or voice note with .8d'
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
        const outputPath = path.join(tmpDir, `output_8d_${Date.now()}.mp3`);

        fs.writeFileSync(inputPath, buffer);

        // 4. Apply 8D effect using ffmpeg
        //    The filter applies a panning effect with a sinusoidal movement
        const ffmpegCmd = `
            ffmpeg -i "${inputPath}" \
            -af "apulsator=hz=0.19:amount=0.8, \
                 pan=stereo|c0=c0+c1*sin(2*PI*t*0.19)|c1=c1+c0*cos(2*PI*t*0.19)" \
            "${outputPath}"
        `;

        await execPromise(ffmpegCmd);

        // 5. Read output and send back
        const outputBuffer = fs.readFileSync(outputPath);

        await sock.sendMessage(chatId, {
            audio: outputBuffer,
            mimetype: 'audio/mpeg',
            fileName: '8d_audio.mp3'
        }, { quoted: message });

        // 6. Cleanup temp files
        try {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        } catch {}

    } catch (error) {
        console.error('8D error:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Failed to apply 8D effect. Make sure ffmpeg is installed and the audio is valid.'
        }, { quoted: message });
    }
}

module.exports = eightDCommand;