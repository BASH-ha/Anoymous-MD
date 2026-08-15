/**
 * .add command – Add user(s) to group or send invite link
 * Adapted from Crynova for Anoymous MD
 */
const fetch = require('node-fetch');

async function addCommand(sock, chatId, message, args, senderId) {
    try {
        // 1. Group-only check
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: message });
            return;
        }

        // 2. Build target list
        let targets = [];
        const ctx = message.message?.extendedTextMessage?.contextInfo || {};

        // Reply to a message
        if (ctx.quotedMessage && ctx.participant) {
            targets.push(ctx.participant);
        }

        // @mentions
        if (ctx.mentionedJid && ctx.mentionedJid.length) {
            for (const jid of ctx.mentionedJid) {
                if (!targets.includes(jid)) targets.push(jid);
            }
        }

        // Phone numbers from args (only if no targets yet)
        if (!targets.length) {
            for (const arg of args) {
                let number = arg.replace(/[^0-9]/g, '');
                if (!number) continue;
                if (number.startsWith('0')) number = '234' + number.slice(1); // Nigeria? Adjust if needed
                if (number.length < 7) continue;
                const jid = number + '@s.whatsapp.net';
                if (!targets.includes(jid)) targets.push(jid);
            }
        }

        if (!targets.length) {
            await sock.sendMessage(chatId, {
                text: `📌 *How to use .add:*\n\n• Reply to a message → adds that person\n• .add @user\n• .add 256701487186`
            }, { quoted: message });
            return;
        }

        // 3. Get group metadata
        const meta = await sock.groupMetadata(chatId);
        const groupName = meta.subject;

        const added   = [];
        const invited = [];
        const failed  = [];

        // 4. Process each target
        for (const jid of targets) {
            try {
                const res = await sock.groupParticipantsUpdate(chatId, [jid], 'add');
                const status = String(res?.[0]?.status ?? '');

                if (status === '200') {
                    added.push(jid);
                    continue;
                }

                // Privacy block → send invite link in DM
                if (['403', '401', '409'].includes(status)) {
                    const freshCode = await sock.groupInviteCode(chatId);
                    const inviteLink = `https://chat.whatsapp.com/${freshCode}`;

                    // Try to get group image for preview
                    let thumbnail = null;
                    try {
                        const pp = await sock.profilePictureUrl(chatId, 'image');
                        thumbnail = await fetch(pp).then(r => r.buffer());
                    } catch {}

                    await sock.sendMessage(jid, {
                        text: `📩 *Group Invite*\n\nYou've been invited to join *${groupName}*.\n\nClick the link below to join:\n${inviteLink}`,
                        ...(thumbnail ? { image: thumbnail, caption: `Join ${groupName}` } : {})
                    });

                    invited.push(jid);
                    continue;
                }

                failed.push(jid);
            } catch (e) {
                // If adding fails, check if we can send invite link
                try {
                    const freshCode = await sock.groupInviteCode(chatId);
                    const inviteLink = `https://chat.whatsapp.com/${freshCode}`;
                    await sock.sendMessage(jid, {
                        text: `📩 *Group Invite*\n\nYou've been invited to join *${groupName}*.\n\nClick the link below to join:\n${inviteLink}`
                    });
                    invited.push(jid);
                } catch {
                    failed.push(jid);
                }
            }

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 600));
        }

        // 5. Send report
        const mentions = [...added, ...invited, ...failed];
        let text = '';

        if (added.length) {
            text += `_✅ Added to the group:_\n` +
                    added.map(j => `✦ @${j.split('@')[0]}`).join('\n') + '\n\n';
        }
        if (invited.length) {
            text += `_📩 Invite sent (privacy on):_\n` +
                    invited.map(j => `✦ @${j.split('@')[0]}`).join('\n') + '\n\n';
        }
        if (failed.length) {
            text += `_❌ Failed:_\n` +
                    failed.map(j => `✦ @${j.split('@')[0]}`).join('\n');
        }

        await sock.sendMessage(chatId, {
            text: text.trim() || 'No actions performed.',
            mentions
        }, { quoted: message });

    } catch (error) {
        console.error('Add command error:', error);
        await sock.sendMessage(chatId, {
            text: `❌ Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = addCommand;
