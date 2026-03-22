/**
 * Claude Sonnet 4.6 via Anthropic SDK — Simplicity's Brain
 *
 * Powered by Anthropic's Claude API with prompt caching for cost efficiency.
 * The system prompt (personality, market data, self-awareness) is cached
 * for up to 1 hour, reducing input costs by ~90% on subsequent requests.
 *
 * Model: claude-sonnet-4-6
 * Prompt caching: enabled (cache_control: ephemeral on system blocks)
 */

import Anthropic from '@anthropic-ai/sdk';

const claudeClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null;

// ═══════════════════════════════════════════════════════════════════════════════
// Exported result types
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Extended Thinking (Claude with extended thinking)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Claude with extended thinking enabled.
 * Uses Anthropic's native extended thinking for deep reasoning tasks.
 * budget_tokens controls how long Claude can think before responding.
 */
export async function deepseekWithThinking(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 8000,
): Promise<ThinkingResult> {
  if (!claudeClient) throw new Error('Claude client not initialized — set ANTHROPIC_API_KEY');

  const response = await claudeClient.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    thinking: {
      type: 'enabled',
      budget_tokens: 3000,
    },
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
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
    // Fallback: try the full content as text
    text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');
  }

  if (!text) throw new Error('Claude thinking returned no text response');

  return {
    thinking,
    response: text,
    model: 'Claude Sonnet 4.6 (Extended Thinking)',
    method: 'deepseek-thinking',
    hadThinking: thinking.length > 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Standard chat via Anthropic SDK (with prompt caching)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standard Claude Sonnet 4.6 call with prompt caching.
 * The system prompt is marked with cache_control: ephemeral so repeated
 * conversations reuse the cached prompt at ~90% cost reduction.
 *
 * Keeps the same export signature as the old DeepSeek provider so
 * ai-engine.ts and multi-ai-provider.ts continue to work unchanged.
 */
export async function deepseekAnthropicChat(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 2000,
): Promise<AnthropicCompatResult> {
  if (!claudeClient) throw new Error('Claude client not initialized — set ANTHROPIC_API_KEY');

  const response = await claudeClient.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    temperature: 0.8,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('');

  if (!text) throw new Error('Claude returned no text response');

  return {
    response: text,
    model: 'Claude Sonnet 4.6',
    method: 'deepseek-anthropic',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Streaming chat (for real-time responses)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Streaming version of Claude chat for real-time token delivery.
 * Uses prompt caching on the system prompt for efficiency.
 */
export async function* claudeStreamChat(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 2000,
): AsyncGenerator<string, void, unknown> {
  if (!claudeClient) throw new Error('Claude client not initialized — set ANTHROPIC_API_KEY');

  const stream = claudeClient.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    temperature: 0.8,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && (event.delta as any).type === 'text_delta') {
      yield (event.delta as any).text;
    }
  }
}
