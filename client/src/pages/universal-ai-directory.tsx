import { useState, useEffect } from 'react';
import { Navigation } from '../components/layout/navigation';
import { Footer } from '../components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Search,
  Zap,
  Code,
  Eye,
  Volume2,
  Layers,
  Building,
  BookOpen,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Users,
  DollarSign,
  Sparkles,
  Shield,
  Star,
  X,
} from 'lucide-react';

interface UniversalAIProvider {
  id: string;
  name: string;
  company: string;
  category: string;
  models: string[];
  pricing: {
    free_tier: boolean;
    cost_per_1k_tokens?: number;
    monthly_subscription?: number;
  };
  capabilities: string[];
  status: string;
  founded: number;
  employees?: number;
  funding?: number;
  availability: string;
}

interface MarketOverview {
  total_providers: number;
  total_models: number;
  total_funding: number;
  total_employees: number;
  categories: Record<string, number>;
  top_funded: UniversalAIProvider[];
  newest_providers: UniversalAIProvider[];
  market_trends: {
    foundation_models_dominance: number;
    open_source_growth: number;
    enterprise_adoption: number;
    multimodal_expansion: number;
  };
}

const companyDescriptions: Record<string, { tagline: string; description: string; bestFor: string[]; funFact: string }> = {
  openai: {
    tagline: "The pioneers of modern AI",
    description: "OpenAI created ChatGPT, the AI chatbot that took the world by storm. They build GPT-4, one of the most capable AI models ever made. OpenAI focuses on making AI that can understand and generate text, images, code, and even voice. Their models power thousands of apps worldwide.",
    bestFor: ["General conversations & writing", "Code generation & debugging", "Image creation (DALL-E)", "Voice & audio processing", "Complex reasoning tasks"],
    funFact: "ChatGPT reached 100 million users in just 2 months — faster than any app in history."
  },
  anthropic: {
    tagline: "AI safety-first, built to be helpful and harmless",
    description: "Anthropic builds Claude, an AI assistant known for being thoughtful, accurate, and safe. Founded by former OpenAI researchers, they focus heavily on making AI that follows instructions carefully and avoids harmful outputs. Claude is especially loved for long document analysis and coding.",
    bestFor: ["Long document analysis (200K+ context)", "Safe & careful AI responses", "Coding assistance", "Research & academic work", "Business writing"],
    funFact: "Claude can read and understand documents that are over 500 pages long in a single conversation."
  },
  google: {
    tagline: "AI that understands text, images, video, and audio all at once",
    description: "Google's Gemini models are truly multimodal — they can understand and work with text, images, videos, and audio simultaneously. Built by Google DeepMind, they leverage Google's vast knowledge and infrastructure. Gemini powers features across Google Search, Gmail, and Docs.",
    bestFor: ["Multimodal tasks (text + images + video)", "Integration with Google products", "Research & scientific work", "Code generation", "Real-time information"],
    funFact: "Gemini 1.5 Pro can process up to 2 million tokens — that's roughly 1,500 pages of text in one go."
  },
  meta: {
    tagline: "Making powerful AI free and open for everyone",
    description: "Meta (Facebook's parent company) releases their Llama AI models completely free and open-source. Anyone can download, use, and modify them. This has democratized AI — letting startups, researchers, and developers build on top of world-class AI without paying licensing fees.",
    bestFor: ["Free self-hosted AI", "Custom AI applications", "Research & experimentation", "Privacy-sensitive projects", "Learning about AI"],
    funFact: "Llama models have been downloaded over 300 million times, making them the most popular open-source AI models."
  },
  deepseek: {
    tagline: "China's AI powerhouse rivaling the best in the world",
    description: "DeepSeek burst onto the scene with models that compete directly with GPT-4 and Claude at a fraction of the cost. Their DeepSeek-V3 and R1 models excel at reasoning, math, and coding. They're known for publishing detailed research papers and offering extremely affordable API pricing.",
    bestFor: ["Advanced math & reasoning", "Cost-effective AI at scale", "Coding & programming", "Scientific research", "Multilingual applications"],
    funFact: "DeepSeek-R1 matched GPT-4's performance on many benchmarks while costing 90% less to use."
  },
  xai: {
    tagline: "Elon Musk's AI company with real-time knowledge",
    description: "xAI builds Grok, an AI assistant created by Elon Musk's team. Grok stands out because it has real-time access to posts and information from X (Twitter), giving it up-to-the-minute knowledge about current events. It's known for being direct and occasionally witty in its responses.",
    bestFor: ["Real-time current events", "Social media analysis", "Direct, unfiltered answers", "Humor & personality in AI", "Tech & science discussions"],
    funFact: "Grok was named after a term from science fiction meaning to understand something intuitively and completely."
  },
  cohere: {
    tagline: "Enterprise AI built for business applications",
    description: "Cohere specializes in making AI that businesses can easily integrate into their products. They're especially strong in search, classification, and understanding text meaning. Their Embed model is one of the best for building AI-powered search engines.",
    bestFor: ["Enterprise search & retrieval", "Text classification", "Semantic search engines", "Business document processing", "Customer support AI"],
    funFact: "Cohere was founded by one of the inventors of the Transformer architecture — the technology behind all modern AI."
  },
  perplexity: {
    tagline: "AI-powered search that gives you real answers, not links",
    description: "Perplexity AI reimagined search. Instead of giving you a list of blue links like Google, Perplexity reads the internet in real-time and gives you a direct, sourced answer to your question. Every response includes citations so you can verify the information.",
    bestFor: ["Research with cited sources", "Real-time web information", "Academic research", "Fact-checking", "Quick answers to complex questions"],
    funFact: "Perplexity processes over 10 million queries per day and has been called 'the Google killer' by tech media."
  },
  huggingface: {
    tagline: "The GitHub of AI — home to the open-source AI community",
    description: "Hugging Face is the largest platform for sharing and discovering AI models. With over 500,000 models available, it's where researchers and developers go to find, test, and deploy AI. They don't build one AI — they host thousands, making AI accessible to everyone.",
    bestFor: ["Discovering & testing AI models", "Fine-tuning models for your needs", "Open-source AI development", "Community-driven AI projects", "Learning AI & machine learning"],
    funFact: "Over 500,000 AI models and 100,000 datasets are hosted on Hugging Face, used by nearly every AI company."
  },
  mistral: {
    tagline: "Europe's answer to American AI giants",
    description: "Mistral AI, based in Paris, builds some of the most efficient AI models in the world. Their models deliver impressive performance while being smaller and faster than competitors. Mixtral, their mixture-of-experts model, pioneered a new approach to AI efficiency.",
    bestFor: ["Fast, efficient AI responses", "Multilingual (especially European languages)", "Code generation", "Cost-effective enterprise AI", "On-device AI applications"],
    funFact: "Mistral AI was valued at $2 billion just 6 months after being founded — one of the fastest valuations in AI history."
  },
  stability: {
    tagline: "The creators of Stable Diffusion — AI image generation for all",
    description: "Stability AI created Stable Diffusion, the open-source image generation model that revolutionized AI art. Unlike DALL-E which requires a subscription, Stable Diffusion can be downloaded and run for free. It powers countless art, design, and creative applications.",
    bestFor: ["AI image generation", "Creative artwork & design", "Video generation", "Image editing & upscaling", "Custom visual content"],
    funFact: "Stable Diffusion was the first high-quality AI image generator released as open-source, sparking a creative revolution."
  },
  runway: {
    tagline: "AI-powered video creation and editing magic",
    description: "Runway ML is leading the charge in AI video generation. Their Gen-3 model can create stunning video clips from text descriptions. They also offer powerful tools for video editing, motion capture, and visual effects — all powered by AI.",
    bestFor: ["AI video generation", "Video editing & effects", "Motion capture", "Creative content production", "Film & media production"],
    funFact: "Runway's AI technology was used in the Oscar-winning film 'Everything Everywhere All at Once'."
  },
  midjourney: {
    tagline: "AI art that looks like it was painted by a master",
    description: "Midjourney creates some of the most visually stunning AI-generated images in the world. Known for its artistic quality and photorealistic output, it's the go-to tool for artists, designers, and creative professionals. Access is through Discord, giving it a unique community feel.",
    bestFor: ["Photorealistic AI art", "Concept art & design", "Marketing visuals", "Creative inspiration", "Architectural visualization"],
    funFact: "A Midjourney-generated artwork won first place at the Colorado State Fair's fine art competition in 2022."
  },
  elevenlabs: {
    tagline: "AI voices so real you can't tell them apart from humans",
    description: "ElevenLabs specializes in AI voice synthesis and cloning. Their technology can create incredibly realistic human voices, clone existing voices with just a few seconds of audio, and generate speech in dozens of languages. It's used by content creators, businesses, and audiobook producers.",
    bestFor: ["Realistic AI voice generation", "Voice cloning", "Audiobook narration", "Content creation & podcasts", "Multilingual voice synthesis"],
    funFact: "ElevenLabs can clone a voice from just 30 seconds of audio and generate speech in 29 languages."
  },
  deepmind: {
    tagline: "The research lab that solved protein folding",
    description: "Google DeepMind is one of the world's most advanced AI research labs. They created AlphaFold, which solved the 50-year-old problem of predicting protein structures — a breakthrough that could revolutionize medicine. They also created AlphaGo, the first AI to beat a world champion at Go.",
    bestFor: ["Scientific research", "Protein structure prediction", "Game-playing AI", "Fundamental AI research", "Climate & health applications"],
    funFact: "AlphaFold predicted the structure of nearly every known protein — over 200 million — in under 2 years."
  },
  together: {
    tagline: "Run open-source AI models in the cloud, instantly",
    description: "Together AI makes it easy to run open-source AI models without managing your own servers. They provide fast, affordable API access to models like Llama, Mistral, and many others. Perfect for developers who want the flexibility of open-source with the ease of a cloud service.",
    bestFor: ["Running open-source models easily", "Fast inference at low cost", "Model fine-tuning", "AI application development", "Comparing different AI models"],
    funFact: "Together AI can serve open-source models up to 4x faster than competitors through custom infrastructure."
  },
  replicate: {
    tagline: "Run any AI model with just one line of code",
    description: "Replicate is a platform that lets you run AI models with a simple API call. No setup, no GPU management — just point and run. They host thousands of models from image generation to language models, making it incredibly easy to add AI to any application.",
    bestFor: ["Quick AI prototyping", "Running diverse AI models", "Image & video generation", "Easy API-based AI access", "Experimenting with new models"],
    funFact: "Over 10 million predictions are run on Replicate every day across thousands of different AI models."
  },
  ai21: {
    tagline: "Enterprise AI specialized in reading and writing",
    description: "AI21 Labs builds Jurassic models that excel at understanding and generating text. They focus on enterprise applications like document summarization, content generation, and text analysis. Their Wordtune product helps millions of people write better every day.",
    bestFor: ["Business writing & documentation", "Text summarization", "Content generation", "Document analysis", "Writing improvement tools"],
    funFact: "AI21's Wordtune product is used by over 10 million people to improve their writing daily."
  },
  character: {
    tagline: "Chat with AI personalities — from Einstein to anime characters",
    description: "Character.AI lets you create and chat with AI characters that have distinct personalities. You can talk to historical figures, fictional characters, or create your own AI companion. It's one of the most engaging consumer AI applications, especially popular with younger users.",
    bestFor: ["Entertainment & roleplay", "Educational conversations", "Creative writing assistance", "Language practice", "AI companion experiences"],
    funFact: "Character.AI users spend an average of 29 minutes per session — more than Instagram or TikTok."
  },
  adept: {
    tagline: "AI that can use your computer like a human assistant",
    description: "Adept AI is building AI agents that can interact with software the way humans do — clicking buttons, filling forms, navigating websites. Their ACT-1 model can automate complex workflows across different applications, acting as a true digital assistant.",
    bestFor: ["Workflow automation", "Web task automation", "Computer use & navigation", "Business process automation", "Digital assistant tasks"],
    funFact: "Adept's AI can learn to use new software applications just by watching a human demonstrate once."
  },
};

const categories = [
  { id: 'all', name: 'All', icon: Brain },
  { id: 'foundation', name: 'Foundation', icon: Building },
  { id: 'specialized', name: 'Specialized', icon: Zap },
  { id: 'open_source', name: 'Open Source', icon: Globe },
  { id: 'enterprise', name: 'Enterprise', icon: Building },
  { id: 'multimodal', name: 'Multimodal', icon: Layers },
  { id: 'vision', name: 'Vision', icon: Eye },
  { id: 'audio', name: 'Audio', icon: Volume2 },
  { id: 'research', name: 'Research', icon: BookOpen },
];

export function AIDirectoryContent() {
  const [providers, setProviders] = useState<UniversalAIProvider[]>([]);
  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    fetchAIData();
  }, [selectedCategory, searchQuery]);

  const fetchAIData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const [providersRes, overviewRes] = await Promise.all([
        fetch(`/api/universal-ai/providers?${params}`),
        fetch('/api/universal-ai/overview')
      ]);

      if (providersRes.ok) {
        const providersData = await providersRes.json();
        setProviders(providersData.data || []);
      }
      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setOverview(overviewData.data);
      }
    } catch (error) {
      console.error('Failed to fetch AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(0)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num}`;
  };

  const getCategoryIcon = (category: string) => {
    const map: Record<string, typeof Brain> = {
      'foundation': Building, 'specialized': Zap, 'open_source': Globe,
      'enterprise': Building, 'multimodal': Layers, 'code': Code,
      'vision': Eye, 'audio': Volume2, 'research': BookOpen, 'reasoning': Brain,
    };
    return map[category] || Brain;
  };

  const getCategoryGradient = (category: string) => {
    const map: Record<string, string> = {
      'foundation': 'from-blue-600 to-indigo-600',
      'specialized': 'from-amber-500 to-orange-600',
      'open_source': 'from-emerald-500 to-green-600',
      'enterprise': 'from-purple-600 to-violet-600',
      'multimodal': 'from-pink-500 to-rose-600',
      'code': 'from-cyan-500 to-blue-600',
      'vision': 'from-fuchsia-500 to-purple-600',
      'audio': 'from-teal-500 to-cyan-600',
      'research': 'from-sky-500 to-blue-600',
      'reasoning': 'from-violet-500 to-indigo-600',
    };
    return map[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div>
      <section className="relative pb-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/3 w-80 h-80 rounded-full blur-[120px] opacity-15" style={{ background: 'var(--primary)' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[140px] opacity-10" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }}>
              <BookOpen className="w-4 h-4" />
              Learn What Every AI Company Does
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              AI <span style={{ color: 'var(--primary)' }}>Market</span> Directory
            </h1>
            <p className="text-lg max-w-2xl mx-auto mb-10 opacity-60">
              Explore every major AI company, understand their strengths, and learn what each one is best at.
              Your complete guide to the AI landscape.
            </p>
          </motion.div>

          {overview && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8">
              {[
                { label: "AI Companies", value: overview.total_providers, icon: Building },
                { label: "AI Models", value: overview.total_models, icon: Brain },
                { label: "Total Funding", value: formatNumber(overview.total_funding), icon: DollarSign },
                { label: "Team Members", value: `${(overview.total_employees / 1000).toFixed(0)}K+`, icon: Users },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--primary)' }} />
                  <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{stat.value}</div>
                  <div className="text-xs opacity-50">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-4 sticky top-16 z-50" style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-40" />
              <Input
                type="text"
                placeholder="Search AI companies, models, or capabilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="text-xs"
                  style={selectedCategory === cat.id ? { backgroundColor: 'color-mix(in srgb, var(--primary) 20%, var(--card))', color: 'var(--primary)', border: '1px solid color-mix(in srgb, var(--primary) 40%, transparent)' } : { borderColor: 'var(--border)' }}
                >
                  <cat.icon className="w-3 h-3 mr-1" />
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse" style={{ color: 'var(--primary)' }} />
              <p className="opacity-50">Loading AI directory...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="opacity-50">No AI companies found matching your search</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="mt-4">Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {providers.map((provider, index) => {
                const desc = companyDescriptions[provider.id];
                const CategoryIcon = getCategoryIcon(provider.category);
                const gradient = getCategoryGradient(provider.category);
                const isExpanded = expandedCard === provider.id;

                return (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                    layout
                  >
                    <Card
                      className="overflow-hidden transition-all duration-300 cursor-pointer group border"
                      style={{ backgroundColor: 'var(--card)', borderColor: isExpanded ? 'var(--primary)' : 'var(--border)' }}
                      onClick={() => setExpandedCard(isExpanded ? null : provider.id)}
                    >
                      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <CategoryIcon className="w-6 h-6 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-lg font-bold">{provider.name}</h3>
                              <Badge variant="outline" className="text-xs" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                                {provider.category.replace('_', ' ')}
                              </Badge>
                              {provider.status === 'active' && (
                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" title="Active" />
                              )}
                            </div>

                            <p className="text-sm opacity-50 mb-3">{provider.company} · Founded {provider.founded}</p>

                            {desc && (
                              <p className="text-sm opacity-70 italic mb-3">&ldquo;{desc.tagline}&rdquo;</p>
                            )}

                            <div className="flex flex-wrap gap-3 text-xs mb-3">
                              <span className="flex items-center gap-1 opacity-60">
                                <Brain className="w-3 h-3" /> {provider.models.length} models
                              </span>
                              {provider.employees && (
                                <span className="flex items-center gap-1 opacity-60">
                                  <Users className="w-3 h-3" /> {provider.employees.toLocaleString()} team
                                </span>
                              )}
                              {provider.funding && (
                                <span className="flex items-center gap-1 opacity-60">
                                  <DollarSign className="w-3 h-3" /> {formatNumber(provider.funding)} raised
                                </span>
                              )}
                              {provider.pricing.free_tier && (
                                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">Free Tier</Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                              {provider.models.slice(0, 4).map((model, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs" style={{ borderColor: 'var(--border)' }}>
                                  {model}
                                </Badge>
                              ))}
                              {provider.models.length > 4 && (
                                <Badge variant="outline" className="text-xs opacity-50" style={{ borderColor: 'var(--border)' }}>
                                  +{provider.models.length - 4} more
                                </Badge>
                              )}
                            </div>

                            <button className="flex items-center gap-1 text-xs font-medium mt-2" style={{ color: 'var(--primary)' }}>
                              {isExpanded ? 'Show less' : 'Learn more about this company'}
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && desc && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-5 pt-5 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
                                <div>
                                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                    What does {provider.name} do?
                                  </h4>
                                  <p className="text-sm opacity-70 leading-relaxed">{desc.description}</p>
                                </div>

                                <div>
                                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                    <Star className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                    Best For
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {desc.bestFor.map((item, i) => (
                                      <div key={i} className="flex items-center gap-2 text-sm opacity-70">
                                        <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                                        {item}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="rounded-lg p-3 border" style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--primary) 5%, var(--card))' }}>
                                  <h4 className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                                    <Zap className="w-3 h-3" /> Fun Fact
                                  </h4>
                                  <p className="text-xs opacity-70">{desc.funFact}</p>
                                </div>

                                <div>
                                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                    <Shield className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                    Capabilities
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {provider.capabilities.map((cap, i) => (
                                      <Badge key={i} className="text-xs" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
                                        {cap.replace(/_/g, ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {provider.pricing.cost_per_1k_tokens !== undefined && (
                                  <div className="text-xs opacity-50">
                                    Pricing: {provider.pricing.cost_per_1k_tokens === 0 ? 'Free (open-source)' : `$${provider.pricing.cost_per_1k_tokens}/1K tokens`}
                                    {provider.pricing.monthly_subscription && ` · $${provider.pricing.monthly_subscription}/month subscription`}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

export default function UniversalAIDirectory() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <Navigation />
      <div className="pt-24">
        <AIDirectoryContent />
      </div>
      <Footer />
    </div>
  );
}