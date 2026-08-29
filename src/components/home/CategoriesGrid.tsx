import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ALL_CATEGORIES } from '../../data/allCuriosities';
import { IconHelper } from '../common/IconHelper';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface CategoriesGridProps {
  onSelectCategory: (categorySlug: string) => void;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ onSelectCategory }) => {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Áreas do Conhecimento
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white">
            Navegue por Categorias
          </h2>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md">
          Explore acervos selecionados com imagens em alta resolução e fatos fascinantes organizados por área temática.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className="group relative h-48 rounded-2xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-end p-4"
          >
            {/* Background Cover Image with Fallback */}
            <div className="absolute inset-0 z-0">
              <ImageWithFallback
                src={cat.coverImage}
                alt={cat.name}
                category={cat.slug}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/60 to-neutral-950/20 group-hover:from-neutral-950/90 transition-colors" />
            </div>

            {/* Top Icon Badge */}
            <div className="relative z-10 mb-auto flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-xl bg-white/20 dark:bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shadow-sm group-hover:bg-amber-500 group-hover:border-amber-400 transition-colors">
                <IconHelper name={cat.icon} className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white/90 border border-white/10">
                {cat.count} fatos
              </span>
            </div>

            {/* Bottom Category Info */}
            <div className="relative z-10 mt-2">
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                {cat.name}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-neutral-300 group-hover:text-amber-200 font-medium">
                <span>Explorar</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
