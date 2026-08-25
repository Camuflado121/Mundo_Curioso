import React from 'react';
import { ArrowLeft, Calendar, Clock, Eye, ShieldCheck, Share2, BookOpen } from 'lucide-react';
import { SpecialArticle } from '../../types';
import { AdBanner } from '../common/AdBanner';

interface ArticleDetailViewProps {
  article: SpecialArticle;
  onBack: () => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({ article, onBack }) => {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar aos Dossiês
      </button>

      <article className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-12 shadow-xl mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider">
            Dossiê de Pesquisa
          </span>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Fato Verificado
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-neutral-950 dark:text-white leading-[1.2] mb-3">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
          {article.subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pb-6 mb-8 border-b border-neutral-100 dark:border-neutral-800">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Por {article.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {article.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {article.readTimeMinutes} min de leitura
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString()} leituras
          </span>
        </div>

        <div className="relative aspect-16/9 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-5">
          {article.content.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>

      <AdBanner slot="article-footer" />
    </div>
  );
};
