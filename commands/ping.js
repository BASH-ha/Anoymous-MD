const os = require('os');
const settings = require('../settings.js');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds %= (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds %= (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days) time += `${days}d `;
    if (hours) time += `${hours}h `;
    if (minutes) time += `${minutes}m `;
    if (!time) time += `${seconds}s`;

    return time.trim();
}

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        await sock.sendMessage(
            chatId,
            { text: '⚡ 𝑇𝑒𝑠𝑡𝑖𝑛𝑔 𝑎𝑛𝑜𝑦𝑚𝑜𝑢𝑠 𝑚𝑑 𝑠𝑝𝑒𝑒𝑑...' },
            { quoted: message }
        );
        const end = Date.now();

        const ping = Math.round((end - start) / 2);
        const uptime = formatTime(process.uptime());

        const botInfo = `
「 🤖 ANOYMOUS MD 」

↯ ping      : ${ping} ms
↯ uptime    : ${uptime}
↯ version   : v${settings.version}

━━━ 「 BOT INFO 」 ━━━
`.trim();

        await sock.sendMessage(
            chatId,
            { text: botInfo },
            { quoted: message }
        );

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(
            chatId,
            { text: '❌ Unable to fetch bot status right now.' },
            { quoted: message }
        );
    }
}

module.exports = pingCommand;