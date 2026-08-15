/**
 * .approve – Approve all pending group join requests
 * Adapted from Crynova for Anoymous MD
 */
async function approveCommand(sock, chatId, message, args, senderId) {
    try {
        // Group-only check
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: message });
            return;
        }

        // Check if sender is admin
        const groupMeta = await sock.groupMetadata(chatId);
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMeta.participants.some(p => p.id === botJid && (p.admin === 'admin' || p.admin === 'superadmin'));
        const isSenderAdmin = groupMeta.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));

        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ Only group admins can use this command.' }, { quoted: message });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '❌ Please make the bot an admin first.' }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, { react: { text: '🍃', key: message.key } });

        // Get pending join requests
        const requests = await sock.groupRequestParticipantsList(chatId);

        if (!requests || requests.length === 0) {
            await sock.sendMessage(chatId, { react: { text: '❔', key: message.key } });
            await sock.sendMessage(chatId, {
                text: `╭─❍ *APPROVE*\n│\n│ ⊘ No pending requests\n╰──────────────────`
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, {
            text: `╭─❍ *APPROVE*\n│\n│ ☘️ *Approving...*\n│ ⚉ Found: ${requests.length} request(s)\n╰──────────────────`
        }, { quoted: message });

        const jids = requests.map(r => r.jid);
        await sock.groupRequestParticipantsUpdate(chatId, jids, 'approve');

        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        await sock.sendMessage(chatId, {
            text: `╭─❍ *APPROVE*\n│\n│ ✓ *Done!*\n│ ✅ ${jids.length} member(s) approved\n╰──────────────────`
        }, { quoted: message });

    } catch (err) {
        console.error('[APPROVE ERROR]', err.message);
        await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });

        if (err.message?.includes('not-authorized')) {
            await sock.sendMessage(chatId, { text: '❌ Make me an admin first.' }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: `❌ Error: ${err.message}` }, { quoted: message });
        }
    }
}

module.exports = approveCommand;