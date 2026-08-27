import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Sparkles,
  HelpCircle,
  BookOpen,
  Volume2,
  VolumeX,
  ExternalLink,
  SlidersHorizontal,
  Check,
  ShieldCheck,
  Smartphone,
  Send,
  Flame
} from 'lucide-react';
import { AppNotification, NotificationPreferences } from '../../types';
import { playPopSound } from '../../utils/audio';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  browserPermission: NotificationPermission;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemoveNotification: (id: string) => void;
  onClearAll: () => void;
  onUpdatePreferences: (newPrefs: Partial<NotificationPreferences>) => void;
  onRequestBrowserPermission: () => Promise<NotificationPermission>;
  onSendTestNotification: () => void;
  onNavigateToContent: (notification: AppNotification) => void;
}

type FilterTab = 'all' | 'unread' | 'curiosity' | 'quiz_article';

function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `Há ${diffMinutes} min`;
    if (diffHours < 24) return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return 'Recente';
  }
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  preferences,
  browserPermission,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
  onClearAll,
  onUpdatePreferences,
  onRequestBrowserPermission,
  onSendTestNotification,
  onNavigateToContent
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'curiosity') return n.type === 'curiosity' || n.type === 'daily';
    if (filter === 'quiz_article') return n.type === 'quiz' || n.type === 'article';
    return true;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    playPopSound();
    if (!notif.isRead) {
      onMarkAsRead(notif.id);
    }
    onNavigateToContent(notif);
    onClose();
  };

  const handleRequestPush = async () => {
    setIsRequestingPermission(true);
    playPopSound();
    await onRequestBrowserPermission();
    setIsRequestingPermission(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case 'article':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'daily':
        return <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />;
      case 'system':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div
      id="notifications-center-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif text-neutral-900 dark:text-white">
                  Atualizações & Notificações
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Fique por dentro de cada nova curiosidade, quiz e artigo publicado
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Fechar Notificações"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Lista vs Configurações) */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notificações ({notifications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Configurações & Push</span>
            </button>
          </div>

          {activeTab === 'list' && notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    playPopSound();
                    onMarkAllAsRead();
                  }}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Marcar todas como lidas</span>
                </button>
              )}
              <button
                onClick={() => {
                  playPopSound();
                  onClearAll();
                }}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Limpar todas as notificações"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Notifications List */}
        {activeTab === 'list' && (
          <>
            {/* Filter Pills */}
            <div className="px-5 sm:px-6 py-2.5 bg-neutral-50/50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                Todas ({notifications.length})
              </button>

              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                Não lidas ({unreadCount})
              </button>

              <button
                onClick={() => setFilter('curiosity')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  filter === 'curiosity'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                Curiosidades
              </button>

              <button
                onClick={() => setFilter('quiz_article')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  filter === 'quiz_article'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                Quizzes & Dossiês
              </button>
            </div>

            {/* List Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-neutral-100 dark:divide-neutral-800/80 space-y-1">
              {filteredNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    Nenhuma notificação no momento
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                    {filter === 'unread'
                      ? 'Você leu todas as notificações recentes!'
                      : 'Assim que novos conteúdos, fatos do dia ou quizzes forem postados, você verá aqui.'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer flex items-start gap-3.5 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 ${
                      !notif.isRead
                        ? 'bg-amber-50/40 dark:bg-amber-950/15 border-l-3 border-amber-500'
                        : 'bg-transparent'
                    }`}
                  >
                    {/* Thumbnail or Icon */}
                    {notif.imageUrl ? (
                      <img
                        src={notif.imageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-800 mt-0.5"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800 mt-0.5">
                        {getTypeIcon(notif.type)}
                      </div>
                    )}

                    {/* Notification info */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/40 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-800/40">
                          {notif.categoryName || 'Atualização'}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Não lida" />
                        )}
                      </div>

                      <h4
                        className={`text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-snug line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors`}
                      >
                        {notif.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                    </div>

                    {/* Delete action button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        playPopSound();
                        onRemoveNotification(notif.id);
                      }}
                      className="absolute top-3 right-3 p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir notificação"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Tab 2: Settings & Push Notifications */}
        {activeTab === 'settings' && (
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 animate-in fade-in duration-150">
            {/* Browser Push Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-600/10 border border-amber-500/30 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Notificações Push no Navegador
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300">
                      Receba avisos instantâneos na sua área de trabalho mesmo se a aba estiver em segundo plano.
                    </p>
                  </div>
                </div>

                {/* Status indicator badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                    browserPermission === 'granted'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : browserPermission === 'denied'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-700'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  }`}
                >
                  {browserPermission === 'granted'
                    ? '✓ Ativo'
                    : browserPermission === 'denied'
                    ? 'Bloqueado'
                    : 'Pendente'}
                </span>
              </div>

              {browserPermission !== 'granted' ? (
                <button
                  onClick={handleRequestPush}
                  disabled={isRequestingPermission}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>{isRequestingPermission ? 'Solicitando...' : 'Ativar Alertas no Navegador'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Permissão concedida! Você receberá alertas dos novos conteúdos.</span>
                </div>
              )}
            </div>

            {/* Notification sound toggle */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                Preferências de Áudio & Alertas
              </h4>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200">
                    {preferences.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      Efeitos Sonoros de Notificação
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Tocar um suave toque harmônico ao receber novos conteúdos
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.soundEnabled}
                    onChange={e => {
                      playPopSound();
                      onUpdatePreferences({ soundEnabled: e.target.checked });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-neutral-300 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                </label>
              </div>
            </div>

            {/* Category Preferences */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">
                Categorias de Conteúdo Notificadas
              </h4>

              {/* Novas Curiosidades */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    Novas Curiosidades e Fatos Científicos
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifyNewCuriosities}
                  onChange={e => onUpdatePreferences({ notifyNewCuriosities: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Fato Diário */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    Fato do Dia em Destaque
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifyDailyFact}
                  onChange={e => onUpdatePreferences({ notifyDailyFact: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Novos Quizzes */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    Novos Quizzes & Desafios de Conhecimento
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifyNewQuizzes}
                  onChange={e => onUpdatePreferences({ notifyNewQuizzes: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Artigos Especiais */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    Dossiês & Artigos Especiais
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.notifySpecialArticles}
                  onChange={e => onUpdatePreferences({ notifySpecialArticles: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Test Notification Action */}
            <div className="pt-2">
              <button
                onClick={onSendTestNotification}
                className="w-full py-3 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
              >
                <Send className="w-3.5 h-3.5 text-amber-500" />
                <span>Testar Notificação Agora</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="px-5 sm:px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Mundo Curioso Alertas v1.0</span>
          <button
            onClick={onClose}
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
