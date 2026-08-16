// 🧹 Fix for ENOSPC / temp overflow in hosted panels
const fs = require('fs');
const path = require('path');

// Redirect temp storage away from system /tmp
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => { });
                }
            });
        }
    });
    console.log('🧹 Temp folder auto-cleaned');
}, 3 * 60 * 60 * 1000);

const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { isSudo } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./commands/autotyping');
const viewOnceCommand = require('./commands/viewonce');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');
// Command imports
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const antigroupmentionCommand = require('./commands/antigroupmention');
const { demoteCommand } = require('./commands/demote');
const unblockCommand = require('./commands/unblock');
const { piesCommand, piesAlias } = require('./commands/pies');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const eightDCommand = require('./commands/8d');
const stickerCommand = require('./commands/sticker');
const addCommand = require('./commands/add');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const ownerCommand = require('./commands/owner');
const slowCommand = require('./commands/slow');
const chipmunkCommand = require('./commands/chipmunk');
const deleteCommand = require('./commands/delete');
const purpletCommand = require('./commands/purplet');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const approveCommand = require('./commands/approve');
const { Antilink } = require('./lib/antilink');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const hideTagCommand = require('./commands/hidetag');
const jokeCommand = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const deepCommand = require('./commands/deep');
const newsCommand = require('./commands/news');
const setprefixCommand = require('./commands/setprefix');
const neontCommand = require('./commands/neont');
const kickCommand = require('./commands/kick');
const attpCommand = require('./commands/attp');
const { insultCommand } = require('./commands/insult');
const { dareCommand } = require('./commands/dare');
const apkCommand = require('./commands/apk');
const { truthCommand } = require('./commands/truth');
const groupstatusCommand = require('./commands/groupstatus');
const { clearCommand } = require('./commands/clear');
const robotCommand = require('./commands/robot');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./commands/goodbye');
const githubCommand = require('./commands/github');
const { chatbotCommand, handleChatbot } = require('./commands/chatbot');
const blockCommand = require('./commands/block');
const takeCommand = require('./commands/take');
const wastedCommand = require('./commands/wasted');
const getppCommand = require('./commands/getpp');
const quranCommand = require('./commands/quran');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const { autoreplyCommand, handleAutoReply } = require('./commands/autoreply');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./commands/groupmanage');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const catboxCommand = require('./commands/catbox');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { rosedayCommand } = require('./commands/roseday');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');
const { miscCommand, handleHeart } = require('./commands/misc');
const { animeCommand } = require('./commands/anime');
const removebgCommand = require('./commands/removebg');
const simageCommand = require('./commands/simage');
const updateCommand = require('./commands/update');
const stickercropCommand = require('./commands/stickercrop');
const { reminiCommand } = require('./commands/remini');
const { anticallCommand, readState: readAnticallState } = require('./commands/anticall');
const { pmblockerCommand, readState: readPmBlockerState } = require('./commands/pmblocker');
const listonlineCommand = require('./commands/listonline');
const settingsCommand = require('./commands/settings');

// Global settings
global.packname = "Anoymous";       
global.author = "Bashiri";       
global.channelLink = "https://whatsapp.com/channel/0029VbCTghVBA1f3zXA50Z1z";
global.ytch = "Anonymous"; 

// Bot image link
global.botImage = "https://d.uguu.se/GUDLScQa.jpg";

// Add this near the top of main.js with other global configurations
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterName: 'Anonymous',     
            serverMessageId: -1,
            newsletterJid: '',               
            newsletterLink: "https://whatsapp.com/channel/0029VbCTghVBA1f3zXA50Z1z"
        }
    }
};
async function handleMessages(sock, messageUpdate, printLog) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        // Handle autoread functionality
        await handleAutoread(sock, message);

        // Store message for antidelete feature
        if (message.message) {
            storeMessage(sock, message);
        }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);

        // Handle button responses
        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            const chatId = message.key.remoteJid;

            if (buttonId === 'channel') {
                await sock.sendMessage(chatId, {
                    text: '📢 *Join our Channel:*\nhttps://whatsapp.com/channel/0029VbCTghVBA1f3zXA50Z1z'
                }, { quoted: message });
                return;
            } else if (buttonId === 'owner') {
                const ownerCommand = require('./commands/owner');
                await ownerCommand(sock, chatId);
                return;
            } else if (buttonId === 'support') {
                await sock.sendMessage(chatId, {
                    text: `🔗 *Support*\n\nhttps://chat.whatsapp.com/F2BEXCnQqklJ4TS2Gxzeqf`
                }, { quoted: message });
                return;
            }
        }

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            message.message?.buttonsResponseMessage?.selectedButtonId?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        // Preserve raw message for commands like .tag that need original casing
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        const args = rawText.split(' ').slice(1);

        // Only log command usage
        if (userMessage.startsWith('.')) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }

        // Read bot mode once; don't early-return so moderation can still run in private mode
        let isPublic = true;
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof data.isPublic === 'boolean') isPublic = data.isPublic;
        } catch (error) {
            console.error('Error checking access mode:', error);
        }
        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;
        // Check if user is banned (skip ban check for unban command)
if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
    if (Math.random() < 0.1) {
        await sock.sendMessage(chatId, {
            text: '❌ You are banned from using the bot. Contact an admin to get unbanned.',
            ...channelInfo
        });
    }
    return;
}

// ---- COMMENTED OUT TIC-TAC-TOE ----
// if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
//     await handleTicTacToeMove(sock, chatId, senderId, userMessage);
//     return;
// }

if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

// Check for bad words and antilink FIRST, before ANY other processing
if (isGroup) {
    if (userMessage) {
        await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
    }
    await Antilink(message, sock);
}

// PM blocker: block non-owner DMs when enabled
if (!isGroup && !message.key.fromMe && !senderIsSudo) {
    try {
        const pmState = readPmBlockerState();
        if (pmState.enabled) {
            await sock.sendMessage(chatId, { text: pmState.message || 'Private messages are blocked. Please contact the owner in groups only.' });
            await new Promise(r => setTimeout(r, 1500));
            try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
            return;
        }
    } catch (e) { }
}

// Then check for command prefix
if (!userMessage.startsWith('.')) {
    await handleAutotypingForMessage(sock, chatId, userMessage);
    if (isGroup) {
        await handleTagDetection(sock, chatId, message, senderId);
        // Only run chatbot in public mode or for owner/sudo
        if (isPublic || isOwnerOrSudoCheck) {
            await handleChatbot(sock, chatId, message, senderId, userMessage);
        }
    }
    return;
}

// In private mode, only owner/sudo can run commands
if (!isPublic && !isOwnerOrSudoCheck) {
    return;
}
// List of admin commands
const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote', '.kick', '.tagall', '.tagnotadmin', '.hidetag', '.antilink', '.antitag', '.setgdesc', '.setgname', '.setgpp'];
const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));

// List of owner commands
const ownerCommands = ['.mode', '.autostatus', '.antidelete', '.cleartmp', '.setpp', '.clearsession', '.areact', '.autoreact', '.autotyping', '.autoread', '.pmblocker', '.unblock', '.block'];
const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));

let isSenderAdmin = false;
let isBotAdmin = false;

if (isGroup && isAdminCommand) {
    const adminStatus = await isAdmin(sock, chatId, senderId);
    isSenderAdmin = adminStatus.isSenderAdmin;
    isBotAdmin = adminStatus.isBotAdmin;
    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: 'Please make the bot an admin to use admin commands.', ...channelInfo }, { quoted: message });
        return;
    }
    if (
        userMessage.startsWith('.mute') ||
        userMessage === '.unmute' ||
        userMessage.startsWith('.ban') ||
        userMessage.startsWith('.unban') ||
        userMessage.startsWith('.promote') ||
        userMessage.startsWith('.demote')
    ) {
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: 'Sorry, only group admins can use this command.',
                ...channelInfo
            }, { quoted: message });
            return;
        }
    }
}

if (isOwnerCommand) {
    if (!message.key.fromMe && !senderIsOwnerOrSudo) {
        await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner or sudo!' }, { quoted: message });
        return;
    }
}

let commandExecuted = false;

switch (true) {
    case userMessage.startsWith('.kick'):
        const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
        break;
    case userMessage.startsWith('.mute'):
        {
            const parts = userMessage.trim().split(/\s+/);
            const muteArg = parts[1];
            const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
            if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                await sock.sendMessage(chatId, { text: 'Please provide a valid number of minutes or use .mute with no number to mute immediately.', ...channelInfo }, { quoted: message });
            } else {
                await muteCommand(sock, chatId, senderId, message, muteDuration);
            }
        }
        break;
    case userMessage === '.autoreply':
        await autoreplyCommand(sock, chatId, message, args, rawText);
        break;
    case userMessage === '.unmute':
        await unmuteCommand(sock, chatId, senderId);
        break;
    case userMessage.startsWith('.quran'):
        const quranQuery = userMessage.slice(7).trim() || rawText.slice(7).trim();
        if (!quranQuery) {
            await sock.sendMessage(chatId, { text: 'Usage: .quran 1:1' }, { quoted: message });
            break;
        }
        await quranCommand(sock, chatId, message, quranQuery);
        break;
    case userMessage.startsWith('.ban'):
        if (!isGroup) {
            if (!message.key.fromMe && !senderIsSudo) {
                await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .ban in private chat.' }, { quoted: message });
                break;
            }
        }
        await banCommand(sock, chatId, message);
        break;
    case userMessage === '.block':
        await blockCommand.execute(sock, message, args, {
            from: chatId,
            isGroup: isGroup,
            reply: async (text) => {
                await sock.sendMessage(chatId, { text }, { quoted: message });
            }
        });
        break;
        case userMessage.startsWith('.apk'):
    await apkCommand(sock, chatId, message, args);
    break;
        case userMessage === '.slow':
    await slowCommand(sock, chatId, message);
    break;
    case userMessage === '.vv':
        await viewOnceCommand(sock, chatId, message);
        break;
    case userMessage === '.setprefix' || userMessage === '.prefix':
        await setprefixCommand.execute(sock, message, args, {
            reply: async (text) => {
                await sock.sendMessage(chatId, { text }, { quoted: message });
            }
        });
        break;
    case userMessage.startsWith('.pies'):
        {
            const parts = rawText.trim().split(/\s+/);
            const argsPies = parts.slice(1);
            await piesCommand(sock, chatId, message, argsPies);
            commandExecuted = true;
        }
        break;
        case userMessage === '.purplet':
    await purpletCommand(sock, chatId, message, args);
    break;
    case userMessage.startsWith('.unban'):
        if (!isGroup) {
            if (!message.key.fromMe && !senderIsSudo) {
                await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .unban in private chat.' }, { quoted: message });
                break;
            }
        }
        await unbanCommand(sock, chatId, message);
        break;
    case userMessage === '.help' || userMessage === '.menu' || userMessage === '.bot' || userMessage === '.list':
        await helpCommand(sock, chatId, message, global.channelLink);
        commandExecuted = true;
        break;
        case userMessage === '.deep':
    await deepCommand(sock, chatId, message);
    break;
    case userMessage === '.catbox':
        await catboxCommand(sock, chatId, message);
        break;
    case userMessage === '.sticker' || userMessage === '.s':
        await stickerCommand(sock, chatId, message);
        commandExecuted = true;
        break;
    case userMessage.startsWith('.warnings'):
        const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        await warningsCommand(sock, chatId, mentionedJidListWarnings);
        break;
        case userMessage === '.neont':
    await neontCommand(sock, chatId, message, args);
    break;
    case userMessage === '.unblock':
        await unblockCommand.execute(sock, message, args, {
            from: chatId,
            isGroup: isGroup,
            reply: async (text) => {
                await sock.sendMessage(chatId, { text }, { quoted: message });
            }
        });
        break;
        case userMessage === '.approve' || userMessage === '.acceptall' || userMessage === '.approveall':
    await approveCommand(sock, chatId, message, args, senderId);
    break;
        case userMessage.startsWith('.translate') || userMessage.startsWith('.trt'):
    const commandLength = userMessage.startsWith('.translate') ? 10 : 4;
    await handleTranslateCommand(sock, chatId, message, userMessage.slice(commandLength));
    return;
case userMessage === '.groupstatus' || userMessage === '.togstatus' || userMessage === '.swgc' || userMessage === '.gs' || userMessage === '.gstatus':
    await groupstatusCommand.execute(sock, message, args, {
        from: chatId,
        isGroup: isGroup,
        reply: async (text) => {
            await sock.sendMessage(chatId, { text }, { quoted: message });
        }
    });
    break;
    case userMessage === '.listonline' || userMessage === '.active' || userMessage === '.here' || userMessage === '.whoisonline' || userMessage === '.onlinelist':
    await listonlineCommand(sock, chatId, message, args, senderId);
    break;
    case userMessage === '.robot':
    await robotCommand(sock, chatId, message);
    break;
case userMessage.startsWith('.warn'):
    const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
    break;
case userMessage.startsWith('.tts'):
    const ttsText = userMessage.slice(4).trim();
    await ttsCommand(sock, chatId, ttsText, message);
    break;
    case userMessage === '.chipmunk':
    await chipmunkCommand(sock, chatId, message);
    break;
case userMessage.startsWith('.delete') || userMessage.startsWith('.del'):
    await deleteCommand(sock, chatId, message, senderId);
    break;
case userMessage.startsWith('.attp'):
    await attpCommand(sock, chatId, message);
    break;
case userMessage === '.settings':
    await settingsCommand(sock, chatId, message);
    break;
case userMessage === '.getpp' || userMessage === '.gp' || userMessage === '.getpic':
    await getppCommand.execute(sock, message, args, {
        from: chatId,
        sender: senderId,
        isGroup: isGroup,
        reply: async (text) => {
            await sock.sendMessage(chatId, { text }, { quoted: message });
        }
    });
    break;
    case userMessage === '.8d':
    await eightDCommand(sock, chatId, message);
    break;
case userMessage.startsWith('.mode'):
    if (!message.key.fromMe && !senderIsOwnerOrSudo) {
        await sock.sendMessage(chatId, { text: 'Only bot owner can use this command!', ...channelInfo }, { quoted: message });
        return;
    }
    let data;
    try {
        data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
    } catch (error) {
        console.error('Error reading access mode:', error);
        await sock.sendMessage(chatId, { text: 'Failed to read bot mode status', ...channelInfo });
        return;
    }
    const modeAction = userMessage.split(' ')[1]?.toLowerCase();
    if (!modeAction) {
        const currentMode = data.isPublic ? 'public' : 'private';
        await sock.sendMessage(chatId, {
            text: `Current bot mode: *${currentMode}*\n\nUsage: .mode public/private`,
            ...channelInfo
        }, { quoted: message });
        return;
    }
    if (modeAction !== 'public' && modeAction !== 'private') {
        await sock.sendMessage(chatId, { text: 'Usage: .mode public/private', ...channelInfo }, { quoted: message });
        return;
    }
    data.isPublic = modeAction === 'public';
    fs.writeFileSync('./data/messageCount.json', JSON.stringify(data, null, 2));
    await sock.sendMessage(chatId, { text: `Bot is now in *${modeAction}* mode`, ...channelInfo });
    break;
case userMessage.startsWith('.anticall'):
    if (!message.key.fromMe && !senderIsOwnerOrSudo) {
        await sock.sendMessage(chatId, { text: 'Only owner/sudo can use anticall.' }, { quoted: message });
        break;
    }
    {
        const anticallArgs = userMessage.split(' ').slice(1).join(' ');
        await anticallCommand(sock, chatId, message, anticallArgs);
    }
    break;
case userMessage.startsWith('.pmblocker'):
    {
        const pmArgs = userMessage.split(' ').slice(1).join(' ');
        await pmblockerCommand(sock, chatId, message, pmArgs);
    }
    commandExecuted = true;
    break;
case userMessage === '.owner':
    await ownerCommand(sock, chatId);
    break;
case userMessage === '.tagall':
    await tagAllCommand(sock, chatId, senderId, message);
    break;
case userMessage.startsWith('.hidetag'):
    {
        const hidetagText = rawText.slice(8).trim();
        const hidetagReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
        await hideTagCommand(sock, chatId, senderId, hidetagText, hidetagReply, message);
    }
    break;
case userMessage.startsWith('.tag'):
    const tagText = rawText.slice(4).trim();
    const tagReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    await tagCommand(sock, chatId, senderId, tagText, tagReply, message);
    break;
case userMessage.startsWith('.antilink'):
    if (!isGroup) {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
        return;
    }
    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: 'Please make the bot an admin first.', ...channelInfo }, { quoted: message });
        return;
    }
    await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
    break;
case userMessage === '.antigroupmention' || userMessage === '.agm':
    const agmArgs = rawText.split(' ').slice(1);
    await antigroupmentionCommand.execute(sock, message, agmArgs, {
        from: chatId,
        isGroup: isGroup,
        reply: async (text) => {
            await sock.sendMessage(chatId, { text }, { quoted: message });
        }
    });
    break;
case userMessage.startsWith('.antitag'):
    if (!isGroup) {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
        return;
    }
    if (!isBotAdmin) {
        await sock.sendMessage(chatId, { text: 'Please make the bot an admin first.', ...channelInfo }, { quoted: message });
        return;
    }
    await handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
    break;
case userMessage === '.crop' || userMessage === '.stickercrop':
    await stickercropCommand(sock, chatId, message);
    break;
    case userMessage === '.meme':
    await memeCommand(sock, chatId, message);
    break;
    case userMessage === '.add':
    await addCommand(sock, chatId, message, args, senderId);
    break;
case userMessage === '.joke':
    await jokeCommand(sock, chatId, message);
    break;
case userMessage === '.quote':
    await quoteCommand(sock, chatId, message);
    break;
case userMessage === '.fact':
    await factCommand(sock, chatId, message, message);
    break;
case userMessage.startsWith('.weather'):
    const city = userMessage.slice(9).trim();
    if (city) {
        await weatherCommand(sock, chatId, message, city);
    } else {
        await sock.sendMessage(chatId, { text: 'Please specify a city, e.g., .weather London', ...channelInfo }, { quoted: message });
    }
    break;
case userMessage === '.news':
    await newsCommand(sock, chatId);
    break;
case userMessage.startsWith('.insult'):
    await insultCommand(sock, chatId, message);
    break;
case userMessage === '.dare':
    await dareCommand(sock, chatId, message);
    break;
case userMessage === '.truth':
    await truthCommand(sock, chatId, message);
    break;
case userMessage === '.clear':
    if (isGroup) await clearCommand(sock, chatId);
    break;
case userMessage.startsWith('.promote'):
    const promotedJids = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    await promoteCommand(sock, chatId, promotedJids, message);
    break;
case userMessage.startsWith('.demote'):
    const demotedJids = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    await demoteCommand(sock, chatId, demotedJids, message);
    break;
case userMessage === '.ping':
    await pingCommand(sock, chatId, message);
    break;
case userMessage === '.alive':
    await aliveCommand(sock, chatId, message);
    break;
case userMessage.startsWith('.welcome'):
    if (isGroup) {
        if (!isSenderAdmin) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
        }
        if (isSenderAdmin || message.key.fromMe) {
            await welcomeCommand(sock, chatId, message);
        } else {
            await sock.sendMessage(chatId, { text: 'Sorry, only group admins can use this command.', ...channelInfo }, { quoted: message });
        }
    } else {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
    }
    break;
case userMessage === '.roseday':
    await rosedayCommand(sock, chatId, message);
    break;
case userMessage.startsWith('.goodbye'):
    if (isGroup) {
        if (!isSenderAdmin) {
            const adminStatus = await isAdmin(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
        }
        if (isSenderAdmin || message.key.fromMe) {
            await goodbyeCommand(sock, chatId, message);
        } else {
            await sock.sendMessage(chatId, { text: 'Sorry, only group admins can use this command.', ...channelInfo }, { quoted: message });
        }
    } else {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
    }
    break;
case userMessage === '.git':
case userMessage === '.github':
case userMessage === '.sc':
case userMessage === '.script':
case userMessage === '.repo':
    await githubCommand(sock, chatId, message);
    break;
        case userMessage.startsWith('.chatbot'):
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', ...channelInfo }, { quoted: message });
            return;
        }
        const chatbotAdminCheck = await isAdmin(sock, chatId, senderId);
        if (!chatbotAdminCheck.isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: '*Only admins or bot owner can use this command*', ...channelInfo }, { quoted: message });
            return;
        }
        const chatbotRaw = rawText.slice(8).trim();
        await chatbotCommand(sock, chatId, message, args, chatbotRaw);
        break;
    case userMessage.startsWith('.take') || userMessage.startsWith('.steal'):
        {
            const isSteal = userMessage.startsWith('.steal');
            const sliceLen = isSteal ? 6 : 5;
            const takeArgs = rawText.slice(sliceLen).trim().split(' ');
            await takeCommand(sock, chatId, message, takeArgs);
        }
        break;
    // case userMessage.startsWith('.character'): // commented out
    //     break;
    case userMessage.startsWith('.waste'):
        await wastedCommand(sock, chatId, message);
        break;
    case userMessage === '.groupinfo' || userMessage === '.infogp' || userMessage === '.infogrupo':
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
            return;
        }
        await groupInfoCommand(sock, chatId, message);
        break;
    case userMessage === '.simage':
        const quotedSticker = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedSticker?.stickerMessage) {
            await simageCommand(sock, quotedSticker, chatId);
        } else {
            await sock.sendMessage(chatId, { text: 'Please reply to a sticker with .simage' }, { quoted: message });
        }
        break;
    case userMessage === '.jid':
        await sock.sendMessage(chatId, { text: `JID: ${chatId}` }, { quoted: message });
        break;
    case userMessage === '.resetlink' || userMessage === '.revoke' || userMessage === '.anularlink':
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
            return;
        }
        await resetlinkCommand(sock, chatId, senderId);
        break;
    case userMessage === '.staff' || userMessage === '.admins' || userMessage === '.listadmin':
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: 'This command can only be used in groups!', ...channelInfo }, { quoted: message });
            return;
        }
        await staffCommand(sock, chatId, message);
        break;
    case userMessage.startsWith('.tourl') || userMessage.startsWith('.url'):
        await urlCommand(sock, chatId, message);
        break;  
      case userMessage.startsWith('.autostatus'):
        const autoStatusArgs = userMessage.split(' ').slice(1);
        await autoStatusCommand(sock, chatId, message, autoStatusArgs);
        break;
    case userMessage.startsWith('.play') || userMessage.startsWith('.mp3') || userMessage.startsWith('.ytmp3') || userMessage.startsWith('.song'):
        await songCommand(sock, chatId, message);
        break;
    case userMessage.startsWith('.video') || userMessage.startsWith('.ytmp4'):
        await videoCommand(sock, chatId, message);
        break;
    case userMessage.startsWith('.tiktok') || userMessage.startsWith('.tt'):
        await tiktokCommand(sock, chatId, message);
        break;
    case userMessage.startsWith('.removebg') || userMessage.startsWith('.rmbg') || userMessage.startsWith('.nobg'):
        await removebgCommand.exec(sock, message, userMessage.split(' ').slice(1));
        break;
    case userMessage.startsWith('.remini') || userMessage.startsWith('.enhance') || userMessage.startsWith('.upscale'):
        await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1));
        break;
    case userMessage.startsWith('.antidelete'):
        const antideleteMatch = userMessage.slice(11).trim();
        await handleAntideleteCommand(sock, chatId, message, antideleteMatch);
        break;
    case userMessage === '.cleartmp':
        await clearTmpCommand(sock, chatId, message);
        break;
    case userMessage === '.setpp':
        await setProfilePicture(sock, chatId, message);
        break;
    case userMessage.startsWith('.setgdesc'):
        {
            const desc = rawText.slice(9).trim();
            await setGroupDescription(sock, chatId, senderId, desc, message);
        }
        break;
    case userMessage.startsWith('.setgname'):
        {
            const name = rawText.slice(9).trim();
            await setGroupName(sock, chatId, senderId, name, message);
        }
        break;
    case userMessage.startsWith('.setgpp'):
        await setGroupPhoto(sock, chatId, senderId, message);
        break;
    case userMessage.startsWith('.instagram') || userMessage.startsWith('.insta') || (userMessage === '.ig' || userMessage.startsWith('.ig ')):
        await instagramCommand(sock, chatId, message);
        break;
    case userMessage.startsWith('.fb') || userMessage.startsWith('.facebook'):
        await facebookCommand(sock, chatId, message);
        break;
    case userMessage.startsWith('.music'):
        await playCommand(sock, chatId, message);
        break;
} // <-- closes the switch
        // If a command was executed, show typing status after command execution
        if (commandExecuted !== false) {
            await showTypingAfterCommand(sock, chatId);
        }

        // Function to handle .groupjid command (internal)
        async function groupJidCommand(sock, chatId, message) {
            const groupJid = message.key.remoteJid;
            if (!groupJid.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, {
                    text: "❌ This command can only be used in a group."
                });
            }
            await sock.sendMessage(chatId, {
                text: `✅ Group JID: ${groupJid}`
            }, { quoted: message });
        }

        if (userMessage.startsWith('.')) {
            await addCommandReaction(sock, message);
        }
    } catch (error) {
        console.error('❌ Error in message handler:', error.message);
        if (typeof chatId !== 'undefined') {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to process command!',
                ...channelInfo
            });
        }
    }
}

// ---- incrementMessageCount FUNCTION ----
function incrementMessageCount(chatId, senderId) {
    try {
        const dataPath = './data/messageCount.json';
        let data = {};
        if (fs.existsSync(dataPath)) {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        if (!data.counts) data.counts = {};
        const key = `${chatId}_${senderId}`;
        if (!data.counts[key]) data.counts[key] = 0;
        data.counts[key]++;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    } catch (e) {
        // ignore
    }
}

// Helper: bad word detection
async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const antibadword = require('./commands/antibadword');
        await antibadword.handleBadwordDetection(sock, chatId, message, userMessage, senderId);
    } catch (e) {}
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;
        if (!id.endsWith('@g.us')) return;
        let isPublic = true;
        try {
            const modeData = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof modeData.isPublic === 'boolean') isPublic = modeData.isPublic;
        } catch (e) {}
        if (action === 'promote') {
            if (!isPublic) return;
            await handlePromotionEvent(sock, id, participants, author);
            return;
        }
        if (action === 'demote') {
            if (!isPublic) return;
            await handleDemotionEvent(sock, id, participants, author);
            return;
        }
        if (action === 'add') {
            // auto-welcome disabled
        }
        if (action === 'remove') {
            // auto-goodbye disabled
        }
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

// Exports
module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status);
    }
};
