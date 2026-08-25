import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { Curiosity } from '../../types';
import { ALL_CURIOSITIES } from '../../data/allCuriosities';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCuriosity: (curiosity: Curiosity) => void;
}

const POPULAR_SEARCHES = [
  'Moçambique',
  'Buraco Negro',
  'Polvos',
  'Mansa Musa',
  'Derinkuyu',
  'Gatos',
  'DNA',
  'Telescópio',
  'Fossa das Marianas'
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectCuriosity }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim()
    ? ALL_CURIOSITIES.filter(c => {
        const q = query.toLowerCase().trim();
        return (
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.content.toLowerCase().includes(q) ||
          c.categoryName.toLowerCase().includes(q) ||
          c.tags.some(t => t.toLowerCase().includes(q))
        );
      }).slice(0, 8)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Search Bar Input */}
        <div className="relative flex items-center mb-4">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquise por temas, animais, ciência, história de Moçambique..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-2xl text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="absolute right-4 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-xs font-semibold"
            >
              ESC
            </button>
          )}
        </div>

        {/* Popular Tags */}
        {!query && (
          <div className="py-2 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
              Termos Populares
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SEARCHES.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-400 text-neutral-600 dark:text-neutral-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 opacity-60" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="grow overflow-y-auto space-y-2 pr-1">
          {query.trim() && results.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
              <p className="text-sm font-medium">Nenhuma curiosidade encontrada para "{query}"</p>
              <p className="text-xs text-neutral-500 mt-1">
                Tente buscar por palavras-chave mais genéricas como "África", "Espaço", "Animais" ou "Cérebro".
              </p>
            </div>
          ) : (
            results.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectCuriosity(item);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                      {item.categoryName}
                    </span>
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
