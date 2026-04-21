import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const formatGroqChatError = (errorText) => {
  try {
    const parsed = JSON.parse(errorText);
    const err = parsed?.error;
    const code = err?.code;
    const type = err?.type;
    const message = err?.message || '';

    if (code === 'insufficient_quota' || type === 'insufficient_quota') {
      return 'Groq: hết hạn mức / lỗi quota. Xem tại https://console.groq.com/';
    }
    if (code === 'rate_limit_exceeded' || type === 'rate_limit' || /rate limit/i.test(message)) {
      return 'Groq: quá nhiều yêu cầu, hãy đợi vài giây rồi thử lại.';
    }
    if (
      code === 'invalid_api_key' ||
      (type === 'invalid_request_error' && message.toLowerCase().includes('api key'))
    ) {
      return 'API key Groq không hợp lệ. Kiểm tra GROQ_API_KEY trong backend/.env';
    }
    if (message) {
      return `Groq: ${message}`;
    }
  } catch {
    // not JSON
  }
  return `Groq request failed: ${errorText}`;
};

const buildSystemInstruction = () => `
You are EnGr, a specialist English learning assistant for Vietnamese students.
Focus on clear, accurate explanations of English: meaning, grammar, usage, collocations, and common mistakes.
Primary tasks:
1) Explain sentence meaning and grammar in clear Vietnamese when helpful.
2) Suggest useful vocabulary with short pronunciation hints (IPA or simple spelling) and natural examples.
3) Keep responses concise, practical, and learner-friendly; prefer standard varieties (e.g. common US/UK) and note if both differ.
4) If the user asks outside English learning, politely redirect to learning support.
Output format:
- Main explanation
- Key points (bullet list)
- 2 short practice examples
`;

const normalizeChatHistory = (history = []) =>
  history
    .filter((item) => item?.role && item?.content)
    .slice(-8)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: String(item.content)
    }));

async function postGroqChat({ message, history }) {
  const normalizedHistory = normalizeChatHistory(history);

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.ai.groqApiKey}`
    },
    body: JSON.stringify({
      model: env.ai.groqModel,
      messages: [
        { role: 'system', content: buildSystemInstruction() },
        ...normalizedHistory,
        { role: 'user', content: String(message) }
      ],
      temperature: 0.45,
      max_tokens: 1800
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(502, formatGroqChatError(errorText));
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new ApiError(502, 'Groq returned an empty response.');
  }

  return { reply: text, model: env.ai.groqModel };
}

async function askGroq({ message, history = [] }) {
  if (!env.ai.groqApiKey) {
    throw new ApiError(500, 'Thiếu GROQ_API_KEY trong backend/.env. Lấy key miễn phí tại https://console.groq.com/keys');
  }
  return postGroqChat({ message, history });
}

async function askGemini({ message, history = [] }) {
  if (!env.ai.geminiApiKey) {
    throw new ApiError(500, 'Missing GEMINI_API_KEY in backend environment.');
  }

  const configuredModel = env.ai.geminiModel;

  const normalizedHistory = history
    .filter((item) => item?.role && item?.content)
    .slice(-8)
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(item.content) }]
    }));

  const makeRequest = (modelName) =>
    fetch(`${GEMINI_URL}/${modelName}:generateContent?key=${env.ai.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemInstruction() }]
        },
        contents: [...normalizedHistory, { role: 'user', parts: [{ text: message }] }]
      })
    });

  let model = configuredModel;
  let response = await makeRequest(model);

  if (response.status === 404) {
    const listResponse = await fetch(`${GEMINI_URL}?key=${env.ai.geminiApiKey}`);
    if (listResponse.ok) {
      const listData = await listResponse.json();
      const models = Array.isArray(listData?.models) ? listData.models : [];
      const candidates = models.filter((item) => item?.supportedGenerationMethods?.includes('generateContent'));

      const preferred =
        candidates.find((item) => item.name?.includes('flash')) ||
        candidates.find((item) => item.name?.includes('gemini')) ||
        candidates[0];

      if (preferred?.name) {
        model = preferred.name.replace('models/', '');
        response = await makeRequest(model);
      }
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(502, `Gemini request failed: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new ApiError(502, 'Gemini returned an empty response.');
  }

  return { reply: text, model };
}

export const aiService = {
  async askAssistant({ message, history = [] }) {
    if (env.ai.provider === 'gemini') {
      return askGemini({ message, history });
    }
    return askGroq({ message, history });
  }
};
