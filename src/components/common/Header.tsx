import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Dice5,
  Sun,
  Moon,
  Flame,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  HelpCircle,
  BookOpen,
  LayoutDashboard,
  Bell
} from 'lucide-react';
import { UserStats, Category } from '../../types';
import { ALL_CATEGORIES } from '../../data/allCuriosities';
import { IconHelper } from './IconHelper';
import { playPopSound } from '../../utils/audio';

interface HeaderProps {
  currentView: string;
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
  onNavigateCategory?: (slug: string) => void;
  onNavigateQuizzes: () => void;
  onNavigateArticles: () => void;
  onNavigateAdmin: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenSubmit: () => void;
  onTriggerRandom: () => void;
  onOpenAiAssistant?: () => void;
  userStats: UserStats;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isAdmin?: boolean;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onNavigateCategories,
  onNavigateCategory,
  onNavigateQuizzes,
  onNavigateArticles,
  onNavigateAdmin,
  onOpenSearch,
  onOpenProfile,
  onOpenSubmit,
  onTriggerRandom,
  onOpenAiAssistant,
  userStats,
  isDarkMode,
  onToggleTheme,
  isAdmin = false,
  unreadNotificationsCount = 0,
  onOpenNotifications
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const handleRandomClick = () => {
    playPopSound();
    onTriggerRandom();
    setMobileMenuOpen(false);
  };

  const handleNav = (view: string, param?: string) => {
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
    if (view === 'home') {
      onNavigateHome();
    } else if (view === 'quizzes') {
      onNavigateQuizzes();
    } else if (view === 'artigos') {
      onNavigateArticles();
    } else if (view === 'admin') {
      onNavigateAdmin();
    } else if (view === 'categoria') {
      if (param && onNavigateCategory) {
        onNavigateCategory(param);
      } else {
        onNavigateCategories();
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-neutral-950 dark:text-white font-serif">
                  Mundo<span className="text-amber-500">Curioso</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md border border-amber-500/20">
                  Global
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium hidden md:block">
                Enciclopédia de Fatos & Descobertas
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentView === 'home'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              Início
            </button>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                Categorias <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesDropdownOpen && (
                <div
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 grid grid-cols-1 gap-1 max-h-96 overflow-y-auto"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                    Explore por Tema
                  </div>
                  {ALL_CATEGORIES.map((cat: Category) => (
                    <button
                      key={cat.id}
                      onClick={() => handleNav('categoria', cat.slug)}
                      className="flex items-center justify-between p-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                          <IconHelper name={cat.icon} className="w-3.5 h-3.5" />
                        </span>
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full text-neutral-500 font-bold">
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleNav('quizzes')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentView === 'quizzes'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              Quizzes & Desafios
            </button>

            <button
              onClick={() => handleNav('artigos')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentView === 'artigos'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              Especiais
            </button>

            {/* AI Assistant Quick Nav (Exclusive for Administrator) */}
            {isAdmin && onOpenAiAssistant && (
              <button
                onClick={() => {
                  playPopSound();
                  onOpenAiAssistant();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all shadow-2xs group"
                title="Abrir Assistente Oráculo IA com Gemini 3.7 (Administrador)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse group-hover:rotate-12 transition-transform" />
                <span>Oráculo IA</span>
              </button>
            )}

            {/* Exclusive Admin Button (Visible only to authenticated Admin) */}
            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  currentView === 'admin'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
                title="Painel Exclusivo de Administração & IA"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Action Hub (Search, Surprise Me, User Gamification, Dark Mode) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Search Trigger Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-medium transition-colors border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
              title="Buscar curiosidades (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-neutral-400" />
              <span className="hidden xl:inline">Pesquisar...</span>
              <kbd className="hidden xl:inline-block text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Surprise Me / Random Fact Button */}
            <button
              onClick={handleRandomClick}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all shrink-0 active:scale-95"
              title="Descubra um fato aleatório surpreendente"
            >
              <Dice5 className="w-4 h-4 animate-spin-slow" />
              <span className="hidden sm:inline">Surpreenda-me!</span>
            </button>

            {/* User Gamification Badge (Level & Streak) */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 transition-colors cursor-pointer"
              title="Seu Perfil de Conhecimento e Favoritos"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold text-[11px] flex items-center justify-center">
                {userStats.level}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200 leading-tight">
                  {userStats.currentXp} XP
                </span>
                <span className="text-[9px] text-neutral-400 leading-tight">
                  Nv. {userStats.level}
                </span>
              </div>
              <div className="flex items-center text-amber-500 gap-0.5 ml-0.5">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span className="text-[10px] font-extrabold">{userStats.streakDays}</span>
              </div>
            </button>

            {/* Notification Center Trigger Button */}
            {onOpenNotifications && (
              <button
                onClick={() => {
                  playPopSound();
                  onOpenNotifications();
                }}
                className="relative p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Notificações e Atualizações de Conteúdo"
                aria-label="Ver notificações"
              >
                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs border border-white dark:border-neutral-950 animate-pulse">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Publicar Curiosidade (Visible Exclusively to Admin) */}
            {isAdmin && (
              <button
                onClick={onOpenSubmit}
                className="hidden md:flex p-2 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
                title="Publicar Nova Curiosidade (Admin)"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            )}

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              aria-label="Alternar tema escuro/claro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNav('home')}
              className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold text-neutral-900 dark:text-white text-left cursor-pointer"
            >
              Início
            </button>
            <button
              onClick={() => handleNav('quizzes')}
              className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold text-neutral-900 dark:text-white text-left flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Quizzes
            </button>
            <button
              onClick={() => handleNav('artigos')}
              className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold text-neutral-900 dark:text-white text-left flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Especiais
            </button>
            {onOpenNotifications && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  playPopSound();
                  onOpenNotifications();
                }}
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs font-semibold text-neutral-900 dark:text-white text-left flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-500" /> Notificações
                </div>
                {unreadNotificationsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold text-[9px]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}
            {isAdmin && onOpenAiAssistant && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  playPopSound();
                  onOpenAiAssistant();
                }}
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-400 text-left flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Oráculo IA
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-400 text-left flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Painel Admin
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Categorias Populares
            </p>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleNav('categoria', cat.slug)}
                  className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 text-xs font-medium text-neutral-700 dark:text-neutral-300 text-left truncate flex items-center gap-1.5"
                >
                  <IconHelper name={cat.icon} className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSubmit();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-amber-500" /> Publicar Nova Curiosidade
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
