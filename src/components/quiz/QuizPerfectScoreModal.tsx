import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  Share2,
  Crown,
  Award,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Send,
  X,
  Zap,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz } from '../../types';
import { playSuccessChime, playLevelUpFanfare, playPopSound } from '../../utils/audio';

interface QuizPerfectScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz;
  earnedXp: number;
  totalQuestions: number;
}

export const QuizPerfectScoreModal: React.FC<QuizPerfectScoreModalProps> = ({
  isOpen,
  onClose,
  quiz,
  earnedXp,
  totalQuestions
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playLevelUpFanfare();
      
      // Multi-stage celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6']
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#F59E0B', '#FBBF24', '#FFFFFF']
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#F59E0B', '#FBBF24', '#FFFFFF']
        });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/quiz`
    : 'https://mundocurioso.com/quiz';

  const shareText = `🏆 GABARITEI! Acertei ${totalQuestions}/${totalQuestions} perguntas (100%) no quiz "${quiz.title}" no portal Mundo Curioso! 🧠⚡\n\nSerá que você consegue bater meu resultado? Faça o teste agora:`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText}\n${currentUrl}`);
    setCopied(true);
    playSuccessChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `100% de Acertos no Quiz: ${quiz.title}`,
          text: shareText,
          url: currentUrl
        });
      } catch {
        // Fallback to copy
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  return (
    <div
      id="quiz-perfect-score-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="quiz-perfect-score-modal-panel"
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-16 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            playPopSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors z-10"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy & Crown Visual Header */}
        <div className="relative inline-flex items-center justify-center mx-auto mb-4 mt-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-xl flex items-center justify-center text-white">
            <div className="w-full h-full bg-neutral-950 rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent" />
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 animate-bounce" />
            </div>
          </div>

          <span className="absolute -top-2 -right-2 p-1.5 rounded-full bg-amber-500 text-black shadow-lg animate-pulse">
            <Crown className="w-4 h-4" />
          </span>
        </div>

        {/* Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pontuação Máxima Perfeita • 100%</span>
        </div>

        {/* Headings */}
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white tracking-tight leading-tight mb-2">
          Gênio das Curiosidades!
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-sm mx-auto mb-6 leading-relaxed">
          Você acertou <strong className="text-emerald-600 dark:text-emerald-400">todas as {totalQuestions} perguntas</strong> do quiz{' '}
          <span className="font-bold text-neutral-900 dark:text-white">"{quiz.title}"</span>. Seu conhecimento é extraordinário!
        </p>

        {/* Stats Highlights Card */}
        <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 mb-6">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-0.5">
              Acertos
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {totalQuestions}/{totalQuestions}
            </div>
            <span className="text-[10px] text-neutral-500 font-medium">100% de taxa</span>
          </div>

          <div className="text-center border-x border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-0.5">
              Recompensa
            </span>
            <div className="text-lg sm:text-xl font-black text-amber-500 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4" /> +{earnedXp}
            </div>
            <span className="text-[10px] text-neutral-500 font-medium">XP computado</span>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-0.5">
              Distinção
            </span>
            <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" /> Mestre
            </div>
            <span className="text-[10px] text-neutral-500 font-medium">Rank Ouro</span>
          </div>
        </div>

        {/* Social Share Call to Action Header */}
        <div className="mb-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Desafie seus Amigos!
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Compartilhe seu feito e veja se alguém da sua rede consegue igualar sua pontuação:
          </p>
        </div>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-transform active:scale-95 gap-1 shadow-xs"
          >
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
              WA
            </span>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={shareTelegram}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold text-xs transition-transform active:scale-95 gap-1 shadow-xs"
          >
            <span className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs shadow-xs">
              <Send className="w-4 h-4 ml-0.5" />
            </span>
            <span>Telegram</span>
          </button>

          <button
            onClick={shareX}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs transition-transform active:scale-95 gap-1 shadow-xs"
          >
            <span className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-black shadow-xs">
              𝕏
            </span>
            <span>Twitter / 𝕏</span>
          </button>

          <button
            onClick={shareFacebook}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs transition-transform active:scale-95 gap-1 shadow-xs"
          >
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
              f
            </span>
            <span>Facebook</span>
          </button>
        </div>

        {/* Copy Result or Native Share */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={copyToClipboard}
            className={`w-full sm:flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Resultado Copiado com Sucesso!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar Texto do Desafio
              </>
            )}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={shareNative}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Mais Opções</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
