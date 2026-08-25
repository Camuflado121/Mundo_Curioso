import React from 'react';
import { Info, Sparkles } from 'lucide-react';

interface AdBannerProps {
  slot: 'top-leaderboard' | 'in-feed' | 'sidebar' | 'article-footer';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slot, className = '' }) => {
  if (slot === 'top-leaderboard') {
    return (
      <aside aria-label="Espaço publicitário" className={`w-full max-w-6xl mx-auto my-4 p-2.5 bg-neutral-100 dark:bg-neutral-900/60 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl flex items-center justify-between px-6 text-xs text-neutral-500 dark:text-neutral-400 ${className}`}>
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
            Parceiro Oficial
          </span>
          <p className="font-medium text-neutral-700 dark:text-neutral-300">
            Descubra cursos interativos de Astronomia e Ciência com certificação internacional.
          </p>
        </div>
        <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs whitespace-nowrap">
          Saiba mais →
        </button>
      </aside>
    );
  }

  if (slot === 'in-feed') {
    return (
      <aside aria-label="Publicidade em destaque" className={`bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-transparent border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
            Destaque Patrocinado
          </span>
          <Info className="w-3.5 h-3.5 text-neutral-400" />
        </div>
        <div>
          <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" /> Clube do Livro de Ciências & História
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
            Receba mensalmente edições especiais de enciclopédias e obras-primas sobre grandes mistérios da humanidade com 30% OFF.
          </p>
        </div>
        <button className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors text-center shadow-sm">
          Conhecer o Clube
        </button>
      </aside>
    );
  }

  if (slot === 'sidebar') {
    return (
      <aside aria-label="Espaço promocional lateral" className={`bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 text-center ${className}`}>
        <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-2 block">
          Publicidade
        </span>
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
          App Mundo Curioso Pro
        </h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          Acesse conteúdos exclusivos, áudio-guias de expedição e navegação 100% livre de anúncios.
        </p>
        <button className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl font-medium text-xs transition-colors">
          Experimentar 7 Dias Grátis
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Espaço promocional" className={`bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 my-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <div>
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1 block">
          Recomendação de Parceiro
        </span>
        <h4 className="font-bold text-base text-neutral-900 dark:text-white">
          Gostou deste artigo? Aprofunde seus estudos
        </h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          Acesse a maior biblioteca digital de artigos científicos e históricos com acesso ilimitado.
        </p>
      </div>
      <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap shadow-sm">
        Conhecer Agora
      </button>
    </aside>
  );
};
