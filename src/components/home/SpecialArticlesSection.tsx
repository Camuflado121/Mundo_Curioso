import React from 'react';
import { BookOpen, ArrowRight, Clock, Eye } from 'lucide-react';
import { SpecialArticle } from '../../types';
import { ALL_ARTICLES } from '../../data/allCuriosities';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface SpecialArticlesSectionProps {
  onSelectArticle: (article: SpecialArticle) => void;
  onNavigateArticles: () => void;
}

export const SpecialArticlesSection: React.FC<SpecialArticlesSectionProps> = ({
  onSelectArticle,
  onNavigateArticles
}) => {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <BookOpen className="w-3.5 h-3.5" /> Edições Especiais
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white">
            Grandes Dossiês & Reportagens
          </h2>
        </div>
        <button
          onClick={onNavigateArticles}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          Ver todos os especiais <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ALL_ARTICLES.map(article => (
          <article
            key={article.id}
            onClick={() => onSelectArticle(article)}
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="relative aspect-16/9 overflow-hidden">
                <ImageWithFallback
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] uppercase font-black tracking-wider text-white bg-blue-600 px-2.5 py-0.5 rounded-full">
                  Dossiê Completo
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-base font-bold text-neutral-950 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                  {article.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4">
                  {article.subtitle}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" /> {article.readTimeMinutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-neutral-400" /> {article.views.toLocaleString()}
                </span>
              </div>

              <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Ler Dossiê <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
