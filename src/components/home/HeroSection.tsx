import React from 'react';
import { Sparkles, Dice5, Search, Globe2, BookMarked, Users, Flame, ArrowRight, Zap, TrendingUp, Compass } from 'lucide-react';
import { Curiosity } from '../../types';
import { playPopSound } from '../../utils/audio';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface HeroSectionProps {
  onTriggerRandom: () => void;
  onOpenSearch: () => void;
  onSelectCuriosity: (curiosity: Curiosity) => void;
  featuredCuriosity: Curiosity;
  secondaryCuriosities?: Curiosity[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onTriggerRandom,
  onOpenSearch,
  onSelectCuriosity,
  featuredCuriosity,
  secondaryCuriosities = []
}) => {
  return (
    <section className="relative overflow-hidden pt-4 pb-12 lg:pt-6 lg:pb-16 bg-gradient-to-b from-amber-500/5 via-orange-500/[0.02] to-transparent">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/5 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Live Ticker Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-sm text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
              Edição Semanal • Setembro 2026
            </span>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">|</span>
            <span className="hidden sm:inline text-neutral-600 dark:text-neutral-300">
              Novos conteúdos atualizados e verificados pela redação
            </span>
          </div>

          <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 text-[11px]">
            <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" /> 26+ Fatos Inéditos
            </span>
            <span className="hidden md:inline font-mono">100% Fontes Primárias</span>
          </div>
        </div>

        {/* Main Grid: Headline & Search (Left) + Spotlight Showcase (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          {/* Left Column: Brand, Value Proposition & Fast Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Enciclopédia de Maravilhas da Terra e do Cosmos</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-neutral-950 dark:text-white leading-[1.14]">
              Desvende os mistérios mais fascinantes da{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">
                Ciência, História e Natureza
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl font-sans">
              Curadoria rigorosa de descobertas científicas, biodiversidade extraordinária de Moçambique e África, segredos quânticos da matéria e maravilhas do universo que desafiam o senso comum.
            </p>

            {/* Quick Action Input & Surprise Me */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={onOpenSearch}
                className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md text-xs sm:text-sm font-medium shadow-sm transition-all grow text-left group"
                id="hero-search-btn"
              >
                <span className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>Buscar curiosidade, país ou tema...</span>
                </span>
                <span className="text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2.5 py-1 rounded-lg font-mono">
                  Buscar
                </span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  onTriggerRandom();
                }}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all shrink-0 active:scale-95"
                id="hero-random-btn"
              >
                <Dice5 className="w-5 h-5 animate-spin-slow" />
                <span>Surpreenda-me!</span>
              </button>
            </div>

            {/* Micro Discoveries Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-500" /> Em Alta:
              </span>
              {['Lago Niassa', 'Cristais de Tempo', 'Planetas Errantes', 'Manuscritos de Timbuktu', 'Origami de DNA'].map(tag => (
                <button
                  key={tag}
                  onClick={onOpenSearch}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-neutral-700 dark:text-neutral-300 hover:text-amber-700 dark:hover:text-amber-400 text-[11px] font-medium transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-black text-neutral-900 dark:text-white leading-none">12</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Categorias</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <BookMarked className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-black text-neutral-900 dark:text-white leading-none">30+</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Fatos Inéditos</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-black text-neutral-900 dark:text-white leading-none">385k+</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Leituras</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Spotlight Card + Fast Radar (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Featured Card */}
            <div
              onClick={() => onSelectCuriosity(featuredCuriosity)}
              className="group relative bg-white dark:bg-neutral-900 rounded-3xl p-3.5 border border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 cursor-pointer overflow-hidden"
              id="hero-featured-card"
            >
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden mb-3.5 bg-neutral-100 dark:bg-neutral-800">
                <ImageWithFallback
                  src={featuredCuriosity.imageUrl}
                  alt={featuredCuriosity.title}
                  categoryId={featuredCuriosity.categoryId}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                    <Sparkles className="w-3 h-3" /> Destaque da Semana
                  </span>
                  {featuredCuriosity.funFactor && (
                    <span className="bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-500/30">
                      🤯 {featuredCuriosity.funFactor}% Fator Surpresa
                    </span>
                  )}
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

              <div className="px-1.5 pb-1">
                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed mb-3">
                  {featuredCuriosity.summary}
                </p>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-medium pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> {featuredCuriosity.readTimeMinutes} min de leitura
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Ler descoberta completa <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Radar Row (if secondary provided) */}
            {secondaryCuriosities.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {secondaryCuriosities.slice(0, 2).map(curiosity => (
                  <div
                    key={curiosity.id}
                    onClick={() => onSelectCuriosity(curiosity)}
                    className="p-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer shadow-sm hover:shadow transition-all group flex items-center gap-2.5"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                      <ImageWithFallback
                        src={curiosity.imageUrl}
                        alt={curiosity.title}
                        categoryId={curiosity.categoryId}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-amber-500 font-bold uppercase truncate">
                        {curiosity.categoryName}
                      </div>
                      <h4 className="text-[11px] font-semibold text-neutral-900 dark:text-white truncate mt-0.5">
                        {curiosity.title}
                      </h4>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {curiosity.readTimeMinutes} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
