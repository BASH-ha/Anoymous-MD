const axios = require('axios');
const { sleep } = require('../lib/myfunc');

async function pairCommand(sock, chatId, message, q) {
    try {
        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "❌ Please provide a valid WhatsApp number\nExample: *.pair 25670148XXXX*"
            }, { quoted: message });
        }

        const numbers = q.split(',')
            .map(v => v.replace(/[^0-9]/g, ''))
            .filter(v => v.length > 5 && v.length < 20);

        if (numbers.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid number format!\nUse: *.pair 25670148XXXX*"
            }, { quoted: message });
        }

        for (const number of numbers) {
            const whatsappID = number + '@s.whatsapp.net';
            const result = await sock.onWhatsApp(whatsappID);

            if (!result[0]?.exists) {
                return await sock.sendMessage(chatId, {
                    text: "❌ This number is not registered on WhatsApp!"
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, {
                text: "⏳ Please wait, generating pairing code..."
            }, { quoted: message });

            try {
                const response = await axios.get(
                    `https://knight-bot-paircode.onrender.com/code?number=${number}`
                );

                if (!response.data || !response.data.code) {
                    throw new Error("Invalid API response");
                }

                const code = response.data.code;

                if (code === "Service Unavailable") {
                    throw new Error("Service Unavailable");
                }

                await sleep(5000);

                await sock.sendMessage(chatId, {
                    text: `✅ *Anoymous MD Pairing Code*\n\n🔑 Code: *${code}*\n\nOpen WhatsApp → Linked Devices → Link with phone number`
                }, { quoted: message });

            } catch (apiError) {
                console.error("Pair API Error:", apiError.message);

                await sock.sendMessage(chatId, {
                    text: "❌ Failed to generate pairing code.\nPlease try again later."
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error("Pair Command Error:", error);
        await sock.sendMessage(chatId, {
            text: "❌ An error occurred while processing your request."
        }, { quoted: message });
    }
}

module.exports = pairCommand;
