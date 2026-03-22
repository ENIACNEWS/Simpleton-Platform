import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

// Types and interfaces
interface ProviderResponse {
  provider: string;
  content: string;
  latencyMs: number;
  tokensUsed?: {
    input: number;
    output: number;
  };
  error?: string;
}

interface MultiProviderResult {
  responses: ProviderResponse[];
  successCount: number;
  failureCount: number;
  queriedProviders: string[];
}

interface ConsensusResult {
  answer: string;
  confidence: 'high' | 'medium' | 'single-source' | 'low';
  agreingProviders: string[];
  disagreingProviders: string[];
  details: {
    [provider: string]: string;
  };
}

interface QueryOptions {
  timeoutMs?: number;
  maxTokens?: number;
  temperature?: number;
  logResults?: boolean;
}

interface ProviderPriority {
  [provider: string]: number;
}

// Configuration
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_TOKENS = 1000;
const DEFAULT_TEMPERATURE = 0.7;

const DEFAULT_PROVIDER_PRIORITY: ProviderPriority = {
  Anthropic: 3,
  OpenAI: 2,
  Google: 1,
};

// Initialize SDK clients
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropicClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const googleClient = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY })
  : null;

// Helper: Create timeout promise
function createTimeoutPromise<T>(timeoutMs: number): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
  );
}

// Helper: Query OpenAI
async function queryOpenAI(
  prompt: string,
  systemPrompt: string,
  options: QueryOptions
): Promise<ProviderResponse> {
  if (!openaiClient) {
    throw new Error('OpenAI API key not configured');
  }

  const startTime = Date.now();

  try {
    const response = await Promise.race([
      openaiClient.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
        temperature: options.temperature || DEFAULT_TEMPERATURE,
      }),
      createTimeoutPromise<any>(options.timeoutMs || DEFAULT_TIMEOUT_MS),
    ]);

    const latencyMs = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || '';

    return {
      provider: 'OpenAI',
      content,
      latencyMs,
      tokensUsed: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
      },
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      provider: 'OpenAI',
      content: '',
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper: Query Anthropic
async function queryAnthropic(
  prompt: string,
  systemPrompt: string,
  options: QueryOptions
): Promise<ProviderResponse> {
  if (!anthropicClient) {
    throw new Error('Anthropic API key not configured');
  }

  const startTime = Date.now();

  try {
    const response = await Promise.race([
      anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
      createTimeoutPromise<any>(options.timeoutMs || DEFAULT_TIMEOUT_MS),
    ]);

    const latencyMs = Date.now() - startTime;
    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

    return {
      provider: 'Anthropic',
      content,
      latencyMs,
      tokensUsed: {
        input: response.usage?.input_tokens || 0,
        output: response.usage?.output_tokens || 0,
      },
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      provider: 'Anthropic',
      content: '',
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper: Query Google Gemini
async function queryGoogle(
  prompt: string,
  systemPrompt: string,
  options: QueryOptions
): Promise<ProviderResponse> {
  if (!googleClient) {
    throw new Error('Google AI API key not configured');
  }

  const startTime = Date.now();

  try {
    const model = googleClient.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: systemPrompt,
    });

    const response = await Promise.race([
      model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
      createTimeoutPromise<any>(options.timeoutMs || DEFAULT_TIMEOUT_MS),
    ]);

    const latencyMs = Date.now() - startTime;
    const content = response.response.text();

    // Note: Google's response doesn't include token usage in the free API tier
    return {
      provider: 'Google',
      content,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      provider: 'Google',
      content: '',
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Main function: Query all available providers in parallel
async function queryMultipleProviders(
  prompt: string,
  systemPrompt: string = 'You are a helpful AI assistant.',
  options: QueryOptions = {}
): Promise<MultiProviderResult> {
  if (!prompt || prompt.trim() === '') {
    throw new Error('Prompt cannot be empty');
  }

  const queriedProviders: string[] = [];
  const queries: Promise<ProviderResponse>[] = [];

  if (openaiClient) {
    queriedProviders.push('OpenAI');
    queries.push(queryOpenAI(prompt, systemPrompt, options));
  }

  if (anthropicClient) {
    queriedProviders.push('Anthropic');
    queries.push(queryAnthropic(prompt, systemPrompt, options));
  }

  if (googleClient) {
    queriedProviders.push('Google');
    queries.push(queryGoogle(prompt, systemPrompt, options));
  }

  if (queries.length === 0) {
    throw new Error('No AI providers configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_API_KEY');
  }

  // Execute all queries in parallel, catching failures gracefully
  const results = await Promise.allSettled(queries);

  const responses: ProviderResponse[] = results
    .map((result) => (result.status === 'fulfilled' ? result.value : null))
    .filter((response) => response !== null) as ProviderResponse[];

  const successCount = responses.filter((r) => !r.error).length;
  const failureCount = responses.filter((r) => r.error).length;

  if (options.logResults) {
    console.log(`[Multi-AI] Queried ${queriedProviders.length} providers`, {
      providers: queriedProviders,
      successCount,
      failureCount,
      avgLatency: Math.round(responses.reduce((sum, r) => sum + r.latencyMs, 0) / responses.length),
    });
  }

  return {
    responses,
    successCount,
    failureCount,
    queriedProviders,
  };
}

// Function: Get best response based on quality and provider priority
function getBestResponse(
  responses: ProviderResponse[],
  priorities?: ProviderPriority
): ProviderResponse | null {
  const validResponses = responses.filter(
    (r) => !r.error && r.content && r.content.trim().length > 0
  );

  if (validResponses.length === 0) {
    return null;
  }

  if (validResponses.length === 1) {
    return validResponses[0];
  }

  const priorityMap = { ...DEFAULT_PROVIDER_PRIORITY, ...(priorities || {}) };

  // Score responses based on:
  // 1. Provider priority
  // 2. Response length (penalize very short or very long responses)
  // 3. Latency (slight preference for faster responses)
  const scored = validResponses.map((response) => {
    const priority = priorityMap[response.provider] || 0;
    const contentLength = response.content.length;
    const lengthScore =
      contentLength < 50
        ? -1 // Too short
        : contentLength > 2000
          ? -0.5 // Too long
          : 1; // Just right
    const latencyScore = 1 / (1 + response.latencyMs / 1000); // Faster is better

    const score = priority * 1000 + lengthScore * 100 + latencyScore * 10;
    return { response, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].response;
}

// Function: Query with consensus detection
async function queryWithConsensus(
  prompt: string,
  systemPrompt: string = 'You are a helpful AI assistant.',
  options: QueryOptions = {}
): Promise<ConsensusResult> {
  const result = await queryMultipleProviders(prompt, systemPrompt, options);
  const validResponses = result.responses.filter((r) => !r.error && r.content);

  if (validResponses.length === 0) {
    return {
      answer: 'No valid responses received from any provider.',
      confidence: 'low',
      agreingProviders: [],
      disagreingProviders: result.responses.map((r) => r.provider),
      details: {},
    };
  }

  if (validResponses.length === 1) {
    return {
      answer: validResponses[0].content,
      confidence: 'single-source',
      agreingProviders: [validResponses[0].provider],
      disagreingProviders: [],
      details: {
        [validResponses[0].provider]: validResponses[0].content,
      },
    };
  }

  // Normalize responses for comparison (lowercase, remove extra whitespace)
  const normalized = validResponses.map((r) => ({
    ...r,
    normalized: r.content.toLowerCase().replace(/\s+/g, ' ').trim(),
  }));

  // Find consensus by checking if responses are very similar (>80% overlap)
  const firstNormalized = normalized[0].normalized;
  const agreingProviders: string[] = [normalized[0].provider];
  const disagreingProviders: string[] = [];

  for (let i = 1; i < normalized.length; i++) {
    const similarity = calculateSimilarity(firstNormalized, normalized[i].normalized);
    if (similarity > 0.8) {
      agreingProviders.push(normalized[i].provider);
    } else {
      disagreingProviders.push(normalized[i].provider);
    }
  }

  const details = Object.fromEntries(validResponses.map((r) => [r.provider, r.content]));

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (agreingProviders.length === validResponses.length) {
    confidence = 'high'; // All providers agree
  } else if (agreingProviders.length > disagreingProviders.length) {
    confidence = 'medium'; // Majority agrees
  }

  // Return the best response from agreeing providers
  const bestFromAgreeing = validResponses.find((r) => agreingProviders.includes(r.provider));

  return {
    answer: bestFromAgreeing?.content || validResponses[0].content,
    confidence,
    agreingProviders,
    disagreingProviders,
    details,
  };
}

// Helper: Calculate similarity between two strings (simple word overlap)
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(' '));
  const words2 = new Set(str2.split(' '));

  const intersection = [...words1].filter((w) => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;

  return union === 0 ? 0 : intersection / union;
}

// Singleton instance
const multiAIProvider = {
  queryMultipleProviders,
  getBestResponse,
  queryWithConsensus,
  getConfiguredProviders: () => {
    return {
      openai: !!openaiClient,
      anthropic: !!anthropicClient,
      google: !!googleClient,
    };
  },
};

export {
  multiAIProvider,
  queryMultipleProviders,
  getBestResponse,
  queryWithConsensus,
  ProviderResponse,
  MultiProviderResult,
  ConsensusResult,
  QueryOptions,
  ProviderPriority,
};

export default multiAIProvider;
