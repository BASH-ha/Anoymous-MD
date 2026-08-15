module.exports = {
  name: 'groupstatus',
  aliases: ['togstatus', 'swgc', 'gs', 'gstatus'],
  description: 'Post a status message or media to the group',
  usage: '.groupstatus [caption] (reply to image/video) OR .groupstatus your text',
  category: 'admin',
  groupOnly: true,
  adminOnly: true,

  async execute(sock, msg, args, extra) {
    try {
      const from = extra.from;
      if (!extra.isGroup) {
        return extra.reply('👥 This command can only be used in groups.');
      }

      const caption = (args.join(' ') || '').trim();
      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
      const hasQuoted = !!ctxInfo?.quotedMessage;

      // CASE 1: No quoted message -> send a text status
      if (!hasQuoted) {
        if (!caption) {
          return extra.reply(
            '📝 *Group Status Usage*\n\n' +
            '• Reply to an image/video with:\n' +
            '  `.groupstatus [optional caption]`\n' +
            '• Or send text status only:\n' +
            '  `.groupstatus Your text here`'
          );
        }

        // Send as a fancy text message
        await sock.sendMessage(from, {
          text: `📢 *GROUP STATUS*\n\n${caption}\n\n— ${new Date().toLocaleString()}`
        }, { quoted: msg });
        return extra.reply('✅ Text group status posted!');
      }

      // CASE 2: Quoted media -> send as normal media message with status header
      const quotedMsg = ctxInfo.quotedMessage;
      const mtype = Object.keys(quotedMsg)[0] || '';

      // Helper to download media
      const downloadMedia = async (type) => {
        const stream = await downloadContentFromMessage(quotedMsg[type], type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      };

      // Handle image
      if (/image/i.test(mtype) || /sticker/i.test(mtype)) {
        await extra.reply('⏳ Posting image status...');
        try {
          const buffer = await downloadMedia(mtype === 'sticker' ? 'sticker' : 'image');
          const finalCaption = caption ? `📢 *GROUP STATUS*\n\n${caption}` : '📢 *GROUP STATUS*';
          await sock.sendMessage(from, {
            image: buffer,
            caption: finalCaption
          }, { quoted: msg });
          return extra.reply('✅ Image group status posted!');
        } catch (e) {
          console.error('groupstatus image error:', e);
          return extra.reply('❌ Failed to post image status.');
        }
      }

      // Handle video
      if (/video/i.test(mtype)) {
        await extra.reply('⏳ Posting video status...');
        try {
          const buffer = await downloadMedia('video');
          const finalCaption = caption ? `📢 *GROUP STATUS*\n\n${caption}` : '📢 *GROUP STATUS*';
          await sock.sendMessage(from, {
            video: buffer,
            caption: finalCaption
          }, { quoted: msg });
          return extra.reply('✅ Video group status posted!');
        } catch (e) {
          console.error('groupstatus video error:', e);
          return extra.reply('❌ Failed to post video status.');
        }
      }

      // Audio support removed (requires ffmpeg) – inform user
      if (/audio/i.test(mtype)) {
        return extra.reply('❌ Audio status is not supported in this version. Please use text, image, or video.');
      }

      return extra.reply('❌ Unsupported media type. Reply to an image or video.');
    } catch (e) {
      console.error('groupstatus error:', e);
      return extra.reply('❌ Error: ' + (e.message || e));
    }
  }
};