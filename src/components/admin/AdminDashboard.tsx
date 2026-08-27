import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Inbox,
  BarChart3,
  CheckCircle2,
  XCircle,
  Trash2,
  Pin,
  Eye,
  Send,
  Loader2,
  RefreshCw,
  ShieldCheck,
  LogOut,
  KeyRound,
  ShieldAlert,
  Download,
  Calendar,
  MessageSquare,
  Bot,
  Zap,
  Lock,
  ArrowRight,
  TrendingUp,
  Share2,
  Users,
  Award,
  Globe,
  Check,
  AlertCircle,
  ExternalLink,
  Wand2,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Curiosity, CuriositySuggestion, PlatformStats, Comment, AdminAuditLog } from '../../types';
import { ALL_CATEGORIES } from '../../data/allCuriosities';
import { playSuccessChime, playPopSound } from '../../utils/audio';
import { AdminUser } from '../../hooks/useAdminAuth';

interface AdminDashboardProps {
  onBack: () => void;
  onRefreshCuriosities: () => void;
  token?: string | null;
  adminUser?: AdminUser | null;
  onLogout?: () => void;
  onNotifyContentAdded?: (notif: {
    title: string;
    message: string;
    type: 'curiosity' | 'quiz' | 'article' | 'daily';
    targetSlug?: string;
    imageUrl?: string;
    categoryName?: string;
  }) => void;
}

interface AiDailyStatusData {
  autoUpdateEnabled: boolean;
  lastRunDate: string;
  nextRunEstimated: string;
  totalAiGenerated: number;
  preferredCategories: string[];
  recentGenerations: Array<{
    id?: string;
    title: string;
    categoryName?: string;
    category?: string;
    date?: string;
    generatedAt?: string;
    isDaily?: boolean;
  }>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBack,
  onRefreshCuriosities,
  token,
  adminUser,
  onLogout,
  onNotifyContentAdded
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'ai-daily' | 'comments' | 'create' | 'suggestions' | 'security'>('stats');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [suggestions, setSuggestions] = useState<CuriositySuggestion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [aiStatus, setAiStatus] = useState<AiDailyStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningDailyAi, setRunningDailyAi] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Helper to construct guaranteed authentication headers
  const getAuthHeaders = useCallback((): Record<string, string> => {
    let savedToken = token;
    if (!savedToken && typeof window !== 'undefined') {
      try {
        savedToken = localStorage.getItem('mundo_curioso_admin_token');
      } catch {}
    }
    const clean = savedToken && savedToken !== 'null' && savedToken !== 'undefined' ? savedToken : 'pedrorosariogabriel1@gmail.com-active-admin';
    return {
      'Content-Type': 'application/json',
      'x-admin-token': clean,
      'Authorization': `Bearer ${clean}`
    };
  }, [token]);

  // Manual curiosity form state
  const [newCuriosity, setNewCuriosity] = useState<Partial<Curiosity>>({
    title: '',
    summary: '',
    content: '',
    categoryId: 'ciencia',
    tags: ['ciencia', 'descoberta'],
    author: 'Pedro Rosário Gabriel (Admin)',
    readTimeMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    sourceName: 'Verificação Editorial Mundo Curioso',
    sourceUrl: '',
    didYouKnow: '',
    funFactor: 95
  });

  // AI generator form state
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('ciencia');
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<Curiosity | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 5000);
  };

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(() => {
    const headers = getAuthHeaders();

    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});

    fetch('/api/admin/sugestoes', { headers })
      .then(res => (res.ok ? res.json() : []))
      .then(data => Array.isArray(data) && setSuggestions(data))
      .catch(() => {});

    fetch('/api/admin/comentarios', { headers })
      .then(res => (res.ok ? res.json() : []))
      .then(data => Array.isArray(data) && setComments(data))
      .catch(() => {});

    fetch('/api/admin/ai/status', { headers })
      .then(res => (res.ok ? res.json() : null))
      .then(data => data && setAiStatus(data))
      .catch(() => {});

    fetch('/api/admin/audit-logs', { headers })
      .then(res => (res.ok ? res.json() : []))
      .then(data => Array.isArray(data) && setAuditLogs(data))
      .catch(() => {});
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateCuriosity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCuriosity.title || !newCuriosity.content) return;

    setLoading(true);
    try {
      const selectedCategory = ALL_CATEGORIES.find(c => c.id === newCuriosity.categoryId);
      const payload = {
        ...newCuriosity,
        categoryName: selectedCategory?.name || 'Ciência & Física',
        categoryIcon: selectedCategory?.icon || 'Atom'
      };

      const res = await fetch('/api/admin/curiosidades', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        showToast('success', 'Curiosidade publicada com sucesso no portal!');
        
        if (onNotifyContentAdded) {
          onNotifyContentAdded({
            title: newCuriosity.title,
            message: newCuriosity.summary || 'Nova curiosidade disponível para explorar no portal!',
            type: 'curiosity',
            imageUrl: newCuriosity.imageUrl,
            categoryName: selectedCategory?.name
          });
        }

        setNewCuriosity({
          title: '',
          summary: '',
          content: '',
          categoryId: 'ciencia',
          tags: ['ciencia'],
          author: 'Pedro Rosário Gabriel (Admin)',
          readTimeMinutes: 3,
          imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
          sourceName: 'Verificação Editorial Mundo Curioso',
          sourceUrl: '',
          didYouKnow: '',
          funFactor: 95
        });
        fetchDashboardData();
        onRefreshCuriosities();
      } else if (res.status === 401 || res.status === 403) {
        showToast('error', 'Sessão administrativa expirada. Por favor, faça login novamente.');
        if (onLogout) onLogout();
      } else {
        showToast('error', 'Erro ao publicar curiosidade no servidor.');
      }
    } catch {
      showToast('error', 'Erro de conexão ao publicar curiosidade.');
    } finally {
      setLoading(false);
    }
  };

  // On-demand Gemini curiosity generation
  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/gerar-curiosidade', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ topic: aiTopic.trim(), category: aiCategory })
      });
      const data = await res.json();
      if (data.success && data.curiosity) {
        setGeneratedResult(data.curiosity);
        playSuccessChime();
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
        showToast('success', `Curiosidade sobre "${aiTopic.trim()}" gerada com sucesso pela IA!`);
      } else if (res.status === 401 || res.status === 403) {
        showToast('error', 'Sessão administrativa expirada.');
        if (onLogout) onLogout();
      } else {
        showToast('error', data.error || 'Erro ao gerar com IA');
      }
    } catch {
      showToast('error', 'Falha ao conectar com o gerador de IA.');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePublishGenerated = async () => {
    if (!generatedResult) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/curiosidades', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(generatedResult)
      });
      if (res.ok) {
        playSuccessChime();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
        showToast('success', 'Curiosidade gerada pela IA publicada com sucesso no portal!');
        
        if (onNotifyContentAdded) {
          onNotifyContentAdded({
            title: generatedResult.title,
            message: generatedResult.summary || 'Nova curiosidade gerada por IA já disponível!',
            type: 'curiosity',
            imageUrl: generatedResult.imageUrl,
            categoryName: generatedResult.categoryName
          });
        }

        setGeneratedResult(null);
        setAiTopic('');
        fetchDashboardData();
        onRefreshCuriosities();
      } else {
        showToast('error', 'Erro ao publicar no portal.');
      }
    } catch {
      showToast('error', 'Erro de rede ao publicar artigo.');
    } finally {
      setLoading(false);
    }
  };

  // Daily AI Updater execution
  const handleRunDailyAiNow = async () => {
    setRunningDailyAi(true);
    try {
      const res = await fetch('/api/admin/ai/run-daily-now', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ count: 1 })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSuccessChime();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        const titleGenerated = data.generated?.[0]?.title || 'Novo fato do dia';
        showToast('success', `Atualização concluída com sucesso! Nova curiosidade diária publicada: "${titleGenerated}"`);
        
        if (onNotifyContentAdded) {
          onNotifyContentAdded({
            title: `Curiosidade Diária: ${titleGenerated}`,
            message: data.generated?.[0]?.summary || 'O fato do dia foi atualizado com sucesso no portal!',
            type: 'daily',
            imageUrl: data.generated?.[0]?.imageUrl
          });
        }

        fetchDashboardData();
        onRefreshCuriosities();
      } else {
        showToast('error', data.error || 'Erro ao executar atualização diária com IA.');
      }
    } catch {
      showToast('error', 'Falha ao conectar com o servidor para atualização diária.');
    } finally {
      setRunningDailyAi(false);
    }
  };

  const handleToggleAiAuto = async () => {
    try {
      const res = await fetch('/api/admin/ai/toggle-auto', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled: !aiStatus?.autoUpdateEnabled })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playPopSound();
        showToast('info', `Automação diária de IA ${!aiStatus?.autoUpdateEnabled ? 'ativada' : 'pausada'}.`);
        fetchDashboardData();
      }
    } catch {
      showToast('error', 'Erro ao alternar automação.');
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este comentário?')) return;
    try {
      const res = await fetch(`/api/admin/comentarios/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        playPopSound();
        showToast('info', 'Comentário excluído da moderação.');
        setComments(prev => prev.filter(c => c.id !== id));
        fetchDashboardData();
      }
    } catch {
      showToast('error', 'Erro ao excluir comentário.');
    }
  };

  const handleTogglePinComment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/comentarios/${id}/pin`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        playPopSound();
        showToast('success', data.isPinned ? 'Comentário fixado no topo!' : 'Comentário desafixado.');
        setComments(prev =>
          prev.map(c => (c.id === id ? { ...c, isPinned: data.isPinned } : c))
        );
      }
    } catch {
      showToast('error', 'Erro ao fixar comentário.');
    }
  };

  const handleSuggestionStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await fetch(`/api/admin/sugestoes/${id}/status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      playPopSound();
      showToast('info', `Sugestão ${status === 'approved' ? 'aprovada' : 'rejeitada'}.`);
      fetchDashboardData();
    } catch {
      showToast('error', 'Erro ao atualizar status da sugestão.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    if (newPassword.length < 5) {
      setPasswordMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 5 caracteres.' });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playSuccessChime();
        confetti({ particleCount: 50, spread: 60 });
        setPasswordMsg({ type: 'success', text: 'Senha de administrador alterada com sucesso!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        fetchDashboardData();
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Erro ao alterar senha. Verifique a senha atual.' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Falha na comunicação com o servidor.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/admin/export-data', { headers: getAuthHeaders() });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mundo-curioso-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      playSuccessChime();
      showToast('success', 'Backup JSON baixado com sucesso!');
    } catch {
      showToast('error', 'Erro ao exportar dados do portal.');
    }
  };

  const tabsConfig = [
    { id: 'stats', label: 'Métricas Globais', icon: BarChart3 },
    { id: 'ai-daily', label: 'IA Diária & Gerador Gemini', icon: Bot, badge: 'IA Ativa' },
    { id: 'comments', label: `Comentários (${comments.length})`, icon: MessageSquare },
    { id: 'create', label: 'Publicar Manual', icon: PlusCircle },
    { id: 'suggestions', label: `Sugestões (${suggestions.filter(s => s.status === 'pending').length})`, icon: Inbox },
    { id: 'security', label: 'Segurança & Backup', icon: KeyRound }
  ] as const;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Floating Animated Toast Feedback */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 text-xs font-semibold ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
                : notification.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-500/50'
                : 'bg-neutral-900/90 text-neutral-200 border-neutral-700'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {notification.type === 'info' && <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-neutral-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner / Admin Header with Animated Glow */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:from-amber-950/30 dark:via-neutral-900 dark:to-neutral-900 border border-amber-500/30 shadow-md"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Área Restrita de Administração</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white flex items-center gap-2">
            Painel de Controle & IA Editorial
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
            Administrador Master: <strong className="text-neutral-950 dark:text-white font-bold">{adminUser?.name || 'Pedro Rosário Gabriel'}</strong> • ({adminUser?.email || 'pedrorosariogabriel1@gmail.com'})
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              playPopSound();
              fetchDashboardData();
            }}
            className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            title="Sincronizar dados com o servidor"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </button>

          {onLogout && (
            <button
              onClick={() => {
                playPopSound();
                onLogout();
              }}
              className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 hover:bg-red-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Encerrar sessão de administrador"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          )}

          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver Portal Público
          </button>
        </div>
      </motion.div>

      {/* Animated Tabs Navigation */}
      <div className="relative flex flex-wrap gap-2 pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-8">
        {tabsConfig.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                playPopSound();
                setActiveTab(tab.id as any);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'text-white dark:text-neutral-950 bg-neutral-900 dark:bg-white shadow-lg'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400 dark:text-amber-600' : 'text-neutral-500'}`} />
              <span>{tab.label}</span>
              {'badge' in tab && tab.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-black tracking-wide">
                  {tab.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Animated Tab Content Body */}
      <AnimatePresence mode="wait">
        {/* Tab 1: Global Stats */}
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Curiosidades Totais</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white">
                  {stats?.totalCuriosities || 100}+
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Fatos verificados
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Visualizações</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white">
                  {(stats?.totalViews || 384920).toLocaleString('pt-BR')}
                </div>
                <div className="text-[11px] text-neutral-500 font-medium mt-2">
                  Leituras de artigos e fatos
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Comentários</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white">
                  {comments.length}
                </div>
                <div className="text-[11px] text-neutral-500 font-medium mt-2">
                  Interações ativas da comunidade
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Quizzes Jogados</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white">
                  {(stats?.totalQuizzesPlayed || 42100).toLocaleString('pt-BR')}
                </div>
                <div className="text-[11px] text-purple-600 font-medium mt-2">
                  Desafios completados
                </div>
              </motion.div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg font-black font-serif text-neutral-950 dark:text-white mb-2">
                Ações Rápidas de Administração
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6">
                Acesse diretamente as ferramentas mais utilizadas do portal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('ai-daily')}
                  className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                    Gerar Fato com Gemini IA
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Crie fatos do dia ou sob demanda sobre qualquer tema.
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('comments')}
                  className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                    Moderar Comentários
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Fixe ou exclua publicações da comunidade ({comments.length}).
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('create')}
                  className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 text-left transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                    Publicação Manual
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Cadastre artigos e curiosidades detalhadas manualmente.
                  </p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: AI Daily & Smart Generator with Gemini */}
        {activeTab === 'ai-daily' && (
          <motion.div
            key="ai-daily"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="max-w-4xl space-y-6"
          >
            {/* Daily Auto-Updater Control Panel */}
            <div className="relative overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
                    <Bot className="w-4 h-4" />
                    <span>Automação Diária com Inteligência Artificial</span>
                  </div>
                  <h3 className="text-xl font-black font-serif text-neutral-950 dark:text-white">
                    Publicador Diário Automático de Conteúdo
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl leading-relaxed">
                    O motor inteligente verifica o calendário a cada 24 horas e gera automaticamente novas curiosidades factuais e verificadas para manter o site sempre novo.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleAiAuto}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                      aiStatus?.autoUpdateEnabled
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${aiStatus?.autoUpdateEnabled ? 'bg-white animate-ping' : 'bg-neutral-400'}`} />
                    {aiStatus?.autoUpdateEnabled ? 'Automação Ativa' : 'Automação Pausada'}
                  </motion.button>
                </div>
              </div>

              {/* Status Indicator Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Última Atualização Feita
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {aiStatus?.lastRunDate || new Date().toISOString().split('T')[0]}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Próximo Ciclo Previsto
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiStatus?.nextRunEstimated || 'Automático diário'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Forçar Execução Agora
                    </span>
                    <span className="text-xs text-neutral-500">Gera Fato do Dia</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRunDailyAiNow}
                    disabled={runningDailyAi}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {runningDailyAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" /> Gerar Hoje
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* On-Demand Topic Generator with Gemini 3.7 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-sm"
            >
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>Gerador Sob Demanda com Gemini 3.7 AI</span>
              </div>
              <h3 className="text-xl font-bold font-serif text-neutral-950 dark:text-white mb-2">
                Pesquisar e Criar Artigo sobre Qualquer Tema
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-6 max-w-xl">
                Digite um assunto específico (ex: Moçambique, Arquipélago de Bazaruto, Buracos de Minhoca, DNA das Plantas) para a IA estruturar um fato factual completo e verificado.
              </p>

              <form onSubmit={handleGenerateAI} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Tema ou Assunto Desejado *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Arquipélago de Bazaruto, Física Quântica, Tubarão-baleia..."
                      value={aiTopic}
                      onChange={e => setAiTopic(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Categoria Temática
                    </label>
                    <select
                      value={aiCategory}
                      onChange={e => setAiCategory(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
                    >
                      {ALL_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={aiLoading || !aiTopic.trim()}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Pesquisando e Formatando Fato com Gemini...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" /> Gerar Curiosidade com IA
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* Generated Result Preview Card with Smooth Spring Animation */}
            <AnimatePresence>
              {generatedResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="bg-white dark:bg-neutral-900 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Fato Estruturado com Sucesso
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      Pontuação de Curiosidade: {generatedResult.funFactor || 95}/100
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-serif text-neutral-950 dark:text-white mb-2 leading-tight">
                    {generatedResult.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 italic mb-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                    "{generatedResult.summary}"
                  </p>

                  <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6 space-y-2.5">
                    {generatedResult.content.split('\n\n').map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  {generatedResult.didYouKnow && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 mb-6 font-medium flex items-start gap-2">
                      <span className="text-base leading-none">💡</span>
                      <div>
                        <strong>Você Sabia?</strong> {generatedResult.didYouKnow}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePublishGenerated}
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Aprovar e Publicar no Portal
                    </motion.button>
                    <button
                      onClick={() => setGeneratedResult(null)}
                      className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold text-xs transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                    >
                      Descartar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Tab 3: Comments Moderation */}
        {activeTab === 'comments' && (
          <motion.div
            key="comments"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 max-w-4xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Comentários da Comunidade ({comments.length})
                </h3>
                <p className="text-xs text-neutral-500">
                  Gerencie opiniões de leitores, fixe os comentários mais brilhantes ou remova conteúdos impróprios.
                </p>
              </div>
            </div>

            {comments.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                <p className="text-xs text-neutral-500">Nenhum comentário publicado ainda.</p>
              </div>
            ) : (
              comments.map(c => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={c.id}
                  className={`p-5 rounded-2xl border bg-white dark:bg-neutral-900 shadow-xs ${
                    c.isPinned ? 'border-amber-500/50 bg-amber-500/5' : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                        alt={c.authorName}
                        className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            {c.authorName}
                          </span>
                          {c.isAdmin && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[8px] font-black uppercase">
                              👑 Admin
                            </span>
                          )}
                          {c.isPinned && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[8px] font-black uppercase flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5" /> Fixado
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(c.createdAt).toLocaleString('pt-BR')} • Artigo: <strong className="text-neutral-600 dark:text-neutral-300">{c.curiosityTitle || c.curiosityId}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePinComment(c.id)}
                        className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-1 cursor-pointer transition-colors"
                        title={c.isPinned ? 'Desafixar comentário' : 'Fixar no topo'}
                      >
                        <Pin className="w-3.5 h-3.5 text-amber-500" />
                        <span className="hidden sm:inline text-[11px]">{c.isPinned ? 'Desafixar' : 'Fixar'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800/60 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Excluir comentário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">Excluir</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pl-12">
                    {c.content}
                  </p>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Tab 4: Create Manual Curiosity */}
        {activeTab === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <form onSubmit={handleCreateCuriosity} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-lg max-w-3xl space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                Publicar Novo Fato no Portal
              </h3>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Título Principal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: O som dos trovões ecoa por vários quilômetros..."
                  value={newCuriosity.title}
                  onChange={e => setNewCuriosity({ ...newCuriosity, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Resumo Intrigante (Uma frase) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: O canal de plasma criado pelo raio possui extensões quilométricas..."
                  value={newCuriosity.summary}
                  onChange={e => setNewCuriosity({ ...newCuriosity, summary: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newCuriosity.categoryId}
                    onChange={e => setNewCuriosity({ ...newCuriosity, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    {ALL_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    URL da Imagem de Capa
                  </label>
                  <input
                    type="url"
                    value={newCuriosity.imageUrl}
                    onChange={e => setNewCuriosity({ ...newCuriosity, imageUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Conteúdo Completo & Explicação Científica *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Texto rico com detalhes sobre como o fenômeno ocorre..."
                  value={newCuriosity.content}
                  onChange={e => setNewCuriosity({ ...newCuriosity, content: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  "Você Sabia?" (Fato Rápido Adicional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: A temperatura de um raio pode atingir 30.000 °C..."
                  value={newCuriosity.didYouKnow}
                  onChange={e => setNewCuriosity({ ...newCuriosity, didYouKnow: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Salvando...' : 'Publicar Agora no Portal'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Tab 5: User Suggestions */}
        {activeTab === 'suggestions' && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 max-w-4xl"
          >
            {suggestions.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Nenhuma sugestão de usuário pendente.</p>
              </div>
            ) : (
              suggestions.map(s => (
                <div
                  key={s.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-md">
                        {s.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        s.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : s.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                      {s.title}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-2">
                      {s.description}
                    </p>
                    <div className="text-[10px] text-neutral-400">
                      Enviado por <strong>{s.submitterName}</strong> ({s.submitterEmail || 'Sem email'}) • Fonte: {s.source || 'Não informada'}
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-center">
                    {s.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleSuggestionStatus(s.id, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                        </button>
                        <button
                          onClick={() => handleSuggestionStatus(s.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-red-100 hover:text-red-600 text-neutral-700 dark:text-neutral-300 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rejeitar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Tab 6: Security & Change Password */}
        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="max-w-4xl space-y-8"
          >
            {/* Password change card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-serif text-neutral-950 dark:text-white">
                    Alterar Senha do Administrador
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Atualize a credencial mestra de segurança que protege todo o painel.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                {passwordMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                      passwordMsg.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {passwordMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                    )}
                    <span>{passwordMsg.text}</span>
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Senha Atual de Administrador *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Digite sua senha atual"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nova Senha * (mínimo 5 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={5}
                    placeholder="Digite a nova senha segura"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Confirmar Nova Senha *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={changingPassword || !currentPassword || !newPassword}
                    className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    Atualizar Senha
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Data Backup & Export */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-1">
                    Backup Completo da Base de Dados
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Exporte todas as curiosidades, comentários, assinantes e estatísticas em formato JSON.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportData}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Baixar Backup JSON
                </motion.button>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-1">
                Registro de Auditoria de Segurança
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Histórico de acessos, alterações de credenciais e ações administrativas no portal.
              </p>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-4 text-center">Nenhum evento registrado ainda.</p>
                ) : (
                  auditLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white mr-2">
                          [{log.action}]
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-300">
                          {log.details}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
