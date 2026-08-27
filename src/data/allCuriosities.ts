import { Category, Curiosity, Quiz, SpecialArticle } from '../types';
import { INITIAL_CATEGORIES, INITIAL_CURIOSITIES, INITIAL_QUIZZES, INITIAL_ARTICLES, DID_YOU_KNOW_FAST_FACTS } from './initialData';
import { ADDITIONAL_CURIOSITIES } from './moreCuriosities';

// Generate more curated facts to reach 50+ total facts
const EXTRA_CURATED_FACTS: Curiosity[] = [
  {
    id: 'c36',
    slug: 'os-flamingos-bebem-agua-fervendo-e-comem-com-a-cabeca-para-baixo',
    title: 'Flamingos: Os pássaros que bebem água quase fervendo e filtram comida de cabeça para baixo',
    summary: 'Eles prosperam em lagos alcalinos cáusticos na África que queimariam a pele de outros animais em minutos.',
    content: `Os flamingos são conhecidos por sua graciosa plumagem cor-de-rosa, mas a sua anatomia é uma das mais extremas e bizarras de todas as aves do mundo.\n\nEles habitam alguns dos lagos mais inóspitos do planeta, como o Lago Natron na Tanzânia e lagos vulcânicos da África Oriental, onde as águas são tão alcalinas e cáusticas (com pH de até 10,5) que a pele humana sofreria queimaduras severas. As pernas dos flamingos são cobertas por escamas grossas e resistentes que impedem que o sal cáustico queime seus tecidos.\n\nAlém disso, flamingos bebem água fresca diretamente de gêiseres e fontes termais borbulhantes a temperaturas próximas à fervura. Quando se alimentam de algas e pequenos crustáceos (ricos em carotenoides, que dão a cor rosa às penas), eles dobram o pescoço e colocam o bico completamente de cabeça para baixo dentro da água, utilizando a língua carnuda como um pistão mecânico que filtra até 20 goles por segundo!`,
    categoryId: 'animais',
    categoryName: 'Animais & Natureza',
    categoryIcon: 'Flame',
    tags: ['flamingos', 'aves', 'áfrica', 'biologia', 'natureza'],
    author: 'Marina Silveira',
    readTimeMinutes: 3,
    views: 25400,
    likes: 2180,
    shares: 680,
    date: '2026-07-18',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.audubon.org/birds/flamingo-adaptations',
    sourceName: 'National Audubon Society Bird Studies',
    didYouKnow: 'Os filhotes de flamingo nascem com penas cinza-esbranquiçadas e só adquirem a cor rosa após cerca de dois anos se alimentando de camarões e algas com betacaroteno.',
    funFactor: 92,
    relatedSlugs: ['os-polvos-possuem-tres-coracoes-e-sangue-azul', 'a-agua-viva-que-pode-viver-para-sempre']
  },
  {
    id: 'c37',
    slug: 'a-batalha-das-laranjas-de-ivrea-na-italia',
    title: 'A Batalha das Laranjas em Ivrea: A maior guerra gastronômica do mundo com 500 toneladas de frutas',
    summary: 'Todos os anos, moradores da cidade italiana recriam uma rebelião medieval arremessando laranjas com capacetes e armaduras.',
    content: `Na pequena e charmosa cidade histórica de Ivrea, no norte da Itália, o carnaval anual não é comemorado com confetes ou serpentinas, mas sim com uma autêntica e estrondosa batalha medieval travada com mais de 500.000 quilos de laranjas frescas.\n\nA "Battaglia delle Arance" comemora uma lendária insurreição popular do século XII, quando a filha de um moleiro local, Violetta, recusou-se a se submeter ao tirano da cidade e cortou a cabeça do nobre opressor, incitando os cidadãos a se rebelarem contra os guardas do castelo.\n\nDurante três dias intensos, nove equipes a pé armadas até os dentes com caixas de laranjas atacam carroças com soldados blindados em pesados capacetes de couro. As ruas de Ivrea cobrem-se com um tapete espesso de meio metro de polpa e suco de laranja perfumado, atraindo dezenas de milhares de turistas e gastrônomos de todo o mundo.`,
    categoryId: 'linguagem-cultura',
    categoryName: 'Idiomas & Cultura',
    categoryIcon: 'BookOpen',
    tags: ['italia', 'cultura', 'tradições-estranhas', 'festivais', 'história'],
    author: 'Renato Furtado',
    readTimeMinutes: 3,
    views: 21900,
    likes: 1840,
    shares: 610,
    date: '2026-07-17',
    imageUrl: 'https://images.unsplash.com/photo-1547517023-7ca0c162fbd1?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.storicocarnevaleivrea.it',
    sourceName: 'Storico Carnevale di Ivrea Official Archives',
    didYouKnow: 'Se você visitar a cidade e não quiser levar uma laranjada no rosto, deve usar um barrete vermelho frígio tradicional ("berretto frigio"), que marca os espectadores neutros!',
    funFactor: 93,
    relatedSlugs: ['as-pedras-rai-moedas-de-calcario-de-4-toneladas', 'o-mel-nunca-estraga-pote-de-3000-anos-no-egito']
  },
  {
    id: 'c38',
    slug: 'como-a-aspirina-surgiu-da-casca-do-salgueiro-ha-3500-anos',
    title: 'A casca de salgueiro e a Aspirina: Como um remédio dos papiros egípcios virou o remédio mais tomado do mundo',
    summary: 'Hipócrates já prescrevia chá de casca de salgueiro para dores de parto em 400 a.C. No final do século XIX, a Bayer sintetizou o ácido acetilsalicílico.',
    content: `A aspirina é um dos medicamentos mais consumidos e produzidos em massa na história da civilização humana, com mais de 40.000 toneladas de comprimidos fabricados todos os anos. No entanto, o princípio ativo não foi inventado em um laboratório moderno com computadores, mas sim descoberto na natureza há mais de 3.500 anos.\n\nO Papiro de Ebers, um tratado médico do Egito Antigo datado de cerca de 1534 a.C., já mencionava o uso da casca da árvore de salgueiro (Salix alba) para reduzir a febre e aliviar dores inflamatórias. Séculos depois, o pai da medicina grega, Hipócrates, receitava folhas e cascas de salgueiro moídas para mulheres em trabalho de parto.\n\nEm 1897, o químico alemão Felix Hoffmann, trabalhando nos laboratórios da farmacêutica Bayer, procurava um remédio para aliviar as dores severas de artrite de seu pai que não irritasse o estômago. Ele acetilou a molécula de ácido salicílico extraída do salgueiro, criando o ácido acetilsalicílico (AAS) sintético puro, registrando o nome comercial patenteado "Aspirin" que mudou a história da medicina global.`,
    categoryId: 'corpo-humano',
    categoryName: 'Corpo Humano & Saúde',
    categoryIcon: 'HeartPulse',
    tags: ['medicina', 'história-da-ciência', 'aspirina', 'farmácia', 'saúde'],
    author: 'Dra. Luísa Cossa',
    readTimeMinutes: 3,
    views: 27800,
    likes: 2310,
    shares: 740,
    date: '2026-07-16',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3833503/',
    sourceName: 'National Institutes of Health (NIH) Medical History Archives',
    didYouKnow: 'A aspirina foi levada pelos astronautas da Apollo 11 em seu kit médico oficial quando Neil Armstrong e Buzz Aldrin pisaram na Lua em 1969.',
    funFactor: 91,
    relatedSlugs: ['o-coracao-humano-gera-pressao-para-espirrar-sangue-a-9-metros', 'o-mel-nunca-estraga-pote-de-3000-anos-no-egito']
  },
  {
    id: 'c39',
    slug: 'a-ponte-maputo-katembe-a-maior-ponte-suspensa-da-africa',
    title: 'Ponte Maputo-Katembe: A maior ponte suspensa de toda a África e a transformação da capital moçambicana',
    summary: 'Com um vão suspenso de 680 metros sobre a Baía de Maputo, esta colossal obra de engenharia uniu o norte e o sul do país.',
    content: `Inaugurada em 2018 na capital de Moçambique, a Ponte Maputo-Katembe é um dos maiores marcos da engenharia civil moderna em todo o continente africano. Com um vão central suspenso de 680 metros de comprimento sobre a Baía de Maputo e torres monumentais de concreto armado que se elevam a mais de 140 metros de altura, ela ostenta o título de maior ponte suspensa de África.\n\nAntes da sua construção, a travessia de passageiros e mercadorias entre o centro histórico de Maputo e a península de Katembe dependia de balsas lentas (ferryboats) que frequentemente sofriam atrasos ou paravam durante tempestades no canal marítimo.\n\nA ponte reduziu o tempo de viagem de várias horas para menos de 10 minutos e abriu uma rota direta asfaltada até a Reserva Especial de Maputo e a fronteira com a África do Sul (Kosi Bay), impulsionando o ecoturismo, o comércio transfronteiriço e a integração regional do sul da África.`,
    categoryId: 'mocambique-africa',
    categoryName: 'Moçambique & África',
    categoryIcon: 'Globe2',
    tags: ['moçambique', 'engenharia', 'maputo', 'infraestrutura', 'pontes', 'áfrica'],
    author: 'Dr. Armando Sitoe',
    readTimeMinutes: 3,
    views: 31200,
    likes: 2870,
    shares: 980,
    date: '2026-07-15',
    imageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.infrastructure-mozambique.org',
    sourceName: 'Ministério das Obras Públicas de Moçambique',
    didYouKnow: 'Os cabos principais de aço que sustentam o tabuleiro da ponte contêm fios de aço que, somados ponta a ponta, dariam para contornar a Terra várias vezes!',
    funFactor: 94,
    relatedSlugs: ['ilha-de-mocambique-a-ponte-historica-entre-continentes', 'monte-namuli-e-as-florestas-sagradas-de-mocambique']
  },
  {
    id: 'c40',
    slug: 'por-que-as-pipocas-estouram-a-pressao-interna-do-vapor',
    title: 'A física da pipoca: Por que o milho explode e dá uma pirueta no ar a 180 °C',
    summary: 'Cada grão de milho de pipoca é uma minúscula panela de pressão natural contendo uma gota de água e amido duro.',
    content: `O milho de pipoca (Zea mays everta) é a única variedade de milho capaz de estourar e transformar-se no aperitivo estaladiço que consumimos nos cinemas. O segredo está na anatomia única da sua casca externa (pericarpo).\n\nAo contrário do milho verde comum, a casca da pipoca é extremamente densa e quase 100% impermeável à água. No centro de cada grão existe uma minúscula gota de água líquida (cerca de 14% da massa do grão) cercada por amido cristalino duro.\n\nQuando o grão é aquecido na panela ou no micro-ondas a cerca de 180 °C, a gota de água interna transforma-se em vapor superaquecido sob altíssima pressão (ultrapassando 9,3 atmosferas ou 135 psi — mais que o dobro da pressão do pneu de um carro!). A essa temperatura e pressão, o amido derrete em uma massa gelatinosa incandescente. Quando a casca finalmente cede e rompe com o clássico estalo "pop", o vapor expande-se violentamente para fora, resfriando o amido instantaneamente em uma espuma branca aerada em frações de segundo, catapultando a pipoca no ar!`,
    categoryId: 'ciencia',
    categoryName: 'Ciência & Física',
    categoryIcon: 'Atom',
    tags: ['física', 'culinária', 'química', 'curiosidades-do-cotidiano', 'pipoca'],
    author: 'Prof. Lucas Mendes',
    readTimeMinutes: 3,
    views: 29400,
    likes: 2510,
    shares: 890,
    date: '2026-07-14',
    imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://royalsocietypublishing.org/doi/10.1098/rsif.2014.1247',
    sourceName: 'Journal of the Royal Society Interface Physics of Popcorn',
    didYouKnow: 'Câmeras de altíssima velocidade (10.000 quadros por segundo) mostraram que o salto acrobático da pipoca ocorre porque ela cria uma "perninha" de amido que chuta o fundo da panela como um trampolim!',
    funFactor: 95,
    relatedSlugs: ['o-mel-nunca-estraga-pote-de-3000-anos-no-egito', 'o-coracao-humano-gera-pressao-para-espirrar-sangue-a-9-metros']
  },
  {
    id: 'c41',
    slug: 'a-aurora-boreal-sonora-e-os-estalos-gravados-na-finlandia',
    title: 'O som secreto da Aurora Boreal: Os cientistas gravaram estalos e sussurros a 70 metros do solo',
    summary: 'Durante séculos tribos árticas contavam histórias sobre o som das auroras, mas apenas recentemente microfones acústicos comprovaram a existência do fenômeno.',
    content: `Durante séculos, exploradores polares e os povos Sami da Lapônia afirmavam que, durante noites de intensas auroras boreais no inverno, era possível ouvir murmúrios, zumbidos e estalos semelhantes a fósforos riscando no céu noturno. Por gerações, físicos descartaram os relatos como alucinações auditivas causadas pelo frio extremo e pelo silêncio opressor da tundra ártica.\n\nNo entanto, pesquisadores da Universidade de Aalto na Finlândia instalaram microfones acústicos de ultra-alta sensibilidade e comprovaram que o som é real. Ele é gerado por uma camada de inversão térmica na atmosfera a cerca de 70 a 100 metros de altitude.\n\nDurante tempestades geomagnéticas severas provocadas pelo vento solar, cargas elétricas se acumulam na camada de ar quente e descarregam repentinamente através do ar frio inferior, produzindo microdescargas de eletricidade estática que o ouvido humano capta como estalos metálicos e estática sussurrada!`,
    categoryId: 'misterios',
    categoryName: 'Mistérios & Fenômenos',
    categoryIcon: 'Compass',
    tags: ['aurora-boreal', 'acústica', 'finlândia', 'física-atmosférica', 'mistérios-da-natureza'],
    author: 'Carlos Eduardo Marinho',
    readTimeMinutes: 3,
    views: 34100,
    likes: 2980,
    shares: 1050,
    date: '2026-08-23',
    imageUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.aalto.fi/en/news/auroral-sounds-and-geomagnetic-disturbances',
    sourceName: 'Aalto University Department of Signal Processing and Acoustics',
    didYouKnow: 'O som da aurora acontece ao mesmo tempo em que você vê as luzes verdes e violetas dançarem, mesmo que a própria aurora ocorra a mais de 100 km de altitude no espaço!',
    funFactor: 96,
    relatedSlugs: ['buracos-negros-emitem-o-som-mais-grave-do-universo', 'a-floresta-dancante-da-polonia-curva-de-90-graus']
  },
  {
    id: 'c42',
    slug: 'a-bateria-de-bagda-eletricidade-na-antiguidade-persa',
    title: 'A Bateria de Bagdá: O vaso de 2.000 anos que gerava corrente elétrica na Antiguidade',
    summary: 'Descoberto no Iraque em 1936, este cilindro de cobre e haste de ferro dentro de um pote de argila funcionava exatamente como uma pilha galvânica moderna.',
    content: `Em 1936, durante escavações arqueológicas no sítio histórico de Khujut Rabu, perto de Bagdá, o arqueólogo austríaco Wilhelm König encontrou um artefato enigmático pertencente ao período do Império Parta ou Sassânida (cerca de 250 a.C. a 224 d.C.).\n\nO objeto consistia em um vaso de cerâmica de terracota amarela de 13 cm de altura selado com betume natural (asfalto). Dentro do vaso estava encaixado um cilindro oco feito de chapa de cobre puro e, no centro do cilindro, suspensa por betume isolante, uma haste maciça de ferro forjado.\n\nQuando engenheiros modernos recriaram réplicas exatas do vaso e as preencheram com eletrólitos comuns da época antiga (como suco de uva fermentado, vinagre ou suco de limão), a célula eletroquímica produziu instantaneamente uma tensão elétrica estável entre 0,8 e 1,5 volts. Historiadores acreditam que os artesãos da antiga Mesopotâmia utilizavam essas baterias em série para realizar eletrodeposição galvânica (dourar estátuas de cobre com uma camada finíssima de ouro puro) ou para fins de alívio de dores na medicina sacerdotal!`,
    categoryId: 'historia',
    categoryName: 'História & Civilizações',
    categoryIcon: 'Landmark',
    tags: ['arqueologia', 'eletricidade', 'mesopotâmia', 'história-antiga', 'bateria-de-bagdá'],
    author: 'Gabriel Santos',
    readTimeMinutes: 4,
    views: 37600,
    likes: 3120,
    shares: 1140,
    date: '2026-08-22',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.smithsonianmag.com/history/unraveling-the-mystery-of-the-baghdad-battery-929342/',
    sourceName: 'Smithsonian Magazine Historical Investigations',
    didYouKnow: 'Luigi Galvani e Alessandro Volta só redescobriram oficialmente a pilha elétrica na Europa moderna no final do século XVIII, mais de 1.800 anos depois dos artesãos de Bagdá!',
    funFactor: 95,
    relatedSlugs: ['como-a-aspirina-surgiu-da-casca-do-salgueiro-ha-3500-anos', 'o-mel-nunca-estraga-pote-de-3000-anos-no-egito']
  },
  {
    id: 'c43',
    slug: 'a-grande-muralha-verde-de-africa-8000-km-de-arvores',
    title: 'A Grande Muralha Verde de África: O monumento vivo de 8.000 km que está a vencer o Saara',
    summary: 'Cruzando 11 países do Senegal ao Djibuti, este megaprojeto de reflorestamento com acácias nativas está a restaurar 100 milhões de hectares de terra fértil.',
    content: `Ao longo de toda a faixa do Sahel — a fronteira semiárida que separa o Deserto do Saara das savanas tropicais africanas —, a União Africana lidera a construção da maior estrutura viva e ecológica já criada pela humanidade: a Grande Muralha Verde (Great Green Wall).\n\nCom 8.000 quilômetros de comprimento e 15 quilômetros de largura, a faixa verde atravessa 11 nações africanas desde a costa do Oceano Atlântico no Senegal até o Mar Vermelho no Djibuti. O objetivo é restaurar 100 milhões de hectares de terras degradadas e sequestrar 250 milhões de toneladas de carbono da atmosfera até 2030.\n\nEm vez de plantar monoculturas exóticas, o projeto utiliza árvores nativas altamente resilientes como a acácia (Acacia senegal), que fixa nitrogênio no solo, produz goma arábica comercializável e cria um microclima úmido que permite o retorno de nascentes de água, hortas comunitárias e animais selvagens que haviam desaparecido há décadas.`,
    categoryId: 'mocambique-africa',
    categoryName: 'Moçambique & África',
    categoryIcon: 'Globe2',
    tags: ['áfrica', 'meio-ambiente', 'ecologia', 'muralha-verde', 'sahel', 'reflorestamento'],
    author: 'Dr. Armando Sitoe',
    readTimeMinutes: 4,
    views: 41900,
    likes: 3650,
    shares: 1420,
    date: '2026-08-23',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.greatgreenwall.org',
    sourceName: 'African Union Great Green Wall Initiative & UNCCD',
    didYouKnow: 'Quando estiver totalmente concluída, a Grande Muralha Verde será três vezes maior que a Grande Barreira de Corais da Austrália!',
    funFactor: 97,
    relatedSlugs: ['monte-namuli-e-as-florestas-sagradas-de-mocambique', 'ponte-maputo-katembe-a-maior-ponte-suspensa-da-africa']
  },
  {
    id: 'c44',
    slug: 'o-peixe-caracol-das-marianas-vida-a-8000-metros-sob-pressao',
    title: 'O Peixe-Caracol das Marianas: O vertebrado que vive a 8.000 metros sob pressão de 1.000 atmosferas',
    summary: 'Com corpo gelatinoso transparente e crânio flexível, ele prospera em profundidades onde ossos normais se esmigalhariam instantaneamente.',
    content: `Na escuridão eterna da Fossa das Marianas, a mais de 8.000 metros de profundidade na zona hadal, a pressão hidrostática exercida pela coluna d'água ultrapassa 1.000 vezes a pressão atmosférica ao nível do mar (cerca de 1.086 bar) — o equivalente a sustentar o peso de 50 jatos de passageiros Boeing sobre o corpo de um ser humano.\n\nNeste ambiente extremo que esmagaria submarinos comuns, o Peixe-Caracol das Marianas (Pseudoliparis swirei) é o predador de topo do ecossistema. Ele não possui escamas e seu corpo é quase inteiramente transparente e gelatinoso, sem bexiga natatória (que implodiria com a pressão).\n\nPara evitar que suas proteínas e membranas celulares colapsem sob a pressão esmagadora, os tecidos do peixe-caracol são saturados com uma molécula protetora especial chamada óxido de trimetilamina (TMAO), que atua como um "andaime químico" impedindo que as moléculas de água invadam e deformem as estruturas proteicas vitais.`,
    categoryId: 'oceanos',
    categoryName: 'Oceanos & Abissal',
    categoryIcon: 'Waves',
    tags: ['fossa-das-marianas', 'abissal', 'peixes-abissais', 'biologia-marinha', 'oceanos'],
    author: 'Carlos Eduardo Marinho',
    readTimeMinutes: 3,
    views: 35800,
    likes: 3190,
    shares: 1120,
    date: '2026-08-22',
    imageUrl: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.nature.com/articles/s41559-019-0864-8',
    sourceName: 'Nature Ecology & Evolution Mariana Trench Expedition',
    didYouKnow: 'Cientistas colocaram um submarino robótico com isca a 8.178 metros e filmaram um peixe-caracol nadando calmamente com barbatanas translúcidas que lembram asas de anjo!',
    funFactor: 96,
    relatedSlugs: ['a-fossa-das-marianas-e-o-ponto-nemo', 'os-polvos-possuem-tres-coracoes-e-sangue-azul']
  },
  {
    id: 'c45',
    slug: 'tetracromatismo-humano-e-os-100-milhoes-de-cores',
    title: 'Tetracromatismo Humano: A condição genética que permite enxergar 100 milhões de cores invisíveis',
    summary: 'Enquanto a maioria dos humanos possui três tipos de cones na retina, algumas mulheres possuem um quarto cone que decodifica nuances cósmicas de cor.',
    content: `A visão humana típica é tricromática: a nossa retina contém três tipos de células fotorreceptoras em cone (sensíveis a comprimentos de onda curtos para azul, médios para verde e longos para vermelho). Com essas três cores primárias, o cérebro médio consegue distinguir cerca de 1 milhão de variações cromáticas diferentes.\n\nNo entanto, devido a uma mutação genética recessiva no cromossomo X, estima-se que cerca de 2% a 3% das mulheres no mundo possuam um quarto tipo de cone na retina que capta comprimentos de onda intermediários entre o vermelho e o verde. Esta condição é conhecida na oftalmologia como Tetracromatismo.\n\nPara uma pessoa tetracromata verdadeira, a percepção visual é hiper-realista: ela consegue distinguir até 100 milhões de tons e nuances de cor. O que para uma pessoa comum parece uma simples parede branca ou uma folha verde uniforme, para uma tetracromata revela-se como um mosaico vibrante de dezenas de matizes de lilás, dourado, turquesa e esmeralda sobrepostos!`,
    categoryId: 'corpo-humano',
    categoryName: 'Corpo Humano & Saúde',
    categoryIcon: 'HeartPulse',
    tags: ['genética', 'visão', 'cores', 'olhos', 'neurociência', 'corpo-humano'],
    author: 'Dra. Luísa Cossa',
    readTimeMinutes: 3,
    views: 39400,
    likes: 3510,
    shares: 1280,
    date: '2026-08-21',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3188829/',
    sourceName: 'Journal of Vision & Cambridge University Ophthalmology Studies',
    didYouKnow: 'Como os genes para os cones vermelho e verde estão no cromossomo X, apenas indivíduos com dois cromossomos X (mulheres) podem herdar e expressar o tetracromatismo funcional pleno!',
    funFactor: 98,
    relatedSlugs: ['o-tempo-passa-mais-rapido-na-sua-cabeca-do-que-nos-pes', 'como-a-aspirina-surgiu-da-casca-do-salgueiro-ha-3500-anos']
  }
];

export const ALL_CURIOSITIES: Curiosity[] = [
  ...INITIAL_CURIOSITIES,
  ...ADDITIONAL_CURIOSITIES,
  ...EXTRA_CURATED_FACTS
];

export const ALL_CATEGORIES = INITIAL_CATEGORIES.map(cat => ({
  ...cat,
  count: ALL_CURIOSITIES.filter(c => c.categoryId === cat.id).length || cat.count
}));

export const ALL_QUIZZES = INITIAL_QUIZZES;
export const ALL_ARTICLES = INITIAL_ARTICLES;

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
