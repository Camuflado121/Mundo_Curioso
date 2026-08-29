import React, { useState } from 'react';
import { Compass, ArrowRight, Sparkles } from 'lucide-react';
import { Curiosity } from '../../types';
import { ALL_CURIOSITIES } from '../../data/allCuriosities';
import { playPopSound } from '../../utils/audio';
import { ImageWithFallback } from '../common/ImageWithFallback';

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
  imageUrl: string;
}

const DISCOVERY_TRAILS: {
  id: string;
  name: string;
  description: string;
  steps: RouteStep[];
}[] = [
  {
    id: 'trail-1',
    name: 'Da Poeira Estelar à Biologia Humana',
    description: 'Descubra como explosões colossais no cosmos forjaram a matéria, moldaram as montanhas e formaram a vida.',
    steps: [
      {
        step: 1,
        title: 'Estrelas de Nêutrons: Densidade Extrema',
        category: 'Espaço & Universo',
        teaser: 'Uma colher de chá de matéria pesa 1 bilhão de toneladas.',
        slug: 'estrelas-de-neutrons-uma-colher-pesa-um-bilhao-de-toneladas',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        connection: 'A matéria cósmica viajou pelo vácuo até encontrar novos mundos e energias exóticas...'
      },
      {
        step: 2,
        title: 'Fogo Frio Espacial na Estação Espacial',
        category: 'Ciência & Física',
        teaser: 'Em microgravidade o fogo queima em esferas perfeitas azuis.',
        slug: 'fogo-frio-espacial-chamas-redondas-e-azuis-na-iss',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        connection: 'A física térmica moldou relevos ancestrais e ecossistemas isolados...'
      },
      {
        step: 3,
        title: 'Monte Namúli e as Ilhas de Céu',
        category: 'Moçambique & África',
        teaser: 'Picos rochosos de 2.419 metros abrigam florestas com espécies únicas.',
        slug: 'monte-namuli-e-as-florestas-sagradas-de-mocambique',
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
        connection: 'A extraordinária resistência dos seres vivos reflete-se na bioengenharia do nosso corpo...'
      },
      {
        step: 4,
        title: 'A Regeneração do Fígado Humano',
        category: 'Corpo Humano & Saúde',
        teaser: 'O fígado regenera seu volume total mesmo após perder 75% da sua massa.',
        slug: 'a-regeneracao-do-figado-humano-e-o-mito-de-prometeu',
        imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
        connection: 'Você é o resultado de bilhões de anos de evolução cósmica e biológica!'
      }
    ]
  },
  {
    id: 'trail-2',
    name: 'As Fronteiras da Mente, Evolução e Tecnologia',
    description: 'Dos superpoderes acústicos e de enxame no reino animal aos circuitos quânticos da era digital.',
    steps: [
      {
        step: 1,
        title: 'O Soco do Camarão-Mantis',
        category: 'Animais & Natureza',
        teaser: 'Um golpe a 80 km/h que gera calor de 4.700 °C e luz visível no mar.',
        slug: 'o-soco-do-camarao-mantis-luz-e-calor-do-sol',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        connection: 'A biologia desenvolveu métodos cognitivos surpreendentes para manipular o mundo...'
      },
      {
        step: 2,
        title: 'Corvos da Nova Caledônia: Ferramentas',
        category: 'Animais & Natureza',
        teaser: 'Aves que fabricam ganchos sob medida e resolvem enigmas de 8 etapas.',
        slug: 'inteligencia-dos-corvos-da-nova-caledonia-ferramentas',
        imageUrl: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=800&q=80',
        connection: 'O raciocínio abstrato levou a humanidade a construir máquinas de cálculo...'
      },
      {
        step: 3,
        title: 'A Primeira Mensagem da Internet (1969)',
        category: 'Tecnologia & IA',
        teaser: 'O primeiro envio travou na segunda letra ("LO"), mas conectou o planeta.',
        slug: 'a-primeira-mensagem-da-arpanet-o-nascimento-da-internet',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        connection: 'Na era hiperconectada, o cérebro humano produz fascinantes distorções cognitivas...'
      },
      {
        step: 4,
        title: 'O Efeito Mandela & Memórias Coletivas',
        category: 'Cérebro & Psicologia',
        teaser: 'Por que milhões de pessoas lembram exatamente da mesma mentira histórica.',
        slug: 'o-efeito-mandela-e-as-falsas-memorias-coletivas',
        imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80',
        connection: 'A mente humana reconstrói a realidade a cada instante!'
      }
    ]
  },
  {
    id: 'trail-3',
    name: 'Tesoros & Tradições de Moçambique',
    description: 'Mergulhe no patrimônio ancestral, nas maiores jazidas de rubis do globo e nos mares de corais.',
    steps: [
      {
        step: 1,
        title: 'Montepuez: A Maior Reserva de Rubis',
        category: 'Moçambique & África',
        teaser: 'Mais de 80% dos rubis de luxo do mundo nascem no norte de Moçambique.',
        slug: 'montepuez-mocambique-a-maior-reserva-de-rubis-do-mundo',
        imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        connection: 'A terra moçambicana também preserva expressões culturais reconhecidas mundialmente...'
      },
      {
        step: 2,
        title: 'A Dança Teatral Mapiko (UNESCO)',
        category: 'Moçambique & África',
        teaser: 'Máscaras esculpidas em madeira m\'pingo e ritmos ancestrais de Cabo Delgado.',
        slug: 'a-danca-mapiko-e-a-arte-maconde-de-mocambique',
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        connection: 'Essa tradição milenar estende-se até os abrigos de arte rupestre nas montanhas...'
      },
      {
        step: 3,
        title: 'Pinturas Rupestres de Chinhamapere',
        category: 'Moçambique & África',
        teaser: 'Arte em ocre vermelho de 10.000 anos gravada em Manica pelos povos San.',
        slug: 'pinturas-rupestres-de-chinhamapere-manica-mocambique',
        imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
        connection: 'Das serras sagradas às águas azul-turquesa do Oceano Índico...'
      },
      {
        step: 4,
        title: 'Arquipélago das Quirimbas & Dugongos',
        category: 'Moçambique & África',
        teaser: '32 ilhas de coral que protegem o dócil mamífero que inspirou as lendas de sereias.',
        slug: 'arquipelago-das-quirimbas-santuario-dos-dugongos-em-mocambique',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        connection: 'Um dos santuários ecológicos e culturais mais preciosos do planeta!'
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
          <div className="flex flex-wrap gap-2">
            {DISCOVERY_TRAILS.map((trail, idx) => (
              <button
                key={trail.id}
                onClick={() => {
                  playPopSound();
                  setActiveTrailIndex(idx);
                }}
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

        {/* Trail Steps Horizontal Timeline with Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {activeTrail.steps.map((step) => (
            <div
              key={step.step}
              onClick={() => handleStepClick(step.slug)}
              className="group bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-md relative"
            >
              {/* Photo Thumbnail */}
              <div className="relative h-28 w-full overflow-hidden">
                <ImageWithFallback
                  src={step.imageUrl}
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center shadow-md">
                    {step.step}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[10px] text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-bold uppercase border border-white/10">
                    {step.category}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-snug mb-1.5 line-clamp-2">
                    {step.title}
                  </h4>

                  <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed mb-3">
                    {step.teaser}
                  </p>
                </div>

                <div>
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 italic mb-3 leading-tight">
                    🔗 {step.connection}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 pt-2 border-t border-neutral-800/80">
                    <span>Explorar etapa</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
