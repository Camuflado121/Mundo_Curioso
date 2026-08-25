import React from 'react';
import { Sparkles, Dice5, Search, Globe2, BookMarked, Users, Flame, ArrowRight } from 'lucide-react';
import { Curiosity } from '../../types';
import { playPopSound } from '../../utils/audio';

interface HeroSectionProps {
  onTriggerRandom: () => void;
  onOpenSearch: () => void;
  onSelectCuriosity: (curiosity: Curiosity) => void;
  featuredCuriosity: Curiosity;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onTriggerRandom,
  onOpenSearch,
  onSelectCuriosity,
  featuredCuriosity
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:py-16 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/5 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Text & Call to Action (7 cols) */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide animate-in fade-in duration-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>O portal definitivo de conhecimento & maravilhas do mundo</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-neutral-950 dark:text-white leading-[1.15]">
              Descubra os segredos mais fascinantes da{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
                Terra e do Universo
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl font-sans">
              Mergulhe em curiosidades científicas verificadas, tesouros arqueológicos, maravilhas de Moçambique e África, segredos do cérebro humano e fenômenos do cosmos que desafiam a imaginação.
            </p>

            {/* Action Search & Surprise Me Row */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onOpenSearch}
                className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-amber-400 dark:hover:border-amber-600 text-xs sm:text-sm font-medium shadow-sm transition-all grow text-left group"
              >
                <span className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  O que você quer descobrir hoje?
                </span>
                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded font-mono">
                  Buscar
                </span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  onTriggerRandom();
                }}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all shrink-0 active:scale-95"
              >
                <Dice5 className="w-5 h-5 animate-spin-slow" />
                <span>Surpreenda-me!</span>
              </button>
            </div>

            {/* Fast Stats Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">14</div>
                  <div className="text-[10px] text-neutral-500">Categorias</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <BookMarked className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">50+</div>
                  <div className="text-[10px] text-neutral-500">Fatos Fatuais</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">380k+</div>
                  <div className="text-[10px] text-neutral-500">Exploradores</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Featured Spotlight Card (5 cols) */}
          <div className="lg:col-span-5">
            <div
              onClick={() => onSelectCuriosity(featuredCuriosity)}
              className="group relative bg-white dark:bg-neutral-900 rounded-3xl p-3 border border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden mb-4">
                <img
                  src={featuredCuriosity.imageUrl}
                  alt={featuredCuriosity.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-amber-500 text-neutral-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                  <Sparkles className="w-3 h-3" /> Fato em Destaque
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    {featuredCuriosity.categoryName}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold line-clamp-2 mt-0.5 leading-snug">
                    {featuredCuriosity.title}
                  </h3>
                </div>
              </div>

              <div className="px-2 pb-2">
                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed mb-3">
                  {featuredCuriosity.summary}
                </p>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-medium pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span>{featuredCuriosity.readTimeMinutes} min de leitura</span>
                  <span className="text-amber-500 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Ler descoberta completa <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
