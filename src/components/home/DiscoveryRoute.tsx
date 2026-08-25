import React, { useState } from 'react';
import { Compass, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Curiosity } from '../../types';
import { ALL_CURIOSITIES } from '../../data/allCuriosities';
import { playPopSound } from '../../utils/audio';

interface DiscoveryRouteProps {
  onSelectCuriosity: (curiosity: Curiosity) => void;
}

interface RouteStep {
  step: number;
  title: string;
  category: string;
  teaser: string;
  slug: string;
  connection: string;
}

const DISCOVERY_TRAILS: {
  id: string;
  name: string;
  description: string;
  steps: RouteStep[];
}[] = [
  {
    id: 'trail-1',
    name: 'Da Poeira Estelar à Aliança de Ouro no Seu Dedo',
    description: 'Descubra como explosões colossais no cosmos criaram os elementos raros da Terra e a vida.',
    steps: [
      {
        step: 1,
        title: 'Estrelas de Nêutrons & Colisão Kilonova',
        category: 'Espaço & Universo',
        teaser: 'O ouro e a platina do universo foram forjados quando duas estrelas mortas colidiram.',
        slug: 'a-chuva-de-vidro-e-ventos-hipersonicos-no-planeta-azul',
        connection: 'A matéria ejetada viajou pelo vácuo cósmico até atingir a nuvem primordial que formou a Terra...'
      },
      {
        step: 2,
        title: 'O Manto Terrestre e as Rochas de Obsidiana',
        category: 'Ciência & Física',
        teaser: 'O calor residual do nascimento do planeta cria vidros vulcânicos mais afiados que bisturis.',
        slug: 'a-faca-de-vidro-vulcanico-obsidiana-mais-afiada-que-o-aco',
        connection: 'A atividade geológica profunda gerou montanhas sagradas e bolsões de biodiversidade única...'
      },
      {
        step: 3,
        title: 'Monte Namúli e as Ilhas de Céu de Moçambique',
        category: 'Moçambique & África',
        teaser: 'Picos rochosos ancestrais isolados abrigam criaturas que evoluíram longe do restante do mundo.',
        slug: 'monte-namuli-e-as-florestas-sagradas-de-mocambique',
        connection: 'Essas florestas intactas revelam como a biologia e a genética humana se adaptaram ao ambiente...'
      },
      {
        step: 4,
        title: 'A Máquina Biológica Humana: 2 Metros de DNA',
        category: 'Corpo Humano & Saúde',
        teaser: 'Cada uma das suas 37 trilhões de células contém átomos criados em estrelas que explodiram.',
        slug: 'dois-metros-de-dna-em-cada-celula-humana',
        connection: 'Você é literalmente feito de poeira de estrelas!'
      }
    ]
  },
  {
    id: 'trail-2',
    name: 'As Rotas Secretas da Inteligência & Memória',
    description: 'Do enigma dos polvos com 9 cérebros aos computadores de Alan Turing e a mente humana.',
    steps: [
      {
        step: 1,
        title: 'Polvos: A Inteligência Alienígena dos Oceanos',
        category: 'Animais & Natureza',
        teaser: 'Dois terços dos neurônios do polvo não estão na cabeça, mas espalhados por seus tentáculos.',
        slug: 'os-polvos-possuem-tres-coracoes-e-sangue-azul',
        connection: 'Biólogos e cientistas da computação estudam essa rede neural descentralizada...'
      },
      {
        step: 2,
        title: 'Alan Turing e a Origem da Inteligência Artificial',
        category: 'Tecnologia & IA',
        teaser: 'Como o Teste de Turing de 1950 previu o raciocínio das redes neurais modernas.',
        slug: 'a-inteligencia-artificial-e-o-teste-de-turing',
        connection: 'No entanto, o cérebro humano ainda guarda truques psicológicos misteriosos...'
      },
      {
        step: 3,
        title: 'O Efeito Mandela & Memórias Coletivas Falsas',
        category: 'Cérebro & Psicologia',
        teaser: 'Por que milhões de pessoas lembram vividamente de acontecimentos que nunca existiram.',
        slug: 'o-efeito-mandela-e-a-memoria-coletiva',
        connection: 'Uma jornada fascinante pela fronteira entre realidade e cognição!'
      }
    ]
  }
];

export const DiscoveryRoute: React.FC<DiscoveryRouteProps> = ({ onSelectCuriosity }) => {
  const [activeTrailIndex, setActiveTrailIndex] = useState(0);
  const activeTrail = DISCOVERY_TRAILS[activeTrailIndex];

  const handleStepClick = (slug: string) => {
    playPopSound();
    const found = ALL_CURIOSITIES.find(c => c.slug === slug);
    if (found) {
      onSelectCuriosity(found);
    }
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-10 border border-neutral-800 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4 text-amber-400" /> Rotas de Descoberta Interligadas
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-white">
              {activeTrail.name}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              {activeTrail.description}
            </p>
          </div>

          {/* Switch Trail Selector */}
          <div className="flex gap-2">
            {DISCOVERY_TRAILS.map((trail, idx) => (
              <button
                key={trail.id}
                onClick={() => setActiveTrailIndex(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  idx === activeTrailIndex
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                Trilha {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Trail Steps Horizontal Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {activeTrail.steps.map((step, idx) => (
            <div
              key={step.step}
              onClick={() => handleStepClick(step.slug)}
              className="group bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 hover:border-amber-500/60 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 relative"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">
                    {step.step}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                    {step.category}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-snug mb-1.5">
                  {step.title}
                </h4>

                <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed mb-3">
                  {step.teaser}
                </p>
              </div>

              <div>
                <div className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[10px] text-neutral-400 italic mb-3">
                  🔗 {step.connection}
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 pt-2 border-t border-neutral-800">
                  <span>Explorar etapa</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
