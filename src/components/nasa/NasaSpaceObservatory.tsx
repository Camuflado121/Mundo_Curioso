import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Telescope, 
  Globe, 
  Orbit, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Calendar, 
  Maximize2, 
  Languages, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  ChevronRight, 
  ArrowLeft,
  Info,
  Layers,
  Flame,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { NasaApod, NasaAsteroid, NasaEarthEpicImage, NasaSpaceOverview, Curiosity } from '../../types';
import { playPopSound } from '../../utils/audio';

interface NasaSpaceObservatoryProps {
  onBack: () => void;
  onSelectCuriosity?: (curiosity: Curiosity) => void;
  spaceCuriosities?: Curiosity[];
}

export const NasaSpaceObservatory: React.FC<NasaSpaceObservatoryProps> = ({
  onBack,
  onSelectCuriosity,
  spaceCuriosities = []
}) => {
  const [activeTab, setActiveTab] = useState<'apod' | 'asteroids' | 'earth' | 'curiosities'>('apod');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<NasaSpaceOverview | null>(null);
  
  // APOD state
  const [currentApod, setCurrentApod] = useState<NasaApod | null>(null);
  const [apodTranslation, setApodTranslation] = useState<{
    translatedTitle?: string;
    translatedExplanation?: string;
    keyDiscovery?: string;
  } | null>(null);
  const [translating, setTranslating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loadingRandomApod, setLoadingRandomApod] = useState(false);
  const [isHdImageModalOpen, setIsHdImageModalOpen] = useState(false);

  // Asteroids state
  const [asteroids, setAsteroids] = useState<NasaAsteroid[]>([]);
  const [selectedAsteroid, setSelectedAsteroid] = useState<NasaAsteroid | null>(null);

  // EPIC Earth state
  const [earthEpic, setEarthEpic] = useState<NasaEarthEpicImage | null>(null);

  // Fetch initial NASA overview
  const fetchNasaOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/nasa/overview');
      if (!res.ok) throw new Error('Falha ao conectar aos servidores da NASA');
      const data: NasaSpaceOverview = await res.json();
      setOverview(data);
      if (data.apod) {
        setCurrentApod(data.apod);
        setSelectedDate(data.apod.date);
      }
      if (data.asteroids?.closest) {
        setAsteroids(data.asteroids.closest);
        if (data.asteroids.closest.length > 0) {
          setSelectedAsteroid(data.asteroids.closest[0]);
        }
      }
      if (data.earthEpic) {
        setEarthEpic(data.earthEpic);
      }
    } catch (err) {
      console.error('Error fetching NASA overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNasaOverview();
  }, []);

  // Fetch APOD by date
  const handleFetchApodByDate = async (dateStr: string) => {
    if (!dateStr) return;
    try {
      setLoading(true);
      setApodTranslation(null);
      const res = await fetch(`/api/nasa/apod?date=${dateStr}`);
      if (!res.ok) throw new Error('Falha ao buscar foto da data informada');
      const data: NasaApod = await res.json();
      setCurrentApod(data);
      setSelectedDate(data.date);
    } catch (err) {
      console.error('Error fetching APOD by date:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch random APOD from NASA archive
  const handleFetchRandomApod = async () => {
    try {
      setLoadingRandomApod(true);
      setApodTranslation(null);
      playPopSound();
      const res = await fetch('/api/nasa/apod?count=1');
      if (!res.ok) throw new Error('Falha ao buscar foto aleatória');
      const data = await res.json();
      const item = Array.isArray(data) ? data[0] : data;
      if (item) {
        setCurrentApod(item);
        setSelectedDate(item.date);
      }
    } catch (err) {
      console.error('Error fetching random APOD:', err);
    } finally {
      setLoadingRandomApod(false);
    }
  };

  // Translate APOD explanation with Gemini
  const handleTranslateApod = async () => {
    if (!currentApod) return;
    try {
      setTranslating(true);
      playPopSound();
      const res = await fetch('/api/nasa/translate-apod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentApod.title,
          explanation: currentApod.explanation
        })
      });
      if (!res.ok) throw new Error('Erro na tradução');
      const data = await res.json();
      setApodTranslation(data);
    } catch (err) {
      console.error('Error translating APOD:', err);
    } finally {
      setTranslating(false);
    }
  };

  // Human scale comparison helper for asteroids
  const getAsteroidScaleComparison = (metersMax: number): string => {
    if (metersMax < 10) return 'Tamanho de um ônibus escolar';
    if (metersMax < 30) return 'Tamanho aproximado de uma baleia-azul';
    if (metersMax < 70) return 'Tamanho de um avião comercial Boeing 747';
    if (metersMax < 150) return 'Tamanho de um campo de futebol oficial';
    if (metersMax < 350) return 'Tamanho da Torre Eiffel ou de um arranha-céu';
    return 'Asteroide colossal de dimensões montanhosas';
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 pb-20 transition-colors">
      {/* Top Banner & Navigation */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playPopSound();
                onBack();
              }}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Portal</span>
            </button>

            <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 flex items-center justify-center text-white shadow-sm">
                <Rocket className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight">Observatório Espacial</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded border border-blue-500/20">
                    NASA Open API
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Dados em tempo real do Jet Propulsion Laboratory & Goddard
                </p>
              </div>
            </div>
          </div>

          {/* Connection Status & Refresh */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Conectado à API Oficial da NASA</span>
            </div>

            <button
              onClick={() => {
                playPopSound();
                setRefreshing(true);
                fetchNasaOverview();
              }}
              disabled={refreshing || loading}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-300 disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
              title="Recarregar dados da NASA"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Hero Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 text-white shadow-xl">
          {/* Deep Space Background gradient & glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-indigo-950/40 to-neutral-950 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Exploração Cósmica Direto das Missões Espaciais</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif tracking-tight">
                Observatório Espacial <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">NASA em Tempo Real</span>
              </h1>
              <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl">
                Acompanhe diariamente os fenômenos mais espetaculares do cosmos através da Foto Astronômica do Dia (APOD), do radar de asteroides próximos da Terra (NeoWs) e fotografias abissais do nosso planeta tiradas a 1,5 milhão de km pelo satélite DSCOVR.
              </p>
            </div>

            {/* Quick Metrics Badge Grid */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                  <Orbit className="w-3.5 h-3.5 text-amber-400" /> Asteroides Hoje
                </div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  {overview?.asteroids.count || 5}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                  Rastreados pelo JPL Radar
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Nível de Risco
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                  Seguro
                </div>
                <div className="text-[10px] text-neutral-300 font-medium mt-0.5">
                  0 perigos para a Terra
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                  <Telescope className="w-3.5 h-3.5 text-blue-400" /> Fonte Primária
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  NASA Open Data
                </div>
                <div className="text-[10px] text-neutral-400 font-medium mt-0.5">
                  API Key Ativa
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> Câmera DSCOVR
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-1">
                  Lagrange L1
                </div>
                <div className="text-[10px] text-cyan-300 font-medium mt-0.5">
                  1,5 milhão de km
                </div>
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="relative z-10 flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-neutral-800/80">
            <button
              onClick={() => {
                playPopSound();
                setActiveTab('apod');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'apod'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
              }`}
            >
              <Telescope className="w-4 h-4 text-amber-400" />
              <span>Foto Astronômica do Dia (APOD)</span>
            </button>

            <button
              onClick={() => {
                playPopSound();
                setActiveTab('asteroids');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'asteroids'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
              }`}
            >
              <Orbit className="w-4 h-4 text-orange-400" />
              <span>Radar de Asteroides (NeoWs)</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-white/20 rounded-full font-mono">
                {overview?.asteroids.count || 5}
              </span>
            </button>

            <button
              onClick={() => {
                playPopSound();
                setActiveTab('earth');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'earth'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Terra do Espaço Profundo (EPIC)</span>
            </button>

            <button
              onClick={() => {
                playPopSound();
                setActiveTab('curiosities');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'curiosities'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Acervo Espacial do Portal</span>
            </button>
          </div>
        </div>

        {/* Tab 1: APOD (Astronomy Picture of the Day) */}
        {activeTab === 'apod' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {currentApod ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Visual Media Viewer (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm space-y-4">
                  <div className="relative group bg-neutral-950 aspect-[16/10] sm:aspect-[16/11] flex items-center justify-center overflow-hidden">
                    {currentApod.media_type === 'video' ? (
                      <iframe
                        src={currentApod.url}
                        title={currentApod.title}
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <img
                        src={currentApod.url}
                        alt={currentApod.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {currentApod.media_type !== 'video' && (
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                          onClick={() => setIsHdImageModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-900 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg transition-all"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Ver em Alta Resolução</span>
                        </button>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-mono border border-white/10">
                      Data da NASA: {currentApod.date}
                    </div>
                  </div>

                  {/* APOD Controls Bar */}
                  <div className="p-4 sm:p-5 pt-0 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleFetchRandomApod}
                        disabled={loadingRandomApod}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20 transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingRandomApod ? 'animate-spin' : ''}`} />
                        <span>Surpreenda-me: Foto Aleatória do Arquivo</span>
                      </button>
                    </div>

                    {currentApod.hdurl && (
                      <a
                        href={currentApod.hdurl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-neutral-500 hover:text-blue-500 dark:hover:text-blue-400 font-medium flex items-center gap-1"
                      >
                        <span>Abrir imagem original (HD / 4K)</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content & AI Translation Explanation (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        <Telescope className="w-4 h-4" />
                        <span>Registro Oficial NASA APOD</span>
                      </div>
                      <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                        {currentApod.date}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black font-serif text-neutral-950 dark:text-white leading-tight">
                      {apodTranslation?.translatedTitle || currentApod.title}
                    </h2>

                    {currentApod.copyright && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Crédito & Copyright: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{currentApod.copyright}</span>
                      </p>
                    )}

                    {/* AI Translation Action Button */}
                    <div className="pt-2">
                      {!apodTranslation ? (
                        <button
                          onClick={handleTranslateApod}
                          disabled={translating}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                          <Languages className={`w-4 h-4 ${translating ? 'animate-spin' : ''}`} />
                          <span>{translating ? 'Traduzindo e analisando com IA...' : 'Traduzir Explicação Científica para Português'}</span>
                        </button>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Descoberta Científica Chave</span>
                          </div>
                          <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed font-medium">
                            {apodTranslation.keyDiscovery}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Explanation Text */}
                    <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-3 pt-2">
                      <p className="whitespace-pre-line">
                        {apodTranslation?.translatedExplanation || currentApod.explanation}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Fonte: NASA Astronomy Picture of the Day</span>
                      <a
                        href="https://apod.nasa.gov/apod/astropix.html"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Site da NASA <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
                <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold">Carregando dados da Foto Astronômica da NASA...</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Asteroids (NeoWs) */}
        {activeTab === 'asteroids' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Info header bar */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Radar de Objetos Próximos da Terra (NASA JPL NeoWs)
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Monitoramento contínuo de asteroides cruzando a vizinhança orbital da Terra hoje com dados de telemetria orbital.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Total Detectados: <span className="font-bold text-blue-600 dark:text-blue-400">{asteroids.length} asteroides</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>0 Risco de Impacto</span>
                </div>
              </div>
            </div>

            {/* Asteroids Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {asteroids.map((ast) => (
                <div
                  key={ast.id}
                  className={`p-5 rounded-3xl border transition-all duration-200 space-y-4 ${
                    selectedAsteroid?.id === ast.id
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-400 dark:border-blue-600 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                        <Orbit className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white font-mono">
                          {ast.name}
                        </h4>
                        <span className="text-[10px] text-neutral-400">ID JPL: {ast.id}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ast.isPotentiallyHazardous
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {ast.isPotentiallyHazardous ? 'Atenção Orbital' : 'Órbita Segura'}
                    </span>
                  </div>

                  {/* Size & Scale Comparison */}
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 dark:text-neutral-400 font-medium">Diâmetro Estimado:</span>
                      <span className="font-bold text-neutral-900 dark:text-white font-mono">
                        {ast.estimatedDiameterMeters.min}m - {ast.estimatedDiameterMeters.max}m
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      📏 {getAsteroidScaleComparison(ast.estimatedDiameterMeters.max)}
                    </p>
                  </div>

                  {/* Metrics: Velocity & Miss Distance */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                      <span className="text-[10px] text-neutral-400 font-medium block">Velocidade Cósmica</span>
                      <span className="font-bold font-mono text-neutral-800 dark:text-neutral-200">
                        {ast.velocityKmPerHour.toLocaleString('pt-BR')} km/h
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                      <span className="text-[10px] text-neutral-400 font-medium block">Distância Mínima</span>
                      <span className="font-bold font-mono text-neutral-800 dark:text-neutral-200">
                        {ast.missDistanceLunar.toFixed(1)} LD ({Math.round(ast.missDistanceKm / 1000000)}M km)
                      </span>
                    </div>
                  </div>

                  {/* Approximate approach time & JPL link */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[11px] text-neutral-400">
                      Aproximação: <strong className="text-neutral-700 dark:text-neutral-300">{ast.closeApproachDate}</strong>
                    </span>

                    <a
                      href={ast.nasaJplUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <span>Ficha JPL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Educational Explanatory Box */}
            <div className="p-6 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                <Info className="w-4 h-4 text-blue-500" />
                <span>O que significa "LD" (Distância Lunar)?</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                1 LD (Lunar Distance) equivale à distância média entre a Terra e a Lua, que é de aproximadamente <strong>384.400 quilômetros</strong>. A grande maioria dos asteroides monitorados pela NASA passa a dezenas de distâncias lunares de nós, sem oferecer qualquer perigo de colisão com a atmosfera terrestre.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Earth from Deep Space (EPIC DSCOVR) */}
        {activeTab === 'earth' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {earthEpic ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 bg-neutral-950 rounded-3xl border border-neutral-800 p-6 flex items-center justify-center overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-transparent to-transparent pointer-events-none" />
                  <img
                    src={earthEpic.imageUrl}
                    alt="Planeta Terra visto da câmera NASA EPIC"
                    className="max-h-[500px] w-auto object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-in zoom-in-95 duration-500"
                  />
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-mono border border-white/10">
                    Capturado em: {earthEpic.date} UTC
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Observatório Espacial DSCOVR</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black font-serif text-neutral-950 dark:text-white">
                      O Nosso Planeta Visto a 1,5 Milhão de Quilômetros
                    </h3>

                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      Esta imagem é capturada pela câmera <strong>EPIC (Earth Polychromatic Imaging Camera)</strong> da NASA a bordo do satélite NOAA DSCOVR, posicionado no Ponto de Lagrange L1 entre a Terra e o Sol.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">Distância da Terra</span>
                        <span className="font-bold text-neutral-900 dark:text-white font-mono">1.500.000 km</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">Posicionamento Orbital</span>
                        <span className="font-bold text-neutral-900 dark:text-white font-mono">Lagrange L1 Gravitacional</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between text-xs">
                        <span className="text-neutral-500 dark:text-neutral-400 font-medium">Frequência de Registro</span>
                        <span className="font-bold text-neutral-900 dark:text-white font-mono">10 a 20 fotos por dia</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                      💡 <strong>Curiosidade:</strong> Como o satélite orbita o ponto L1 exatamente alinhado com o Sol, o hemisfério da Terra visível para a câmera EPIC está 100% iluminado em luz diurna constante, permitindo monitorar o clima global, furacões e a camada de ozônio.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
                <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold">Carregando imagem EPIC da NASA...</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Cosmic Curiosities from Portal Archive */}
        {activeTab === 'curiosities' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Fatos Espaciais Verificados do Portal Mundo Curioso
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Aprofunde seus conhecimentos astronômicos com nossas reportagens sobre buracos negros, exoplanetas e fenômenos extremos do universo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaceCuriosities.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    playPopSound();
                    if (onSelectCuriosity) onSelectCuriosity(item);
                  }}
                  className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-white/10">
                        {item.categoryName}
                      </div>
                      {item.funFactor && (
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-neutral-950/80 text-[10px] font-bold text-white border border-white/10">
                          {item.funFactor}% Fator Surpresa
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-2.5">
                      <h4 className="text-base font-bold text-neutral-900 dark:text-white leading-snug group-hover:text-blue-500 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span>{item.readTimeMinutes} min de leitura</span>
                    <span className="text-blue-500 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Explorar Fato <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* HD Full-Resolution Image Modal */}
      {isHdImageModalOpen && currentApod && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setIsHdImageModalOpen(false)}
        >
          <div className="flex items-center justify-between text-white pb-3 max-w-7xl mx-auto w-full">
            <div>
              <h3 className="text-sm sm:text-base font-bold">{currentApod.title}</h3>
              <p className="text-xs text-neutral-400">Fotografia Oficial da NASA em Alta Resolução</p>
            </div>
            <button
              onClick={() => setIsHdImageModalOpen(false)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            >
              Fechar
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-auto p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentApod.hdurl || currentApod.url}
              alt={currentApod.title}
              className="max-h-[85vh] max-w-[95vw] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
