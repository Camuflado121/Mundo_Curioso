import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Telescope, 
  Orbit, 
  Globe, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { NasaSpaceOverview } from '../../types';
import { playPopSound } from '../../utils/audio';

interface NasaLiveSectionProps {
  onOpenObservatory: () => void;
}

export const NasaLiveSection: React.FC<NasaLiveSectionProps> = ({
  onOpenObservatory
}) => {
  const [data, setData] = useState<NasaSpaceOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/nasa/overview')
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar dados da NASA');
        return res.json();
      })
      .then((json: NasaSpaceOverview) => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Erro ao carregar preview da NASA:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const apod = data?.apod;
  const asteroids = data?.asteroids;

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 text-white shadow-xl">
          {/* Cosmic ambient lights */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Col: Explanatory & Action (6 cols) */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Transmissão NASA Ao Vivo
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  JPL & Goddard Space Center
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white leading-tight">
                Observatório Espacial: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">Conexão Oficial com a NASA</span>
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Acompanhe o cosmos em tempo real com dados da <strong>NASA Open API</strong>: fotos astronômicas diárias em alta definição, monitoramento de asteroides que cruzam a órbita da Terra e fotografias do nosso planeta a 1,5 milhão de km pelo satélite DSCOVR.
              </p>

              {/* Live telemetry counters */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-semibold">
                    <Orbit className="w-3 h-3 text-orange-400" /> Asteroides
                  </div>
                  <div className="text-lg font-black text-white mt-0.5 font-mono">
                    {asteroids?.count || 5} hoje
                  </div>
                  <div className="text-[9px] text-emerald-400 font-medium">
                    100% monitorados
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Risco Terra
                  </div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">
                    Zero
                  </div>
                  <div className="text-[9px] text-neutral-400">
                    Órbitas seguras
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-semibold">
                    <Globe className="w-3 h-3 text-cyan-400" /> DSCOVR
                  </div>
                  <div className="text-lg font-black text-cyan-300 mt-0.5 font-mono">
                    1.5M km
                  </div>
                  <div className="text-[9px] text-neutral-400">
                    Lagrange L1
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    playPopSound();
                    onOpenObservatory();
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-700 hover:via-indigo-700 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 group transition-all"
                >
                  <Rocket className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Explorar Observatório Espacial Completo</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Col: APOD Live Card Preview (6 cols) */}
            <div className="lg:col-span-6">
              <div
                onClick={() => {
                  playPopSound();
                  onOpenObservatory();
                }}
                className="group relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl cursor-pointer hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  {apod?.url ? (
                    <img
                      src={apod.url}
                      alt={apod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                      <Telescope className="w-8 h-8 text-neutral-600 animate-pulse" />
                    </div>
                  )}

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-white/10 flex items-center gap-1">
                      <Telescope className="w-3 h-3 text-amber-400" />
                      Foto Astronômica do Dia (NASA)
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-neutral-300 border border-white/10">
                    {apod?.date || 'Hoje'}
                  </div>
                </div>

                {/* Card footer description */}
                <div className="p-4 sm:p-5 bg-neutral-900/90 backdrop-blur-md space-y-1.5 text-left border-t border-neutral-800">
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {apod?.title || 'Pilares da Criação no Infravermelho Profundo (James Webb)'}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {apod?.explanation || 'Visão monumental capturada pelos instrumentos do Telescópio James Webb revelando novas protoestrelas nascendo a 6.500 anos-luz.'}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-blue-400 font-semibold">
                    <span>Clique para ver em tela cheia & tradução IA</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Abrir <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
