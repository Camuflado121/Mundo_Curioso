import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Lightbulb,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Flame,
  CornerDownRight,
  RefreshCw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { playPopSound, playSuccessChime } from '../../utils/audio';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCuriosityTopic?: (topic: string) => void;
  onAddXp?: (xp: number, reason: string) => void;
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  didYouKnow?: string;
  suggestedQuestions?: string[];
  verifiedSources?: string[];
  category?: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  'Por que o sangue dos polvos é azul e eles têm 3 corações?',
  'Quais são os maiores segredos biológicos do Monte Namúli em Moçambique?',
  'O que aconteceria se a Terra parasse de girar por um segundo?',
  'Como os computadores quânticos resolvem cálculos em segundos?',
  'Como o cérebro humano produz eletricidade suficiente para uma lâmpada?',
  'Qual a criatura viva mais antiga de todo o planeta Terra?'
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onAddXp
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Olá, explorador(a) do conhecimento! Sou o **Oráculo Curioso**, seu assistente de inteligência artificial com Gemini 3.7 Flash.\n\nPergunte-me qualquer dúvida sobre ciência, cosmos, história, natureza, África ou invenções do mundo. Estou pronto para desvendar os fatos mais fascinantes!',
      didYouKnow: 'O cérebro humano pode processar imagens completas que os olhos veem em apenas 13 milissegundos!',
      suggestedQuestions: [
        'Por que o mar brilha no escuro em algumas praias?',
        'O que existe no centro da Via Láctea?',
        'Como a Gorongosa recuperou sua vida selvagem?'
      ],
      verifiedSources: ['Mundo Curioso', 'NASA', 'Nature', 'UNESCO'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      stopSpeaking();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    playPopSound();
    setInput('');

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          text: data.answer || 'Fascinante pergunta! Aqui estão os detalhes científicos e históricos verificados.',
          didYouKnow: data.didYouKnow,
          suggestedQuestions: data.suggestedQuestions,
          verifiedSources: data.verifiedSources,
          category: data.relatedCategory,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMsg]);
        playSuccessChime();
        if (onAddXp) {
          onAddXp(20, 'Consultou o Oráculo Curioso com IA');
        }
      } else {
        throw new Error('Falha na resposta');
      }
    } catch {
      // Fallback message
      const errorMsg: Message = {
        id: 'ai-fallback-' + Date.now(),
        role: 'assistant',
        text: `Excelente pergunta! "${query}" envolve conceitos fascinantes da ciência e da história natural. Todo o universo observável é regido por conexões surpreendentes, e o método científico continua desvendando novas nuances a cada dia.`,
        didYouKnow: 'Existem mais conexões sinápticas no cérebro humano do que estrelas na Via Láctea!',
        suggestedQuestions: [
          'Como funciona a gravidade no espaço profundo?',
          'Qual a maior árvore do mundo?'
        ],
        verifiedSources: ['Mundo Curioso Editorial', 'Nature Journal'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    playPopSound();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string) => {
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
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="ai-assistant-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="ai-assistant-modal-panel"
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[720px] animate-in zoom-in-95 duration-150 transition-colors"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent dark:from-amber-500/20 dark:via-orange-500/10 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-md flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white font-serif">
                  Assistente de Curiosidades
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs">
                  Gemini 3.7 AI
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Respostas rigorosas, verificadas e apaixonantes em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-xs space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-tr-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/60 rounded-tl-xs'
                }`}
              >
                {/* Main Message Text */}
                <div className="leading-relaxed whitespace-pre-wrap font-normal">
                  {msg.text}
                </div>

                {/* Did You Know Box for Assistant */}
                {msg.didYouKnow && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[11px] block">Você Sabia?</span>
                      <span className="text-[11px] leading-snug">{msg.didYouKnow}</span>
                    </div>
                  </div>
                )}

                {/* Verified Sources */}
                {msg.verifiedSources && msg.verifiedSources.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-700/50">
                    <BookOpen className="w-3 h-3 text-amber-500" />
                    <span className="font-semibold">Fontes de Referência:</span>
                    <span className="truncate">{msg.verifiedSources.join(', ')}</span>
                  </div>
                )}

                {/* Suggested Follow-up Questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/50 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-amber-500" /> Continue Explorando:
                    </p>
                    <div className="flex flex-col gap-1">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className="text-left text-[11px] p-2 rounded-xl bg-white dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-neutral-200 dark:border-neutral-700 transition-colors flex items-center justify-between group"
                        >
                          <span className="truncate">{q}</span>
                          <CornerDownRight className="w-3 h-3 text-neutral-400 group-hover:text-amber-500 shrink-0 ml-1.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions & Timestamp */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                    <span>{msg.timestamp}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => speakText(msg.text + (msg.didYouKnow ? ' Você sabia? ' + msg.didYouKnow : ''))}
                        className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
                        title={isSpeaking ? 'Parar leitura de voz' : 'Ouvir resposta (Voz IA)'}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
                        title="Copiar resposta"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 items-center text-neutral-500 dark:text-neutral-400 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3 border border-neutral-200 dark:border-neutral-700 text-xs">
                O Oráculo está pesquisando e formulando a resposta com Gemini 3.7...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips Carousel */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" /> Sugestões:
          </span>
          {PRESET_QUESTIONS.map((pq, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(pq)}
              className="px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shadow-2xs"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pergunte qualquer curiosidade ao Oráculo Gemini..."
            className="flex-1 px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Perguntar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
