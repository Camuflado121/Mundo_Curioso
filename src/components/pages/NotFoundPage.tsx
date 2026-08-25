import React from 'react';
import { ArrowLeft, Dice5, Compass } from 'lucide-react';
import { playPopSound } from '../../utils/audio';

interface NotFoundPageProps {
  onGoHome: () => void;
  onTriggerRandom: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome, onTriggerRandom }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 text-center max-w-lg shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 block mb-1">
          Erro 404
        </span>

        <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 dark:text-white mb-2">
          Página Perdida no Espaço-Tempo
        </h1>

        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
          Você navegou até uma coordenada inexplorada do nosso cosmos. Não se preocupe: há milhares de outras descobertas esperando por você!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onGoHome}
            className="px-6 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Início
          </button>

          <button
            onClick={() => {
              playPopSound();
              onTriggerRandom();
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Dice5 className="w-4 h-4" /> Resgatar com Fato Aleatório
          </button>
        </div>
      </div>
    </div>
  );
};
