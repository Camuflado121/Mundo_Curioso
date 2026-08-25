export interface Curiosity {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  tags: string[];
  author: string;
  readTimeMinutes: number;
  views: number;
  likes: number;
  shares: number;
  date: string;
  imageUrl: string;
  sourceUrl?: string;
  sourceName?: string;
  isFeatured?: boolean;
  isDaily?: boolean;
  didYouKnow?: string;
  funFactor?: number; // 1-100
  relatedSlugs?: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  coverImage: string;
  count: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Mestre';
  estimatedMinutes: number;
  questions: QuizQuestion[];
  playsCount: number;
  xpReward: number;
  imageUrl: string;
}

export interface SpecialArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  categoryId: string;
  categoryName: string;
  readTimeMinutes: number;
  author: string;
  date: string;
  imageUrl: string;
  views: number;
  likes: number;
  tags: string[];
}

export interface Comment {
  id: string;
  curiosityId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface UserStats {
  level: number;
  levelTitle: string;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  lastVisitDate: string;
  curiositiesRead: number;
  quizzesCompleted: number;
  favorites: string[]; // slugs or IDs
  history: string[]; // slugs
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
  }[];
}

export interface CuriositySuggestion {
  id: string;
  title: string;
  category: string;
  description: string;
  source?: string;
  submitterName: string;
  submitterEmail: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PlatformStats {
  totalCuriosities: number;
  totalCategories: number;
  totalQuizzes: number;
  totalViews: number;
  totalShares: number;
  totalFavorites: number;
  dailyActiveReaders: number;
}
