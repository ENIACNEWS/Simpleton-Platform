/**
 * DeepSeek via Anthropic SDK
 * baseURL: https://api.deepseek.com/anthropic
 *
 * DeepSeek's Anthropic-compatible endpoint lets us use the full Anthropic SDK
 * to call deepseek-chat with extended thinking, Anthropic-format tool use,
 * and streaming — without changing any SDK code.
 *
 * Constraints (from DeepSeek compatibility docs):
 *   - Images          → NOT supported (vision stays with real Claude)
 *   - Thinking        → Supported (budget_tokens is accepted but ignored server-side)
 *   - Tools           → Supported (Anthropic tool format)
 *   - anthropic-beta  → Ignored by DeepSeek — but SDK still works
 */

import Anthropic from '@anthropic-ai/sdk';

// DeepSeek's key is stored under OPENAI_API_KEY in this project
const deepseekViaAnthropic = process.env.OPENAI_API_KEY
  ? new Anthropic({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.deepseek.com/anthropic',
    })
  : null;

// ─── Exported result types ────────────────────────────────────────────────────

export interface ThinkingResult {
  thinking: string;
  response: string;
  model: string;
  method: 'deepseek-thinking';
  hadThinking: boolean;
}

export interface AnthropicCompatResult {
  response: string;
  model: string;
  method: 'deepseek-anthropic';
}

// ─── 1. Extended Thinking ─────────────────────────────────────────────────────
/**
 * Sends the request with thinking enabled.
 * DeepSeek's reasoning chain is captured in the `thinking` field.
 * Use for deep market analysis, complex appraisals, investment advice.
 */
export async function deepseekWithThinking(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 6000,
): Promise<ThinkingResult> {
  if (!deepseekViaAnthropic) throw new Error('DeepSeek Anthropic client not initialized (OPENAI_API_KEY missing)');

  const response = await (deepseekViaAnthropic.messages.create as any)({
    model: 'deepseek-reasoner',
    max_tokens: maxTokens,
    temperature: 0.8,
    thinking: {
      type: 'enabled',
      budget_tokens: 3000,
    },
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  let thinking = '';
  let text = '';

  for (const block of response.content) {
    if (block.type === 'thinking') {
      thinking = (block as any).thinking ?? '';
    } else if (block.type === 'text') {
      text = (block as any).text ?? '';
    }
  }

  if (!text) {
    // Fallback: try without thinking blocks
    text = response.content.find((b: any) => b.type === 'text')?.text ?? '';
  }

  if (!text) throw new Error('DeepSeek thinking returned no text response');

  return {
    thinking,
    response: text,
    model: 'deepseek-reasoner (Extended Thinking)',
    method: 'deepseek-thinking',
    hadThinking: thinking.length > 0,
  };
}

// ─── 2. Standard chat via Anthropic SDK ──────────────────────────────────────
/**
 * Standard deepseek-chat call through the Anthropic SDK.
 * Used as an Anthropic-format provider in the consensus engine.
 */
export async function deepseekAnthropicChat(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 2000,
): Promise<AnthropicCompatResult> {
  if (!deepseekViaAnthropic) throw new Error('DeepSeek Anthropic client not initialized');

  const response = await deepseekViaAnthropic.messages.create({
    model: 'deepseek-chat',
    max_tokens: maxTokens,
    temperature: 0.8,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
  if (!text) throw new Error('DeepSeek Anthropic returned empty response');

  return {
    response: text,
    model: 'deepseek-chat (via Anthropic SDK)',
    method: 'deepseek-anthropic',
  };
}

// ─── 3. Check if client is ready ─────────────────────────────────────────────
export function deepseekAnthropicAvailable(): boolean {
  return !!deepseekViaAnthropic && !!process.env.OPENAI_API_KEY;
}
