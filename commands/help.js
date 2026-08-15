const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {

    const sender = message.key.participant || message.key.remoteJid;
    const userTag = sender.split('@')[0];
    const runtime = process.uptime();

    const helpMessage = `
╭━━━〔 ANOYMOUS MD 〕━━━╮
┃ Hᴇʏ cʜɪᴇꜰ 🖋 ʜᴏᴡ cᴀɴ ɪ ʜᴇʟᴘ ʏᴏᴜ?
╰━━━━━━━━━━━━━━━━━━━━━━━╯

      「 BOT INFO 」

↯ creator: Bashiri
↯ bot name: Anoymous MD
↯ version: 2026
↯ status: active
↯ runtime: ${runtime}
↯ prefix: .

━━━ 「 general menu 」 ━━━

↯ ping
↯ alive
↯ owner
↯ joke
↯ quote
↯ fact
↯ weather
↯ news
↯ attp
↯ tts
↯ vv
↯ ss
↯ trt
↯ jid
↯ url
↯ meme
↯ pies
↯ simage
↯ stickertelegram
↯ translate
↯ wasted
↯ warnings
↯ clear
↯ delete
↯ resetlink
↯ roseday
↯ setpp
↯ staff
↯ sudo
↯ tag
↯ emojimix
↯ chatbot
↯ autostatus
↯ getpp
↯ insult

━━━ 「 group menu 」 ━━━

↯ groupinfo
↯ admins
↯ tagall
↯ hidetag
↯ welcome
↯ goodbye
↯ autoreply
↯ groupstatus
↯ antigroupmention
↯ listonline
↯ add
↯ approve

━━━ 「 admin menu 」 ━━━

↯ ban
↯ unban
↯ promote
↯ demote
↯ mute
↯ unmute
↯ kick
↯ warn
↯ antilink
↯ antitag
↯ anticall
↯ antidelete
↯ block
↯ unblock

━━━ 「 download menu 」 ━━━

↯ play
↯ song
↯ tiktok
↯ instagram
↯ facebook
↯ video
↯ apk

━━━ 「 audio menu 」 ━━━

↯ 8d
↯ chipmunk
↯ deep
↯ robot
↯ slow

━━━ 「 textmaker menu 」 ━━━

↯ neont
↯ purplet

━━━ 「 ai menu 」 ━━━

↯ deepseek
↯ quran
↯ truth
↯ dare
↯ character
↯ take

━━━ 「 settings/owner menu 」 ━━━

↯ setprefix
↯ mode
↯ autoread
↯ autotyping
↯ clearsession
↯ cleartmp
↯ pmblocker
↯ settings

━━━ 「 media menu 」 ━━━

↯ catbox
↯ stickercrop
↯ removebg
↯ remini

━━━ 「 github menu 」 ━━━

↯ repo
↯ git
↯ script
↯ update

━━━ 「 ANOYMOUS MD 」 ━━━

↯ ꜰᴀsᴛ ʀᴇsᴘᴏɴsᴇ
↯ sᴛᴀʙʟᴇ sʏsᴛᴇᴍ
↯ Pᴏᴡᴇʀᴇᴅ ʙʏ ʙᴀsʜɪʀɪ
Jᴏɪɴ ᴏᴜʀ cʜᴀɴɴᴇʟ ꜰᴏʀ ᴜᴘᴅᴀᴛᴇs
`.trim();

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');

        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                mentions: [sender],
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363405445990040@newsletter',
                        newsletterName: 'ANOYMOUS MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });

        } else {
            await sock.sendMessage(chatId, {
                text: helpMessage,
                mentions: [sender],
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363405445990040@newsletter',
                        newsletterName: 'ANOYMOUS MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Menu error:', error);

        await sock.sendMessage(chatId, {
            text: helpMessage,
            mentions: [sender],
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363405445990040@newsletter',
                    newsletterName: 'ANOYMOUS MD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = helpCommand;