import React from 'react';
import { HelpCircle, Trophy, Sparkles, ArrowRight, Play } from 'lucide-react';
import { Quiz } from '../../types';
import { ALL_QUIZZES } from '../../data/allCuriosities';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface QuizPromoSectionProps {
  onSelectQuiz: (quiz: Quiz) => void;
  onNavigateQuizzes: () => void;
}

export const QuizPromoSection: React.FC<QuizPromoSectionProps> = ({
  onSelectQuiz,
  onNavigateQuizzes
}) => {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-neutral-950 rounded-3xl p-6 sm:p-10 text-white border border-indigo-900/50 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Trophy className="w-4 h-4 text-amber-400" /> Desafio de Conhecimento
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white">
              Teste o que você realmente sabe sobre o mundo
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 max-w-xl">
              Responda a quizzes temáticos rápidos com imagens fascinantes, acumule pontos de experiência (XP) e suba no ranking.
            </p>
          </div>

          <button
            onClick={onNavigateQuizzes}
            className="px-6 py-3 rounded-2xl bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-xs shadow-lg transition-all flex items-center gap-2 self-start lg:self-center shrink-0"
          >
            Ver Todos os Quizzes <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quizzes Cards Grid with Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {ALL_QUIZZES.map(quiz => (
            <div
              key={quiz.id}
              onClick={() => onSelectQuiz(quiz)}
              className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-purple-400/60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between shadow-md"
            >
              <div>
                {/* Quiz Photo Thumbnail Banner */}
                <div className="relative h-32 w-full overflow-hidden">
                  <ImageWithFallback
                    src={quiz.imageUrl}
                    alt={quiz.title}
                    category={quiz.categoryId}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />

                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md backdrop-blur-md ${
                      quiz.difficulty === 'Fácil'
                        ? 'bg-emerald-500/80 text-white'
                        : quiz.difficulty === 'Médio'
                        ? 'bg-amber-500/80 text-white'
                        : 'bg-red-500/80 text-white'
                    }`}>
                      {quiz.difficulty}
                    </span>

                    <span className="flex items-center gap-1 text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
                      <Sparkles className="w-3 h-3 text-amber-400" /> +{quiz.xpReward} XP
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors leading-snug mb-1.5 line-clamp-2">
                    {quiz.title}
                  </h3>
                  <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> {quiz.questions.length} perguntas
                </span>
                <span className="text-purple-300 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Jogar <Play className="w-3 h-3 fill-purple-300" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
