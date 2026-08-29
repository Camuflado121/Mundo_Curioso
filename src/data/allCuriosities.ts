import { Category, Curiosity, Quiz, SpecialArticle } from '../types';
import { INITIAL_CATEGORIES, INITIAL_CURIOSITIES, INITIAL_QUIZZES, INITIAL_ARTICLES, DID_YOU_KNOW_FAST_FACTS } from './initialData';
import { ADDITIONAL_CURIOSITIES } from './moreCuriosities';

// Fresh, Deeply Researched Curated Curiosities
const FRESH_CURATED_FACTS: Curiosity[] = [
  {
    id: 'c24',
    slug: 'condensado-de-bose-einstein-o-quinto-estado-da-materia',
    title: 'Condensado de Bose-Einstein: O quinto estado da matéria onde átomos viram uma única onda gigante',
    summary: 'A um bilionésimo de grau acima do zero absoluto, milhares de átomos perdem sua identidade individual e comportam-se como um único superátomo sincronizado.',
    content: `Na física clássica, aprendemos que a matéria existe em três estados principais: sólido, líquido e gasoso, além do plasma em altas temperaturas. No entanto, em 1924, Satyendra Nath Bose e Albert Einstein previram a existência de um quinto estado exótico da matéria: o Condensado de Bose-Einstein (BEC).\n\nQuando gases de átomos como o rubídio são resfriados a temperaturas inacreditavelmente baixas — frações de bilionésimos de grau acima do Zero Absoluto (-273,15 °C) —, as leis da mecânica quântica assumem o controle da matéria em escala macroscópica.\n\nNessas condições extremas, o comprimento de onda quântico dos átomos expande-se até que todos os átomos começam a se sobrepor no espaço. Eles perdem completamente a sua identidade individual e colapsam no mesmo nível quântico fundamental de energia, agindo em uníssono perfeito como um único "superátomo" gigante macroscópico visível em câmeras de laboratório! O BEC permitiu desacelerar feixes de luz a meros 17 metros por segundo e até parar a luz completamente.`,
    categoryId: 'ciencia',
    categoryName: 'Ciência & Física',
    categoryIcon: 'Atom',
    tags: ['física-quântica', 'bose-einstein', 'zero-absoluto', 'ciência', 'mecânica-quântica'],
    author: 'Prof. Lucas Mendes',
    readTimeMinutes: 3,
    views: 47800,
    likes: 4230,
    shares: 1610,
    date: '2026-08-16',
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.nobelprize.org/prizes/physics/2001/press-release/',
    sourceName: 'The Nobel Prize in Physics 2001 - Bose-Einstein Condensation in Dilute Gases',
    didYouKnow: 'Cientistas na Estação Espacial Internacional criaram condensados de Bose-Einstein no Cold Atom Lab, aproveitando a microgravidade para manter os átomos suspensos sem interferência de forças gravitacionais por segundos.',
    funFactor: 98,
    relatedSlugs: ['fogo-frio-espacial-chamas-redondas-e-azuis-na-iss', 'vidro-5d-o-disco-de-cristal-eterno-de-360-terabytes']
  },
  {
    id: 'c25',
    slug: 'o-efeito-mpemba-por-que-agua-quente-congela-mais-rapido-que-a-fria',
    title: 'O Efeito Mpemba: O enigma de por que a água quente pode congelar mais rápido do que a água fria',
    summary: 'Observado por Aristóteles e redescoberto por um estudante tanzaniano em 1963, o fenômeno desafia a intuição térmica até hoje.',
    content: `Se você colocar dois recipientes idênticos com o mesmo volume de água no congelador — um com água fervente a 90 °C e outro com água fria a 20 °C —, a intuição básica da termodinâmica dita que a água fria congelará primeiro, pois tem menos energia térmica para perder até chegar a 0 °C.\n\nNo entanto, em 1963, um estudante secundarista da Tanzânia chamado Erasto Mpemba notou enquanto preparava sorvete caseiro que a mistura de leite e açúcar ainda quente congelava consideravelmente mais rápido do que a mistura fria. Ao questionar seu professor de física na época, foi ridicularizado; mas ao repetir os experimentos com o físico Denis Osborne, o fenômeno foi confirmado e batizado de "Efeito Mpemba".\n\nFísicos moleculares descobriram que o efeito decorre de uma combinação de fatores: maior taxa de evaporação (que reduz a massa líquida a ser resfriada), correntes de convecção térmica mais vigorosas na água quente e alterações no comportamento das ligações de hidrogênio entre as moléculas de H₂O quando aquecidas.`,
    categoryId: 'ciencia',
    categoryName: 'Ciência & Física',
    categoryIcon: 'Atom',
    tags: ['física', 'termodinâmica', 'efeito-mpemba', 'tanzânia', 'ciência-do-cotidiano'],
    author: 'Prof. Lucas Mendes',
    readTimeMinutes: 3,
    views: 43900,
    likes: 3880,
    shares: 1420,
    date: '2026-08-16',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.nature.com/articles/s41586-020-2560-x',
    sourceName: 'Nature Physics - Observation of the Mpemba Effect in Controlled Systems',
    didYouKnow: 'Filósofos da Antiguidade e cientistas pioneiros como Aristóteles, Francis Bacon e René Descartes já haviam registrado relatos do fenômeno séculos antes de Mpemba.',
    funFactor: 95,
    relatedSlugs: ['a-agua-ferve-a-71-graus-no-topo-do-monte-everest', 'condensado-de-bose-einstein-o-quinto-estado-da-materia']
  },
  {
    id: 'c26',
    slug: 'o-grande-atrator-a-forca-gravitacional-que-puxa-a-nossa-galaxia',
    title: 'O Grande Atrator: A misteriosa anomalia gravitacional que puxa a Via Láctea a 2 milhões de km/h',
    summary: 'Escondido atrás do disco de poeira da nossa galáxia, ele atrai centenas de milhares de galáxias inteiras em direção a um ponto oculto do universo.',
    content: `Quando astrofísicos mapearam a velocidade com que a Via Láctea e as galáxias vizinhas (como Andrômeda e o Grupo Local) se movem pelo espaço em relação à radiação cósmica de fundo, descobriram algo desconcertante: toda a nossa região cósmica está sendo arrastada a impressionantes 2,2 milhões de quilômetros por hora em direção a um ponto específico do espaço profundo.\n\nEssa anomalia de massa colossal recebeu o nome de "O Grande Atrator". Localizado a cerca de 220 milhões de anos-luz da Terra, na direção da constelação do Centauro, sua massa equivale a dezenas de milhares de galáxias concentradas juntas.\n\nO maior mistério é que o Grande Atrator repousa na chamada "Zona de Evitamento" — a região do céu obscurecida diretamente pela poeira densa e pelas estrelas do próprio disco central da Via Láctea, o que impede telescópios ópticos de enxergá-lo diretamente. Radiotelescópios e observatórios de raios-X revelaram que ele faz parte do colossal Superaglomerado de Laniakea, uma teia cósmica de 500 milhões de anos-luz de diâmetro que abriga mais de 100.000 galáxias.`,
    categoryId: 'espaco',
    categoryName: 'Espaço & Universo',
    categoryIcon: 'Sparkles',
    tags: ['grande-atrator', 'astrofísica', 'via-láctea', 'laniakea', 'cosmologia', 'universo'],
    author: 'Prof. Lucas Mendes',
    readTimeMinutes: 4,
    views: 49800,
    likes: 4420,
    shares: 1680,
    date: '2026-08-15',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.nature.com/articles/nature13674',
    sourceName: 'Nature - The Laniakea Supercluster of Galaxies',
    didYouKnow: 'O nome "Laniakea" significa "Céus incomensuráveis" na língua nativa havaiana, em homenagem aos navegadores polinésios que cruzavam o Pacífico guiando-se pelas estrelas.',
    funFactor: 98,
    relatedSlugs: ['estrelas-de-neutrons-uma-colher-pesa-um-bilhao-de-toneladas', '55-cancri-e-o-exoplaneta-de-diamante-macico']
  },
  {
    id: 'c27',
    slug: 'pinturas-rupestres-de-chinhamapere-manica-mocambique',
    title: 'Pinturas Rupestres de Chinhamapere: A arte de 10.000 anos gravada nas rochas sagradas de Manica',
    summary: 'Criadas pelos ancestrais caçadores-recolectores San em Moçambique, as figuras avermelhadas retratam ritos de xamanismo e animais sagrados que resistiram a milênios.',
    content: `Nas encostas da serra de Vumba, no distrito de Manica em Moçambique, localiza-se um dos sítios arqueológicos de arte rupestre mais bem preservados e venerados do continente africano: as Pinturas de Chinhamapere.\n\nDatadas de milhares de anos, as pinturas foram executadas em abrigos sob rocha de granito pelos povos ancestrais San (bosquímanos), utilizando pigmentos minerais naturais à base de óxido de ferro vermelho (ocre), gordura animal e seivas vegetais aglutinantes.\n\nOs painéis retratam silhuetas esguias de arqueiros em marcha de caça, figuras humanas em transe espiritual xamânico e manadas de antílopes sagrados (como o elande). Além de seu valor histórico e arqueológico inestimável como Monumento Nacional de Moçambique, Chinhamapere continua a ser um santuário sagrado vivo: até os dias de hoje, líderes tradicionais e comunidades locais realizam ali cerimônias de chuva e homenagens aos antepassados.`,
    categoryId: 'mocambique-africa',
    categoryName: 'Moçambique & África',
    categoryIcon: 'Globe2',
    tags: ['moçambique', 'manica', 'arqueologia', 'arte-rupestre', 'cultura-san', 'património'],
    author: 'Dra. Luísa Cossa',
    readTimeMinutes: 3,
    views: 42800,
    likes: 3790,
    shares: 1390,
    date: '2026-08-15',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.patrimonio.gov.mz',
    sourceName: 'Direcção Nacional do Património Cultural de Moçambique',
    didYouKnow: 'As tintas de ocre vermelho usadas pelos povos San penetraram de tal forma nos poros do granito que as pinturas resistiram intactas a milênios de chuvas e sol tropical sem perder a intensidade de cor.',
    funFactor: 96,
    relatedSlugs: ['a-danca-mapiko-e-a-arte-maconde-de-mocambique', 'monte-namuli-e-as-florestas-sagradas-de-mocambique']
  },
  {
    id: 'c28',
    slug: 'arquipelago-das-quirimbas-santuario-dos-dugongos-em-mocambique',
    title: 'Arquipélago das Quirimbas: O santuário de 32 ilhas de coral que protege os últimos Dugongos da África',
    summary: 'Ao largo de Cabo Delgado, as águas cristalinas e pradarias marinhas abrigam a espécie dócil que deu origem à lenda mitológica das sereias.',
    content: `Estendendo-se por cerca de 400 quilômetros ao longo do Oceano Índico na província de Cabo Delgado, o Arquipélago das Quirimbas é um dos conjuntos de ilhas de coral e manguezais mais espetaculares de todo o planeta.\n\nFormado por 32 ilhas paradisíacas e protegido em grande parte pelo Parque Nacional das Quirimbas (declarado Reserva da Biosfera pela UNESCO), o arquipélago abriga recifes de corais pristinos, tartarugas-de-pente e tartarugas-verdes, cardumes de tubarões-baleia e vastas pradarias submarinas de ervas marinhas.\n\nEssas pradarias são o habitat vital da última população viável e protegida de dugongos (*Dugong dugon*) de toda a costa oriental da África. Parentes dóceis e herbívoros dos peixes-bois que chegam a pesar 400 quilos, os dugongos alimentam-se tranquilamente nos canais calmos entre as ilhas e, quando amamentavam suas crias segurando-as na superfície, inspiraram marinheiros árabes e portugueses dos séculos passados a criarem as famosas lendas de sereias.`,
    categoryId: 'mocambique-africa',
    categoryName: 'Moçambique & África',
    categoryIcon: 'Globe2',
    tags: ['moçambique', 'quirimbas', 'dugongos', 'unesco', 'biodiversidade-marinha', 'natureza'],
    author: 'Dr. Armando Sitoe',
    readTimeMinutes: 4,
    views: 45100,
    likes: 4020,
    shares: 1480,
    date: '2026-08-14',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://en.unesco.org/biosphere/africa/quirimbas',
    sourceName: 'UNESCO Man and the Biosphere (MAB) Quirimbas Programme',
    didYouKnow: 'Os dugongos são os únicos mamíferos exclusivamente herbívoros de todo o mar e podem passar até 6 minutos submersos pastando no fundo do oceano.',
    funFactor: 97,
    relatedSlugs: ['montepuez-mocambique-a-maior-reserva-de-rubis-do-mundo', 'rios-e-lagos-submarinos-sob-o-oceano-profundo']
  },
  {
    id: 'c29',
    slug: 'a-ave-lira-soberba-e-a-imitacao-acustica-perfeita',
    title: 'A Ave-Lira Soberba: O pássaro capaz de imitar motosserras, alarmes de carro e a voz humana',
    summary: 'Nativa das florestas temperadas da Austrália, sua siringe biológica tem músculos independentes que reproduzem qualquer som gravado no ambiente.',
    content: `A ave-lira-soberba (*Menura novaehollandiae*), que habita o sub-bosque das florestas úmidas do sudeste da Austrália, é incontestavelmente o mímico acústico mais sofisticado e impressionante de todo o reino das aves.\n\nEnquanto a maioria dos pássaros canoros possui um órgão vocal (siringe) simples, a ave-lira desenvolveu o sistema de músculos vocais mais complexo e flexível de toda a ornitologia mundial. Cada músculo pode controlar lados diferentes da membrana vibratória de forma simultânea e independente.\n\nDurante o ritual de acasalamento, os machos abrem a cauda espetacular em formato de lira grega e cantam um repertório inacreditável: além de imitar o canto de mais de 20 outras espécies de aves com precisão milimétrica, a ave-lira reproduz sons mecânicos urbanos como cliques de obturador de câmeras fotográficas, motosserras cortando madeira, alarmes de segurança de carros e até conversas de trabalhadores florestais!`,
    categoryId: 'animais',
    categoryName: 'Animais & Natureza',
    categoryIcon: 'Flame',
    tags: ['ave-lira', 'ornitologia', 'acústica-animal', 'superpoderes-animais', 'biologia'],
    author: 'Marina Silveira',
    readTimeMinutes: 3,
    views: 48300,
    likes: 4310,
    shares: 1620,
    date: '2026-08-14',
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.audubon.org/news/the-remarkable-lyrebird-sound-mimic',
    sourceName: 'National Audubon Society Acoustic Mimicry in Birds',
    didYouKnow: 'Em santuários de vida selvagem na Austrália, filhotes de ave-lira aprenderam a canção que flautistas humanos tocavam na década de 1930 e continuam transmitindo a mesma melodia de geração para geração até hoje!',
    funFactor: 99,
    relatedSlugs: ['o-soco-do-camarao-mantis-luz-e-calor-do-sol', 'engenharia-viva-das-formigas-do-exercito-pontes-suspensas']
  },
  {
    id: 'c30',
    slug: 'inteligencia-dos-corvos-da-nova-caledonia-ferramentas',
    title: 'Corvos da Nova Caledônia: As aves que fabricam ferramentas e resolvem quebra-cabeças de 8 etapas',
    summary: 'Eles possuem raciocínio causal comparável ao de crianças de 7 anos e inventam ganchos de arame para alcançar alimentos escondidos.',
    content: `Por muitas décadas, a fabricação espontânea de ferramentas complexas era considerada um privilégio exclusivo dos seres humanos e de grandes primatas como os chimpanzés. Os corvos da Nova Caledônia (*Corvus moneduloides*) destruíram definitivamente essa fronteira científica.\n\nEm experimentos controlados em laboratórios das universidades de Oxford e Cambridge, corvos foram apresentados a problemas lógicos nunca antes vistos na natureza. Para alcançar um pedaço de carne no fundo de um tubo estreito, os pássaros selecionaram espontaneamente pedaços de arame reto e dobraram a ponta com o bico criando um gancho funcional sob medida.\n\nEm testes ainda mais exigentes com quebra-cabeças sequenciais de oito etapas — onde era necessário pegar um pedaço de pau pequeno para desobstruir uma pedra, colocar a pedra numa balança para liberar um graveto maior e só então alcançar o alimento —, os corvos planejaram mentalmente toda a sequência com antecedência, executando cada passo sem tentativas e erros aleatórios!`,
    categoryId: 'animais',
    categoryName: 'Animais & Natureza',
    categoryIcon: 'Flame',
    tags: ['corvos', 'inteligência-animal', 'cognição', 'neurociência', 'ferramentas-animais'],
    author: 'Marina Silveira',
    readTimeMinutes: 3,
    views: 46900,
    likes: 4180,
    shares: 1540,
    date: '2026-08-13',
    imageUrl: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.nature.com/articles/nature08988',
    sourceName: 'Nature - Multi-Step Problem Solving and Metatool Use by New Caledonian Crows',
    didYouKnow: 'Os corvos possuem uma densidade de neurônios no prosencéfalo significativamente maior do que a de primatas do mesmo tamanho, demonstrando que a inteligência não depende do tamanho bruto do crânio.',
    funFactor: 98,
    relatedSlugs: ['a-ave-lira-soberba-e-a-imitacao-acustica-perfeita', 'o-experimento-do-gorila-invisivel-cegueira-por-desatencao']
  },
  {
    id: 'c31',
    slug: 'a-verdade-sobre-o-incendio-da-biblioteca-de-alexandria',
    title: 'A Biblioteca de Alexandria: A verdade histórica sobre a perda dos 500.000 rolos de papiro',
    summary: 'Ao contrário do mito popular de um único incêndio devastador, o maior centro do saber antigo sofreu um declínio lento de 600 anos.',
    content: `A imagem dramática da Biblioteca Real de Alexandria sendo totalmente consumida por um único incêndio colossal em uma noite trágica faz parte do imaginário popular mundial. No entanto, pesquisas históricas e arqueológicas modernas revelam uma realidade muito mais complexa e melancólica.\n\nFundada no século III a.C. pela dinastia ptolomaica no Egito, a biblioteca chegou a abrigar mais de 500.000 rolos de papiro com as maiores obras de astronomia, matemática, medicina e literatura do Mediterrâneo.\n\nO imperador romano Júlio César acidentalmente queimou alguns depósitos navais no porto durante a guerra de 48 a.C., mas a biblioteca principal sobreviveu. O verdadeiro fim da biblioteca não foi um único cataclismo, mas sim um longo processo de seis séculos marcado por cortes sucessivos de verbas imperiais, conflitos religiosos, expurgos intelectuais e a deterioração natural dos papiros orgânicos sob a umidade do ar do Mediterrâneo sem copistas para renová-los.`,
    categoryId: 'historia',
    categoryName: 'História & Civilizações',
    categoryIcon: 'Landmark',
    tags: ['alexandria', 'egito-antigo', 'história', 'bibliotecas', 'mitos-históricos'],
    author: 'Gabriel Santos',
    readTimeMinutes: 4,
    views: 45700,
    likes: 4090,
    shares: 1470,
    date: '2026-08-13',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.britannica.com/topic/Library-of-Alexandria',
    sourceName: 'Encyclopaedia Britannica - The Fate of the Ancient Library of Alexandria',
    didYouKnow: 'No auge da biblioteca, todo navio que atracava no porto de Alexandria era obrigado por lei a entregar seus livros para que escribas reais fizessem cópias; muitas vezes o rei guardava o original e devolvia a cópia ao marinheiro!',
    funFactor: 96,
    relatedSlugs: ['mecanismo-de-anticitera-o-primeiro-computador-analogico-da-grecia', 'derinkuyu-a-cidade-subterranea-de-18-andares-na-turquia']
  },
  {
    id: 'c32',
    slug: 'sinestesia-cromestesica-ouvir-cores-e-ver-sons',
    title: 'Sinestesia Cromestésica: Quando o cérebro cruza os sentidos e as pessoas enxergam músicas como cores',
    summary: 'Em cerca de 4% da população, conexões neurais cruzadas fazem com que sons, notas de piano ou vozes acionem visões cromáticas no espaço.',
    content: `Imagine ouvir um acorde de piano em Si menor e instantaneamente ver uma névoa lilás-metálica flutuando diante de seus olhos, ou sentir o gosto de hortelã fresca sempre que escuta o nome "Guilherme". Essa experiência não é uma metáfora poética nem uma alucinação, mas uma condição neurológica real e documentada: a Sinestesia.\n\nNa forma mais famosa da condição, a Cromestesia (som-para-cor), estímulos auditivos ativam de forma automática e involuntária o córtex visual occipital do cérebro. Cientistas acreditam que todos os bebês humanos nascem com uma hiperconectividade entre as áreas sensoriais do cérebro; durante a infância, o processo de "poda sináptica" separa os sentidos, mas nos sinestetas essas pontes neurais permanecem ativas pela vida toda.\n\nGrandes gênios da música e da arte como Nikola Tesla, Wassily Kandinsky, Duke Ellington e Billie Eilish são sinestetas conhecidos que usam essa fusão sensorial para compor melodias e pinturas tridimensionais.`,
    categoryId: 'psicologia',
    categoryName: 'Cérebro & Psicologia',
    categoryIcon: 'Brain',
    tags: ['sinestesia', 'neurociência', 'cérebro', 'percepção', 'música', 'psicologia'],
    author: 'Dra. Beatriz Nogueira',
    readTimeMinutes: 3,
    views: 48900,
    likes: 4380,
    shares: 1670,
    date: '2026-08-12',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.nature.com/articles/nrn1706',
    sourceName: 'Nature Reviews Neuroscience - Cross-Activation Models of Synaesthesia',
    didYouKnow: 'Existe também a sinestesia léxico-gustativa, uma variante raríssima onde ler certas palavras evoca sensações gustativas físicas na língua, como sabor de chocolate ou bacon!',
    funFactor: 98,
    relatedSlugs: ['o-experimento-do-gorila-invisivel-cegueira-por-desatencao', 'tetracromatismo-humano-e-os-100-milhoes-de-cores']
  },
  {
    id: 'c33',
    slug: 'o-efeito-mandela-e-as-falsas-memorias-coletivas',
    title: 'O Efeito Mandela: Por que milhões de pessoas lembram exatamente da mesma mentira histórica?',
    summary: 'De frases famosas de cinema que nunca foram ditas até desenhos de personagens infantis, o cérebro humano preenche lacunas mentais em grupo.',
    content: `Em 2010, a escritora e pesquisadora de fenômenos cognitivos Fiona Broome descobriu que milhares de pessoas ao redor do globo compartilhavam com absoluta convicção a mesma memória: lembravam-se de Nelson Mandela ter falecido na prisão nos anos 1980, com direito a detalhes sobre reportagens de TV e discursos fúnebres de sua viúva (quando, na verdade, Mandela foi solto em 1990 e viveu até 2013). O mistério deu origem ao termo "Efeito Mandela".\n\nOutros exemplos clássicos incluem a famosa frase de Star Wars: quase todo mundo lembra de Darth Vader dizendo: "Luke, eu sou seu pai", quando a frase exata do filme é: "Não, eu sou seu pai". No desenho animado do Pica-Pau e no jogo Banco Imobiliário (Monopoly), milhões juram que o velhinho mascote usa um monóculo no olho — ele nunca usou!\n\nNeurocientistas explicam que a memória humana não é uma gravação em fita de vídeo, mas sim um processo reconstrutivo. Toda vez que você recorda um fato, seu cérebro recria a cena do zero, mesclando dados reais com pistas sociais, esquemas conceituais e influências de conversas alheias.`,
    categoryId: 'psicologia',
    categoryName: 'Cérebro & Psicologia',
    categoryIcon: 'Brain',
    tags: ['efeito-mandela', 'memória', 'psicologia-cognitiva', 'cérebro', 'ilusões-mentais'],
    author: 'Dra. Beatriz Nogueira',
    readTimeMinutes: 4,
    views: 52300,
    likes: 4710,
    shares: 1890,
    date: '2026-08-12',
    imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.psychologicalscience.org/observer/collective-false-memories',
    sourceName: 'Association for Psychological Science - False Memory Reconstruction',
    didYouKnow: 'No filme Casablanca (1942), a frase lendária "Toque de novo, Sam" (Play it again, Sam) jamais foi dita em nenhum segundo do roteiro original!',
    funFactor: 97,
    relatedSlugs: ['o-experimento-do-gorila-invisivel-cegueira-por-desatencao', 'sinestesia-cromestesica-ouvir-cores-e-ver-sons']
  },
  {
    id: 'c34',
    slug: 'o-peixe-caracol-das-marianas-vida-a-8000-metros-sob-pressao',
    title: 'O Peixe-Caracol das Marianas: O animal vertebrado que vive sob a pressão esmagadora de 8.000 metros',
    summary: 'Com corpo gelatinoso transparente e osmólitos especiais que impedem o colapso de proteínas, ele prospera onde submarinos comuns seriam implodidos.',
    content: `Na Fossa das Marianas, a mais de 8.000 metros abaixo da superfície do Oceano Pacífico, reina uma escuridão impenetrável e uma temperatura próxima a 1 °C. A pressão da coluna de água ultrapassa 800 vezes a pressão atmosférica do nível do mar — o equivalente a sustentar o peso de 1.600 elefantes adultos sobre o teto de um carro popular.\n\nNesse ambiente hostil onde a maioria dos ossos se fragmentaria, vive o *Pseudoliparis swirei* (o Peixe-Caracol das Marianas), o peixe vertebrado mais profundo já registrado na história da biologia.\n\nPara resistir à pressão extrema, sua evolução biológica eliminou escamas duras e bexiga natatória com ar (que implodiria instantaneamente). Seu esqueleto é composto quase exclusivamente por cartilagens ultraflexíveis e ossos parcialmente desmineralizados. Além disso, suas células contêm concentrações massivas de TMAO (óxido de trimetilamina), uma molécula protetora que impede que a pressão colossal esmague as proteínas vitais das células musculares e nervosas!`,
    categoryId: 'oceanos',
    categoryName: 'Oceanos & Abissal',
    categoryIcon: 'Waves',
    tags: ['fossa-das-marianas', 'peixe-caracol', 'abissal', 'biologia-marinha', 'oceanos'],
    author: 'Carlos Eduardo Marinho',
    readTimeMinutes: 3,
    views: 47100,
    likes: 4190,
    shares: 1560,
    date: '2026-08-11',
    imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://news.stanford.edu/2019/04/15/deepest-living-fish-reveals-secrets-ocean-trenches/',
    sourceName: 'Stanford University Hopkins Marine Station - The Mariana Snailfish',
    didYouKnow: 'Cientistas calculam que o limite biológico absoluto para qualquer criatura com espinha dorsal viver nos oceanos é de 8.200 metros de profundidade, exatamente onde o Peixe-Caracol reina supremo no topo da cadeia alimentar abissal.',
    funFactor: 98,
    relatedSlugs: ['rios-e-lagos-submarinos-sob-o-oceano-profundo', 'o-soco-do-camarao-mantis-luz-e-calor-do-sol']
  },
  {
    id: 'c35',
    slug: 'a-primeira-mensagem-da-arpanet-o-nascimento-da-internet',
    title: 'A Primeira Mensagem da Internet: Em 1969 o sistema travou após enviar apenas duas letras ("LO")',
    summary: 'Cientistas da UCLA tentavam digitar "LOGIN" para enviar a Stanford; o computador quebrou na letra G, mas inaugurou a era digital global.',
    content: `Às 22h30 do dia 29 de outubro de 1969, no laboratório de ciências da computação da Universidade da Califórnia em Los Angeles (UCLA), o professor Leonard Kleinrock e o estudante Charley Kline preparavam-se para realizar o primeiro teste de transmissão de dados entre computadores remotos da história através da rede ARPANET.\n\nO objetivo era digitar a palavra "LOGIN" em um terminal SDS Sigma 7 em Los Angeles e fazer as letras aparecerem na tela de um computador SDS 940 a mais de 560 quilômetros de distância, no Stanford Research Institute.\n\nKline digitou a letra 'L' e confirmou pelo telefone com Stanford: "Vocês receberam o L?" — "Sim, recebemos o L". Digitou a letra 'O': "Receberam o O?" — "Sim, recebemos o O". Quando Kline pressionou a tecla 'G', o sistema de memória de Stanford sofreu um overflow e caiu completamente! Assim, a primeiríssima mensagem transmitida pela precursora da Internet global foi o involuntário e profético "LO" (que em inglês arcaico significa "Contemple!").`,
    categoryId: 'tecnologia',
    categoryName: 'Tecnologia & IA',
    categoryIcon: 'Cpu',
    tags: ['internet', 'arpanet', 'história-da-tecnologia', 'computação', 'ucla'],
    author: 'Felipe Ramos',
    readTimeMinutes: 3,
    views: 46500,
    likes: 4120,
    shares: 1510,
    date: '2026-08-11',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.internethalloffame.org/official-biography-leonard-kleinrock/',
    sourceName: 'Internet Hall of Fame & UCLA Engineering Historical Archives',
    didYouKnow: 'Os primeiros roteadores da ARPANET eram chamados de IMPs (Interface Message Processors) e tinham o tamanho e o peso de uma geladeira doméstica blindada de aço.',
    funFactor: 97,
    relatedSlugs: ['vidro-5d-o-disco-de-cristal-eterno-de-360-terabytes', 'mecanismo-de-anticitera-o-primeiro-computador-analogico-da-grecia']
  },
  {
    id: 'c36',
    slug: 'as-pedras-deslizantes-do-vale-da-morte-racetrack-playa',
    title: 'As Pedras Deslizantes do Vale da Morte: O enigma secular das rochas que andam sozinhas no deserto',
    summary: 'Blocos de pedra de até 300 quilos movem-se por centenas de metros deixando trilhas marcadas na terra seca sem qualquer ação humana.',
    content: `No leito de um lago seco isolado cercado por montanhas no Parque Nacional do Vale da Morte (Califórnia), conhecido como Racetrack Playa, ocorre um dos fenômenos geológicos mais intrigantes do planeta: centenas de rochas pesadas deslocam-se pela lama seca, esculpindo trilhas longas e sinuosas no solo que chegam a centenas de metros de extensão.\n\nDurante mais de um século, desde o início dos anos 1900, dezenas de teorias conspiratórias e hipóteses gravitacionais tentaram explicar o movimento das pedras sem sucesso, já que ninguém jamais as havia testemunhado em movimento em tempo real.\n\nO mistério só foi definitivamente solucionado em 2014 por oceanógrafos da Scripps Institution of Oceanography, que instalaram pedras com sensores GPS de precisão e câmeras com lapso de tempo. Eles comprovaram que, em noites raras de inverno, uma fina lâmina de água de chuva congela em placas de gelo flutuantes da espessura de uma janela. Ao meio-dia, quando o sol derrete o gelo em fragmentos, ventos suaves empurram as placas de gelo que agem como velas náuticas, deslizando as pedras de 300 kg sobre o leito de lama lubrificada!`,
    categoryId: 'misterios',
    categoryName: 'Mistérios & Fenômenos',
    categoryIcon: 'Compass',
    tags: ['vale-da-morte', 'pedras-deslizantes', 'geologia', 'mistérios-da-terra', 'ciência'],
    author: 'Carlos Eduardo Marinho',
    readTimeMinutes: 4,
    views: 49400,
    likes: 4370,
    shares: 1680,
    date: '2026-08-10',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0105948',
    sourceName: 'PLOS ONE - Sliding Rocks on Racetrack Playa, Death Valley National Park',
    didYouKnow: 'As pedras movem-se a uma velocidade de 2 a 5 metros por minuto, de forma tão silenciosa e lenta que um observador a 20 metros de distância mal perceberia o movimento a olho nu.',
    funFactor: 98,
    relatedSlugs: ['o-olho-do-saara-a-misteriosa-estrutura-de-richat', 'a-cratera-de-darvaza-as-portas-do-inferno-no-deserto']
  },
  {
    id: 'c37',
    slug: 'o-osso-hioide-o-unico-osso-flutuante-que-permite-a-fala-humana',
    title: 'O Osso Hioide: O único osso flutuante do corpo humano que tornou possível a linguagem falada',
    summary: 'Localizado na garganta, ele não se conecta a nenhum outro osso do esqueleto e ancora a língua e a caixa vocal com precisão milimétrica.',
    content: `O esqueleto de um ser humano adulto é composto por 206 ossos, quase todos conectados entre si por meio de articulações sinoviais, cartilagens ou suturas ósseas rígidas. No entanto, existe uma notável e solitária exceção: o Osso Hioide.\n\nCom formato anatômico em ferradura ou na letra grega "ípsilon" (υ), o hioide repousa na parte anterior do pescoço, entre a mandíbula e a cartilagem tireoide da laringe. Ele é o único osso de todo o corpo que não faz contato articular direto com nenhum outro osso do esqueleto, mantendo-se perfeitamente suspenso e "flutuando" no tecido através de uma complexa rede de ligamentos e músculos cervicais.\n\nEssa mobilidade única foi a maior revolução da evolução humana: ao funcionar como a âncora biomecânica da língua e do trato vocal, o osso hioide permitiu a modulação de uma gama infinita de frequências sonoras, transformando grunhidos em palavras articuladas complexas e tornando possível o surgimento da linguagem falada na nossa espécie!`,
    categoryId: 'corpo-humano',
    categoryName: 'Corpo Humano & Saúde',
    categoryIcon: 'HeartPulse',
    tags: ['anatomia', 'corpo-humano', 'evolução-humana', 'osso-hioide', 'linguagem', 'medicina'],
    author: 'Dra. Luísa Cossa',
    readTimeMinutes: 3,
    views: 44600,
    likes: 3950,
    shares: 1420,
    date: '2026-08-10',
    imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.nature.com/articles/ncomms3926',
    sourceName: 'Nature Communications - Micro-Biomechanics of the Neanderthal Hyoid Bone',
    didYouKnow: 'A descoberta de ossos hioides idênticos aos humanos modernos em fósseis de Neandertais de 60.000 anos comprovou que nossos primos arcaicos já possuíam a capacidade anatômica de falar línguas complexas.',
    funFactor: 97,
    relatedSlugs: ['a-regeneracao-do-figado-humano-e-o-mito-de-prometeu', 'tetracromatismo-humano-e-os-100-milhoes-de-cores']
  },
  {
    id: 'c38',
    slug: 'a-hiperinflacao-hungara-de-1946-cedula-de-100-quintilhoes',
    title: 'A Hiperinflação Húngara de 1946: Quando foi impressa a cédula de 100 quintilhões de Pengős',
    summary: 'Os preços dobravam a cada 15 horas; o governo emitia notas com 20 zeros e vassouras varriam pilhas de dinheiro inútil na sarjeta.',
    content: `Após o fim da Segunda Guerra Mundial, a Hungria vivenciou a mais extrema, violenta e surreal espiral hiperinflacionária de toda a história econômica mundial, superando com folga os casos da Alemanha de Weimar em 1923 ou do Zimbábue nos anos 2000.\n\nEntre 1945 e julho de 1946, a taxa diária de inflação na Hungria chegou a inacreditáveis 207% ao dia. Isso significava que os preços de itens essenciais como pão e leite dobravam a cada 15 horas! Os trabalhadores exigiam receber o salário duas vezes ao dia e corriam às lojas durante o almoço, pois à noite seu dinheiro já havia perdido metade do valor de compra.\n\nO Banco Central húngaro foi forçado a criar novas denominações monetárias vertiginosas, culminando na impressão da cédula de 100 quintilhões de Pengős (100.000.000.000.000.000.000 pengős). Quando o Forint foi introduzido em agosto de 1946 para estabilizar a economia, a taxa de conversão oficial foi de 1 Forint para 400 octilhões (4 × 10²⁹) de pengős velhos!`,
    categoryId: 'economia',
    categoryName: 'Dinheiro & Negócios',
    categoryIcon: 'Coins',
    tags: ['hiperinflação', 'hungria', 'economia', 'história-do-dinheiro', 'finanças'],
    author: 'Renato Furtado',
    readTimeMinutes: 3,
    views: 47200,
    likes: 4180,
    shares: 1540,
    date: '2026-08-09',
    imageUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.cato.org/cato-journal/fall-2008/roubini-measuring-hyperinflations',
    sourceName: 'Cato Institute & Global Financial Data - The Great Hungarian Hyperinflation',
    didYouKnow: 'No auge da crise, o papel onde as cédulas eram impressas valia mais do que o valor nominal escrito na nota; garis varriam montanhas de dinheiro jogadas no lixo das calçadas de Budapeste.',
    funFactor: 96,
    relatedSlugs: ['a-febre-das-tulipas-a-primeira-bolha-especulativa-de-1637', 'as-pedras-rai-moedas-de-calcario-de-4-toneladas']
  },
  {
    id: 'c39',
    slug: 'o-codigo-navajo-da-segunda-guerra-mundial-a-cifra-invicta',
    title: 'O Código Navajo da Segunda Guerra: A única cifra militar criptográfica que nunca foi decifrada',
    summary: '29 fuzileiros navais indígenas dos EUA criaram um código oral usando a língua nativa Navajo que transmitia ordens secretas em 20 segundos.',
    content: `Durante a Segunda Guerra Mundial no Teatro de Operações do Pacífico, as forças japonesas contavam com especialistas criptoanalistas fluentes em inglês que quebravam todos os códigos de comunicação das forças aliadas em questão de horas, prevendo desembarques anfíbios e bombardeios aéreos.\n\nTudo mudou quando o generalato do Corpo de Fuzileiros Navais dos EUA recrutou 29 indígenas da nação Navajo para desenvolver um código secreto tático baseado em sua complexa língua nativa (Diné bizaad) — uma língua estritamente tonal, sem alfabeto escrito formal na época e com gramática incompreensível para quem não fosse nativo.\n\nOs "Code Talkers" memorizaram termos militares associando palavras navajo a equipamentos de guerra: um submarino virava "Besh-lo" (peixe de ferro), um avião bombardeiro virava "Gini" (falcão-da-noite) e a América virava "Ne-he-mah" (nossa mãe). Enquanto as máquinas mecânicas de criptografia demoravam 30 minutos para codificar e decodificar três linhas de texto, os operadores navajo transmitiam e traduziam as mensagens por rádio em meros 20 segundos. O código permaneceu 100% indecifrado durante toda a guerra!`,
    categoryId: 'linguagem-cultura',
    categoryName: 'Idiomas & Cultura',
    categoryIcon: 'BookOpen',
    tags: ['código-navajo', 'segunda-guerra', 'criptografia', 'linguística', 'história-militar'],
    author: 'Renato Furtado',
    readTimeMinutes: 4,
    views: 48500,
    likes: 4290,
    shares: 1610,
    date: '2026-08-09',
    imageUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.archives.gov/education/lessons/code-talkers',
    sourceName: 'US National Archives & Marine Corps History Division - Navajo Code Talkers',
    didYouKnow: 'Na sangrenta Batalha de Iwo Jima, seis operadores de código Navajo trabalharam ininterruptamente durante 48 horas enviando mais de 800 mensagens sem cometer um único erro!',
    funFactor: 98,
    relatedSlugs: ['silbo-gomero-o-idioma-assobiado-das-ilhas-canarias', 'mecanismo-de-anticitera-o-primeiro-computador-analogico-da-grecia']
  }
];

export const ALL_CURIOSITIES: Curiosity[] = [
  ...INITIAL_CURIOSITIES,
  ...ADDITIONAL_CURIOSITIES,
  ...FRESH_CURATED_FACTS
];

export const ALL_CATEGORIES: Category[] = INITIAL_CATEGORIES.map(cat => ({
  ...cat,
  count: ALL_CURIOSITIES.filter(c => c.categoryId === cat.id).length || cat.count
}));

export const ALL_QUIZZES: Quiz[] = [
  ...INITIAL_QUIZZES
];

export const ALL_ARTICLES: SpecialArticle[] = [
  ...INITIAL_ARTICLES
];

// Helper query utilities
export function getCuriosityBySlug(slug: string): Curiosity | undefined {
  return ALL_CURIOSITIES.find(c => c.slug === slug || c.id === slug);
}

export function getRandomCuriosity(excludeSlug?: string): Curiosity {
  const pool = excludeSlug ? ALL_CURIOSITIES.filter(c => c.slug !== excludeSlug) : ALL_CURIOSITIES;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex] || ALL_CURIOSITIES[0];
}

export function getDailyCuriosity(): Curiosity {
  const daily = ALL_CURIOSITIES.find(c => c.isDaily);
  return daily || ALL_CURIOSITIES[0];
}

export function getRelatedCuriosities(curiosity: Curiosity, limit: number = 3): Curiosity[] {
  // First match relatedSlugs, then same category, then others
  const relatedFromSlugs = (curiosity.relatedSlugs || [])
    .map(slug => getCuriosityBySlug(slug))
    .filter((c): c is Curiosity => !!c && c.id !== curiosity.id);

  if (relatedFromSlugs.length >= limit) {
    return relatedFromSlugs.slice(0, limit);
  }

  const fromCategory = ALL_CURIOSITIES.filter(
    c => c.categoryId === curiosity.categoryId && c.id !== curiosity.id && !relatedFromSlugs.some(r => r.id === c.id)
  );

  const combined = [...relatedFromSlugs, ...fromCategory];
  if (combined.length >= limit) {
    return combined.slice(0, limit);
  }

  const others = ALL_CURIOSITIES.filter(
    c => c.id !== curiosity.id && !combined.some(r => r.id === c.id)
  );

  return [...combined, ...others].slice(0, limit);
}
