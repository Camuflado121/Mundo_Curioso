import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';
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
}

interface AiDailyStatusData {
  autoUpdateEnabled: boolean;
  lastRunDate: string;
  nextRunEstimated: string;
  totalAiGenerated: number;
  preferredCategories: string[];
  recentGenerations: Array<{
    title: string;
    category: string;
    generatedAt: string;
  }>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBack,
  onRefreshCuriosities,
  token,
  adminUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'ai-daily' | 'comments' | 'create' | 'suggestions' | 'security'>('stats');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [suggestions, setSuggestions] = useState<CuriositySuggestion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [aiStatus, setAiStatus] = useState<AiDailyStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningDailyAi, setRunningDailyAi] = useState(false);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'x-admin-token': token } : {})
  };

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

  // Fetch all dashboard data
  const fetchDashboardData = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});

    fetch('/api/admin/sugestoes', { headers: authHeaders })
      .then(res => (res.ok ? res.json() : []))
      .then(data => Array.isArray(data) && setSuggestions(data))
      .catch(() => {});

    fetch('/api/admin/comentarios', { headers: authHeaders })
      .then(res => (res.ok ? res.json() : []))
      .then(data => Array.isArray(data) && setComments(data))
      .catch(() => {});

    fetch('/api/admin/ai/status', { headers: authHeaders })
      .then(res => (res.ok ? res.json() : null))
      .then(data => data && setAiStatus(data))
      .catch(() => {});

    fetch('/api/admin/audit-logs', { headers: authHeaders })
      .then(res => (res.ok ? res.json() : []))
      .then(data => Array.isArray(data) && setAuditLogs(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

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
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        playSuccessChime();
        alert('Curiosidade publicada com sucesso no portal!');
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
        alert('Sessão administrativa expirada. Por favor, faça login novamente.');
        if (onLogout) onLogout();
      }
    } catch {
      alert('Erro ao publicar curiosidade.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/gerar-curiosidade', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ topic: aiTopic, category: aiCategory })
      });
      const data = await res.json();
      if (data.success && data.curiosity) {
        setGeneratedResult(data.curiosity);
        playSuccessChime();
      } else if (res.status === 401 || res.status === 403) {
        alert('Sessão administrativa expirada.');
        if (onLogout) onLogout();
      }
    } catch {
      alert('Erro ao gerar com IA');
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
        headers: authHeaders,
        body: JSON.stringify(generatedResult)
      });
      if (res.ok) {
        playSuccessChime();
        alert('Curiosidade gerada pela IA publicada com sucesso no portal!');
        setGeneratedResult(null);
        setAiTopic('');
        fetchDashboardData();
        onRefreshCuriosities();
      }
    } catch {
      alert('Erro ao publicar');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDailyAiNow = async () => {
    setRunningDailyAi(true);
    try {
      const res = await fetch('/api/admin/ai/run-daily-now', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ count: 1 })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playSuccessChime();
        alert(`Atualização concluída! Nova curiosidade diária gerada e publicada: "${data.generated[0]?.title || ''}"`);
        fetchDashboardData();
        onRefreshCuriosities();
      } else {
        alert(data.error || 'Erro ao executar atualização diária com IA.');
      }
    } catch {
      alert('Falha ao conectar com o servidor para atualização diária.');
    } finally {
      setRunningDailyAi(false);
    }
  };

  const handleToggleAiAuto = async () => {
    try {
      const res = await fetch('/api/admin/ai/toggle-auto', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ enabled: !aiStatus?.autoUpdateEnabled })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playPopSound();
        fetchDashboardData();
      }
    } catch {}
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este comentário?')) return;
    try {
      const res = await fetch(`/api/admin/comentarios/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        playPopSound();
        setComments(prev => prev.filter(c => c.id !== id));
        fetchDashboardData();
      }
    } catch {}
  };

  const handleTogglePinComment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/comentarios/${id}/pin`, {
        method: 'POST',
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        playPopSound();
        setComments(prev =>
          prev.map(c => (c.id === id ? { ...c, isPinned: data.isPinned } : c))
        );
      }
    } catch {}
  };

  const handleSuggestionStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await fetch(`/api/admin/sugestoes/${id}/status`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ status })
      });
      playPopSound();
      fetchDashboardData();
    } catch {}
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
        headers: authHeaders,
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playSuccessChime();
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
      const res = await fetch('/api/admin/export-data', { headers: authHeaders });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mundo-curioso-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      playSuccessChime();
    } catch {
      alert('Erro ao exportar dados do portal.');
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      {/* Top Banner / Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" /> Área Restrita de Administração
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif text-neutral-950 dark:text-white">
            Painel de Controle e Moderação
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Administrador: <strong className="text-neutral-900 dark:text-neutral-200">{adminUser?.name || 'Pedro Rosário Gabriel'}</strong> ({adminUser?.email || 'pedrorosariogabriel1@gmail.com'})
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 hover:bg-red-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Encerrar sessão de administrador"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair do Admin
            </button>
          )}

          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Ver Portal Público
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-8">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Métricas Globais
        </button>

        <button
          onClick={() => setActiveTab('ai-daily')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ai-daily'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <Bot className="w-3.5 h-3.5" /> IA Diária & Gerador Inteligente
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'comments'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Moderação de Comentários ({comments.length})
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" /> Publicar Manual
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'suggestions'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" /> Sugestões ({suggestions.filter(s => s.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" /> Segurança & Mudar Senha
        </button>
      </div>

      {/* Tab 1: Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
                Curiosidades Cadastradas
              </span>
              <div className="text-3xl font-black text-neutral-900 dark:text-white">
                {stats?.totalCuriosities || 40}
              </div>
              <span className="text-xs text-emerald-600 font-medium">100% verificadas</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
                Visualizações Totais
              </span>
              <div className="text-3xl font-black text-neutral-900 dark:text-white">
                {stats?.totalViews?.toLocaleString() || '380,000'}
              </div>
              <span className="text-xs text-neutral-500 font-medium">Tráfego no portal</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
                Comentários Totais
              </span>
              <div className="text-3xl font-black text-amber-500">
                {comments.length}
              </div>
              <span className="text-xs text-neutral-500 font-medium">Engajamento de leitores</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
                Assinantes Newsletter
              </span>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                {stats?.totalSubscribers || 1}
              </div>
              <span className="text-xs text-neutral-500 font-medium">Atualizações diárias</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Daily & Smart Generator */}
      {activeTab === 'ai-daily' && (
        <div className="max-w-4xl space-y-6">
          {/* Daily Auto-Updater Control Panel */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
                  <Bot className="w-4 h-4" /> Automação Diária com Inteligência Artificial
                </div>
                <h3 className="text-lg font-black font-serif text-neutral-950 dark:text-white">
                  Publicador Diário Automático de Conteúdo
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  O sistema verifica o calendário a cada 24 horas e gera automaticamente novas curiosidades factuais e verificadas para manter o site sempre novo.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleToggleAiAuto}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    aiStatus?.autoUpdateEnabled
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${aiStatus?.autoUpdateEnabled ? 'bg-white animate-pulse' : 'bg-neutral-400'}`} />
                  {aiStatus?.autoUpdateEnabled ? 'Automação Ativa' : 'Automação Pausada'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Última Atualização Feita
                </span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  {aiStatus?.lastRunDate || 'Hoje'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Próximo Ciclo Previsto
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {aiStatus?.nextRunEstimated || 'Automático diário'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Forçar Execução Agora
                  </span>
                  <span className="text-xs text-neutral-500">Publica imediatamente</span>
                </div>
                <button
                  onClick={handleRunDailyAiNow}
                  disabled={runningDailyAi}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {runningDailyAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Gerar Hoje
                </button>
              </div>
            </div>
          </div>

          {/* On-Demand Topic Generator */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> Gerador Sob Demanda com Gemini AI
            </div>
            <h3 className="text-xl font-bold font-serif text-neutral-900 dark:text-white mb-2">
              Pesquisar e Criar Artigo sobre Qualquer Tema
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-6">
              Digite um assunto específico (ex: Moçambique, Física Quântica, Oceano Profundo) para a IA estruturar um fato factual completo.
            </p>

            <form onSubmit={handleGenerateAI} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tema ou Assunto Desejado
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Arquipélago de Bazaruto, Buracos de Minhoca, DNA de Plantas..."
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={aiCategory}
                    onChange={e => setAiCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    {ALL_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Pesquisando e Formatando Fato com Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Gerar Curiosidade com IA
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in duration-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full mb-3 inline-block">
                Curiosidade Gerada com Sucesso
              </span>
              <h3 className="text-xl font-bold text-neutral-950 dark:text-white mb-2">
                {generatedResult.title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 italic mb-4">
                "{generatedResult.summary}"
              </p>
              <div className="prose dark:prose-invert text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6 space-y-2">
                {generatedResult.content.split('\n\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {generatedResult.didYouKnow && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 mb-6 font-medium">
                  💡 <strong>Você Sabia?</strong> {generatedResult.didYouKnow}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handlePublishGenerated}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Aprovar e Publicar no Site
                </button>
                <button
                  onClick={() => setGeneratedResult(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Descartar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Comments Moderation */}
      {activeTab === 'comments' && (
        <div className="space-y-4 max-w-4xl">
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
              <div
                key={c.id}
                className={`p-4 sm:p-5 rounded-2xl border bg-white dark:bg-neutral-900 ${
                  c.isPinned ? 'border-amber-500/40 bg-amber-500/5' : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={c.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                      alt={c.authorName}
                      className="w-8 h-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {c.authorName}
                        </span>
                        {c.isAdmin && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[8px] font-black uppercase">
                            👑 Admin
                          </span>
                        )}
                        {c.isPinned && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase flex items-center gap-0.5">
                            <Pin className="w-2.5 h-2.5" /> Fixado
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(c.createdAt).toLocaleString('pt-BR')} • Em: <strong className="text-neutral-600 dark:text-neutral-300">{c.curiosityTitle || c.curiosityId}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePinComment(c.id)}
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-1 cursor-pointer"
                      title={c.isPinned ? 'Desafixar comentário' : 'Fixar no topo'}
                    >
                      <Pin className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden sm:inline text-[11px]">{c.isPinned ? 'Desafixar' : 'Fixar'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-800/60 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1 cursor-pointer"
                      title="Excluir comentário"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Excluir</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pl-10">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Create Manual Curiosity */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateCuriosity} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-xl max-w-3xl space-y-4">
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
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Salvando...' : 'Publicar Agora no Portal'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 5: User Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4 max-w-4xl">
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
        </div>
      )}

      {/* Tab 6: Security & Change Password */}
      {activeTab === 'security' && (
        <div className="max-w-4xl space-y-8">
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
                <div
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
                </div>
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
                <button
                  type="submit"
                  disabled={changingPassword || !currentPassword || !newPassword}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>

          {/* Data Backup & Export */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-1">
                  Backup Completo da Base de Dados
                </h3>
                <p className="text-xs text-neutral-500">
                  Exporte todas as curiosidades, comentários, assinantes e estatísticas em formato JSON.
                </p>
              </div>

              <button
                onClick={handleExportData}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" /> Baixar Backup JSON
              </button>
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
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
