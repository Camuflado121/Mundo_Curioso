import React, { useState, useEffect } from 'react';
import { Curiosity, Quiz, SpecialArticle, Category } from './types';
import {
  ALL_CURIOSITIES,
  getRandomCuriosity,
  getDailyCuriosity,
  ALL_CATEGORIES,
  ALL_QUIZZES,
  ALL_ARTICLES
} from './data/allCuriosities';
import { useUserStats } from './hooks/useUserStats';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { SubmitCuriosityModal } from './components/common/SubmitCuriosityModal';
import { ProfileModal } from './components/common/ProfileModal';
import { ShareModal } from './components/common/ShareModal';

import { HeroSection } from './components/home/HeroSection';
import { DailyCuriositySection } from './components/home/DailyCuriositySection';
import { AiFactGeneratorSection } from './components/home/AiFactGeneratorSection';
import { DiscoveryRoute } from './components/home/DiscoveryRoute';
import { CategoriesGrid } from './components/home/CategoriesGrid';
import { FeaturedGrid } from './components/home/FeaturedGrid';
import { QuizPromoSection } from './components/home/QuizPromoSection';
import { SpecialArticlesSection } from './components/home/SpecialArticlesSection';

import { CuriosityDetailView } from './components/curiosity/CuriosityDetailView';
import { CategoryPageView } from './components/category/CategoryPageView';
import { QuizHubView } from './components/quiz/QuizHubView';
import { QuizPlayView } from './components/quiz/QuizPlayView';
import { ArticlesListView } from './components/articles/ArticlesListView';
import { ArticleDetailView } from './components/articles/ArticleDetailView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AboutPage, ContactPage, PrivacyPage } from './components/pages/StaticPages';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { AiAssistantModal } from './components/common/AiAssistantModal';

import { playPopSound, playLevelUpFanfare } from './utils/audio';
import { useAdminAuth } from './hooks/useAdminAuth';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { ShieldAlert, Lock, ArrowLeft, Sparkles, MessageSquare } from 'lucide-react';

type ViewMode =
  | 'home'
  | 'curiosity-detail'
  | 'category'
  | 'quiz-hub'
  | 'quiz-play'
  | 'articles-list'
  | 'article-detail'
  | 'admin'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'not-found';

export default function App() {
  const [curiosities, setCuriosities] = useState<Curiosity[]>(ALL_CURIOSITIES);
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedCuriosity, setSelectedCuriosity] = useState<Curiosity | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('ciencia');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<SpecialArticle | null>(null);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [shareCuriosity, setShareCuriosity] = useState<Curiosity | null>(null);

  // Dark/Light Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mundo_curioso_theme') === 'dark';
  });

  // Admin Authentication hook & modal state
  const { isAdmin, adminUser, token, login, logout } = useAdminAuth();
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // User Stats / Gamification hook
  const { stats, addXp, toggleFavorite, isFavorite, recordQuizCompleted } = useUserStats();

  // Fetch updated curiosities from backend API on mount
  const fetchCuriosities = async () => {
    try {
      const res = await fetch('/api/curiosidades?limit=100');
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.curiosidades;
        if (Array.isArray(items) && items.length > 0) {
          setCuriosities(items);
        }
      }
    } catch {
      // Fallback in-memory
    }
  };

  useEffect(() => {
    fetchCuriosities();
  }, []);

  // Sync dark theme class to html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mundo_curioso_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mundo_curioso_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    playPopSound();
  };

  // Navigation handlers
  const navigateToHome = () => {
    setCurrentView('home');
    setSelectedCuriosity(null);
    setSelectedQuiz(null);
    setSelectedArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCuriosity = (item: Curiosity) => {
    playPopSound();
    setSelectedCuriosity(item);
    setCurrentView('curiosity-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Add XP for reading
    addXp(15, 'Leu um fato: ' + item.title.slice(0, 30));
  };

  const handleSelectCategory = (categorySlug: string) => {
    playPopSound();
    setSelectedCategorySlug(categorySlug);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuiz = (quiz: Quiz) => {
    playPopSound();
    setSelectedQuiz(quiz);
    setCurrentView('quiz-play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (article: SpecialArticle) => {
    playPopSound();
    setSelectedArticle(article);
    setCurrentView('article-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addXp(25, 'Leu um dossiê especial');
  };

  const handleTriggerRandom = () => {
    playPopSound();
    const random = getRandomCuriosity(selectedCuriosity?.id);
    handleSelectCuriosity(random);
  };

  const dailyCuriosity = getDailyCuriosity();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigateHome={navigateToHome}
        onNavigateCategories={() => {
          handleSelectCategory('ciencia');
        }}
        onNavigateCategory={handleSelectCategory}
        onNavigateQuizzes={() => {
          setCurrentView('quiz-hub');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateArticles={() => {
          setCurrentView('articles-list');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateAdmin={() => {
          if (isAdmin) {
            setCurrentView('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onTriggerRandom={handleTriggerRandom}
        userStats={stats}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        isAdmin={isAdmin}
      />

      {/* Main Dynamic View Outlet */}
      <main className="grow">
        {currentView === 'home' && (
          <div className="space-y-4">
            {/* Hero Section with Quick Categories and Interactive Quick-Facts */}
            <HeroSection
              onTriggerRandom={handleTriggerRandom}
              onOpenSearch={() => setIsSearchOpen(true)}
              onSelectCuriosity={handleSelectCuriosity}
              featuredCuriosity={curiosities[0] || ALL_CURIOSITIES[0]}
            />

            {/* Daily Verified Curiosity Card */}
            <DailyCuriositySection
              dailyCuriosity={dailyCuriosity}
              onSelectCuriosity={handleSelectCuriosity}
              onOpenShare={item => setShareCuriosity(item)}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />

            {/* Automatic Verified Fact Generator with Gemini AI */}
            <AiFactGeneratorSection
              onSelectCuriosity={handleSelectCuriosity}
              onOpenShare={item => setShareCuriosity(item)}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              onAddXp={addXp}
            />

            {/* Discovery Route: Interconnected Fact Trails */}
            <DiscoveryRoute onSelectCuriosity={handleSelectCuriosity} />

            {/* 14 Categories Interactive Bento Grid */}
            <CategoriesGrid onSelectCategory={handleSelectCategory} />

            {/* Main Featured & Filtered Curiosities Grid */}
            <FeaturedGrid
              curiosities={curiosities}
              onSelectCuriosity={handleSelectCuriosity}
              onOpenShare={item => setShareCuriosity(item)}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />

            {/* Gamified Quizzes Invitation Section */}
            <QuizPromoSection
              onSelectQuiz={handleSelectQuiz}
              onNavigateQuizzes={() => {
                setCurrentView('quiz-hub');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Special Investigative Editorial Articles */}
            <SpecialArticlesSection
              onSelectArticle={handleSelectArticle}
              onNavigateArticles={() => {
                setCurrentView('articles-list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {currentView === 'curiosity-detail' && selectedCuriosity && (
          <CuriosityDetailView
            curiosity={selectedCuriosity}
            onBack={navigateToHome}
            onSelectCuriosity={handleSelectCuriosity}
            onOpenShare={item => setShareCuriosity(item)}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            onTriggerRandom={handleTriggerRandom}
            isAdmin={isAdmin}
            token={token}
            adminName={adminUser?.name}
          />
        )}

        {currentView === 'category' && (
          <CategoryPageView
            categorySlug={selectedCategorySlug}
            curiosities={curiosities}
            onBack={navigateToHome}
            onSelectCuriosity={handleSelectCuriosity}
            onSelectQuiz={handleSelectQuiz}
            onOpenShare={item => setShareCuriosity(item)}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        )}

        {currentView === 'quiz-hub' && (
          <QuizHubView
            onBack={navigateToHome}
            onSelectQuiz={handleSelectQuiz}
          />
        )}

        {currentView === 'quiz-play' && selectedQuiz && (
          <QuizPlayView
            quiz={selectedQuiz}
            onBack={() => {
              setCurrentView('quiz-hub');
            }}
            onRecordCompleted={earnedXp => {
              recordQuizCompleted(earnedXp);
            }}
            onSelectAnotherQuiz={() => {
              setCurrentView('quiz-hub');
            }}
          />
        )}

        {currentView === 'articles-list' && (
          <ArticlesListView
            onBack={navigateToHome}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {currentView === 'article-detail' && selectedArticle && (
          <ArticleDetailView
            article={selectedArticle}
            onBack={() => setCurrentView('articles-list')}
            isAdmin={isAdmin}
            token={token}
            adminName={adminUser?.name}
          />
        )}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard
              onBack={navigateToHome}
              onRefreshCuriosities={fetchCuriosities}
              token={token}
              adminUser={adminUser}
              onLogout={() => {
                logout();
                navigateToHome();
              }}
            />
          ) : (
            <div className="py-24 max-w-md mx-auto px-4 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-serif text-neutral-900 dark:text-white mb-2">
                Acesso Restrito ao Administrador
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                Este painel de administração e moderação é de acesso exclusivo do administrador. Os visitantes possuem acesso apenas ao conteúdo público do portal.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={navigateToHome}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar ao Início
                </button>
                <button
                  onClick={() => setIsAdminLoginOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Fazer Login de Admin
                </button>
              </div>
            </div>
          )
        )}

        {currentView === 'about' && (
          <AboutPage
            onBack={navigateToHome}
            onOpenSubmit={() => setIsSubmitOpen(true)}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage
            onBack={navigateToHome}
            onOpenSubmit={() => setIsSubmitOpen(true)}
          />
        )}

        {currentView === 'privacy' && (
          <PrivacyPage
            onBack={navigateToHome}
            onOpenSubmit={() => setIsSubmitOpen(true)}
          />
        )}

        {currentView === 'not-found' && (
          <NotFoundPage
            onGoHome={navigateToHome}
            onTriggerRandom={handleTriggerRandom}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={(view: string, param?: string) => {
          if (view === 'home') navigateToHome();
          else if (view === 'categoria' && param) handleSelectCategory(param);
          else if (view === 'quizzes') {
            setCurrentView('quiz-hub');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (view === 'artigos') {
            setCurrentView('articles-list');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (view === 'admin') {
            if (isAdmin) {
              setCurrentView('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setIsAdminLoginOpen(true);
            }
          } else if (view === 'sobre') {
            setCurrentView('about');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (view === 'contato') {
            setCurrentView('contact');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (view === 'privacidade') {
            setCurrentView('privacy');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onTriggerRandom={handleTriggerRandom}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Floating AI Curiosity Assistant Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button
          id="floating-ai-assistant-btn"
          onClick={() => {
            playPopSound();
            setIsAiAssistantOpen(true);
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-amber-300/40"
          title="Abrir Assistente de Curiosidades Gemini IA"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
          </span>

          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span className="tracking-wide">Oráculo IA</span>
          <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded-full bg-black/20 font-mono font-normal">
            Gemini 3.7
          </span>
        </button>
      </div>

      {/* Global Modals */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onAddXp={addXp}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={login}
        onLoginSuccess={() => {
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        curiosities={curiosities}
        onSelectCuriosity={handleSelectCuriosity}
      />

      <SubmitCuriosityModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        stats={stats}
        allCuriosities={curiosities}
        onSelectCuriosity={handleSelectCuriosity}
        onToggleFavorite={toggleFavorite}
      />

      {shareCuriosity && (
        <ShareModal
          isOpen={!!shareCuriosity}
          onClose={() => setShareCuriosity(null)}
          curiosity={shareCuriosity}
        />
      )}
    </div>
  );
}
