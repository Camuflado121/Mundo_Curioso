import React, { useState } from 'react';
import {
  Flame,
  TrendingUp,
  Share2,
  Clock,
  Heart,
  Eye,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Curiosity } from '../../types';
import { AdBanner } from '../common/AdBanner';

interface FeaturedGridProps {
  curiosities: Curiosity[];
  onSelectCuriosity: (curiosity: Curiosity) => void;
  onOpenShare: (curiosity: Curiosity) => void;
  onToggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
}

export const FeaturedGrid: React.FC<FeaturedGridProps> = ({
  curiosities,
  onSelectCuriosity,
  onOpenShare,
  onToggleFavorite,
  isFavorite
}) => {
  const [activeFilter, setActiveFilter] = useState<'todos' | 'populares' | 'compartilhadas' | 'curiosas' | 'africa'>('todos');
  const [visibleCount, setVisibleCount] = useState(12);

  // Apply in-memory client-side filter
  let filtered = [...curiosities];
  if (activeFilter === 'populares') {
    filtered.sort((a, b) => b.views - a.views);
  } else if (activeFilter === 'compartilhadas') {
    filtered.sort((a, b) => b.shares - a.shares);
  } else if (activeFilter === 'curiosas') {
    filtered.sort((a, b) => (b.funFactor || 90) - (a.funFactor || 90));
  } else if (activeFilter === 'africa') {
    filtered = filtered.filter(c => c.categoryId === 'mocambique-africa');
  }

  const displayedItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
            <Flame className="w-3.5 h-3.5" /> Explorador Geral
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white">
            Curiosidades do Mundo
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'todos'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Todas ({curiosities.length})
          </button>

          <button
            onClick={() => setActiveFilter('populares')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'populares'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-blue-500" /> Mais Lidas
          </button>

          <button
            onClick={() => setActiveFilter('compartilhadas')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'compartilhadas'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Share2 className="w-3 h-3 text-emerald-500" /> Mais Compartilhadas
          </button>

          <button
            onClick={() => setActiveFilter('curiosas')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'curiosas'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" /> Mais Curiosas
          </button>

          <button
            onClick={() => setActiveFilter('africa')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'africa'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            🇲🇿 Moçambique & África
          </button>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedItems.map((item, index) => {
          const isFav = isFavorite(item.slug);

          return (
            <React.Fragment key={item.id}>
              {/* Insert In-Feed Ad at index 6 */}
              {index === 6 && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <AdBanner slot="in-feed" />
                </div>
              )}

              <article className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                {/* Image Header with Badge */}
                <div className="relative aspect-16/10 overflow-hidden cursor-pointer" onClick={() => onSelectCuriosity(item)}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <span className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10">
                    {item.categoryName}
                  </span>

                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.slug);
                      }}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        isFav
                          ? 'bg-red-500 text-white'
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                      title={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenShare(item);
                      }}
                      className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
                      title="Compartilhar"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 grow flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => onSelectCuriosity(item)}
                      className="text-base font-bold text-neutral-950 dark:text-white leading-snug cursor-pointer group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-2"
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4">
                      {item.summary}
                    </p>
                  </div>

                  {/* Footer Meta & Stats */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" /> {item.readTimeMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-neutral-400" /> {item.views.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectCuriosity(item)}
                      className="font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1"
                    >
                      Ler mais <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </article>
            </React.Fragment>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="px-8 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 font-bold text-xs shadow-md hover:shadow-lg transition-all"
          >
            Carregar Mais Curiosidades (+6)
          </button>
        </div>
      )}
    </section>
  );
};
