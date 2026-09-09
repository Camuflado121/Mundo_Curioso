import React, { useState } from 'react';
import { Compass, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
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
    name: 'Do Vácuo Cósmico aos Cristais de Tempo',
    description: 'Viaje dos planetas solitários que vagam no escuro aos quasares vorazes e aos estados exóticos da matéria quântica.',
    steps: [
      {
        step: 1,
        title: 'Planeta Errante PSO J318.5-22',
        category: 'Espaço & Universo',
        teaser: 'Um mundo solitário que vaga pelo vácuo sem nenhuma estrela e chove ferro fundido.',
        slug: 'o-planeta-errante-pso-j318-o-mundo-que-vaga-sem-estrela',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        connection: 'A força da gravidade extrema molda a física dos buracos negros mais radiantes do universo...'
      },
      {
        step: 2,
        title: 'Quasar J0529-4351: O Devorador de Sóis',
        category: 'Espaço & Universo',
        teaser: 'Um buraco negro que engole a massa de um Sol inteiro todos os dias e brilha como 500 trilhões de estrelas.',
        slug: 'o-quasar-j0529-o-objeto-mais-voraz-e-brilhante-do-universo',
        imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
        connection: 'Nas menores escalas do universo, a matéria quebra as regras da física clássica...'
      },
      {
        step: 3,
        title: 'Cristais de Tempo Quânticos',
        category: 'Ciência & Física',
        teaser: 'Átomos que quebram a simetria temporal e oscilam perpetuamente sem gastar energia.',
        slug: 'cristais-de-tempo-a-materia-que-oscila-sem-gastar-energia',
        imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
        connection: 'O domínio atômico permitiu criar os sólidos mais leves que a própria atmosfera...'
      },
      {
        step: 4,
        title: 'Aerogel de Grafeno: Mais Leve que o Ar',
        category: 'Ciência & Física',
        teaser: 'Um sólido esponjoso de carbono que repousa sobre a pétala de uma flor sem dobrá-la.',
        slug: 'aerogel-de-grafeno-o-material-mais-leve-que-o-ar',
        imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
        connection: 'Você completou a jornada das fronteiras extremas da física e do cosmos!'
      }
    ]
  },
  {
    id: 'trail-2',
    name: 'Expedição Moçambique: Dos Lagos às Savanas Costeiras',
    description: 'Explore a explosão biológica do Lago Niassa, a cidadela monumental de corais e os animais que nadam no mar.',
    steps: [
      {
        step: 1,
        title: 'O Laboratório Vivo do Lago Niassa',
        category: 'Moçambique & África',
        teaser: 'Mais de 1.000 espécies de ciclídeos que evoluíram mais rápido que os tentilhões de Darwin.',
        slug: 'o-laboratorio-evolutivo-do-lago-niassa-peixes-ciclideos',
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
        connection: 'Ao longo da costa de Moçambique, a história ergueu fortalezas inexpugnáveis...'
      },
      {
        step: 2,
        title: 'Cidadela de São Sebastião',
        category: 'Moçambique & África',
        teaser: 'A mais antiga fortaleza de pedra da África Austral erguida com argamassa de conchas e corais.',
        slug: 'a-fortaleza-de-sao-sebastiao-na-ilha-de-mocambique',
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
        connection: 'Mais ao sul, a vida selvagem surpreende com hábitos litorâneos únicos no continente...'
      },
      {
        step: 3,
        title: 'Elefantes Nadadores de Maputo',
        category: 'Moçambique & África',
        teaser: 'Manadas que cruzam florestas de dunas e mergulham nas ondas do Oceano Índico.',
        slug: 'os-elefantes-marinhos-e-costeiros-da-reserva-de-maputo',
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
        connection: 'E nas montanhas do norte, satélites revelaram um mundo perdido intocado...'
      },
      {
        step: 4,
        title: 'A Floresta Secreta do Monte Mabu',
        category: 'Moçambique & África',
        teaser: 'Descoberta no Google Earth, ela abriga dezenas de espécies exclusivas da montanha.',
        slug: 'a-floresta-perdida-do-monte-mabu-descoberta-pelo-google-earth',
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
        connection: 'Você desbravou os tesouros biológicos e históricos mais sagrados de Moçambique!'
      }
    ]
  },
  {
    id: 'trail-3',
    name: 'Superpoderes Biológicos & Enigmas da Mente',
    description: 'Mamíferos que farejam na água, piscinas submarinas tóxicas, mãos com vontade própria e computação de DNA.',
    steps: [
      {
        step: 1,
        title: 'A Toupeira que Cheira Debaixo D’Água',
        category: 'Animais & Natureza',
        teaser: 'Sopra e reinala bolhas de ar subaquáticas para farejar odores em milissegundos.',
        slug: 'a-toupeira-de-nariz-estrelado-cheiro-subaquatico-com-bolhas',
        imageUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=800&q=80',
        connection: 'Nas profundezas abissais escuras, a vida enfrenta condições de toxicidade letal...'
      },
      {
        step: 2,
        title: 'A Jacuzzi do Desespero Submarina',
        category: 'Oceanos & Abissal',
        teaser: 'Uma piscina mortal cinco vezes mais salina que o mar que mumifica animais no leito marinho.',
        slug: 'a-jacuzzi-do-desespero-o-lago-mortal-no-fundo-do-oceano',
        imageUrl: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80',
        connection: 'No cérebro humano, pequenas falhas na conectividade geram mistérios surpreendentes...'
      },
      {
        step: 3,
        title: 'A Síndrome da Mão Anárquica',
        category: 'Cérebro & Psicologia',
        teaser: 'Quando uma das mãos executa ações involuntárias contra o livre-arbítrio do paciente.',
        slug: 'a-sindrome-da-mao-anarquica-o-misterio-neurologico',
        imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80',
        connection: 'E a própria molécula da vida agora é usada para armazenar todo o conhecimento humano...'
      },
      {
        step: 4,
        title: 'Armazenamento em Fitas de DNA',
        category: 'Tecnologia & IA',
        teaser: '1 grama de biologia que armazena 215 Petabytes de dados por mais de 10.000 anos.',
        slug: 'computadores-de-dna-armazenamento-biologico-eterno',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        connection: 'Você descobriu a profunda interconexão entre fisiologia animal, mente e tecnologia!'
      }
    ]
  }
];

export const DiscoveryRoute: React.FC<DiscoveryRouteProps> = ({ onSelectCuriosity }) => {
  const [activeTrailIndex, setActiveTrailIndex] = useState(0);
  const currentTrail = DISCOVERY_TRAILS[activeTrailIndex];

  const handleStepClick = (slug: string) => {
    playPopSound();
    const found = ALL_CURIOSITIES.find(c => c.slug === slug);
    if (found) {
      onSelectCuriosity(found);
    }
  };

  return (
    <section className="py-12 bg-neutral-50/50 dark:bg-neutral-900/30 border-y border-neutral-200/80 dark:border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
              <Compass className="w-3.5 h-3.5" /> Trilhas de Descoberta Conectadas
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-neutral-900 dark:text-white">
              Rotas Temáticas de Exploração
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
              Navegue por fios narrativos que conectam fatos científicos, belezas africanas e segredos biológicos em uma sequência lógica de fascínio.
            </p>
          </div>

          {/* Trail Selection Tabs */}
          <div className="flex flex-wrap gap-2">
            {DISCOVERY_TRAILS.map((trail, index) => (
              <button
                key={trail.id}
                onClick={() => {
                  playPopSound();
                  setActiveTrailIndex(index);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTrailIndex === index
                    ? 'bg-amber-500 text-neutral-950 shadow-md scale-105'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                Trilha {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Trail Description Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">
              {currentTrail.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {currentTrail.description}
            </p>
          </div>
          <span className="hidden sm:flex items-center gap-1 text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" /> 4 Etapas
          </span>
        </div>

        {/* 4 Interactive Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentTrail.steps.map((stepItem, idx) => (
            <div
              key={stepItem.step}
              onClick={() => handleStepClick(stepItem.slug)}
              className="group relative bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-16/10 rounded-xl overflow-hidden mb-3 bg-neutral-100 dark:bg-neutral-800">
                  <ImageWithFallback
                    src={stepItem.imageUrl}
                    alt={stepItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Step Number Badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black text-xs flex items-center justify-center shadow">
                    {stepItem.step}
                  </div>

                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      {stepItem.category}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                  {stepItem.title}
                </h4>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {stepItem.teaser}
                </p>
              </div>

              {/* Connector note & CTA */}
              <div className="mt-4 pt-2.5 border-t border-neutral-100 dark:border-neutral-800">
                <div className="text-[10px] text-neutral-400 italic line-clamp-1 mb-1.5">
                  {stepItem.connection}
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
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
