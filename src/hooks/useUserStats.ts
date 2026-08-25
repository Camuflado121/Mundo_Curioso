import { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { playLevelUpFanfare, playPopSound } from '../utils/audio';

const STORAGE_KEY = 'mundo_curioso_user_stats_v1';

const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Curioso Iniciante', xpNeeded: 0, nextXp: 100 },
  { level: 2, title: 'Explorador de Fatos', xpNeeded: 100, nextXp: 300 },
  { level: 3, title: 'Descobridor do Mundo', xpNeeded: 300, nextXp: 600 },
  { level: 4, title: 'Mestre das Curiosidades', xpNeeded: 600, nextXp: 1000 },
  { level: 5, title: 'Enciclopédia Humana', xpNeeded: 1000, nextXp: 2000 },
  { level: 6, title: 'Sábio Supremo', xpNeeded: 2000, nextXp: 5000 }
];

export function getLevelInfo(xp: number) {
  let current = LEVEL_THRESHOLDS[0];
  for (const lvl of LEVEL_THRESHOLDS) {
    if (xp >= lvl.xpNeeded) {
      current = lvl;
    } else {
      break;
    }
  }
  return current;
}

const INITIAL_USER_STATS: UserStats = {
  level: 1,
  levelTitle: 'Curioso Iniciante',
  currentXp: 50,
  nextLevelXp: 100,
  streakDays: 1,
  lastVisitDate: new Date().toISOString().split('T')[0],
  curiositiesRead: 0,
  quizzesCompleted: 0,
  favorites: [],
  history: [],
  achievements: [
    { id: 'first_step', title: 'Primeiro Passo', description: 'Descobriu sua primeira curiosidade no portal', icon: 'Sparkles', unlockedAt: new Date().toISOString() },
    { id: 'quiz_master', title: 'Mente Brilhante', description: 'Completou seu primeiro quiz de conhecimentos', icon: 'Trophy' },
    { id: 'streak_3', title: 'Curioso Compulsivo', description: 'Manteve uma sequência de 3 dias explorando', icon: 'Flame' },
    { id: 'africa_explorer', title: 'Explorador da África', description: 'Leu artigos especiais sobre Moçambique e reinos africanos', icon: 'Globe' },
    { id: 'encyclopedia', title: 'Colecionador de Fatos', description: 'Salvou mais de 5 curiosidades nos favoritos', icon: 'BookMarked' }
  ]
};

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>(() => {
    if (typeof window === 'undefined') return INITIAL_USER_STATS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserStats;
        // Check daily streak
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastVisitDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (parsed.lastVisitDate === yesterday) {
            parsed.streakDays += 1;
          } else {
            parsed.streakDays = 1;
          }
          parsed.lastVisitDate = today;
          // Add daily login XP
          parsed.currentXp += 15;
          const info = getLevelInfo(parsed.currentXp);
          parsed.level = info.level;
          parsed.levelTitle = info.title;
          parsed.nextLevelXp = info.nextXp;
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_USER_STATS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore
    }
  }, [stats]);

  const addXp = (amount: number, reason?: string) => {
    setStats(prev => {
      const newXp = prev.currentXp + amount;
      const prevInfo = getLevelInfo(prev.currentXp);
      const newInfo = getLevelInfo(newXp);

      if (newInfo.level > prevInfo.level) {
        playLevelUpFanfare();
      }

      return {
        ...prev,
        currentXp: newXp,
        level: newInfo.level,
        levelTitle: newInfo.title,
        nextLevelXp: newInfo.nextXp
      };
    });
  };

  const toggleFavorite = (slug: string) => {
    playPopSound();
    setStats(prev => {
      const isFav = prev.favorites.includes(slug);
      const newFavs = isFav ? prev.favorites.filter(s => s !== slug) : [...prev.favorites, slug];

      // Check achievement for 5 favorites
      const achievements = [...prev.achievements];
      if (newFavs.length >= 5) {
        const ach = achievements.find(a => a.id === 'encyclopedia');
        if (ach && !ach.unlockedAt) {
          ach.unlockedAt = new Date().toISOString();
        }
      }

      return {
        ...prev,
        favorites: newFavs,
        achievements
      };
    });
  };

  const isFavorite = (slug: string) => stats.favorites.includes(slug);

  const markRead = (slug: string) => {
    setStats(prev => {
      if (prev.history.includes(slug)) return prev;
      const newHistory = [slug, ...prev.history].slice(0, 50);
      const newCount = prev.curiositiesRead + 1;

      // Add read XP
      const newXp = prev.currentXp + 10;
      const newInfo = getLevelInfo(newXp);

      return {
        ...prev,
        history: newHistory,
        curiositiesRead: newCount,
        currentXp: newXp,
        level: newInfo.level,
        levelTitle: newInfo.title,
        nextLevelXp: newInfo.nextXp
      };
    });
  };

  const recordQuizCompleted = (earnedXp: number) => {
    setStats(prev => {
      const newQuizzes = prev.quizzesCompleted + 1;
      const newXp = prev.currentXp + earnedXp;
      const newInfo = getLevelInfo(newXp);

      const achievements = [...prev.achievements];
      const quizAch = achievements.find(a => a.id === 'quiz_master');
      if (quizAch && !quizAch.unlockedAt) {
        quizAch.unlockedAt = new Date().toISOString();
      }

      return {
        ...prev,
        quizzesCompleted: newQuizzes,
        currentXp: newXp,
        level: newInfo.level,
        levelTitle: newInfo.title,
        nextLevelXp: newInfo.nextXp,
        achievements
      };
    });
  };

  return {
    stats,
    addXp,
    toggleFavorite,
    isFavorite,
    markRead,
    recordQuizCompleted
  };
}
