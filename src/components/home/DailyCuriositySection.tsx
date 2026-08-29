import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, ArrowRight, Heart, Share2, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { Curiosity } from '../../types';
import { DID_YOU_KNOW_FAST_FACTS } from '../../data/initialData';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface DailyCuriositySectionProps {
  dailyCuriosity: Curiosity;
  onSelectCuriosity: (curiosity: Curiosity) => void;
  onOpenShare: (curiosity: Curiosity) => void;
  onToggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
}

export const DailyCuriositySection: React.FC<DailyCuriositySectionProps> = ({
  dailyCuriosity,
  onSelectCuriosity,
  onOpenShare,
  onToggleFavorite,
  isFavorite
}) => {
  const [fastFactIndex, setFastFactIndex] = useState(0);

  // Auto rotate fast facts every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setFastFactIndex(prev => (prev + 1) % DID_YOU_KNOW_FAST_FACTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const currentFact = DID_YOU_KNOW_FAST_FACTS[fastFactIndex];

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Daily Curiosity Spotlight (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-neutral-950 text-[11px] font-black uppercase tracking-wider shadow-xs">
                <Calendar className="w-3.5 h-3.5" /> Curiosidade do Dia
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleFavorite(dailyCuriosity.slug)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isFavorite(dailyCuriosity.slug)
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-500 fill-red-500'
                      : 'bg-white/80 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-red-500'
                  }`}
                  title="Salvar nos favoritos"
                >
                  <Heart className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenShare(dailyCuriosity)}
                  className="p-2 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-amber-500 transition-colors"
                  title="Compartilhar fato do dia"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-4">
              <ImageWithFallback
                src={dailyCuriosity.imageUrl}
                alt={dailyCuriosity.title}
                category={dailyCuriosity.categoryId}
                className="w-full sm:w-36 h-36 rounded-2xl object-cover shadow-md shrink-0"
              />
              <div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  {dailyCuriosity.categoryName}
                </span>
                <h3
                  onClick={() => onSelectCuriosity(dailyCuriosity)}
                  className="text-lg sm:text-xl font-black font-serif text-neutral-950 dark:text-white leading-snug cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors mt-1"
                >
                  {dailyCuriosity.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 line-clamp-3 leading-relaxed">
                  {dailyCuriosity.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-amber-500/15 flex items-center justify-between text-xs font-medium">
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
              Atualizado diariamente às 00:00 UTC
            </span>
            <button
              onClick={() => onSelectCuriosity(dailyCuriosity)}
              className="inline-flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              Ler artigo completo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fast Facts "Você Sabia?" Carousel (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Você Sabia?
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setFastFactIndex(prev => (prev === 0 ? DID_YOU_KNOW_FAST_FACTS.length - 1 : prev - 1))
                }
                className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                aria-label="Fato anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono text-neutral-400 px-1.5">
                {fastFactIndex + 1}/{DID_YOU_KNOW_FAST_FACTS.length}
              </span>
              <button
                onClick={() => setFastFactIndex(prev => (prev + 1) % DID_YOU_KNOW_FAST_FACTS.length)}
                className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                aria-label="Próximo fato"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="my-auto py-3">
            <p className="text-base sm:text-lg font-bold leading-snug text-neutral-100 italic">
              "{currentFact}"
            </p>
            <span className="inline-block mt-3 text-[10px] uppercase tracking-wider font-semibold text-amber-400 bg-neutral-800 px-2 py-0.5 rounded-md">
              Fato Rápido
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <div className="flex gap-1.5">
              {DID_YOU_KNOW_FAST_FACTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFastFactIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === fastFactIndex ? 'w-6 bg-amber-500' : 'w-1.5 bg-neutral-700 hover:bg-neutral-600'
                  }`}
                  aria-label={`Ver fato ${i + 1}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-neutral-400">Pílulas de Sabedoria</span>
          </div>
        </div>
      </div>
    </section>
  );
};
