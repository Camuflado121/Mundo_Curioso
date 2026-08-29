import React, { useState } from 'react';
import { X, Trophy, Flame, Sparkles, BookMarked, History, Award, Trash2 } from 'lucide-react';
import { UserStats, Curiosity } from '../../types';
import { ALL_CURIOSITIES } from '../../data/allCuriosities';
import { ImageWithFallback } from './ImageWithFallback';

interface ProfileModalProps {
  stats: UserStats;
  isOpen: boolean;
  onClose: () => void;
  onSelectCuriosity: (curiosity: Curiosity) => void;
  onToggleFavorite: (slug: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  stats,
  isOpen,
  onClose,
  onSelectCuriosity,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'achievements'>('favorites');

  if (!isOpen) return null;

  const favoriteItems = ALL_CURIOSITIES.filter(c => stats.favorites.includes(c.slug));
  const historyItems = stats.history
    .map(slug => ALL_CURIOSITIES.find(c => c.slug === slug))
    .filter((c): c is Curiosity => !!c);

  const xpPercent = Math.min(100, Math.round((stats.currentXp / stats.nextLevelXp) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
            {stats.level}
          </div>

          <div className="grow">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-500">
                Nível {stats.level}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                {stats.levelTitle}
              </span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Explorador do Conhecimento
            </h3>

            {/* XP Progress Bar */}
            <div className="mt-2.5">
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>{stats.currentXp} XP</span>
                <span>{stats.nextLevelXp} XP (Próximo Nível)</span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak pill */}
          <div className="flex sm:flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
            <Flame className="w-5 h-5 mb-0.5 fill-amber-500 animate-pulse" />
            <span className="text-xs font-bold leading-tight">{stats.streakDays} Dias</span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Sequência</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'favorites'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" /> Favoritos ({favoriteItems.length})
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'achievements'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Conquistas ({stats.achievements.filter(a => a.unlockedAt).length}/{stats.achievements.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Histórico ({historyItems.length})
          </button>
        </div>

        {/* Content list */}
        <div className="grow overflow-y-auto py-4 space-y-3 pr-1">
          {activeTab === 'favorites' && (
            favoriteItems.length === 0 ? (
              <div className="text-center py-10 text-neutral-400">
                <BookMarked className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Nenhuma curiosidade salva ainda.</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Clique no ícone de coração em qualquer artigo para salvar seus fatos prediletos!
                </p>
              </div>
            ) : (
              favoriteItems.map(item => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-amber-300 dark:hover:border-amber-700 bg-neutral-50/50 dark:bg-neutral-950 transition-all cursor-pointer"
                  onClick={() => {
                    onSelectCuriosity(item);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.title}
                      category={item.categoryId}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                        {item.categoryName}
                      </span>
                      <h4 className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-amber-600 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.slug);
                    }}
                    className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                    title="Remover dos favoritos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.achievements.map(ach => {
                const isUnlocked = !!ach.unlockedAt;
                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      isUnlocked
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                        : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {ach.icon === 'Flame' ? (
                        <Flame className="w-5 h-5" />
                      ) : ach.icon === 'Trophy' ? (
                        <Trophy className="w-5 h-5" />
                      ) : ach.icon === 'BookMarked' ? (
                        <BookMarked className="w-5 h-5" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        {ach.title}
                        {isUnlocked && (
                          <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-sm">
                            DESBLOQUEADO
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'history' && (
            historyItems.length === 0 ? (
              <div className="text-center py-10 text-neutral-400">
                <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Nenhum histórico recente.</p>
              </div>
            ) : (
              historyItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                  onClick={() => {
                    onSelectCuriosity(item);
                    onClose();
                  }}
                >
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.title}
                    category={item.categoryId}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="overflow-hidden grow">
                    <span className="text-[10px] text-amber-500 font-semibold uppercase">
                      {item.categoryName}
                    </span>
                    <h4 className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
