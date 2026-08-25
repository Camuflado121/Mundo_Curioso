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
  Edit,
  Eye,
  Send,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Curiosity, CuriositySuggestion, PlatformStats } from '../../types';
import { ALL_CATEGORIES } from '../../data/allCuriosities';
import { playSuccessChime, playPopSound } from '../../utils/audio';

interface AdminDashboardProps {
  onBack: () => void;
  onRefreshCuriosities: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onRefreshCuriosities }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'create' | 'ai-generator' | 'suggestions'>('stats');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [suggestions, setSuggestions] = useState<CuriositySuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // New curiosity form state
  const [newCuriosity, setNewCuriosity] = useState<Partial<Curiosity>>({
    title: '',
    summary: '',
    content: '',
    categoryId: 'ciencia',
    tags: ['ciencia', 'descoberta'],
    author: 'Redação Mundo Curioso',
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

  // Fetch stats and suggestions
  const fetchDashboardData = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});

    fetch('/api/admin/sugestoes')
      .then(res => res.json())
      .then(data => setSuggestions(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        headers: { 'Content-Type': 'application/json' },
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
          author: 'Redação Mundo Curioso',
          readTimeMinutes: 3,
          imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
          sourceName: 'Verificação Editorial Mundo Curioso',
          sourceUrl: '',
          didYouKnow: '',
          funFactor: 95
        });
        fetchDashboardData();
        onRefreshCuriosities();
      }
    } catch {
      alert('Erro ao publicar');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, category: aiCategory })
      });
      const data = await res.json();
      if (data.success && data.curiosity) {
        setGeneratedResult(data.curiosity);
        playSuccessChime();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedResult)
      });
      if (res.ok) {
        playSuccessChime();
        alert('Fato gerado pela IA publicado com sucesso no portal!');
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

  const handleSuggestionStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await fetch(`/api/admin/sugestoes/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      playPopSound();
      fetchDashboardData();
    } catch {
      // Handled
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" /> Painel de Controle Editorial
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white">
            Administração Mundo Curioso
          </h1>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold self-start sm:self-auto"
        >
          Voltar ao Portal Público
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-8">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stats'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Métricas Globais
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'create'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" /> Publicar Curiosidade
        </button>

        <button
          onClick={() => setActiveTab('ai-generator')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ai-generator'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Assistente IA (Gemini)
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'suggestions'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" /> Moderação de Sugestões ({suggestions.filter(s => s.status === 'pending').length})
        </button>
      </div>

      {/* Tab: Stats */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
                Fatos Cadastrados
              </span>
              <div className="text-3xl font-black text-neutral-900 dark:text-white">
                {stats?.totalCuriosities || 40}
              </div>
              <span className="text-xs text-emerald-600 font-medium">100% verificados</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
                Visualizações Totais
              </span>
              <div className="text-3xl font-black text-neutral-900 dark:text-white">
                {stats?.totalViews.toLocaleString() || '380,000'}
              </div>
              <span className="text-xs text-neutral-500 font-medium">Tráfego orgânico</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
                Quizzes Jogados
              </span>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                {stats?.totalQuizzesPlayed.toLocaleString() || '42,100'}
              </div>
              <span className="text-xs text-neutral-500 font-medium">Engajamento gamificado</span>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
                Inscritos Newsletter
              </span>
              <div className="text-3xl font-black text-amber-500">
                {stats?.totalSubscribers || 10}k+
              </div>
              <span className="text-xs text-neutral-500 font-medium">Assinantes diários</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Create Manual Curiosity */}
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
              className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Publicar Agora no Portal'}
            </button>
          </div>
        </form>
      )}

      {/* Tab: AI Generator */}
      {activeTab === 'ai-generator' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> Assistente de Curiosidades com Gemini AI
            </div>
            <h3 className="text-xl font-bold font-serif text-neutral-900 dark:text-white mb-2">
              Gerador Automático de Fatos Verificados
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-6">
              Digite qualquer assunto ou palavra-chave e a inteligência artificial formulará um artigo factual completo com fontes, tags e pílula "Você Sabia?".
            </p>

            <form onSubmit={handleGenerateAI} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tema ou Tópico Desejado
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vida marinha profunda, Pirâmides do Sudão, Computação quântica..."
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
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Pesquisando e Formatando Fato...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Gerar Curiosidade Factual
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in duration-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full mb-3 inline-block">
                Resultado Gerado com Sucesso
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Aprovar e Publicar no Site
                </button>
                <button
                  onClick={() => setGeneratedResult(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold text-xs transition-colors"
                >
                  Descartar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: User Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4 max-w-4xl">
          {suggestions.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
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
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                      </button>
                      <button
                        onClick={() => handleSuggestionStatus(s.id, 'rejected')}
                        className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-red-100 hover:text-red-600 text-neutral-700 dark:text-neutral-300 font-semibold text-xs flex items-center gap-1 transition-colors"
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
    </div>
  );
};
