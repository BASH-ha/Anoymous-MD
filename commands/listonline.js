/**
 * .listonline – Show online users in the group
 * Adapted for Anoymous MD
 */

async function listonlineCommand(sock, chatId, message, args, senderId) {
    try {
        // Group-only check
        const isGroup = chatId.endsWith('@g.us');
        if (!isGroup) {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: message });
            return;
        }

        // Get group metadata
        const meta = await sock.groupMetadata(chatId);
        const participants = meta.participants || [];

        if (!participants.length) {
            await sock.sendMessage(chatId, { text: '✘ No participants found.' }, { quoted: message });
            return;
        }

        // Subscribe to presence updates for this group
        try { await sock.presenceSubscribe(chatId); } catch { /* ignore */ }

        // Send a short "checking" message
        await sock.sendMessage(chatId, { text: '⚉ _Checking presence... please wait_', react: { text: '👀', key: message.key } });

        // Wait a bit for presence data to arrive
        await new Promise(r => setTimeout(r, 3000));

        const online = [];
        const offline = [];
        const all = [];

        for (const p of participants) {
            const jid = p.id;
            const num = jid.split('@')[0];
            const isAdmin = p.admin === 'admin' || p.admin === 'superadmin';

            // Get name
            let name = num;
            try {
                const contacts = sock.store?.contacts;
                const contact = contacts instanceof Map ? contacts.get(jid) : contacts?.[jid];
                if (contact?.notify?.trim()) name = contact.notify;
                else if (contact?.name?.trim()) name = contact.name;
            } catch {}

            // Check presence from store
            let status = null;
            try {
                const p1 = sock.store?.presences?.[jid]?.lastKnownPresence;
                const p2 = sock.store?.presences?.[chatId]?.[jid]?.lastKnownPresence;
                status = p1 || p2 || null;
            } catch {}

            if (!status && global.onlineUsers?.has(jid)) status = 'available';

            const isOnline = ['available', 'composing', 'recording'].includes(status);
            const info = { jid, num, name, isAdmin, status };

            if (isOnline) online.push(info);
            else if (status) offline.push(info);
            all.push(info);
        }

        const unknown = participants.length - online.length - offline.length;
        const mentions = online.map(u => u.jid);

        let text =
            `┏━━〔 *ONLINE MONITOR* 〕━━\n` +
            `┃\n` +
            `┃  ✦ Group  : ${meta.subject}\n` +
            `┃  ✦ Total  : ${participants.length}\n` +
            `┃  ◦ Online : ${online.length}\n` +
            `┃  ◦ Away   : ${offline.length}\n` +
            `┃  ◦ Hidden : ${unknown}\n` +
            `┃\n` +
            `┗━━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (online.length) {
            text += `*✦ ONLINE (${online.length})*\n`;
            for (const u of online) {
                const badge = u.isAdmin ? '❏' : '◦';
                const action = u.status === 'composing' ? ' ✍' : u.status === 'recording' ? ' 🎙' : '';
                text += `${badge} @${u.num} — ${u.name}${action}\n`;
            }
        } else {
            text += `*✦ ONLINE (0)*\n_No members detected online_\n`;
            text += `_Note: WhatsApp only shares presence with your contacts_\n`;
        }

        if (offline.length) {
            text += `\n*◦ RECENTLY AWAY (${offline.length})*\n`;
            for (const u of offline.slice(0, 5)) {
                text += `◦ ${u.name} — _${u.status}_\n`;
            }
            if (offline.length > 5) text += `_...and ${offline.length - 5} more_\n`;
        }

        await sock.sendMessage(chatId, {
            text: text.trim(),
            mentions
        }, { quoted: message });

    } catch (err) {
        console.error('[LISTONLINE ERROR]', err);
        await sock.sendMessage(chatId, {
            text: `❌ Error: ${err.message}`
        }, { quoted: message });
    }
}

module.exports = listonlineCommand;