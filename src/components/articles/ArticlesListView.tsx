import React from 'react';
import { BookOpen, ArrowLeft, Clock, Eye, ArrowRight } from 'lucide-react';
import { SpecialArticle } from '../../types';
import { ALL_ARTICLES } from '../../data/allCuriosities';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface ArticlesListViewProps {
  onBack: () => void;
  onSelectArticle: (article: SpecialArticle) => void;
}

export const ArticlesListView: React.FC<ArticlesListViewProps> = ({ onBack, onSelectArticle }) => {
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-neutral-950 border border-blue-900/40 rounded-3xl p-8 sm:p-12 text-white mb-10 shadow-2xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-4 h-4 text-blue-400" /> Dossiês & Investigações Especiais
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-white mb-3">
            Artigos Aprofundados sobre os Grandes Mistérios da História e da Ciência
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Reportagens completas, referenciadas e ricamente documentadas para quem busca compreender a fundo os fenômenos mais espetaculares da nossa existência.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_ARTICLES.map(article => (
          <article
            key={article.id}
            onClick={() => onSelectArticle(article)}
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="relative aspect-16/10 overflow-hidden">
                <ImageWithFallback
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] uppercase font-black tracking-wider text-white bg-blue-600 px-2.5 py-0.5 rounded-full">
                  Dossiê Especial
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
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
    </div>
  );
};
