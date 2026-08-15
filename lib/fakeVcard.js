// Fake vcard for quoting messages
function getFakeVcard() {
    return {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast'
        },
        message: {
            conversation: '📢'
        }
    };
}

module.exports = getFakeVcard;
