import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Clock,
  Eye,
  Heart,
  Share2,
  ArrowRight,
  HelpCircle,
  Play,
  Sparkles
} from 'lucide-react';
import { Curiosity, Category, Quiz } from '../../types';
import { ALL_CATEGORIES, ALL_QUIZZES } from '../../data/allCuriosities';
import { IconHelper } from '../common/IconHelper';

interface CategoryPageViewProps {
  categorySlug: string;
  curiosities: Curiosity[];
  onBack: () => void;
  onSelectCuriosity: (curiosity: Curiosity) => void;
  onSelectQuiz: (quiz: Quiz) => void;
  onOpenShare: (curiosity: Curiosity) => void;
  onToggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
}

export const CategoryPageView: React.FC<CategoryPageViewProps> = ({
  categorySlug,
  curiosities,
  onBack,
  onSelectCuriosity,
  onSelectQuiz,
  onOpenShare,
  onToggleFavorite,
  isFavorite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recentes' | 'populares' | 'curiosas'>('recentes');

  const category = ALL_CATEGORIES.find(c => c.slug === categorySlug || c.id === categorySlug) || ALL_CATEGORIES[0];
  const relatedQuiz = ALL_QUIZZES.find(q => q.categoryId === category.id || q.categoryName === category.name);

  const categoryCuriosities = curiosities.filter(c => c.categoryId === category.id);

  let filtered = categoryCuriosities.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q));
  });

  if (sortBy === 'populares') {
    filtered.sort((a, b) => b.views - a.views);
  } else if (sortBy === 'curiosas') {
    filtered.sort((a, b) => (b.funFactor || 90) - (a.funFactor || 90));
  } else {
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Todas as Categorias
      </button>

      {/* Category Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-8 sm:p-12 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shadow-lg shrink-0">
            <IconHelper name={category.icon} className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-400">
                Categoria Especial
              </span>
              <span className="text-xs bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                {categoryCuriosities.length} Fatos Disponíveis
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-serif text-neutral-950 dark:text-white">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-2 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>

        {/* Related Quiz prompt if available */}
        {relatedQuiz && (
          <div
            onClick={() => onSelectQuiz(relatedQuiz)}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md hover:border-amber-400 cursor-pointer transition-all shrink-0 max-w-xs"
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-500 mb-1">
              <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Quiz da Categoria</span>
              <span>+{relatedQuiz.xpReward} XP</span>
            </div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1 mb-1">
              {relatedQuiz.title}
            </h4>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              Fazer Teste Agora <Play className="w-2.5 h-2.5 fill-current" />
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar inside Category */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Buscar em ${category.name}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-neutral-400 font-medium">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'recentes' | 'populares' | 'curiosas')}
            className="px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            <option value="recentes">Mais Recentes</option>
            <option value="populares">Mais Lidas</option>
            <option value="curiosas">Mais Curiosas (Fator UAU)</option>
          </select>
        </div>
      </div>

      {/* Curiosities Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
          <p className="text-sm font-semibold">Nenhuma curiosidade encontrada nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => {
            const isFav = isFavorite(item.slug);

            return (
              <article
                key={item.id}
                className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div
                  className="relative aspect-16/10 overflow-hidden cursor-pointer"
                  onClick={() => onSelectCuriosity(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.slug);
                      }}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        isFav ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                      title="Salvar"
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
            );
          })}
        </div>
      )}
    </div>
  );
};
