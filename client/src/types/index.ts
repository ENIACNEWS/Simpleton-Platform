export interface PricingData {
  id: number;
  metal: string;
  price: string;
  currency: string;
  timestamp: string;
  source: string;
}

export interface LivePrices {
  gold: number;
  silver: number;
  platinum: number;
  palladium: number;
}

export interface CalculatorResult {
  weight: number;
  purity: number;
  metal: string;
  price: number;
  meltValue: string;
  calculatedAt: string;
}

export interface CoinSpecs {
  id: number;
  name: string;
  type: string;
  yearStart: number;
  yearEnd?: number;
  purity: string;
  weight: string;
  diameter?: string;
  thickness?: string;
  mintage?: number;
  description?: string;
  specifications?: any;
  imageUrl?: string;
  createdAt: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags?: string[];
  authorId: number;
  readTime: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Discussion {
  id: number;
  title: string;
  content: string;
  authorId: number;
  category: string;
  isAnswered: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  goldCoins: number;
  silverCoins: number;
  totalCoins: number;
  yearsCovered: number;
  articles: number;
  discussions: number;
  totalSpecs: number;
}
