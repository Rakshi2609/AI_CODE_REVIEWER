const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
const API_KEY = process.env.GOOGLE_GEMINI_KEY;

if (!API_KEY) {
  console.warn("[AI Fix Service] GOOGLE_GEMINI_KEY is not set. The fix endpoint will fail until configured.");
}

const client = () => new GoogleGenerativeAI(API_KEY);

const normalizeLanguageLabel = (lang) => {
  switch ((lang || '').toLowerCase()) {
    case 'js':
    case 'javascript':
      return 'JavaScript';
    case 'ts':
    case 'typescript':
      return 'TypeScript';
    case 'py':
    case 'python':
      return 'Python';
    case 'c':
      return 'C';
    case 'cpp':
    case 'c++':
      return 'C++';
    case 'java':
      return 'Java';
    default:
      return 'Auto-detected language';
  }
};

module.exports = async function generateFix(code, language, options = {}) {
  const { tone = 'mentor', focus = [] } = options;

  const systemInstruction = `You are an expert polyglot software engineer. Your job is to produce a concise, minimal, and correct FIX for the provided code. Prefer small, targeted edits over full rewrites when possible.

Rules:
- Output strictly in this format:
  ---BEGIN FIX---\n
  <short summary: 1-3 bullet points of the issues fixed>\n
  ---PATCH---\n
  <either a unified diff against the original OR a fully rewritten fixed code block>\n
  ---END PATCH---\n
  ---NOTES---\n
  <brief notes with justification and risks>\n
  ---END FIX---
- If using unified diff, use 'diff --git a/CodeSnippet b/CodeSnippet' heading and proper @@ hunks where possible.
- Preserve original style and structure when safe.
- Do not include any content outside the markers.
- Keep patch minimal and self-contained.
`;

  const languageLabel = normalizeLanguageLabel(language);
  const focusText = Array.isArray(focus) && focus.length ? `Focus areas: ${focus.join(', ')}.` : '';
  const toneText = tone ? `Desired tone: ${tone}.` : '';

  const prompt = `Language: ${languageLabel}\n${focusText}\n${toneText}\n\nOriginal Code:\n\n\u0060\u0060\u0060${(language || '').toLowerCase() || ''}\n${code}\n\u0060\u0060\u0060\n\nProduce the FIX now following the exact format.`;

  try {
    const genAI = client();
    const model = genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction });
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    const text = result?.response?.text?.() || '';

    return text;
  } catch (err) {
    console.error('[AI Fix Service] Error:', err?.message || err);
    throw new Error(err?.message || 'Failed to generate fix');
  }
};
