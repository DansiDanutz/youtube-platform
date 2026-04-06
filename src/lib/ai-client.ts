/**
 * Fleet AI Client for YouTube Studio
 * Routes through Dan's Lab model stack (cheapest capable first):
 * 1. OpenRouter → google/gemini-2.5-flash (FREE, BYOK)
 * 2. OpenRouter → qwen/qwen3.6-plus:free (FREE, 1M ctx)
 * 3. Local Ollama → qwen3:8b (FREE, local)
 * 4. XAI Grok / OpenAI (paid fallback)
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
}

async function callOpenRouter(messages: AIMessage[], model: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nervix.ai',
      'X-Title': 'YouTube Studio',
    },
    body: JSON.stringify({ model, messages, temperature: 0.8, max_tokens: 2000 }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function callOllama(messages: AIMessage[], model = 'qwen3:8b'): Promise<string | null> {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.8, max_tokens: 2000 }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function callXAI(messages: AIMessage[]): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'grok-3-mini-fast', messages, temperature: 0.8, max_tokens: 2000 }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function callOpenAI(messages: AIMessage[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.8, max_tokens: 2000 }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}

/**
 * Call the AI fleet in priority order.
 * Returns the first successful response.
 */
export async function callAI(messages: AIMessage[]): Promise<AIResponse | null> {
  // 1. Gemini Flash — free via BYOK OpenRouter
  const gemini = await callOpenRouter(messages, 'google/gemini-2.5-flash').catch(() => null);
  if (gemini) return { text: gemini, provider: 'openrouter', model: 'gemini-2.5-flash' };

  // 2. Qwen 3.6 Plus — free via OpenRouter
  const qwen = await callOpenRouter(messages, 'qwen/qwen3.6-plus:free').catch(() => null);
  if (qwen) return { text: qwen, provider: 'openrouter', model: 'qwen3.6-plus' };

  // 3. Local Ollama Qwen3 — always free
  const ollama = await callOllama(messages).catch(() => null);
  if (ollama) return { text: ollama, provider: 'ollama', model: 'qwen3:8b' };

  // 4. XAI Grok
  const xai = await callXAI(messages).catch(() => null);
  if (xai) return { text: xai, provider: 'xai', model: 'grok-3-mini-fast' };

  // 5. OpenAI
  const openai = await callOpenAI(messages).catch(() => null);
  if (openai) return { text: openai, provider: 'openai', model: 'gpt-4o-mini' };

  return null;
}

/**
 * Parse JSON from AI response, with fallback text extraction.
 */
export function parseJSON<T>(text: string): T | null {
  // Strip markdown code fences
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try extracting first JSON object/array
    const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
      try {
        return JSON.parse(match[1]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
