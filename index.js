/**
 * Aɴᴏʏᴍᴏᴜs MD - A WhatsApp Bot
 * Copyright (c) 202𝟼 Bᴀsʜɪʀɪ
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by Black & Normangreen
 */
require('./settings')
const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    jidDecode,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { rmSync } = require('fs')

// Import lightweight store
const store = require('./lib/lightweight_store')

store.readFromFile()
const settings = require('./settings')
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

let owner = JSON.parse(fs.readFileSync('./data/owner.json'))

global.botname = "Aɴᴏʏᴍᴏᴜs MD"
global.themeemoji = "•"

// Readline interface for interactive prompts
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => rl ? new Promise(resolve => rl.question(text, resolve)) : Promise.resolve(settings.ownerNumber || "256701487186")

async function startXeonBotInc() {
    try {
        console.log(chalk.yellow('🔄 Creating socket...'))
        let { version, isLatest } = await fetchLatestBaileysVersion()
        const { state, saveCreds } = await useMultiFileAuthState(`./session`)
        const msgRetryCounterCache = new NodeCache()

        const XeonBotInc = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid)
                let msg = await store.loadMessage(jid, key.id)
                return msg?.message || ""
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        })

        XeonBotInc.ev.on('creds.update', saveCreds)
        store.bind(XeonBotInc.ev)

        // ---- PAIRING CODE: ASK FOR NUMBER IF NO SESSION ----
        if (!XeonBotInc.authState.creds.registered) {
            console.log(chalk.yellow('No valid session found. Please enter your phone number.'))
            let phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`\nEnter your WhatsApp number (without + or spaces) : `)))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            if (!require('awesome-phonenumber')('+' + phoneNumber).isValid()) {
                console.log(chalk.red('Invalid number. Please use international format (e.g., 256701487186).'))
                process.exit(1)
            }
            console.log(chalk.yellow(`📞 Requesting pairing code for ${phoneNumber}...`))
            setTimeout(async () => {
                try {
                    let code = await XeonBotInc.requestPairingCode(phoneNumber)
                    code = code?.match(/.{1,4}/g)?.join("-") || code
                    console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
                    console.log(chalk.yellow(`\nEnter this code in WhatsApp → Settings → Linked Devices → Link with phone number`))
                } catch (error) {
                    console.error(chalk.red('Error requesting pairing code:'), error)
                }
            }, 3000)
        } else {
            console.log(chalk.green('✅ Already registered. Connecting...'))
        }
        // ---- END PAIRING CODE ----

        // ---- Event handlers (same as before) ----
        XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0]
                if (!mek.message) return
                mek.message = Object.keys(mek.message)[0] === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message
                if (mek.key && mek.key.remoteJid === 'status@broadcast') return await handleStatus(XeonBotInc, chatUpdate)

                if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') {
                    const isGroup = mek.key?.remoteJid?.endsWith('@g.us')
                    if (!isGroup) return
                }
                if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

                if (XeonBotInc?.msgRetryCounterCache) XeonBotInc.msgRetryCounterCache.clear()

                try {
                    await handleMessages(XeonBotInc, chatUpdate, true)
                } catch (err) {
                    console.error("Error in handleMessages:", err)
                    if (mek.key && mek.key.remoteJid) {
                        await XeonBotInc.sendMessage(mek.key.remoteJid, {
                            text: `❌ An error occurred.\n\n📢 Join our WhatsApp Channel:\nhttps://whatsapp.com/channel/0029VbCTghVBA1f3zXA50Z1z`
                        }).catch(console.error)
                    }
                }
            } catch (err) {
                console.error("Error in messages.upsert:", err)
            }
        })

        XeonBotInc.decodeJid = (jid) => {
            if (!jid) return jid
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {}
                return decode.user && decode.server ? decode.user + '@' + decode.server : jid
            } else return jid
        }

        XeonBotInc.ev.on('contacts.update', update => {
            for (let contact of update) {
                let id = XeonBotInc.decodeJid(contact.id)
                if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
            }
        })

        XeonBotInc.getName = (jid, withoutContact = false) => {
            id = XeonBotInc.decodeJid(jid)
            withoutContact = XeonBotInc.withoutContact || withoutContact
            let v
            if (id.endsWith("@g.us")) return new Promise(async resolve => {
                v = store.contacts[id] || {}
                if (!(v.name || v.subject)) v = XeonBotInc.groupMetadata(id) || {}
                resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
            })
            else v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : id === XeonBotInc.decodeJid(XeonBotInc.user.id) ? XeonBotInc.user : (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
        }

        XeonBotInc.public = true
        XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store)

        XeonBotInc.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s
            if (qr) console.log(chalk.yellow('📱 QR Code generated (but disabled).'))
            if (connection === 'connecting') console.log(chalk.yellow('🔄 Connecting...'))
            if (connection == "open") {
                console.log(chalk.yellow(`🌿 Connected as ${global.botname}`))
                console.log(chalk.magenta(`${global.themeemoji} WA NUMBER: ${owner}`))
                console.log(chalk.magenta(`${global.themeemoji} CREDIT: Bashiri`))
            }
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
                if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut) {
                    rmSync('./session', { recursive: true, force: true })
                    console.log(chalk.red('Session logged out. Re-authenticate.'))
                }
                if (shouldReconnect) {
                    console.log(chalk.yellow('Reconnecting...'))
                    await delay(5000)
                    startXeonBotInc()
                }
            }
        })

        const antiCallNotified = new Set();
        XeonBotInc.ev.on('call', async (calls) => {
            try {
                const { readState: readAnticallState } = require('./commands/anticall');
                const state = readAnticallState();
                if (!state.enabled) return;
                for (const call of calls) {
                    const callerJid = call.from || call.peerJid || call.chatId;
                    if (!callerJid) continue;
                    try {
                        if (typeof XeonBotInc.rejectCall === 'function' && call.id) await XeonBotInc.rejectCall(call.id, callerJid)
                        if (!antiCallNotified.has(callerJid)) {
                            antiCallNotified.add(callerJid)
                            setTimeout(() => antiCallNotified.delete(callerJid), 60000)
                            await XeonBotInc.sendMessage(callerJid, { text: '📵 Anticall is enabled. Your call was rejected and you will be blocked.' })
                        }
                    } catch {}
                    setTimeout(async () => { try { await XeonBotInc.updateBlockStatus(callerJid, 'block'); } catch {} }, 800)
                }
            } catch {}
        })

        XeonBotInc.ev.on('group-participants.update', async update => await handleGroupParticipantUpdate(XeonBotInc, update))
        XeonBotInc.ev.on('messages.upsert', async m => await handleStatus(XeonBotInc, m))
        XeonBotInc.ev.on('status.update', async status => await handleStatus(XeonBotInc, status))
        XeonBotInc.ev.on('messages.reaction', async status => await handleStatus(XeonBotInc, status))

        return XeonBotInc
    } catch (error) {
        console.error('Error in startXeonBotInc:', error)
        await delay(5000)
        startXeonBotInc()
    }
}

startXeonBotInc().catch(error => { console.error('Fatal error:', error); process.exit(1) })
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err))
process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err))

let file = require.resolve(__filename)
fs.watchFile(file, () => { fs.unwatchFile(file); console.log(chalk.redBright(`Update ${__filename}`)); delete require.cache[file]; require(file) })