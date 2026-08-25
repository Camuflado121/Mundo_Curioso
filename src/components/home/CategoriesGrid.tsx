import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ALL_CATEGORIES } from '../../data/allCuriosities';
import { IconHelper } from '../common/IconHelper';

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
          Explore acervos selecionados e descubra fatos fascinantes organizados por área temática.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-amber-500 group-hover:text-white transition-colors flex items-center justify-center mb-3">
                <IconHelper name={cat.icon} className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight mb-1">
                {cat.name}
              </h3>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400">
              <span>{cat.count} fatos</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
