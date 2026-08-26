import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  Lightbulb,
  Share2,
  Crown,
  Flame,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz } from '../../types';
import { playSuccessChime, playWrongChime, playLevelUpFanfare, playPopSound } from '../../utils/audio';
import { QuizPerfectScoreModal } from './QuizPerfectScoreModal';

interface QuizPlayViewProps {
  quiz: Quiz;
  onBack: () => void;
  onRecordCompleted: (earnedXp: number) => void;
  onSelectAnotherQuiz: () => void;
}

export const QuizPlayView: React.FC<QuizPlayViewProps> = ({
  quiz,
  onBack,
  onRecordCompleted,
  onSelectAnotherQuiz
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showPerfectScoreModal, setShowPerfectScoreModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const question = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleSelectOption = (index: number) => {
    if (hasConfirmed) return;
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || hasConfirmed) return;

    setHasConfirmed(true);
    const isCorrect = selectedOption === question.correctIndex;
    setUserAnswers(prev => ({ ...prev, [question.id]: selectedOption }));

    if (isCorrect) {
      playSuccessChime();
    } else {
      playWrongChime();
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Calculate results
      let correct = 0;
      quiz.questions.forEach(q => {
        if (userAnswers[q.id] === q.correctIndex) {
          correct++;
        }
      });
      // Add current question if answered correctly
      if (selectedOption === question.correctIndex) {
        correct++;
      }

      const isPerfect = correct === quiz.questions.length;
      const earnedXp = Math.round((correct / quiz.questions.length) * quiz.xpReward);
      onRecordCompleted(earnedXp);

      if (isPerfect) {
        setShowPerfectScoreModal(true);
        setShowToast(true);
      } else if (correct >= quiz.questions.length / 2) {
        playLevelUpFanfare();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setIsFinished(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasConfirmed(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setHasConfirmed(false);
    setIsFinished(false);
    setShowPerfectScoreModal(false);
    setShowToast(false);
  };

  // Final Results Screen
  if (isFinished) {
    let correctCount = 0;
    quiz.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const isPerfect = correctCount === quiz.questions.length;
    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
    const earnedXp = Math.round((correctCount / quiz.questions.length) * quiz.xpReward);

    return (
      <div className="py-12 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 animate-in zoom-in-95 duration-200 relative">
        {/* Floating Toast Notification on Top for Perfect Score */}
        {isPerfect && showToast && (
          <div
            id="perfect-score-toast"
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top duration-300"
          >
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-3.5 shadow-2xl border border-amber-300/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-black leading-tight">
                    Incrível! 100% de Acertos!
                  </h4>
                  <p className="text-[11px] text-amber-100 leading-tight">
                    Você gabaritou o quiz. Desafie seus amigos!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    playPopSound();
                    setShowPerfectScoreModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 font-extrabold text-[11px] shadow-xs transition-transform active:scale-95"
                >
                  Compartilhar
                </button>
                <button
                  onClick={() => setShowToast(false)}
                  className="p-1 text-white/80 hover:text-white rounded-lg"
                  aria-label="Fechar notificação"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Top ambient glow for 100% */}
          {isPerfect && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 w-48 h-20 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          )}

          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6 shadow-inner relative">
            <Trophy className="w-10 h-10 animate-bounce" />
            {isPerfect && (
              <span className="absolute -top-1 -right-1 p-1 bg-amber-500 text-black rounded-full shadow-md">
                <Crown className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white mb-2">
            {isPerfect ? 'Perfeito! Você Gabaritou!' : 'Desafio Concluído!'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Você testou seus conhecimentos no quiz: <span className="font-bold text-neutral-900 dark:text-white">{quiz.title}</span>
          </p>

          {/* Perfect Score Special Share Banner */}
          {isPerfect && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/40 text-left flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                  100%
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Conquista Lendária Desbloqueada!
                  </h4>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Você acertou todas as {quiz.questions.length} perguntas. Compartilhe e desafie seus amigos!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playPopSound();
                  setShowPerfectScoreModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar Resultado</span>
              </button>
            </div>
          )}

          {/* Score Box */}
          <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 mb-8">
            <div>
              <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
                Pontuação
              </span>
              <div className={`text-2xl sm:text-3xl font-black ${isPerfect ? 'text-emerald-500 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'}`}>
                {correctCount} / {quiz.questions.length}
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                ({scorePercentage}% de acertos)
              </span>
            </div>

            <div>
              <span className="text-[11px] uppercase font-bold text-neutral-400 block mb-1">
                Experiência Ganha
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center justify-center gap-1">
                <Sparkles className="w-6 h-6" /> +{earnedXp}
              </div>
              <span className="text-xs text-emerald-600 font-semibold">
                Pontos computados!
              </span>
            </div>
          </div>

          {/* Review Question Answers */}
          <div className="text-left space-y-3 mb-8 max-h-60 overflow-y-auto pr-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Resumo das Questões
            </h4>
            {quiz.questions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border text-xs ${
                    isCorrect
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white mb-1">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span>{idx + 1}. {q.question}</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 pl-6">
                    {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isPerfect && (
              <button
                onClick={() => {
                  playPopSound();
                  setShowPerfectScoreModal(true);
                }}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4" /> Compartilhar Conquista (100%)
              </button>
            )}

            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Tentar Novamente
            </button>

            <button
              onClick={onSelectAnotherQuiz}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              Outro Quiz <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal de Pontuação Máxima Informativa e de Compartilhamento */}
        <QuizPerfectScoreModal
          isOpen={showPerfectScoreModal}
          onClose={() => setShowPerfectScoreModal(false)}
          quiz={quiz}
          earnedXp={earnedXp}
          totalQuestions={quiz.questions.length}
        />
      </div>
    );
  }

  // Active Question Stepper Screen
  return (
    <div className="py-8 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Sair do Quiz
      </button>

      {/* Main Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-xl">
        {/* Progress header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Questão {currentQuestionIndex + 1} de {quiz.questions.length}
          </span>
          <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> +{quiz.xpReward} XP em jogo
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl font-black font-serif text-neutral-950 dark:text-white leading-snug mb-6">
          {question.question}
        </h2>

        {/* Options List */}
        <div className="space-y-3 mb-8">
          {question.options.map((opt, index) => {
            let optionStyles = 'border-neutral-200 dark:border-neutral-800 hover:border-purple-400 bg-neutral-50/50 dark:bg-neutral-950';

            if (selectedOption === index) {
              optionStyles = 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20';
            }

            if (hasConfirmed) {
              if (index === question.correctIndex) {
                optionStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold';
              } else if (selectedOption === index) {
                optionStyles = 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200 font-bold';
              } else {
                optionStyles = 'opacity-50 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={hasConfirmed}
                className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${optionStyles}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{opt}</span>
                </div>

                {hasConfirmed && index === question.correctIndex && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                {hasConfirmed && selectedOption === index && index !== question.correctIndex && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card after Confirmation */}
        {hasConfirmed && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 mb-8 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Explicação Científica:</span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {!hasConfirmed ? (
            <button
              onClick={handleConfirmAnswer}
              disabled={selectedOption === null}
              className="px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all"
            >
              Confirmar Resposta
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-8 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              {isLastQuestion ? 'Ver Resultado Final' : 'Próxima Pergunta'} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
