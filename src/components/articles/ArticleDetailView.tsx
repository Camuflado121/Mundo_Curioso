import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  ShieldCheck,
  Share2,
  BookOpen,
  Minimize2
} from 'lucide-react';
import { SpecialArticle } from '../../types';
import { AdBanner } from '../common/AdBanner';
import { CommentsSection } from '../common/CommentsSection';
import { playPopSound } from '../../utils/audio';
import {
  ReaderToolbar,
  ReaderFontSize,
  ReaderFontFamily,
  ReaderTheme
} from '../common/ReaderToolbar';

interface ArticleDetailViewProps {
  article: SpecialArticle;
  onBack: () => void;
  isAdmin?: boolean;
  token?: string | null;
  adminName?: string;
  isReaderMode?: boolean;
  onToggleReaderMode?: () => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  onBack,
  isAdmin = false,
  token,
  adminName,
  isReaderMode = false,
  onToggleReaderMode
}) => {
  // Reader mode customizations
  const [fontSize, setFontSize] = useState<ReaderFontSize>('md');
  const [fontFamily, setFontFamily] = useState<ReaderFontFamily>('serif');
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('default');
  const [readingProgress, setReadingProgress] = useState(0);

  // Scroll listener for reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ----------------------------------------------------
  // DISTRACTION-FREE READER MODE
  // ----------------------------------------------------
  if (isReaderMode) {
    const themeWrapperClass =
      readerTheme === 'sepia'
        ? 'bg-[#fbf0d9] text-[#3d2f1d]'
        : readerTheme === 'dark'
        ? 'bg-[#0f0f11] text-[#e2e2e8]'
        : readerTheme === 'light'
        ? 'bg-[#ffffff] text-[#1a202c]'
        : 'bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100';

    const fontClass =
      fontFamily === 'serif'
        ? 'font-serif'
        : fontFamily === 'mono'
        ? 'font-mono'
        : 'font-sans';

    const paragraphTextClass =
      fontSize === 'sm'
        ? 'text-base leading-relaxed'
        : fontSize === 'lg'
        ? 'text-xl sm:text-2xl leading-loose'
        : 'text-lg sm:text-xl leading-relaxed';

    return (
      <div className={`min-h-screen transition-colors duration-200 ${themeWrapperClass}`}>
        {/* Floating Reader Toolbar */}
        <ReaderToolbar
          onExit={onToggleReaderMode || onBack}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          readerTheme={readerTheme}
          setReaderTheme={setReaderTheme}
          readTimeMinutes={article.readTimeMinutes}
          readingProgress={readingProgress}
        />

        {/* Distraction-free Content Body */}
        <main className="max-w-2xl mx-auto px-5 sm:px-8 pt-20 sm:pt-24 pb-20 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-4 text-xs opacity-75 font-semibold">
            <span className="uppercase tracking-widest">Dossiê Especial</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Investigação Verificada
            </span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-snug ${fontClass}`}
          >
            {article.title}
          </h1>

          <p className="text-base sm:text-lg opacity-85 leading-relaxed mb-6 font-medium">
            {article.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs opacity-60 pb-6 mb-8 border-b border-current/10">
            <span>Por {article.author}</span>
            <span>•</span>
            <span>{article.date}</span>
            <span>•</span>
            <span>{article.readTimeMinutes} min de leitura</span>
          </div>

          <article className={`space-y-6 my-8 ${fontClass} ${paragraphTextClass}`}>
            {article.content.split('\n\n').map((para, i) => {
              if (para.startsWith('### ')) {
                return (
                  <h2 key={i} className="text-xl sm:text-2xl font-bold pt-4 pb-1">
                    {para.replace('### ', '')}
                  </h2>
                );
              }
              return (
                <p key={i} className="leading-relaxed">
                  {para}
                </p>
              );
            })}
          </article>

          {/* Exit / Return Footer */}
          <div className="mt-16 pt-10 text-center border-t border-current/10">
            <p className="text-xs uppercase tracking-widest opacity-50 mb-3 font-semibold">
              Fim do Dossiê
            </p>
            <button
              onClick={onToggleReaderMode || onBack}
              className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" /> Sair do Modo Leitura
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // STANDARD INTERACTIVE PORTAL VIEW
  // ----------------------------------------------------
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar aos Dossiês
        </button>

        {onToggleReaderMode && (
          <button
            onClick={() => {
              playPopSound();
              onToggleReaderMode();
            }}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
            title="Ativar Modo Leitura (Sem distrações)"
          >
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Modo Leitura</span>
          </button>
        )}
      </div>

      <article className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-12 shadow-xl mb-8">
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
          {article.content.split('\n\n').map((para, i) => {
            if (para.startsWith('### ')) {
              return (
                <h3 key={i} className="text-lg sm:text-xl font-bold font-serif text-neutral-900 dark:text-white pt-3">
                  {para.replace('### ', '')}
                </h3>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>
      </article>

      {/* Interactive Comments */}
      <CommentsSection
        targetId={article.id}
        targetTitle={article.title}
        isAdmin={isAdmin}
        adminName={adminName}
        token={token}
      />

      <AdBanner slot="article-footer" />
    </div>
  );
};

