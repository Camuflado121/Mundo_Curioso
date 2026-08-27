import React from 'react';
import { Bell, X, ArrowRight, Sparkles, HelpCircle, BookOpen } from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
  onNavigate: (notification: AppNotification) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onNavigate
}) => {
  if (!notification) return null;

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case 'article':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'daily':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div
      id="notification-toast-banner"
      role="alert"
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-[92%] bg-white dark:bg-neutral-900 border border-amber-500/40 dark:border-amber-500/30 rounded-2xl p-3.5 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail or Type Icon */}
        {notification.imageUrl ? (
          <img
            src={notification.imageUrl}
            alt="Preview"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-800"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
            {getTypeIcon()}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
              {notification.categoryName || 'Nova Atualização'}
            </span>
            <span className="text-[10px] text-neutral-400">Agora mesmo</span>
          </div>

          <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight line-clamp-1">
            {notification.title}
          </h4>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-snug line-clamp-2 mt-0.5">
            {notification.message}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => {
                onNavigate(notification);
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span>Ver Conteúdo</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              className="text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium px-2 py-1 cursor-pointer"
            >
              Dispensar
            </button>
          </div>
        </div>

        {/* Close icon */}
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
