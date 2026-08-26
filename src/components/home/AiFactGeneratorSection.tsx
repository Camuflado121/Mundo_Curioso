import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Award,
  Globe,
  Atom,
  TreePine,
  Cpu,
  Landmark,
  HeartPulse
} from 'lucide-react';
import { Curiosity } from '../../types';
import { playPopSound, playSuccessChime } from '../../utils/audio';

interface AiFactGeneratorSectionProps {
  onSelectCuriosity?: (item: Curiosity) => void;
  onOpenShare?: (item: Curiosity) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: (id: string) => boolean;
  onAddXp?: (amount: number, reason: string) => void;
}

const CATEGORY_OPTIONS = [
  { id: 'ciencia', name: 'Ciência & Cosmos', icon: Atom, color: 'from-blue-500 to-indigo-600' },
  { id: 'mocambique-africa', name: 'Moçambique & África', icon: Globe, color: 'from-emerald-500 to-teal-600' },
  { id: 'natureza', name: 'Natureza & Animais', icon: TreePine, color: 'from-green-500 to-emerald-600' },
  { id: 'historia', name: 'História & Mistérios', icon: Landmark, color: 'from-amber-500 to-orange-600' },
  { id: 'tecnologia', name: 'Tecnologia & Futuro', icon: Cpu, color: 'from-purple-500 to-pink-600' },
  { id: 'corpo_humano', name: 'Corpo Humano & Mente', icon: HeartPulse, color: 'from-rose-500 to-red-600' }
];

const SUGGESTED_THEMES = [
  'O som misterioso das profundezas do oceano',
  'A biodiversidade única do Monte Namúli',
  'Como o telescópio James Webb vê o passado',
  'Por que sonhamos e o que o cérebro faz dormindo',
  'Civilizações perdidas que dominaram a astronomia',
  'A planta que sobrevive sem água há milênios'
];

export const AiFactGeneratorSection: React.FC<AiFactGeneratorSectionProps> = ({
  onSelectCuriosity,
  onOpenShare,
  onToggleFavorite,
  isFavorite,
  onAddXp
}) => {
  const [selectedCategory, setSelectedCategory] = useState('ciencia');
  const [customTopic, setCustomTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedFact, setGeneratedFact] = useState<Curiosity | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (topicOverride?: string) => {
    const topicToUse = topicOverride !== undefined ? topicOverride : customTopic;
    playPopSound();
    setLoading(true);

    try {
      const res = await fetch('/api/ai/gerar-fato-publico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse.trim() || undefined,
          category: selectedCategory
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.curiosity) {
          setGeneratedFact(data.curiosity);
          playSuccessChime();
          if (onAddXp) {
            onAddXp(25, 'Gerou um fato científico com Gemini IA');
          }
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const speakFact = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-PT';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    playPopSound();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="gerador-ia-fatos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="relative rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-amber-500/30 text-white p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Gerador Automático de Fatos Verificados
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-serif tracking-tight text-white">
              Crie Descobertas com <span className="text-amber-400">Gemini AI</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Explore o gerador inteligente baseado no modelo Gemini 3.7 Flash. Escolha uma área do saber, digite um tema ou solicite um fato verificado instantâneo com fontes científicas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-neutral-200">100% Fatos Verificados</span>
            </div>
          </div>
        </div>

        {/* Category Selector Pills */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {CATEGORY_OPTIONS.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  playPopSound();
                  setSelectedCategory(cat.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg ring-2 ring-amber-500/40'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isSelected ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Input and Trigger Action */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={customTopic}
            onChange={e => setCustomTopic(e.target.value)}
            placeholder="Digite qualquer tema (ex: 'Bioluminescência marinha', 'Monte Namúli', 'Buracos negros')..."
            className="flex-1 px-4 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-700 text-white placeholder-neutral-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Pesquisando com Gemini AI...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Gerar Fato Verificado (+25 XP)</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Theme Chips */}
        <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-8">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Temas Populares:
          </span>
          {SUGGESTED_THEMES.map((theme, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomTopic(theme);
                handleGenerate(theme);
              }}
              className="px-3 py-1 rounded-full text-xs bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:text-amber-400 text-neutral-300 whitespace-nowrap transition-colors"
            >
              {theme}
            </button>
          ))}
        </div>

        {/* Generated Fact Result Card */}
        {generatedFact && (
          <div className="relative z-10 rounded-3xl bg-neutral-900/90 border border-amber-500/40 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Image preview */}
              <div className="w-full lg:w-72 h-48 sm:h-56 rounded-2xl overflow-hidden relative shrink-0 border border-neutral-800">
                <img
                  src={generatedFact.imageUrl}
                  alt={generatedFact.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md text-[10px] font-extrabold text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Gerado com Gemini 3.7
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {generatedFact.categoryName || 'Ciência & Descoberta'}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Fator Curiosidade: <strong className="text-amber-400">{generatedFact.funFactor || 98}%</strong>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black font-serif text-white leading-tight">
                  {generatedFact.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
                  {generatedFact.summary}
                </p>

                <div className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line pt-2 border-t border-neutral-800">
                  {generatedFact.content}
                </div>

                {/* Did you know callout */}
                {generatedFact.didYouKnow && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-300 font-bold text-[11px]">Você Sabia?</strong>
                      <span>{generatedFact.didYouKnow}</span>
                    </div>
                  </div>
                )}

                {/* Sources & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800 text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fonte: <strong className="text-neutral-200">{generatedFact.sourceName || 'Institutos Científicos Internacionais'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakFact(generatedFact.title + '. ' + generatedFact.summary + ' ' + (generatedFact.didYouKnow || ''))}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                      title={isSpeaking ? 'Parar áudio' : 'Ouvir com voz sintetizada'}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleCopy(`${generatedFact.title}\n\n${generatedFact.summary}\n\nFonte: ${generatedFact.sourceName}`)}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                      title="Copiar fato"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {onToggleFavorite && isFavorite && (
                      <button
                        onClick={() => onToggleFavorite(generatedFact.id)}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                        title="Favoritar"
                      >
                        <Bookmark className={`w-4 h-4 ${isFavorite(generatedFact.id) ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    )}

                    {onOpenShare && (
                      <button
                        onClick={() => onOpenShare(generatedFact)}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                        title="Compartilhar"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}

                    {onSelectCuriosity && (
                      <button
                        onClick={() => onSelectCuriosity(generatedFact)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Explorar Artigo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
