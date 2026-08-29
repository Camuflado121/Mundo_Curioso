import React from 'react';
import { HelpCircle, Trophy, Sparkles, Play, ArrowLeft } from 'lucide-react';
import { Quiz } from '../../types';
import { ALL_QUIZZES } from '../../data/allCuriosities';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface QuizHubViewProps {
  onBack: () => void;
  onSelectQuiz: (quiz: Quiz) => void;
}

export const QuizHubView: React.FC<QuizHubViewProps> = ({ onBack, onSelectQuiz }) => {
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </button>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-neutral-950 border border-purple-900/40 rounded-3xl p-8 sm:p-12 text-white mb-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Trophy className="w-4 h-4 text-amber-400" /> Arena de Desafios & Quizzes
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-white mb-3">
            Quanto você realmente conhece sobre os mistérios do mundo?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Responda às rodadas de perguntas formuladas por cientistas e historiadores. Cada acerto garante pontos de experiência (XP) para elevar seu nível no portal!
          </p>
        </div>
      </div>

      {/* Quizzes List with Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_QUIZZES.map(quiz => (
          <div
            key={quiz.id}
            onClick={() => onSelectQuiz(quiz)}
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-purple-400 dark:hover:border-purple-600 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Quiz Cover Banner */}
              <div className="relative h-44 w-full overflow-hidden">
                <ImageWithFallback
                  src={quiz.imageUrl}
                  alt={quiz.title}
                  category={quiz.categoryId}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full backdrop-blur-md ${
                    quiz.difficulty === 'Fácil'
                      ? 'bg-emerald-500/80 text-white'
                      : quiz.difficulty === 'Médio'
                      ? 'bg-amber-500/80 text-white'
                      : 'bg-red-500/80 text-white'
                  }`}>
                    {quiz.difficulty}
                  </span>

                  <span className="flex items-center gap-1 text-xs font-black text-amber-300 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> +{quiz.xpReward} XP
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-2 leading-snug">
                  {quiz.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                  {quiz.description}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-500" /> {quiz.questions.length} perguntas
              </span>

              <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors">
                Iniciar Quiz <Play className="w-3 h-3 fill-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
