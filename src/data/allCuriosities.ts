import { Category, Curiosity, Quiz, SpecialArticle } from '../types';
import { INITIAL_CATEGORIES, INITIAL_CURIOSITIES, INITIAL_QUIZZES, INITIAL_ARTICLES, DID_YOU_KNOW_FAST_FACTS } from './initialData';
import { ADDITIONAL_CURIOSITIES } from './moreCuriosities';

// Complete fresh collection of verified September 2026 curiosities
export const ALL_CURIOSITIES: Curiosity[] = [
  ...INITIAL_CURIOSITIES,
  ...ADDITIONAL_CURIOSITIES
];

export const ALL_CATEGORIES: Category[] = INITIAL_CATEGORIES.map(cat => ({
  ...cat,
  count: ALL_CURIOSITIES.filter(c => c.categoryId === cat.id).length || cat.count
}));

export const ALL_QUIZZES: Quiz[] = [
  ...INITIAL_QUIZZES
];

export const ALL_ARTICLES: SpecialArticle[] = [
  ...INITIAL_ARTICLES
];

export { DID_YOU_KNOW_FAST_FACTS };

// Helper query utilities
export function getCuriosityBySlug(slug: string): Curiosity | undefined {
  return ALL_CURIOSITIES.find(c => c.slug === slug || c.id === slug);
}

export function getRandomCuriosity(excludeSlug?: string): Curiosity {
  const pool = excludeSlug ? ALL_CURIOSITIES.filter(c => c.slug !== excludeSlug) : ALL_CURIOSITIES;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || ALL_CURIOSITIES[0];
}

export function getDailyCuriosity(): Curiosity {
  const daily = ALL_CURIOSITIES.find(c => c.isDaily);
  return daily || ALL_CURIOSITIES[0];
}

export function getRelatedCuriosities(curiosity: Curiosity, limit: number = 3): Curiosity[] {
  // First match relatedSlugs, then same category, then others
  const relatedFromSlugs = (curiosity.relatedSlugs || [])
    .map(slug => getCuriosityBySlug(slug))
    .filter((c): c is Curiosity => !!c && c.id !== curiosity.id);

  if (relatedFromSlugs.length >= limit) {
    return relatedFromSlugs.slice(0, limit);
  }

  const fromCategory = ALL_CURIOSITIES.filter(
    c => c.categoryId === curiosity.categoryId && c.id !== curiosity.id && !relatedFromSlugs.some(r => r.id === c.id)
  );

  const combined = [...relatedFromSlugs, ...fromCategory];
  if (combined.length >= limit) {
    return combined.slice(0, limit);
  }

  const others = ALL_CURIOSITIES.filter(
    c => c.id !== curiosity.id && !combined.some(r => r.id === c.id)
  );

  return [...combined, ...others].slice(0, limit);
}
