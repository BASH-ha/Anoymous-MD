const axios = require('axios');

module.exports = {
  name: 'getpp',
  aliases: ['gp', 'getpic'],
  category: 'general',
  description: 'Get profile picture of a user',
  usage: '.getpp (reply to message or tag user)',

  async execute(sock, msg, args, extra) {
    try {
      let targetUser = null;
      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      // 1. If replying to a message
      if (ctx?.quotedMessage) {
        // For groups, the sender is in `participant`
        if (ctx.participant) {
          targetUser = ctx.participant;
        } else {
          // For DMs or if participant missing, try to get sender from quoted message's key
          // We don't have the key directly, but we can try to get it from the stanzaId
          // Fallback: if chat is a DM, the remoteJid is the sender
          if (!extra.isGroup && ctx.remoteJid) {
            targetUser = ctx.remoteJid;
          }
        }
      }

      // 2. If not replying (or still no target), check for @mention
      if (!targetUser && ctx?.mentionedJid && ctx.mentionedJid.length > 0) {
        targetUser = ctx.mentionedJid[0];
      }

      // 3. Final fallback – use the command sender
      if (!targetUser) {
        targetUser = extra.sender;
      }

      if (!targetUser) {
        return extra.reply('❌ Could not identify target user. Please reply to a message or tag a user.');
      }

      // Fetch profile picture
      try {
        const ppUrl = await sock.profilePictureUrl(targetUser, 'image');
        if (!ppUrl) {
          return extra.reply('❌ Profile picture not found for this user.');
        }

        const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        await sock.sendMessage(extra.from, {
          image: buffer,
          caption: `👤 Profile picture of @${targetUser.split('@')[0]}`,
          mentions: [targetUser]
        }, { quoted: msg });

      } catch (profileError) {
        return extra.reply('❌ Profile picture not found for this user.');
      }

    } catch (error) {
      console.error('getpp error:', error);
      extra.reply('❌ Failed to get profile picture.');
    }
  }
};