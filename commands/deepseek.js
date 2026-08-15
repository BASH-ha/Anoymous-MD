const axios = require('axios');
const getFakeVcard = require('../lib/fakeVcard');
const { getLang } = require('../lib/lang');

// ── Same AI models as chatbot ──
const AI_MODELS = [
    { name: 'GPT-4o', model: 'gpt-4o' },
    { name: 'DeepSeek', model: 'deepseek' },
    { name: 'Gemini', model: 'gemini' },
];

const CHAT_API = 'https://chatadmin.org/gd-api/v1/chat/send';
const FIREBASE_API_KEY = 'AIzaSyD7w2BvFDOoPofWuBWzDZGsRNG-3eX4CUc';

async function getFirebaseToken() {
    const res = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
        {},
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    return res.data.idToken;
}

async function queryAI(userMessage) {
    let token;
    try {
        token = await getFirebaseToken();
    } catch (err) {
        console.error('[DEEPSEEK] Firebase token failed:', err.message);
        return null;
    }

    const systemPrompt =
        'You are a helpful AI assistant. Keep replies concise and conversational.';

    for (const ai of AI_MODELS) {
        try {
            const apiMessages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ];

            const res = await axios.post(
                CHAT_API,
                {
                    model: ai.model,
                    isPro: true,
                    messages: apiMessages,
                },
                {
                    timeout: 20000,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (res.data?.success && res.data?.message?.content) {
                console.log(`[DEEPSEEK] Response from ${ai.name}`);
                return { answer: res.data.message.content, model: ai.name };
            }
        } catch (err) {
            console.log(`[DEEPSEEK] ${ai.name} failed:`, err.message);
        }
    }

    // Fallback: try a free public API
    try {
        const fallbackRes = await axios.get(
            `https://api.siputzx.my.id/api/ai/gpt?query=${encodeURIComponent(userMessage)}`,
            { timeout: 15000 }
        );
        if (fallbackRes.data?.data?.message) {
            return { answer: fallbackRes.data.data.message, model: 'GPT-Fallback' };
        }
    } catch (e) {
        console.log('[DEEPSEEK] Fallback API failed:', e.message);
    }

    return null;
}

async function deepseekCommand(sock, chatId, message, query) {
    try {
        await sock.sendMessage(chatId, {
            react: { text: '🤖', key: message.key },
        });

        if (!query) {
            await sock.sendMessage(
                chatId,
                { text: '❌ Please provide a question.\nExample: .deepseek What is AI?' },
                { quoted: getFakeVcard() }
            );
            return;
        }

        const result = await queryAI(query);

        if (result) {
            await sock.sendMessage(chatId, { text: result.answer }, { quoted: getFakeVcard() });
            await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
        } else {
            throw new Error('All AI services failed');
        }
    } catch (error) {
        console.error('Deepseek API Error:', error.message);
        await sock.sendMessage(
            chatId,
            { text: getLang(sock).deepseek_failed || '❌ AI service unavailable. Please try later.' },
            { quoted: getFakeVcard() }
        );
    }
}

module.exports = { deepseekCommand };