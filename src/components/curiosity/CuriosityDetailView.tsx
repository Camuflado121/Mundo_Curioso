import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Dice5,
  ArrowRight,
  ThumbsUp,
  Smile,
  Zap,
  Flame,
  CheckCircle2,
  BookOpen,
  Minimize2
} from 'lucide-react';
import { Curiosity } from '../../types';
import { getRelatedCuriosities } from '../../data/allCuriosities';
import { AdBanner } from '../common/AdBanner';
import { playPopSound } from '../../utils/audio';
import { CommentsSection } from '../common/CommentsSection';
import {
  ReaderToolbar,
  ReaderFontSize,
  ReaderFontFamily,
  ReaderTheme
} from '../common/ReaderToolbar';

interface CuriosityDetailViewProps {
  curiosity: Curiosity;
  onBack: () => void;
  onSelectCuriosity: (curiosity: Curiosity) => void;
  onOpenShare: (curiosity: Curiosity) => void;
  onToggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  onTriggerRandom: () => void;
  isAdmin?: boolean;
  token?: string | null;
  adminName?: string;
  isReaderMode?: boolean;
  onToggleReaderMode?: () => void;
}

export const CuriosityDetailView: React.FC<CuriosityDetailViewProps> = ({
  curiosity,
  onBack,
  onSelectCuriosity,
  onOpenShare,
  onToggleFavorite,
  isFavorite,
  onTriggerRandom,
  isAdmin = false,
  token,
  adminName,
  isReaderMode = false,
  onToggleReaderMode
}) => {
  const [likesCount, setLikesCount] = useState(curiosity.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  // Reader mode customizations
  const [fontSize, setFontSize] = useState<ReaderFontSize>('md');
  const [fontFamily, setFontFamily] = useState<ReaderFontFamily>('serif');
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('default');
  const [readingProgress, setReadingProgress] = useState(0);

  // Scroll listener for reading progress calculation
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

  const related = getRelatedCuriosities(curiosity, 3);
  const isFav = isFavorite(curiosity.slug);

  const handleLike = async () => {
    if (hasLiked) return;
    playPopSound();
    setHasLiked(true);
    setLikesCount(prev => prev + 1);

    try {
      await fetch(`/api/curiosidades/${curiosity.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      });
    } catch {
      // Handled
    }
  };

  const handleReaction = (reaction: string) => {
    playPopSound();
    setSelectedReaction(reaction);
    if (!hasLiked) {
      handleLike();
    }
  };

  // ----------------------------------------------------
  // DISTRACTION-FREE READER MODE RENDER
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
        {/* Floating Toolbar & Scroll Progress */}
        <ReaderToolbar
          onExit={onToggleReaderMode || onBack}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          readerTheme={readerTheme}
          setReaderTheme={setReaderTheme}
          readTimeMinutes={curiosity.readTimeMinutes}
          readingProgress={readingProgress}
        />

        {/* Distraction-free Content Body */}
        <main className="max-w-2xl mx-auto px-5 sm:px-8 pt-20 sm:pt-24 pb-20 animate-in fade-in duration-300">
          {/* Category & Badge */}
          <div className="flex items-center gap-2 mb-4 text-xs opacity-75 font-semibold">
            <span className="uppercase tracking-widest">{curiosity.categoryName}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Fato Científico
            </span>
          </div>

          {/* Article Title */}
          <h1
            className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-snug ${fontClass}`}
          >
            {curiosity.title}
          </h1>

          {/* Meta details */}
          <div className="flex flex-wrap items-center gap-3 text-xs opacity-60 pb-6 mb-8 border-b border-current/10">
            <span>Por {curiosity.author}</span>
            <span>•</span>
            <span>{curiosity.date}</span>
            <span>•</span>
            <span>{curiosity.readTimeMinutes} min de leitura</span>
          </div>

          {/* Lead Summary Highlight */}
          <blockquote className="my-6 pl-4 border-l-4 border-amber-500/70 italic text-base sm:text-lg opacity-90 leading-relaxed">
            "{curiosity.summary}"
          </blockquote>

          {/* Content Paragraphs */}
          <article className={`space-y-6 my-8 ${fontClass} ${paragraphTextClass}`}>
            {curiosity.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </article>

          {/* "Você Sabia?" Box */}
          {curiosity.didYouKnow && (
            <div className="my-10 p-6 rounded-2xl border border-current/15 bg-current/5">
              <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" /> Você Sabia?
              </div>
              <p className={`text-base sm:text-lg font-medium leading-relaxed opacity-95 ${fontClass}`}>
                {curiosity.didYouKnow}
              </p>
            </div>
          )}

          {/* Source Link */}
          <div className="pt-6 mt-8 border-t border-current/10 text-xs opacity-70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold">Referência: </span>
              <span>{curiosity.sourceName}</span>
            </div>
            {curiosity.sourceUrl && (
              <a
                href={curiosity.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:opacity-100 flex items-center gap-1"
              >
                Ver fonte original <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Exit / Return Footer */}
          <div className="mt-16 pt-10 text-center border-t border-current/10">
            <p className="text-xs uppercase tracking-widest opacity-50 mb-3 font-semibold">
              Fim da leitura
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
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Modo Leitura Action Button */}
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

          <button
            onClick={() => onToggleFavorite(curiosity.slug)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isFav
                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-500'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500' : ''}`} />
            <span className="hidden sm:inline">{isFav ? 'Salvo' : 'Salvar'}</span>
          </button>

          <button
            onClick={() => onOpenShare(curiosity)}
            className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-amber-500 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>

          <button
            onClick={onTriggerRandom}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            title="Próxima curiosidade aleatória"
          >
            <Dice5 className="w-4 h-4" />
            <span className="hidden sm:inline">Outra Aleatória</span>
          </button>
        </div>
      </div>

      {/* Main Article Card */}
      <article className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-xl mb-10">
        {/* Category & Verified Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
            {curiosity.categoryName}
          </span>

          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40">
            <ShieldCheck className="w-4 h-4" />
            <span>Fato Cientificamente Verificado</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-tight text-neutral-950 dark:text-white leading-[1.2] mb-4">
          {curiosity.title}
        </h1>

        {/* Author and Metadata Bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 pb-6 mb-6 border-b border-neutral-100 dark:border-neutral-800">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Por {curiosity.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {curiosity.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {curiosity.readTimeMinutes} min de leitura
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {curiosity.views.toLocaleString()} leituras
          </span>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-16/9 rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={curiosity.imageUrl}
            alt={curiosity.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Highlight Summary Box */}
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border-l-4 border-amber-500 mb-8">
          <p className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 leading-relaxed italic">
            "{curiosity.summary}"
          </p>
        </div>

        {/* Article Body Content */}
        <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-4 mb-8">
          {curiosity.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* "Você Sabia?" Box */}
        {curiosity.didYouKnow && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-850 text-white border border-neutral-800 my-8 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> Você Sabia?
            </div>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-neutral-200">
              {curiosity.didYouKnow}
            </p>
          </div>
        )}

        {/* Source Citation */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-neutral-900 dark:text-white block mb-0.5">
              Fonte / Referência Oficial:
            </span>
            <span className="text-neutral-500 dark:text-neutral-400">
              {curiosity.sourceName}
            </span>
          </div>
          {curiosity.sourceUrl && (
            <a
              href={curiosity.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Consultar fonte original <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Interactive Reactions Bar */}
        <div className="pt-8 mt-8 border-t border-neutral-100 dark:border-neutral-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 text-center sm:text-left">
            O que você achou dessa descoberta?
          </h4>
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <button
              onClick={() => handleReaction('mind_blown')}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedReaction === 'mind_blown'
                  ? 'bg-purple-500 text-white border-purple-500 shadow-md scale-105'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-purple-400'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" /> 🤯 Impressionante ({likesCount})
            </button>

            <button
              onClick={() => handleReaction('loved')}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedReaction === 'loved'
                  ? 'bg-red-500 text-white border-red-500 shadow-md scale-105'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-red-400'
              }`}
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" /> ❤️ Adorei
            </button>

            <button
              onClick={() => handleReaction('didnt_know')}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedReaction === 'didnt_know'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-105'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-amber-400'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" /> 🤔 Não sabia!
            </button>
          </div>
        </div>
      </article>

      {/* Ad slot inside article */}
      <AdBanner slot="article-footer" />

      {/* Interactive Community Comments & Debate Section */}
      <CommentsSection
        targetId={curiosity.id}
        targetTitle={curiosity.title}
        isAdmin={isAdmin}
        adminName={adminName}
        token={token}
      />

      {/* Related Curiosities: "O que explorar a seguir?" */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 block mb-0.5">
              Continue a Viagem
            </span>
            <h3 className="text-xl font-bold font-serif text-neutral-950 dark:text-white">
              Curiosidades Relacionadas
            </h3>
          </div>

          <button
            onClick={onTriggerRandom}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Fato Aleatório <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectCuriosity(item)}
              className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-16/10 overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider bg-neutral-900/80 text-white px-2 py-0.5 rounded-full">
                    {item.categoryName}
                  </span>
                </div>

                <div className="p-4">
                  <h4 className="text-xs font-bold text-neutral-950 dark:text-white line-clamp-2 group-hover:text-amber-500 transition-colors mb-1.5 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
                <span>{item.readTimeMinutes} min de leitura</span>
                <span className="font-bold text-amber-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ler agora <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

