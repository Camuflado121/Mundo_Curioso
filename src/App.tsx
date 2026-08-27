import React, { useState, useEffect } from 'react';
import { Curiosity, Quiz, SpecialArticle, Category, AppNotification } from './types';
import {
  ALL_CURIOSITIES,
  getRandomCuriosity,
  getDailyCuriosity,
  ALL_CATEGORIES,
  ALL_QUIZZES,
  ALL_ARTICLES
} from './data/allCuriosities';
import { useUserStats } from './hooks/useUserStats';
import { useNotifications } from './hooks/useNotifications';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { SubmitCuriosityModal } from './components/common/SubmitCuriosityModal';
import { ProfileModal } from './components/common/ProfileModal';
import { ShareModal } from './components/common/ShareModal';
import { NotificationsModal } from './components/common/NotificationsModal';
import { NotificationToast } from './components/common/NotificationToast';

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
  const [isReaderMode, setIsReaderMode] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [shareCuriosity, setShareCuriosity] = useState<Curiosity | null>(null);

  // Notification system hook
  const {
    notifications,
    unreadCount,
    preferences: notificationPreferences,
    browserPermission,
    toastNotification,
    addNotification,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications,
    updatePreferences: updateNotificationPreferences,
    requestBrowserPermission,
    sendTestNotification,
    dismissToast
  } = useNotifications();

  // Dark/Light Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mundo_curioso_theme') === 'dark';
  });

  // Admin Authentication hook & modal state
  const { isAdmin, adminUser, token, login, logout } = useAdminAuth();
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // User Stats / Gamification hook
  const { stats, addXp, toggleFavorite, isFavorite, recordQuizCompleted } = useUserStats();

  // Curiosities synchronization state
  const [isSyncingCuriosities, setIsSyncingCuriosities] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    status: 'idle' | 'syncing' | 'success' | 'fallback' | 'error';
    lastSyncTime?: Date;
    itemCount: number;
    errorDetails?: string;
  }>({
    status: 'idle',
    itemCount: ALL_CURIOSITIES.length
  });

  /**
   * Fetch updated curiosities from backend API with automatic retry,
   * timeout cancellation, diagnostic logging, and safe fallback.
   */
  const fetchCuriosities = async (maxRetries = 3, retryDelayMs = 800): Promise<Curiosity[]> => {
    setIsSyncingCuriosities(true);
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }));

    const startTime = performance.now();
    const endpoint = '/api/curiosidades?limit=100';

    console.groupCollapsed(
      `%c[Mundo Curioso API] 📡 Sincronizando curiosidades com o servidor (${new Date().toLocaleTimeString('pt-BR')})`,
      'color: #d97706; font-weight: bold;'
    );
    console.info(`[API Diagnostics] Endpoint alvo: ${endpoint}`);
    console.info(`[API Diagnostics] Tentativas configuradas: ${maxRetries}`);
    console.info(`[API Diagnostics] Itens em cache local: ${curiosities.length}`);

    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const attemptStart = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout safeguard

      try {
        console.log(`[API Diagnostics] Iniciando tentativa ${attempt}/${maxRetries}...`);

        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        clearTimeout(timeoutId);
        const attemptLatency = Math.round(performance.now() - attemptStart);

        if (!res.ok) {
          throw new Error(
            `Servidor respondeu com status HTTP ${res.status} (${res.statusText || 'Erro Desconhecido'})`
          );
        }

        const rawData = await res.json();
        const items = Array.isArray(rawData)
          ? rawData
          : (rawData && Array.isArray(rawData.curiosidades) ? rawData.curiosidades : null);

        if (!items || items.length === 0) {
          throw new Error('Servidor retornou uma lista vazia ou formato de dados inválido.');
        }

        const totalLatency = Math.round(performance.now() - startTime);
        console.info(
          `%c[API Diagnostics] ✅ Sincronização concluída com sucesso na tentativa ${attempt}!`,
          'color: #059669; font-weight: bold;',
          {
            itensRecebidos: items.length,
            latenciaTentativa: `${attemptLatency}ms`,
            tempoTotal: `${totalLatency}ms`,
            status: res.status
          }
        );
        console.groupEnd();

        setCuriosities(items);
        setIsSyncingCuriosities(false);
        setSyncStatus({
          status: 'success',
          lastSyncTime: new Date(),
          itemCount: items.length
        });
        return items;
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
        const attemptLatency = Math.round(performance.now() - attemptStart);

        const isAbort = err.name === 'AbortError';
        const errorMsg = isAbort
          ? 'Tempo limite de conexão excedido (Timeout de 7s).'
          : (err.message || 'Falha de rede ou conexão recusada.');

        console.warn(
          `%c[API Diagnostics] ⚠️ Falha na tentativa ${attempt}/${maxRetries} (${attemptLatency}ms): ${errorMsg}`,
          'color: #dc2626; font-weight: bold;',
          err
        );

        if (attempt < maxRetries) {
          const delay = retryDelayMs * Math.pow(1.5, attempt - 1);
          console.info(`[API Diagnostics] Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all attempts failed, log diagnostic summary and engage verified local fallback
    const totalDuration = Math.round(performance.now() - startTime);
    const failureReason = lastError instanceof Error ? lastError.message : String(lastError);

    console.error(
      `%c[API Diagnostics] ❌ Não foi possível sincronizar com o servidor após ${maxRetries} tentativas (${totalDuration}ms).`,
      'color: #dc2626; font-weight: bold;',
      {
        motivoFalha: failureReason,
        resolucao: 'Fallback local engajado com 100% de disponibilidade dos dados verificados.',
        totalItensLocais: ALL_CURIOSITIES.length
      }
    );
    console.groupEnd();

    // Safe fallback to locally verified dataset
    setCuriosities(prev => (prev && prev.length > 0 ? prev : ALL_CURIOSITIES));
    setIsSyncingCuriosities(false);
    setSyncStatus({
      status: 'fallback',
      lastSyncTime: new Date(),
      itemCount: ALL_CURIOSITIES.length,
      errorDetails: failureReason
    });

    return ALL_CURIOSITIES;
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
    setIsReaderMode(false);
    setCurrentView('home');
    setSelectedCuriosity(null);
    setSelectedQuiz(null);
    setSelectedArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCuriosity = (item: Curiosity) => {
    setIsReaderMode(false);
    playPopSound();
    setSelectedCuriosity(item);
    setCurrentView('curiosity-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Add XP for reading
    addXp(15, 'Leu um fato: ' + item.title.slice(0, 30));
  };

  const handleSelectCategory = (categorySlug: string) => {
    setIsReaderMode(false);
    playPopSound();
    setSelectedCategorySlug(categorySlug);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuiz = (quiz: Quiz) => {
    setIsReaderMode(false);
    playPopSound();
    setSelectedQuiz(quiz);
    setCurrentView('quiz-play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (article: SpecialArticle) => {
    setIsReaderMode(false);
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

  const handleNavigateToNotificationContent = (notif: AppNotification) => {
    setIsReaderMode(false);
    playPopSound();

    if (notif.targetType === 'quiz' || notif.type === 'quiz') {
      if (notif.targetSlug) {
        const foundQuiz = ALL_QUIZZES.find(q => q.slug === notif.targetSlug || q.id === notif.targetSlug);
        if (foundQuiz) {
          handleSelectQuiz(foundQuiz);
          return;
        }
      }
      setCurrentView('quiz-hub');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (notif.targetType === 'article' || notif.type === 'article') {
      if (notif.targetSlug) {
        const foundArticle = ALL_ARTICLES.find(a => a.slug === notif.targetSlug || a.id === notif.targetSlug);
        if (foundArticle) {
          handleSelectArticle(foundArticle);
          return;
        }
      }
      setCurrentView('articles-list');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (notif.targetType === 'category') {
      if (notif.targetSlug) {
        handleSelectCategory(notif.targetSlug);
        return;
      }
    }

    // Default: Curiosity
    if (notif.targetSlug) {
      const foundCuriosity = curiosities.find(c => c.slug === notif.targetSlug || c.id === notif.targetSlug);
      if (foundCuriosity) {
        handleSelectCuriosity(foundCuriosity);
        return;
      }
    }

    // Fallback based on type
    if (notif.type === 'daily') {
      handleSelectCuriosity(dailyCuriosity);
    } else {
      navigateToHome();
    }
  };

  const dailyCuriosity = getDailyCuriosity();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Header - Hidden in distraction-free Reader Mode */}
      {!isReaderMode && (
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
          onOpenSubmit={() => {
            if (isAdmin) {
              setCurrentView('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setIsAdminLoginOpen(true);
            }
          }}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenAiAssistant={() => {
            if (isAdmin) {
              setIsAiAssistantOpen(true);
            }
          }}
          onTriggerRandom={handleTriggerRandom}
          userStats={stats}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          isAdmin={isAdmin}
          unreadNotificationsCount={unreadCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />
      )}

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

            {/* Automatic Verified Fact Generator with Gemini AI (Exclusive for Admin) */}
            {isAdmin && (
              <AiFactGeneratorSection
                onSelectCuriosity={handleSelectCuriosity}
                onOpenShare={item => setShareCuriosity(item)}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                onAddXp={addXp}
                token={token}
              />
            )}

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
            isReaderMode={isReaderMode}
            onToggleReaderMode={() => setIsReaderMode(prev => !prev)}
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
            isReaderMode={isReaderMode}
            onToggleReaderMode={() => setIsReaderMode(prev => !prev)}
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
              onNotifyContentAdded={addNotification}
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
            onOpenSubmit={() => {
              if (isAdmin) {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setIsAdminLoginOpen(true);
              }
            }}
            isAdmin={isAdmin}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage
            onBack={navigateToHome}
            onOpenSubmit={() => {
              if (isAdmin) {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setIsAdminLoginOpen(true);
              }
            }}
            isAdmin={isAdmin}
          />
        )}

        {currentView === 'privacy' && (
          <PrivacyPage
            onBack={navigateToHome}
            onOpenSubmit={() => {
              if (isAdmin) {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setIsAdminLoginOpen(true);
              }
            }}
            isAdmin={isAdmin}
          />
        )}

        {currentView === 'not-found' && (
          <NotFoundPage
            onGoHome={navigateToHome}
            onTriggerRandom={handleTriggerRandom}
          />
        )}
      </main>

      {/* Global Footer - Hidden in distraction-free Reader Mode */}
      {!isReaderMode && (
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
          onOpenSubmit={() => {
            if (isAdmin) {
              setCurrentView('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setIsAdminLoginOpen(true);
            }
          }}
          isAdmin={isAdmin}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        />
      )}

      {/* Floating AI Curiosity Assistant Trigger Button (Admin Only, hidden in Reader Mode) */}
      {isAdmin && !isReaderMode && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          <button
            id="floating-ai-assistant-btn"
            onClick={() => {
              playPopSound();
              setIsAiAssistantOpen(true);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-amber-300/40 cursor-pointer"
            title="Abrir Assistente de Curiosidades Gemini IA (Admin)"
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
      )}

      {/* Global Modals */}
      {isAdmin && (
        <AiAssistantModal
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          onAddXp={addXp}
          token={token}
        />
      )}

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

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        preferences={notificationPreferences}
        browserPermission={browserPermission}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onRemoveNotification={removeNotification}
        onClearAll={clearAllNotifications}
        onUpdatePreferences={updateNotificationPreferences}
        onRequestBrowserPermission={requestBrowserPermission}
        onSendTestNotification={sendTestNotification}
        onNavigateToContent={handleNavigateToNotificationContent}
      />

      {/* Floating In-App Real-time Notification Banner */}
      <NotificationToast
        notification={toastNotification}
        onClose={dismissToast}
        onNavigate={handleNavigateToNotificationContent}
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

