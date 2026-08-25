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

import { playPopSound, playLevelUpFanfare } from './utils/audio';

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
  const [shareCuriosity, setShareCuriosity] = useState<Curiosity | null>(null);

  // Dark/Light Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mundo_curioso_theme') === 'dark';
  });

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
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onTriggerRandom={handleTriggerRandom}
        userStats={stats}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
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
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onBack={navigateToHome}
            onRefreshCuriosities={fetchCuriosities}
          />
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
        onNavigateHome={navigateToHome}
        onNavigateCategory={handleSelectCategory}
        onNavigateQuizzes={() => setCurrentView('quiz-hub')}
        onNavigateArticles={() => setCurrentView('articles-list')}
        onNavigateAdmin={() => setCurrentView('admin')}
        onNavigateAbout={() => setCurrentView('about')}
        onNavigateContact={() => setCurrentView('contact')}
        onNavigatePrivacy={() => setCurrentView('privacy')}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />

      {/* Global Modals */}
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
