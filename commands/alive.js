const settings = require("../settings");

async function aliveCommand(sock, chatId, message) {
    try {
        const text = `*🤖 Anoymous MD is Active!*

*Version:* ${settings.version}
*Status:* Online
*Mode:* Public

*🌟 Features*
• Group Management
• Antilink Protection
• Fun Commands
• Media Downloader
• And more!

Type *.menu* to see all commands 🚀`;

        await sock.sendMessage(
            chatId,
            {
                text,
                contextInfo: {
                    externalAdReply: {
                        title: "Anoymous MD",
                        body: "Official WhatsApp Channel",
                        thumbnailUrl: "https://i.postimg.cc/yxSVw94y/Screenshot-20260726-151645.jpg", // optional image
                        sourceUrl: "https://whatsapp.com/channel/0029VbCTghVBA1f3zXA50Z1z",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            },
            { quoted: message }
        );

    } catch (error) {
        console.error("Error in alive command:", error);
        await sock.sendMessage(
            chatId,
            { text: "✅ Anoymous MD is alive and running!" },
            { quoted: message }
        );
    }
}

module.exports = aliveCommand;
