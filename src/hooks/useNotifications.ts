import { useState, useEffect, useCallback } from 'react';
import { AppNotification, NotificationPreferences } from '../types';
import { playNotificationSound } from '../utils/audio';

const NOTIFICATIONS_STORAGE_KEY = 'mundo_curioso_notifications_v1';
const PREFERENCES_STORAGE_KEY = 'mundo_curioso_notif_prefs_v1';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  browserPushEnabled: false,
  soundEnabled: true,
  notifyNewCuriosities: true,
  notifyNewQuizzes: true,
  notifyDailyFact: true,
  notifySpecialArticles: true
};

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_seed_1',
    title: 'Novo Fato Científico Publicado!',
    message: 'Flamingos: Os pássaros que bebem água quase fervendo e filtram comida de cabeça para baixo.',
    type: 'curiosity',
    targetSlug: 'os-flamingos-bebem-agua-fervendo-e-comem-com-a-cabeca-para-baixo',
    targetType: 'curiosity',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 min ago
    isRead: false,
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
    categoryName: 'Animais & Natureza'
  },
  {
    id: 'notif_seed_2',
    title: 'Curiosidade do Dia em Destaque 🌟',
    message: 'A Batalha das Laranjas em Ivrea: A maior guerra gastronômica com 500 toneladas de frutas.',
    type: 'daily',
    targetSlug: 'a-batalha-das-laranjas-de-ivrea-na-italia',
    targetType: 'curiosity',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
    isRead: false,
    imageUrl: 'https://images.unsplash.com/photo-1547517023-7ca0c162fbd1?auto=format&fit=crop&w=400&q=80',
    categoryName: 'Idiomas & Cultura'
  },
  {
    id: 'notif_seed_3',
    title: 'Dossiê Especial Disponível 📚',
    message: 'O Império de Gaza e Ngungunhane: A Resistência Épica que Sacudiu Moçambique.',
    type: 'article',
    targetSlug: 'o-imperio-de-gaza-e-ngungunhane-a-resistencia-epica',
    targetType: 'article',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h ago
    isRead: false,
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=400&q=80',
    categoryName: 'História & Civilizações'
  },
  {
    id: 'notif_seed_4',
    title: 'Novo Desafio: Quiz do Universo 🚀',
    message: 'Teste seus conhecimentos sobre o Cosmos, Buracos Negros e Estrelas de Nêutrons.',
    type: 'quiz',
    targetSlug: 'quiz-astronomia-cosmos',
    targetType: 'quiz',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    categoryName: 'Astronomia'
  },
  {
    id: 'notif_seed_5',
    title: 'História da Medicina Revelada 🌿',
    message: 'A casca de salgueiro e a Aspirina: Como um papiro egípcio inspirou a farmacologia moderna.',
    type: 'curiosity',
    targetSlug: 'como-a-aspirina-surgiu-da-casca-do-salgueiro-ha-3500-anos',
    targetType: 'curiosity',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    isRead: true,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    categoryName: 'Corpo Humano & Saúde'
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window === 'undefined') return SEED_NOTIFICATIONS;
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to seed
    }
    return SEED_NOTIFICATIONS;
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    try {
      const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  });

  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [toastNotification, setToastNotification] = useState<AppNotification | null>(null);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Ignore
    }
  }, [notifications]);

  // Sync preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Ignore
    }
  }, [preferences]);

  // Check browser Notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  // Request native browser push notifications permission
  const requestBrowserPermission = async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);

      if (permission === 'granted') {
        setPreferences(prev => ({ ...prev, browserPushEnabled: true }));
        // Send a welcoming browser notification
        new Notification('Mundo Curioso', {
          body: 'Notificações ativadas com sucesso! Você receberá alertas quando novas curiosidades forem publicadas.',
          icon: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=128&q=80',
          badge: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=64&q=80'
        });
      } else {
        setPreferences(prev => ({ ...prev, browserPushEnabled: false }));
      }
      return permission;
    } catch {
      return 'denied';
    }
  };

  // Add a new notification
  const addNotification = useCallback((
    notifData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>,
    options?: { showToast?: boolean; triggerBrowser?: boolean }
  ) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]); // Keep last 50

    // Play chime sound if enabled
    if (preferences.soundEnabled) {
      playNotificationSound();
    }

    // Show in-app Toast alert
    if (options?.showToast !== false) {
      setToastNotification(newNotif);
      setTimeout(() => {
        setToastNotification(current => (current?.id === newNotif.id ? null : current));
      }, 5500);
    }

    // Native browser notification if enabled & permission granted
    if (
      options?.triggerBrowser !== false &&
      preferences.browserPushEnabled &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        const nativeNotif = new Notification(newNotif.title, {
          body: newNotif.message,
          icon: newNotif.imageUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=128&q=80'
        });
        nativeNotif.onclick = () => {
          window.focus();
          nativeNotif.close();
        };
      } catch {
        // Ignore native error
      }
    }

    return newNotif;
  }, [preferences]);

  // Mark single as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // Remove single notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Toggle preference setting
  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  }, []);

  // Send a test notification for user preview
  const sendTestNotification = useCallback(() => {
    addNotification({
      title: '🔔 Teste de Notificação: Mundo Curioso',
      message: 'Seu sistema de notificações está 100% ativo e funcionando perfeitamente!',
      type: 'system',
      categoryName: 'Sistema',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80'
    }, { showToast: true, triggerBrowser: true });
  }, [addNotification]);

  // Dismiss current toast
  const dismissToast = useCallback(() => {
    setToastNotification(null);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    preferences,
    browserPermission,
    toastNotification,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    updatePreferences,
    requestBrowserPermission,
    sendTestNotification,
    dismissToast
  };
}
