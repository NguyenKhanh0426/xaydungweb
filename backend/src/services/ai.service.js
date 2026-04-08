import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const buildSystemInstruction = () => `
You are EnGr, an English learning assistant for Vietnamese students.
Primary tasks:
1) Explain sentence meaning and grammar in clear Vietnamese.
2) Suggest useful vocabulary with pronunciation and examples.
3) Keep responses concise, practical, and learner-friendly.
4) If user asks outside English learning, politely redirect to learning support.
Output format:
- Main explanation
- Key points (bullet list)
- 2 short practice examples
`;

export const aiService = {
  async askAssistant({ message, history = [] }) {
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

    const makeRequest = (modelName) => fetch(
      `${GEMINI_URL}/${modelName}:generateContent?key=${env.ai.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemInstruction() }]
          },
          contents: [
            ...normalizedHistory,
            { role: 'user', parts: [{ text: message }] }
          ]
        })
      }
    );

    let model = configuredModel;
    let response = await makeRequest(model);

    // If configured model is unavailable, try discovering a supported model automatically.
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
};
