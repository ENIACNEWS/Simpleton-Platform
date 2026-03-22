/**
 * Multi-Provider AI Consensus Engine
 * Aggregates intelligence from 20+ AI providers using parallel processing
 * and consensus algorithms for more accurate responses than any single model.
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    timeout,
  ]);
}

function requiresLiveData(message: string): boolean {
  return /current\s*price|spot\s*price|how\s*much\s*is|what.*worth|price\s*today|live\s*price|buy\s*price|sell\s*price|melt\s*value|today.*price|going\s*for|market\s*price|per\s*oz|per\s*ounce|per\s*carat|\$\d|calculate.*value|calculate.*price|value.*today|quote\s*me|what.*cost|what.*pay|how.*much.*gold|how.*much.*silver|gold.*price|silver.*price|platinum.*price|palladium.*price|coin.*value|coin.*worth|watch.*value|watch.*worth|rolex.*worth|rolex.*value|diamond.*price|diamond.*worth/i.test(message);
}

interface AIResponse {
  provider: string;
  model: string;
  response: string;
  confidence: number;
  responseTime: number;
  timestamp: number;
}

interface ConsensusResult {
  synthesizedResponse: string;
  consensusScore: number;
  participatingModels: string[];
  enhancements: string[];
  processingTime: number;
  confidenceLevel: 'HIGHEST' | 'HIGH' | 'MODERATE' | 'STANDARD';
  activeProviders: number;
  totalProviders: number;
}

interface ProviderConfig {
  name: string;
  type: 'openai-compatible' | 'anthropic' | 'anthropic-compat' | 'gemini' | 'gemini-native' | 'cohere' | 'huggingface';
  models: string[];
  envKey: string;
  baseUrl?: string;
  envBaseUrl?: string;
  available: boolean;
}

class MultiProviderAIEngine {
  private providers: Map<string, ProviderConfig> = new Map();
  private clients: Map<string, any> = new Map();
  private activeCount = 0;

  constructor() {
    this.registerAllProviders();
    this.initializeClients();
    console.log(`✅ AI Engine initialized: ${this.activeCount}/${this.providers.size} providers active`);
  }

  private registerAllProviders() {
    const providerDefs: ProviderConfig[] = [
      {
        name: 'OpenAI',
        type: 'openai-compatible',
        models: ['gpt-4o', 'gpt-4o-mini', 'o1-mini'],
        envKey: 'AI_INTEGRATIONS_OPENAI_API_KEY',
        envBaseUrl: 'AI_INTEGRATIONS_OPENAI_BASE_URL',
        available: false,
      },
      {
        name: 'Anthropic',
        type: 'anthropic',
        models: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
        envKey: 'ANTHROPIC_API_KEY',
        available: false,
      },
      {
        name: 'Google Gemini',
        type: 'gemini',
        models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
        envKey: 'AI_INTEGRATIONS_GEMINI_API_KEY',
        envBaseUrl: 'AI_INTEGRATIONS_GEMINI_BASE_URL',
        available: false,
      },
      {
        name: 'Google AI',
        type: 'gemini-native',
        models: ['gemini-2.5-pro', 'gemini-2.5-flash'],
        envKey: 'GOOGLE_AI_API_KEY',
        available: false,
      },
      {
        name: 'DeepSeek',
        type: 'openai-compatible',
        models: ['deepseek-chat', 'deepseek-reasoner'],
        envKey: 'OPENAI_API_KEY',
        baseUrl: 'https://api.deepseek.com',
        available: false,
      },
      {
        name: 'DeepSeek (Anthropic)',
        type: 'anthropic-compat',
        models: ['deepseek-chat'],
        envKey: 'OPENAI_API_KEY',
        baseUrl: 'https://api.deepseek.com/anthropic',
        available: false,
      },
      {
        name: 'Groq',
        type: 'openai-compatible',
        models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
        envKey: 'GROQ_API_KEY',
        baseUrl: 'https://api.groq.com/openai/v1',
        available: false,
      },
      {
        name: 'Mistral',
        type: 'openai-compatible',
        models: ['mistral-large-latest', 'mistral-small-latest'],
        envKey: 'MISTRAL_API_KEY',
        baseUrl: 'https://api.mistral.ai/v1',
        available: false,
      },
      {
        name: 'Perplexity',
        type: 'openai-compatible',
        models: ['llama-3.1-sonar-large-128k-online'],
        envKey: 'PERPLEXITY_API_KEY',
        baseUrl: 'https://api.perplexity.ai',
        available: false,
      },
      {
        name: 'Together AI',
        type: 'openai-compatible',
        models: ['meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'],
        envKey: 'TOGETHER_API_KEY',
        baseUrl: 'https://api.together.xyz/v1',
        available: false,
      },
      {
        name: 'Fireworks AI',
        type: 'openai-compatible',
        models: ['accounts/fireworks/models/llama-v3p1-70b-instruct'],
        envKey: 'FIREWORKS_API_KEY',
        baseUrl: 'https://api.fireworks.ai/inference/v1',
        available: false,
      },
      {
        name: 'OpenRouter',
        type: 'openai-compatible',
        models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5'],
        envKey: 'OPENROUTER_API_KEY',
        baseUrl: 'https://openrouter.ai/api/v1',
        available: false,
      },
      {
        name: 'xAI',
        type: 'openai-compatible',
        models: ['grok-2'],
        envKey: 'XAI_API_KEY',
        baseUrl: 'https://api.x.ai/v1',
        available: false,
      },
      {
        name: 'Cohere',
        type: 'cohere',
        models: ['command-r-plus', 'command-r'],
        envKey: 'COHERE_API_KEY',
        available: false,
      },
      {
        name: 'Hugging Face',
        type: 'huggingface',
        models: ['meta-llama/Meta-Llama-3-8B-Instruct'],
        envKey: 'HUGGINGFACE_API_KEY',
        available: false,
      },
      {
        name: 'AI21 Labs',
        type: 'openai-compatible',
        models: ['jamba-1.5-large'],
        envKey: 'AI21_API_KEY',
        baseUrl: 'https://api.ai21.com/v1',
        available: false,
      },
      {
        name: 'Cerebras',
        type: 'openai-compatible',
        models: ['llama3.1-70b'],
        envKey: 'CEREBRAS_API_KEY',
        baseUrl: 'https://api.cerebras.ai/v1',
        available: false,
      },
      {
        name: 'SambaNova',
        type: 'openai-compatible',
        models: ['Meta-Llama-3.1-70B-Instruct'],
        envKey: 'SAMBANOVA_API_KEY',
        baseUrl: 'https://api.sambanova.ai/v1',
        available: false,
      },
      {
        name: 'Lepton AI',
        type: 'openai-compatible',
        models: ['llama3-70b'],
        envKey: 'LEPTON_API_KEY',
        baseUrl: 'https://llama3-70b.lepton.run/api/v1',
        available: false,
      },
      {
        name: 'Novita AI',
        type: 'openai-compatible',
        models: ['meta-llama/llama-3.1-70b-instruct'],
        envKey: 'NOVITA_API_KEY',
        baseUrl: 'https://api.novita.ai/v3/openai',
        available: false,
      },
      {
        name: 'Hyperbolic',
        type: 'openai-compatible',
        models: ['meta-llama/Meta-Llama-3.1-70B-Instruct'],
        envKey: 'HYPERBOLIC_API_KEY',
        baseUrl: 'https://api.hyperbolic.xyz/v1',
        available: false,
      },
      {
        name: 'Anyscale',
        type: 'openai-compatible',
        models: ['meta-llama/Meta-Llama-3-70B-Instruct'],
        envKey: 'ANYSCALE_API_KEY',
        baseUrl: 'https://api.endpoints.anyscale.com/v1',
        available: false,
      },
    ];

    for (const provider of providerDefs) {
      provider.available = !!process.env[provider.envKey];
      if (provider.envBaseUrl) {
        provider.available = provider.available && !!process.env[provider.envBaseUrl];
      }
      this.providers.set(provider.name, provider);
    }
  }

  private initializeClients() {
    this.providers.forEach((config, name) => {
      if (!config.available) return;

      try {
        if (config.type === 'openai-compatible') {
          const baseURL = config.envBaseUrl 
            ? process.env[config.envBaseUrl] 
            : config.baseUrl;
          this.clients.set(name, new OpenAI({
            apiKey: process.env[config.envKey],
            baseURL: baseURL,
          }));
          this.activeCount++;
        } else if (config.type === 'anthropic') {
          this.clients.set(name, new Anthropic({
            apiKey: process.env[config.envKey],
          }));
          this.activeCount++;
        } else if (config.type === 'anthropic-compat') {
          // DeepSeek via Anthropic SDK — uses DeepSeek's Anthropic-compatible endpoint
          this.clients.set(name, new Anthropic({
            apiKey: process.env[config.envKey],
            baseURL: config.baseUrl,
          }));
          this.activeCount++;
        } else if (config.type === 'gemini') {
          const gemini = new GoogleGenAI({
            apiKey: process.env[config.envKey],
            httpOptions: {
              apiVersion: '',
              baseUrl: process.env[config.envBaseUrl!],
            },
          });
          this.clients.set(name, gemini);
          this.activeCount++;
        } else if (config.type === 'gemini-native') {
          const geminiNative = new GoogleGenAI({
            apiKey: process.env[config.envKey],
          });
          this.clients.set(name, geminiNative);
          this.activeCount++;
        } else if (config.type === 'cohere') {
          this.clients.set(name, { apiKey: process.env[config.envKey] });
          this.activeCount++;
        } else if (config.type === 'huggingface') {
          this.clients.set(name, { apiKey: process.env[config.envKey] });
          this.activeCount++;
        }
      } catch (err) {
        console.error(`⚠️ Failed to initialize ${name}:`, err);
      }
    });
  }

  getProviderStatus(): { name: string; active: boolean; models: string[]; type: string }[] {
    const status: { name: string; active: boolean; models: string[]; type: string }[] = [];
    this.providers.forEach((config, name) => {
      status.push({
        name,
        active: config.available && this.clients.has(name),
        models: config.models,
        type: config.type,
      });
    });
    return status;
  }

  getActiveProviderCount(): number {
    return this.activeCount;
  }

  getTotalProviderCount(): number {
    return this.providers.size;
  }

  async processWithConsensus(userMessage: string, systemPrompt?: string, image?: string): Promise<ConsensusResult> {
    const startTime = performance.now();
    const activeProviders = this.getActiveProviderNames();
    console.log(`⚡ Consensus: Querying ${activeProviders.length} providers in parallel...`);

    const responses = await this.queryAllProviders(userMessage, systemPrompt, image);

    if (responses.length === 0) {
      throw new Error('No AI providers returned a response');
    }

    let finalResponse: string;
    let consensusScore: number;

    if (responses.length >= 2) {
      const consensus = this.calculateConsensus(responses);
      consensusScore = consensus.score;
      finalResponse = await this.synthesizeResponses(responses, userMessage, systemPrompt);
    } else {
      consensusScore = responses[0].confidence;
      finalResponse = responses[0].response;
    }

    const processingTime = performance.now() - startTime;

    return {
      synthesizedResponse: finalResponse,
      consensusScore,
      participatingModels: responses.map(r => `${r.provider}/${r.model}`),
      enhancements: [
        'Multi-Provider Parallel Processing',
        'Cross-Model Consensus Algorithm',
        'Intelligent Response Synthesis',
        'Accuracy Cross-Validation',
      ],
      processingTime,
      confidenceLevel: this.determineConfidenceLevel(consensusScore, responses.length),
      activeProviders: this.activeCount,
      totalProviders: this.providers.size,
    };
  }

  private getActiveProviderNames(): string[] {
    const active: string[] = [];
    this.providers.forEach((config, name) => {
      if (config.available && this.clients.has(name)) {
        active.push(name);
      }
    });
    return active;
  }

  private async queryAllProviders(message: string, systemPrompt?: string, image?: string): Promise<AIResponse[]> {
    const tasks: Promise<AIResponse>[] = [];
    const sys = systemPrompt || 'You are Simplicity, the AI that powers Simpleton™ at simpletonapp.com — a fully operational premium market intelligence platform. You are brilliant at everything but specialize in precious metals, diamonds, watches, coins, and luxury goods. VOICE: Talk like a knowledgeable friend — warm, direct, confident. Not robotic. Not like a report. No markdown symbols (no **, no ##, no ---, no backticks). No filler openers like "Certainly!" or "Great question!" — just start with the answer. Use paragraph breaks. Vary sentence length. Mix short punchy lines with longer explanations. Sound like a real person who happens to know everything.';

    this.providers.forEach((config, name) => {
      if (!config.available || !this.clients.has(name)) return;

      const model = config.models[0];

      if (config.type === 'openai-compatible') {
        tasks.push(this.callOpenAICompatible(name, model, message, sys, image));
      } else if (config.type === 'anthropic') {
        tasks.push(this.callAnthropic(name, model, message, sys, image));
      } else if (config.type === 'anthropic-compat') {
        // DeepSeek via Anthropic SDK — no image support, text-only
        if (!image) tasks.push(this.callAnthropic(name, model, message, sys));
      } else if (config.type === 'gemini' || config.type === 'gemini-native') {
        tasks.push(this.callGemini(name, model, message, sys));
      } else if (config.type === 'cohere') {
        tasks.push(this.callCohere(name, model, message, sys));
      } else if (config.type === 'huggingface') {
        tasks.push(this.callHuggingFace(name, model, message, sys));
      }
    });

    const results = await Promise.allSettled(tasks);
    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<AIResponse>).value);

    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      console.log(`⚠️ ${failed.length}/${results.length} providers failed, ${successful.length} succeeded`);
    }

    return successful;
  }

  private async callOpenAICompatible(providerName: string, model: string, message: string, systemPrompt: string, image?: string): Promise<AIResponse> {
    const startTime = performance.now();
    const client = this.clients.get(providerName) as OpenAI;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (image && (providerName === 'OpenAI' || providerName === 'OpenRouter')) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: message },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
        ],
      });
    } else {
      messages.push({ role: 'user', content: message });
    }

    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.8,
    });

    return {
      provider: providerName,
      model,
      response: response.choices[0]?.message?.content || '',
      confidence: 0.88,
      responseTime: performance.now() - startTime,
      timestamp: Date.now(),
    };
  }

  private async callAnthropic(providerName: string, model: string, message: string, systemPrompt: string, image?: string): Promise<AIResponse> {
    const startTime = performance.now();
    const client = this.clients.get(providerName) as Anthropic;

    const content: any[] = [{ type: 'text', text: message }];
    if (image) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: image },
      });
    }

    const response = await client.messages.create({
      model,
      max_tokens: 2000,
      temperature: 0.8,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
    });

    return {
      provider: providerName,
      model,
      response: response.content[0].type === 'text' ? response.content[0].text : '',
      confidence: 0.92,
      responseTime: performance.now() - startTime,
      timestamp: Date.now(),
    };
  }

  private async callGemini(providerName: string, model: string, message: string, systemPrompt: string): Promise<AIResponse> {
    const startTime = performance.now();
    const client = this.clients.get(providerName) as GoogleGenAI;

    const response = await client.models.generateContent({
      model,
      contents: `${systemPrompt}\n\nUser: ${message}`,
      config: { maxOutputTokens: 8192, temperature: 0.8 },
    });

    return {
      provider: providerName,
      model,
      response: response.text || '',
      confidence: 0.90,
      responseTime: performance.now() - startTime,
      timestamp: Date.now(),
    };
  }

  private async callCohere(providerName: string, model: string, message: string, systemPrompt: string): Promise<AIResponse> {
    const startTime = performance.now();
    const config = this.clients.get(providerName);

    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model,
        message,
        preamble: systemPrompt,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return {
      provider: providerName,
      model,
      response: response.data.text || '',
      confidence: 0.85,
      responseTime: performance.now() - startTime,
      timestamp: Date.now(),
    };
  }

  private async callHuggingFace(providerName: string, model: string, message: string, systemPrompt: string): Promise<AIResponse> {
    const startTime = performance.now();
    const config = this.clients.get(providerName);

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
        parameters: { max_new_tokens: 1000, temperature: 0.7 },
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const text = Array.isArray(response.data) && response.data[0]?.generated_text
      ? response.data[0].generated_text
      : typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

    return {
      provider: providerName,
      model,
      response: text,
      confidence: 0.80,
      responseTime: performance.now() - startTime,
      timestamp: Date.now(),
    };
  }

  private calculateConsensus(responses: AIResponse[]): { score: number; agreements: string[] } {
    if (responses.length < 2) return { score: 0.5, agreements: [] };

    let totalSimilarity = 0;
    const agreements: string[] = [];
    let comparisons = 0;

    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const similarity = this.calculateSimilarity(responses[i].response, responses[j].response);
        totalSimilarity += similarity;
        comparisons++;
        if (similarity > 0.6) {
          agreements.push(`${responses[i].provider} ↔ ${responses[j].provider}`);
        }
      }
    }

    return {
      score: comparisons > 0 ? totalSimilarity / comparisons : 0.5,
      agreements,
    };
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const arr1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const arr2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const set2 = new Set(arr2);
    const intersectionCount = arr1.filter(w => set2.has(w)).length;
    const unionArr = Array.from(new Set(arr1.concat(arr2)));
    return unionArr.length > 0 ? intersectionCount / unionArr.length : 0;
  }

  private async synthesizeResponses(responses: AIResponse[], query: string, systemPrompt?: string): Promise<string> {
    if (responses.length === 1) return responses[0].response;

    const synthesisPrompt = `You are an AI synthesis engine. Multiple AI providers have answered the same question. Combine their responses into one superior, comprehensive answer. Do not mention that multiple AIs were used — just provide the best unified answer.

RESPONSE FORMAT — NON-NEGOTIABLE: Write the way a knowledgeable friend talks — clear, confident, warm, natural. Not robotic. Not like a report. No markdown symbols of any kind (no asterisks, no ** bold **, no ## headers, no --- dividers, no backticks). No filler openers like "Certainly!" or "Great question!" — start with the actual answer. Use paragraph breaks to separate thoughts. Vary sentence length. Mix short punchy statements with longer explanations. Sound human.

Question: "${query}"

Responses from different AI providers:
${responses.map((r, i) => `--- Provider ${i + 1} (${r.provider}/${r.model}) ---\n${r.response}`).join('\n\n')}

Combine the best insights into a single natural, conversational response. Sound like a knowledgeable friend, not a report:`;

    const anthropicClient = this.clients.get('Anthropic') as Anthropic | undefined;
    const openaiClient = this.clients.get('OpenAI') as OpenAI | undefined;
    const geminiClient = this.clients.get('Google Gemini') as GoogleGenAI | undefined;

    try {
      if (anthropicClient) {
        const result = await anthropicClient.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          temperature: 0.8,
          messages: [{ role: 'user', content: synthesisPrompt }],
        });
        return result.content[0].type === 'text' ? result.content[0].text : responses[0].response;
      }

      if (openaiClient) {
        const result = await openaiClient.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: synthesisPrompt }],
          max_tokens: 2000,
          temperature: 0.8,
        });
        return result.choices[0]?.message?.content || responses[0].response;
      }

      if (geminiClient) {
        const result = await geminiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: synthesisPrompt,
          config: { maxOutputTokens: 8192, temperature: 0.8 },
        });
        return result.text || responses[0].response;
      }
    } catch (err) {
      console.error('Synthesis error, using best response:', err);
    }

    return this.pickBestResponse(responses);
  }

  private pickBestResponse(responses: AIResponse[]): string {
    return responses.reduce((best, current) => {
      const currentScore = current.confidence * current.response.length;
      const bestScore = best.confidence * best.response.length;
      return currentScore > bestScore ? current : best;
    }).response;
  }

  private determineConfidenceLevel(score: number, modelCount: number): 'HIGHEST' | 'HIGH' | 'MODERATE' | 'STANDARD' {
    if (score > 0.8 && modelCount >= 3) return 'HIGHEST';
    if (score > 0.7 && modelCount >= 2) return 'HIGH';
    if (score > 0.5) return 'MODERATE';
    return 'STANDARD';
  }

  async processSingle(message: string, systemPrompt?: string, image?: string): Promise<AIResponse> {
    const sys = systemPrompt || 'You are Simplicity, the AI that powers Simpleton™ at simpletonapp.com — a fully operational premium market intelligence platform. You are brilliant at everything but specialize in precious metals, diamonds, watches, coins, and luxury goods. VOICE: Talk like a knowledgeable friend — warm, direct, confident. Not robotic. Not like a report. No markdown symbols (no **, no ##, no ---, no backticks). No filler openers like "Certainly!" or "Great question!" — just start with the answer. Use paragraph breaks. Vary sentence length. Mix short punchy lines with longer explanations. Sound like a real person who happens to know everything.';

    const providerOrder = ['Anthropic', 'OpenAI', 'Google Gemini', 'DeepSeek', 'Groq', 'Mistral'];

    for (const name of providerOrder) {
      const config = this.providers.get(name);
      if (!config?.available || !this.clients.has(name)) continue;

      try {
        if (config.type === 'anthropic') {
          return await this.callAnthropic(name, config.models[0], message, sys, image);
        } else if (config.type === 'openai-compatible') {
          return await this.callOpenAICompatible(name, config.models[0], message, sys, image);
        } else if (config.type === 'gemini' || config.type === 'gemini-native') {
          return await this.callGemini(name, config.models[0], message, sys);
        } else if (config.type === 'cohere') {
          return await this.callCohere(name, config.models[0], message, sys);
        }
      } catch (err) {
        console.error(`⚠️ ${name} failed, trying next provider...`);
        continue;
      }
    }

    throw new Error('No AI provider available');
  }
}

export const multiProviderAI = new MultiProviderAIEngine();

async function extractAndSaveProfile(sessionToken: string, userMessage: string, assistantResponse: string) {
  try {
    if (!sessionToken) return;
    const { extractUserProfileUpdates } = await import('./simplicity-brain');
    const { db } = await import('./db');
    const { assistantSessions } = await import('../shared/schema');
    const { eq } = await import('drizzle-orm');

    const [session] = await db.select().from(assistantSessions).where(eq(assistantSessions.sessionToken, sessionToken)).limit(1);
    if (!session) return;

    const updatedProfile = await extractUserProfileUpdates(session.userProfile, userMessage, assistantResponse);
    if (JSON.stringify(updatedProfile) !== JSON.stringify(session.userProfile)) {
      await db.update(assistantSessions)
        .set({ userProfile: updatedProfile })
        .where(eq(assistantSessions.id, session.id));
      console.log(`🧠 Profile updated for session ${sessionToken}:`, updatedProfile.name || 'unnamed');
    }
  } catch (e) {
    console.log('Profile extract error (non-blocking):', e);
  }
}

export async function handleRevolutionaryAI(req: any, res: any) {
  try {
    const { message: rawMessage, prompt, image, systemPrompt, consensus, useSimplicityBrain, useThinking, sessionToken: bodySessionToken } = req.body;
    const message = rawMessage || prompt;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🤖 AI processing request:', message.substring(0, 100) + '...');

    let effectiveSystemPrompt = systemPrompt;

    if (useSimplicityBrain) {
      try {
        const { buildSimplicityPrompt } = await import('./simplicity-brain');
        const token = bodySessionToken || req.headers['x-session-token'] || 'default-chat-session';
        const promptData = await buildSimplicityPrompt(token, '/ai-chat', message);
        effectiveSystemPrompt = promptData.systemPrompt;

        if (promptData.userName) {
          effectiveSystemPrompt += `\n\nIMPORTANT: The user you are currently speaking with is named "${promptData.userName}". Use their name naturally in conversation when appropriate. Greet them by name. Remember their name for future conversations.`;
        }

        if (promptData.conversationContext) {
          effectiveSystemPrompt += `\n\nCONVERSATION HISTORY SUMMARY:\n${promptData.conversationContext}`;
        }

        console.log(`🧠 Simplicity Brain: Using full personality prompt with ${promptData.knowledgeUsed} knowledge entries${promptData.userName ? `, user: ${promptData.userName}` : ''}`);
      } catch (brainError) {
        console.error('⚠️ Simplicity Brain fallback:', brainError);
        effectiveSystemPrompt = systemPrompt;
      }
    }

    // ── Tier 0: DeepSeek Extended Thinking (text-only, deep analysis) ────────
    if (!image && useThinking) {
      try {
        const { deepseekWithThinking } = await import('./ai-provider');
        const thinkingResult = await deepseekWithThinking(effectiveSystemPrompt || '', message);
        console.log(`✅ DeepSeek Thinking success (had reasoning: ${thinkingResult.hadThinking})`);

        if (useSimplicityBrain && thinkingResult.response) {
          extractAndSaveProfile(bodySessionToken, message, thinkingResult.response).catch(() => {});
        }

        return res.json({
          success: true,
          response: thinkingResult.response,
          thinking: thinkingResult.hadThinking ? thinkingResult.thinking : undefined,
          type: 'thinking',
          metadata: {
            provider: 'DeepSeek Reasoner',
            model: thinkingResult.model,
            hadThinking: thinkingResult.hadThinking,
            liveData: false,
            activeProviders: multiProviderAI.getActiveProviderCount(),
            totalProviders: multiProviderAI.getTotalProviderCount(),
          },
          timestamp: new Date().toISOString(),
        });
      } catch (thinkingErr: any) {
        console.log(`⚠️ DeepSeek Thinking failed (${thinkingErr?.message}), falling through to Tool Calls...`);
      }
    }

    // ── Tier 1: DeepSeek Tool Calls (text-only, ONLY when live market data is needed) ──
    const needsLive = !image && requiresLiveData(message);
    if (needsLive) {
      try {
        const { simplicityWithTools } = await import('./ai-tools');
        const toolResult = await withTimeout(
          simplicityWithTools(effectiveSystemPrompt || '', message, 1200),
          12000,
          'DeepSeek Tool Calls'
        );
        console.log(`✅ Tool Calls success (${toolResult.toolsUsed.length} tools used)`);

        if (useSimplicityBrain && toolResult.text) {
          extractAndSaveProfile(bodySessionToken, message, toolResult.text).catch(() => {});
        }

        return res.json({
          success: true,
          response: toolResult.text,
          type: toolResult.toolsUsed.length > 0 ? 'tools' : 'deepseek',
          metadata: {
            provider: 'DeepSeek',
            model: toolResult.model,
            toolsUsed: toolResult.toolsUsed,
            liveData: toolResult.toolsUsed.length > 0,
            activeProviders: multiProviderAI.getActiveProviderCount(),
            totalProviders: multiProviderAI.getTotalProviderCount(),
          },
          timestamp: new Date().toISOString(),
        });
      } catch (toolsErr: any) {
        console.log(`⚠️ Tool Calls failed/timed out (${toolsErr?.message}), going to fast fallback...`);
      }
    } else if (!image) {
      console.log(`⚡ Fast path: no live data needed, skipping Tool Calls`);
    }

    // ── Tier 2: Fast single-provider (Claude/OpenAI — typically 2-5s) ─────────
    if (!image) {
      try {
        const fastResult = await withTimeout(
          multiProviderAI.processSingle(message, effectiveSystemPrompt || undefined),
          15000,
          'Fast single-provider'
        );
        console.log(`✅ Fast provider success (${fastResult.provider}/${fastResult.model})`);

        if (useSimplicityBrain && fastResult.response) {
          extractAndSaveProfile(bodySessionToken, message, fastResult.response).catch(() => {});
        }

        return res.json({
          success: true,
          response: fastResult.response,
          type: needsLive ? 'tools' : 'deepseek',
          metadata: {
            provider: fastResult.provider,
            model: fastResult.model,
            liveData: false,
            activeProviders: multiProviderAI.getActiveProviderCount(),
            totalProviders: multiProviderAI.getTotalProviderCount(),
          },
          timestamp: new Date().toISOString(),
        });
      } catch (fastErr: any) {
        console.log(`⚠️ Fast provider failed (${fastErr?.message}), falling through to consensus...`);
      }
    }

    // ── Tier 3: Multi-provider consensus / single-provider fallback ──────────
    try {
      let aiResponse: string | undefined;
      if (consensus !== false && multiProviderAI.getActiveProviderCount() >= 2) {
        const result = await multiProviderAI.processWithConsensus(message, effectiveSystemPrompt, image);
        aiResponse = result.synthesizedResponse;

        if (useSimplicityBrain && aiResponse) {
          extractAndSaveProfile(bodySessionToken, message, aiResponse).catch(() => {});
        }

        return res.json({
          success: true,
          response: result.synthesizedResponse,
          type: 'consensus',
          metadata: {
            provider: result.participatingModels.join(', '),
            model: `${result.participatingModels.length}-Model Consensus`,
            confidence: result.consensusScore,
            processingTime: Math.round(result.processingTime),
            confidenceLevel: result.confidenceLevel,
            activeProviders: result.activeProviders,
            totalProviders: result.totalProviders,
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        const result = await multiProviderAI.processSingle(message, effectiveSystemPrompt, image);
        aiResponse = result.response;

        if (useSimplicityBrain && aiResponse) {
          extractAndSaveProfile(bodySessionToken, message, aiResponse).catch(() => {});
        }

        return res.json({
          success: true,
          response: result.response,
          type: 'single',
          metadata: {
            provider: result.provider,
            model: result.model,
            confidence: result.confidence,
            processingTime: Math.round(result.responseTime),
            activeProviders: multiProviderAI.getActiveProviderCount(),
            totalProviders: multiProviderAI.getTotalProviderCount(),
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (aiError) {
      console.error('⚠️ AI processing error:', aiError);
      throw aiError;
    }
  } catch (error) {
    console.error('❌ AI request failed:', error);
    res.status(500).json({
      error: 'AI processing error',
      response: "I'm sorry, I'm experiencing a temporary issue. Please try again in a moment.",
    });
  }
}
