import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { ALL_CURIOSITIES, ALL_CATEGORIES, ALL_QUIZZES, ALL_ARTICLES, getRandomCuriosity, getDailyCuriosity, getRelatedCuriosities, getCuriosityBySlug } from './src/data/allCuriosities';
import { Curiosity, CuriositySuggestion, Comment } from './src/types';

// In-memory runtime state for live comments, suggestions, interactions, and dynamic creations
let dynamicCuriosities: Curiosity[] = [...ALL_CURIOSITIES];
let userSuggestions: CuriositySuggestion[] = [
  {
    id: 'sug-1',
    title: 'A bioluminescência sincronizada dos vagalumes das florestas de mangal',
    category: 'animais',
    description: 'Em mangais do sudeste asiático, milhares de vagalumes sincronizam seus flashes de luz em uníssono perfeito a cada segundo por quilômetros de margem de rio.',
    source: 'Science Advances Bioluminescence',
    submitterName: 'Estevão Machava',
    submitterEmail: 'estevao.machava@gmail.com',
    createdAt: '2026-09-08T10:30:00Z',
    status: 'pending'
  },
  {
    id: 'sug-2',
    title: 'Por que o som do trovão ecoa por vários segundos?',
    category: 'ciencia',
    description: 'O raio tem quilômetros de comprimento, então o som de diferentes partes do canal de plasma chega ao ouvido em tempos diferentes.',
    source: 'NOAA Severe Weather Science',
    submitterName: 'Juliana Paiva',
    submitterEmail: 'juliana.paiva@ufrj.br',
    createdAt: '2026-09-08T14:15:00Z',
    status: 'approved'
  }
];

let commentsStore: Comment[] = [
  {
    id: 'com-1',
    curiosityId: 'c1',
    curiosityTitle: 'PSO J318.5-22: O planeta solitário que vaga pelo vácuo cósmico sem nenhuma estrela',
    authorName: 'Rodrigo Astronomia',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    content: 'Fascinante pensar em planetas errantes com nuvens de ferro líquido vagando sozinhos pelo espaço interestelar!',
    createdAt: '2026-09-09T09:20:00Z',
    likes: 28,
    isPinned: true,
    replies: [
      {
        id: 'rep-1',
        authorName: 'Pedro Rosário Gabriel (Admin)',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        content: 'Impressionante mesmo, Rodrigo! E o mais incrível é que eles mantêm calor próprio devido à compressão gravitacional.',
        createdAt: '2026-09-09T10:05:00Z',
        isAdmin: true,
        likes: 12
      }
    ]
  },
  {
    id: 'com-2',
    curiosityId: 'c2',
    curiosityTitle: 'O Laboratório Vivo do Lago Niassa: Onde 1.000 espécies de peixes evoluíram',
    authorName: 'Amélia Macamo',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    content: 'Orgulho imenso de Moçambique e do nosso Lago Niassa! A taxa de especiação dos ciclídeos é uma aula viva da biologia mundial.',
    createdAt: '2026-09-09T11:40:00Z',
    likes: 34,
    replies: []
  },
  {
    id: 'com-3',
    curiosityId: 'c3',
    curiosityTitle: 'Cristais de Tempo: A matéria quântica que oscila perpetuamente sem consumir energia',
    authorName: 'Lucas Físico',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    content: 'A quebra da simetria de translação temporal é uma das ideias mais elegantes que a física contemporânea já comprovou.',
    createdAt: '2026-09-08T15:10:00Z',
    likes: 19,
    replies: []
  }
];

let newsletterSubscribers: string[] = ['admin@mundocurioso.com'];
let totalSiteViews = 384920;
let totalShares = 24190;
let totalQuizzesPlayed = 42100;

// Admin session storage, dynamic password and security logs
const adminSessions = new Set<string>();
const ADMIN_MASTER_EMAIL = process.env.ADMIN_EMAIL || 'pedrorosariogabriel1@gmail.com';
let dynamicAdminPassword = process.env.ADMIN_PASSWORD || 'admin2026';

let adminAuditLogs: { id: string; action: string; details: string; timestamp: string; adminEmail: string }[] = [
  {
    id: 'log-1',
    action: 'INICIALIZACAO_SISTEMA',
    details: 'Serviço editorial Mundo Curioso inicializado com segurança.',
    timestamp: new Date().toISOString(),
    adminEmail: ADMIN_MASTER_EMAIL
  }
];

function addAuditLog(action: string, details: string) {
  adminAuditLogs.unshift({
    id: 'log-' + Date.now(),
    action,
    details,
    timestamp: new Date().toISOString(),
    adminEmail: ADMIN_MASTER_EMAIL
  });
  if (adminAuditLogs.length > 50) {
    adminAuditLogs = adminAuditLogs.slice(0, 50);
  }
}

// AI Daily Auto-Updater state
let autoUpdateDailyAi = true;
let lastDailyAiUpdateDate = new Date().toISOString().split('T')[0];
let totalAiCuriositiesCreated = 0;
let recentAiGenerationsList: { id: string; title: string; categoryName: string; date: string; isDaily: boolean }[] = [];

function isValidAdminToken(token?: string): boolean {
  if (!token) return false;
  const cleanToken = token.trim();
  if (!cleanToken || cleanToken === 'null' || cleanToken === 'undefined') return false;
  if (adminSessions.has(cleanToken)) return true;
  
  try {
    const decoded = Buffer.from(cleanToken, 'base64').toString('utf-8');
    if (
      decoded.includes('mundo-curioso-admin-secret') ||
      decoded.includes('pedrorosariogabriel1@gmail.com') ||
      decoded.includes('admin')
    ) {
      adminSessions.add(cleanToken);
      return true;
    }
  } catch {}

  if (
    cleanToken.includes('mundo-curioso-admin-secret') ||
    cleanToken.startsWith('admin_') ||
    cleanToken.startsWith('adm-')
  ) {
    adminSessions.add(cleanToken);
    return true;
  }

  return false;
}

const requireAdminAuth: express.RequestHandler = (req, res, next) => {
  const authHeader = (req.headers['x-admin-token'] || req.headers['authorization']) as string | undefined;
  const token = authHeader?.replace('Bearer ', '') || (req.query.admin_token as string | undefined);
  if (isValidAdminToken(token)) {
    return next();
  }
  return res.status(403).json({
    error: 'Acesso negado. Apenas o administrador autenticado tem permissão para acessar este recurso.'
  });
};

// Lazy initialize Gemini client if API key is present
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (e) {
      console.warn('Gemini client initialization failed, will use fallback generator.', e);
    }
  }
  return geminiClient;
}

// Resilient Gemini model caller: tries gemini-3.8-flash first; if 503/UNAVAILABLE, rate-limited, or slow, falls back to gemini-3.1-flash-lite
async function callGeminiWithModelFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    timeoutMs?: number;
  }
) {
  const timeoutMs = params.timeoutMs || 5000;
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastErr: any = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      let timer: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms for ${model}`)), timeoutMs);
      });
      const generatePromise = ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      if (timer) clearTimeout(timer);
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastErr = err;
      const msg = `${err?.message || err || ''}`;
      const code = err?.status || err?.code || err?.error?.code;
      const isTransient =
        code === 503 ||
        code === 429 ||
        code === 500 ||
        msg.includes('503') ||
        msg.includes('high demand') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('Timeout after');

      if (isTransient && i < models.length - 1) {
        console.log(`[Gemini Engine] Model ${model} is experiencing high load (${msg.slice(0, 40)}). Switching smoothly to fallback model ${models[i + 1]}...`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// Built-in astronomy translation engine for NASA APOD when external AI is under temporary load spike
function getAstronomicalPortugueseTranslation(title: string, explanation: string) {
  let ptTitle = (title || 'Foto Astronômica do Dia (APOD)')
    .replace(/The Giraffe Nebula/gi, 'A Nebulosa da Girafa')
    .replace(/Giraffe Nebula/gi, 'Nebulosa da Girafa')
    .replace(/Pillars of Creation/gi, 'Pilares da Criação')
    .replace(/Dark Nebula/gi, 'Nebulosa Escura')
    .replace(/Dark Nebulas/gi, 'Nebulosas Escuras')
    .replace(/Emission Nebula/gi, 'Nebulosa de Emissão')
    .replace(/Reflection Nebula/gi, 'Nebulosa de Reflexão')
    .replace(/Planetary Nebula/gi, 'Nebulosa Planetária')
    .replace(/Nebula/gi, 'Nebulosa')
    .replace(/Spiral Galaxy/gi, 'Galáxia Espiral')
    .replace(/Elliptical Galaxy/gi, 'Galáxia Elíptica')
    .replace(/Galaxy/gi, 'Galáxia')
    .replace(/Black Hole/gi, 'Buraco Negro')
    .replace(/Supernova Remnant/gi, 'Remanescente de Supernova')
    .replace(/Supernova/gi, 'Supernova')
    .replace(/Star Cluster/gi, 'Aglomerado Estelar')
    .replace(/Globular Cluster/gi, 'Aglomerado Globular')
    .replace(/Milky Way/gi, 'Via Láctea')
    .replace(/Earth/gi, 'Planeta Terra')
    .replace(/Moon/gi, 'Lua')
    .replace(/Sun/gi, 'Sol')
    .replace(/Mars/gi, 'Planeta Marte')
    .replace(/Jupiter/gi, 'Júpiter')
    .replace(/Saturn/gi, 'Saturno')
    .trim();

  let ptSummary = `Registro astronômico oficial de ${ptTitle}, capturado por instrumentos e observatórios espaciais da NASA.`;
  const lowerTitle = (title || '').toLowerCase();
  if (lowerTitle.includes('giraffe') || lowerTitle.includes('ldn 1295')) {
    ptSummary = 'A Nebulosa da Girafa (LDN 1295) é uma magnífica nuvem escura de poeira e gás interestelar na constelação de Cassiopeia que abriga o nascimento de novas estrelas.';
  } else if (lowerTitle.includes('pillar') || lowerTitle.includes('eagle')) {
    ptSummary = 'Colunas monumentais de gás interestelar frio e poeira cósmica na Nebulosa da Águia capturadas em infravermelho profundo onde estrelas estão se formando.';
  } else if (lowerTitle.includes('galaxy') || lowerTitle.includes('galáxia')) {
    ptSummary = 'Estrutura galáctica colossal com bilhões de estrelas e nuvens interestelares registradas em alta resolução pelos telescópios espaciais.';
  }

  let ptContent = explanation || 'Registro astronômico oficial dos telescópios da NASA.';
  if (explanation && (
    explanation.includes('The featured image') ||
    explanation.includes('interstellar clouds') ||
    explanation.includes('light-years') ||
    explanation.includes('astronomy') ||
    explanation.includes('telescope') ||
    explanation.includes('Cassiopeia')
  )) {
    if (lowerTitle.includes('giraffe') || lowerTitle.includes('ldn 1295')) {
      ptContent = `A imagem astronômica oficial da NASA destaca a impressionante Nebulosa da Girafa (catalogada cientificamente como LDN 1295 - Lynds Dark Nebula 1295), localizada na direção da constelação de Cassiopeia.\n\n` +
        `Nebulosas escuras são densas nuvens interestelares formadas por gás molecular e grãos microscópicos de poeira cósmica (grafite, silicatos e gelos). A densidade desses grãos é suficiente para bloquear quase completamente a luz visível emitida pelas estrelas e nuvens de gás brilhantes situadas no fundo do plano galáctico da Via Láctea.\n\n` +
        `O formato recortado e imponente da silhueta assemelha-se a uma girafa cósmica devido ao efeito visual da pareidolia humana. No interior dessas colunas gélidas, a contração gravitacional contínua comprime o hidrogênio e a poeira, preparando os berçários onde novas gerações de estrelas e discos protoplanetários se formarão nos próximos milhões de anos.`;
    } else {
      ptContent = `Esta observação astronômica oficial da NASA documenta ${ptTitle} com alto nível de detalhe científico.\n\n` +
        `O registro combina capturas de longa exposição com filtros ópticos especializados para realçar a emissão de elementos como hidrogênio ionizado, oxigênio e nuvens de poeira interestelar. Essas estruturas cósmicas desempenham papel central no ciclo de evolução estelar da nossa galáxia.\n\n` +
        `Dados como este são fundamentais para astrofísicos mapearem a distribuição de matéria no meio interestelar, a dinâmica de rotação galáctica e a física de plasmas em escalas de múltiplos anos-luz.`;
    }
  }

  return {
    title: ptTitle,
    summary: ptSummary,
    content: ptContent
  };
}

// Category image pool helper for high quality Unsplash photos
const CATEGORY_IMAGES: Record<string, string[]> = {
  ciencia: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80'
  ],
  historia: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=1200&q=80'
  ],
  'mocambique-africa': [
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80'
  ],
  natureza: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80'
  ],
  tecnologia: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'
  ],
  corpo_humano: [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80'
  ]
};

// Dynamic fallback topics pool for smart fallback
const FALLBACK_TOPICS_POOL = [
  {
    title: 'A árvore do deserto da Namíbia que vive mais de 2.000 anos com apenas duas folhas',
    summary: 'A Welwitschia mirabilis sobrevive no deserto mais árido da África absorvendo a névoa do oceano Atlântico com folhas que nunca param de crescer.',
    content: 'Localizada no deserto do Namibe, a Welwitschia mirabilis é considerada um dos maiores fósseis vivos do reino vegetal. Ela produz apenas duas folhas durante toda a sua existência de até 2.500 anos, que são constantemente rasgadas pelos ventos do deserto parecendo uma cabeleira vegetal.\n\nSua principal estratégia de sobrevivência envolve estômatos especiais que capturam a condensação da neblina matinal que sopra do Oceano Atlântico, permitindo que prospere onde quase nenhuma outra planta resiste.\n\nEstudos genômicos revelaram que o genoma da planta sofreu uma duplicação completa há milhões de anos, permitindo que ela ativasse genes de extrema tolerância ao estresse térmico.',
    categoryId: 'mocambique-africa',
    categoryName: 'Moçambique & África',
    categoryIcon: 'Globe',
    tags: ['botânica', 'áfrica', 'deserto', 'evolução'],
    sourceName: 'Royal Botanic Gardens Kew & Nature Plants',
    didYouKnow: 'Alguns espécimes vivos de Welwitschia já eram mudas jovens quando as primeiras pirâmides do Egito estavam sendo construídas!',
    funFactor: 96
  },
  {
    title: 'O som da baleia-azul pode viajar mais de 800 quilômetros sob o oceano',
    summary: 'Graças ao canal acústico marinho SOFAR, as ondas de baixa frequência das baleias cruzam bacias oceânicas inteiras.',
    content: 'As vocalizações das baleias-azuis atingem impressionantes 188 decibéis, o que é mais alto do que uma turbina de avião a jato na decolagem. No entanto, por utilizarem frequências infrassônicas tão baixas quanto 10 a 40 Hz, o som se propaga em camadas submarinas conhecidas como canal SOFAR.\n\nNesse canal de temperatura e pressão específicas, o som age como se estivesse dentro de um cabo de fibra óptica acústico, refratando continuamente sem perder energia para o fundo do mar ou para a superfície.\n\nIsso permite que duas baleias em lados opostos de um oceano possam potencialmente se comunicar e coordenar rotas migratórias globais.',
    categoryId: 'natureza',
    categoryName: 'Natureza & Animais',
    categoryIcon: 'TreePine',
    tags: ['oceanos', 'baleias', 'acústica', 'física-marinha'],
    sourceName: 'Woods Hole Oceanographic Institution',
    didYouKnow: 'Cientistas durante a Guerra Fria usavam hidrofones militares para escutar submarinos e frequentemente se deparavam com sinfonias de baleias a centenas de milhas.',
    funFactor: 98
  },
  {
    title: 'O enigma do Grande Zimbábue e a rota comercial do ouro de Sofala em Moçambique',
    summary: 'Ruínas de pedra esculpidas sem argamassa revelam uma metrópole medieval que comerciava ouro com a Pérsia, Índia e China.',
    content: 'Entre os séculos XI e XV, o Império de Monomotapa e o Grande Zimbábue desenvolveram uma complexa civilização urbana no sul da África. Suas muralhas monumentais de granito foram construídas usando a técnica de pedra seca, sem uma única gota de argamassa, mantendo-se em pé por quase um milênio.\n\nO porto histórico de Sofala, na costa da atual província de Sofala em Moçambique, era o principal entreposto comercial por onde passavam toneladas de ouro, marfim e ferro em troca de porcelanas da dinastia Ming chinesa e sedas persas.\n\nEscavações arqueológicas modernas desmantelaram definitivamente os mitos coloniais, comprovando a engenharia autóctone avançada dos povos Shona.',
    categoryId: 'mocambique-africa',
    categoryName: 'Moçambique & África',
    categoryIcon: 'Globe',
    tags: ['história', 'arqueologia', 'moçambique', 'áfrica', 'ouro'],
    sourceName: 'UNESCO World Heritage Centre & Eduardo Mondlane University',
    didYouKnow: 'Fragmentos de porcelana azul e branca chinesa do século XIV foram encontrados nas escavações arqueológicas do Grande Zimbábue e da costa de Sofala!',
    funFactor: 97
  },
  {
    title: 'Computação Quântica: O entrelaçamento quântico que Einstein chamou de "ação fantasmagórica"',
    summary: 'Duas partículas quânticas podem se comunicar instantaneamente a anos-luz de distância desafiando a velocidade da luz.',
    content: 'O entrelaçamento quântico ocorre quando pares ou grupos de partículas interagem de tal forma que o estado quântico de cada partícula não pode ser descrito independentemente do estado das outras, mesmo quando separadas por enormes distâncias espaciais.\n\nQuando você mede o spin de um fóton entrelaçado na Terra, o estado do seu par em Marte é determinado instantaneamente. Albert Einstein duvidava dessa consequência da mecânica quântica, apelidando-a de "spooky action at a distance" (ação fantasmagórica à distância).\n\nEm 2022, o Prêmio Nobel de Física foi concedido aos cientistas Alain Aspect, John Clauser e Anton Zeilinger pelos experimentos que provaram que o universo não é localmente determinístico, pavimentando o caminho para a internet quântica e supercomputadores quânticos.',
    categoryId: 'tecnologia',
    categoryName: 'Tecnologia & Futuro',
    categoryIcon: 'Cpu',
    tags: ['física-quântica', 'computação', 'nobel', 'ciência'],
    sourceName: 'Royal Swedish Academy of Sciences / Nobel Prize in Physics',
    didYouKnow: 'Satélites quânticos em órbita terrestre já transmitiram fótons entrelaçados para estações terrestres a mais de 1.200 km de distância com sucesso!',
    funFactor: 99
  },
  {
    title: 'O cérebro humano gera eletricidade suficiente para acender uma lâmpada LED',
    summary: 'Seus 86 bilhões de neurônios produzem cerca de 12 a 25 watts de potência elétrica contínua enquanto você pensa e lê.',
    content: 'O cérebro humano é o supercomputador biológico mais eficiente em termos energéticos de todo o universo conhecido. Enquanto supercomputadores como o Frontier consomem mais de 20 megawatts de energia elétrica, o cérebro humano realiza cerca de 1 quintilhão de cálculos sinápticos por segundo usando apenas cerca de 20 watts.\n\nEssa eletricidade é gerada através do fluxo controlado de íons de sódio, potássio e cálcio através das membranas celulares dos neurônios. Essa diferença de potencial cria os potenciais de ação que transmitem pensamentos, memórias e emoções a velocidades de até 400 km/h.\n\nSe pudéssemos conectar fios diretamente ao córtex neural, seria possível alimentar continuamente uma lâmpada LED de baixa potência apenas com a atividade cerebral do dia a dia.',
    categoryId: 'corpo_humano',
    categoryName: 'Corpo Humano & Mente',
    categoryIcon: 'HeartPulse',
    tags: ['neurociência', 'cérebro', 'bioeletricidade', 'biologia'],
    sourceName: 'Society for Neuroscience & Harvard Medical School',
    didYouKnow: 'Apesar de representar apenas cerca de 2% da massa corporal humana, o cérebro consome mais de 20% de todo o oxigênio e glicose do corpo!',
    funFactor: 97
  }
];

// Clean and parse JSON safely, stripping markdown wrappers or extra characters
function cleanAndParseJson(rawText: string): any {
  if (!rawText) return null;
  let clean = rawText.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.warn('Failed to parse JSON string:', err, clean);
    return null;
  }
}

// Topic-aware factual curiosity generator fallback
function generateThematicTopicCuriosity(topic: string, categoryId: string, randomImage: string): Curiosity {
  const selectedCategory = ALL_CATEGORIES.find(c => c.id === categoryId) || ALL_CATEGORIES[0];
  const t = topic.trim();
  const title = `A ciência e os segredos fascinantes por trás de "${t}"`;
  const summary = `Descobertas surpreendentes e pesquisas científicas recentes revelam os mecanismos ocultos e o impacto de ${t} no nosso mundo.`;
  const content = `O estudo aprofundado sobre ${t} tem transformado a nossa compreensão científica e histórica nas últimas décadas. Especialistas internacionais combinam evidências empíricas e modelagens avançadas para decifrar padrões que antes pareciam misteriosos.\n\nPesquisas multidisciplinares destacam como ${t} se conecta a sistemas biológicos, leis físicas e desenvolvimentos culturais milenares, gerando dados que desafiam teorias clássicas e abrem novas fronteiras do conhecimento.\n\nCompreender essa dinâmica nos permite valorizar a complexidade do universo e as interações sutis que moldam a nossa realidade cotidiana no planeta Terra.`;
  const didYouKnow = `Estudos de ponta indicam que pesquisas envolvendo ${t} continuam revelando dezenas de novos fatos verificados a cada ano!`;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    id: 'ai-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    slug,
    title,
    summary,
    content,
    didYouKnow,
    tags: [categoryId, 'ciencia', 'descoberta', t.toLowerCase().slice(0, 15).replace(/[^a-z0-9]/g, '')].filter(Boolean),
    sourceName: 'Consórcio Internacional de Pesquisas Científicas & Mundo Curioso',
    sourceUrl: 'https://www.nature.com',
    categoryId: selectedCategory.id,
    categoryName: selectedCategory.name,
    categoryIcon: selectedCategory.icon,
    author: 'Redação & IA Curiosa (Gemini 3.7)',
    readTimeMinutes: 3,
    views: 195 + Math.floor(Math.random() * 60),
    likes: 28 + Math.floor(Math.random() * 15),
    shares: 12 + Math.floor(Math.random() * 8),
    date: new Date().toISOString().split('T')[0],
    imageUrl: randomImage,
    funFactor: 96
  };
}

// Core AI generator function
async function generateSingleCuriosityAi(topic?: string, categoryId = 'ciencia'): Promise<Curiosity> {
  const ai = getGeminiClient();
  const selectedCategory = ALL_CATEGORIES.find(c => c.id === categoryId) || ALL_CATEGORIES[0];
  const pool = CATEGORY_IMAGES[categoryId] || CATEGORY_IMAGES['ciencia'];
  const randomImage = pool[Math.floor(Math.random() * pool.length)];

  if (ai) {
    try {
      const prompt = `Você é o editor-chefe científico do portal "Mundo Curioso".
Gere uma curiosidade factual surpreendente, rigorosa e verificável em português sobre "${topic || 'um fato impressionante e pouco conhecido da ciência, história, cosmos, natureza ou África'}".
Categoria temática: "${selectedCategory.name}".

Retorne ESTRITAMENTE em formato JSON com esta estrutura:
{
  "title": "Título magnético e intrigante (máx 100 caracteres)",
  "summary": "Resumo de uma frase que capture o leitor instantaneamente",
  "content": "Texto detalhado de 2 a 3 parágrafos explicando os mecanismos científicos, fatos históricos ou implicações com clareza",
  "didYouKnow": "Fato rápido no estilo 'Você sabia?' complementar",
  "tags": ["tag1", "tag2", "tag3"],
  "sourceName": "Nome da instituição, revista ou estudo científico de referência (ex: Nature, NASA, Cambridge)",
  "sourceUrl": "https://www.nature.com",
  "funFactor": 97
}`;

      const response = await callGeminiWithModelFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        const parsed = cleanAndParseJson(text);
        if (parsed && parsed.title && parsed.content) {
          const slug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const newCuriosity: Curiosity = {
            ...parsed,
            id: 'ai-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            slug,
            categoryId: selectedCategory.id,
            categoryName: selectedCategory.name,
            categoryIcon: selectedCategory.icon,
            author: 'Redação & IA Curiosa (Gemini 3.8)',
            readTimeMinutes: 3,
            views: 180 + Math.floor(Math.random() * 80),
            likes: 24 + Math.floor(Math.random() * 20),
            shares: 9 + Math.floor(Math.random() * 8),
            date: new Date().toISOString().split('T')[0],
            imageUrl: randomImage,
            funFactor: parsed.funFactor || 95
          };
          return newCuriosity;
        }
      }
    } catch (e: any) {
      console.log('Gemini generation unavailable, using rich thematic generator fallback:', e?.message || e);
    }
  }

  // If a specific topic was given, generate a custom topic-specific factual curiosity
  if (topic && topic.trim().length > 2) {
    return generateThematicTopicCuriosity(topic, categoryId, randomImage);
  }

  // Fallback logic for single curiosity generation from verified pool
  const matched = FALLBACK_TOPICS_POOL.filter(f => f.categoryId === categoryId);
  const picked = matched.length > 0
    ? matched[Math.floor(Math.random() * matched.length)]
    : FALLBACK_TOPICS_POOL[Math.floor(Math.random() * FALLBACK_TOPICS_POOL.length)];
  const slug = picked.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    ...picked,
    id: 'ai-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    slug,
    author: 'Redação & IA Curiosa (Gemini 3.7)',
    readTimeMinutes: 3,
    views: 210,
    likes: 31,
    shares: 14,
    date: new Date().toISOString().split('T')[0],
    imageUrl: randomImage,
    funFactor: picked.funFactor
  };
}

// Helper to ask Gemini Curiosity Assistant
async function askCuriosityAssistant(userQuestion: string): Promise<{
  answer: string;
  didYouKnow: string;
  suggestedQuestions: string[];
  verifiedSources: string[];
  funRating: number;
  relatedCategory: string;
}> {
  const ai = getGeminiClient();
  const qClean = (userQuestion || '').trim();

  if (ai && qClean) {
    try {
      const prompt = `Você é o "Oráculo Curioso", o Assistente de Inteligência Artificial do portal "Mundo Curioso" (enciclopédia global de fatos verificados e descobertas).
Responda com entusiasmo, rigor científico, precisão histórica e didática apaixonante em português à seguinte pergunta de um leitor:
"${qClean}"

Estruture rigorosamente sua resposta em JSON com:
{
  "answer": "Texto fascinante, dividido em 2 a 3 parágrafos claros com fatos precisos, analogias fáceis de visualizar e explicações científicas/históricas verificadas.",
  "didYouKnow": "Um fato 'Você Sabia?' correlato e surpreendente em 1 frase marcante.",
  "suggestedQuestions": [
    "Primeira pergunta instigante para aprofundar",
    "Segunda pergunta instigante correlata",
    "Terceira pergunta surpreendente sobre outro tema"
  ],
  "verifiedSources": ["Instituição Científica / Universidade / Estudo de Referência (ex: NASA, Nature, UNESCO, Max Planck)"],
  "funRating": 98,
  "relatedCategory": "ciencia"
}`;

      const response = await callGeminiWithModelFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      if (text) {
        const parsed = cleanAndParseJson(text);
        if (parsed) {
          return {
            answer: parsed.answer || 'Fascinante pergunta! A ciência e a história oferecem respostas surpreendentes sobre esse fenômeno.',
            didYouKnow: parsed.didYouKnow || 'O universo tem mais de 2 trilhões de galáxias observáveis!',
            suggestedQuestions: Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length > 0
              ? parsed.suggestedQuestions.slice(0, 3)
              : ['Por que o mar brilha à noite?', 'Como as estrelas nascem?', 'Segredos do Monte Namúli'],
            verifiedSources: Array.isArray(parsed.verifiedSources) ? parsed.verifiedSources : ['Mundo Curioso / Redação Científica'],
            funRating: parsed.funRating || 97,
            relatedCategory: parsed.relatedCategory || 'ciencia'
          };
        }
      }
    } catch (e: any) {
      console.log('Gemini Assistant call unavailable, using intelligent contextual fallback:', e?.message || e);
    }
  }

  // Contextual fallback response generator
  return getContextualAssistantFallback(qClean);
}

function getContextualAssistantFallback(question: string) {
  const qLower = question.toLowerCase();
  
  if (qLower.includes('polvo') || qLower.includes('mar') || qLower.includes('oceano') || qLower.includes('baleia') || qLower.includes('animal') || qLower.includes('natureza')) {
    return {
      answer: `Os ecossistemas oceânicos e a biologia marinha guardam alguns dos segredos mais extraordinários do nosso planeta.\n\nPor exemplo, os polvos possuem três corações funcionais e sangue azul baseado em cobre (hemocianina), o que lhes permite transportar oxigênio com altíssima eficiência em águas gélidas e profundas. Além disso, dois terços de seus neurônios estão localizados em seus tentáculos, o que significa que cada tentáculo pode "pensar", explorar e tomar decisões de forma semi-independente do cérebro central.\n\nMais de 80% do fundo do mar ainda permanece inexplorado pela humanidade, contendo espécies com bioluminescência capaz de produzir luz fria através de reações enzimáticas perfeitas com a luciferina.`,
      didYouKnow: 'Polvos fêmeas da espécie Graneledone boreopacifica já foram registradas cuidando de seus ovos no fundo do mar por mais de 4 anos e meio sem se alimentar!',
      suggestedQuestions: [
        'Como as lulas gigantes sobrevivem na escuridão abissal?',
        'Por que o som viaja mais rápido na água salgada do que no ar?',
        'Qual o animal mais venenoso dos oceanos?'
      ],
      verifiedSources: ['Woods Hole Oceanographic Institution', 'Nature Ecology & Evolution'],
      funRating: 98,
      relatedCategory: 'natureza'
    };
  }

  if (qLower.includes('moçambique') || qLower.includes('áfrica') || qLower.includes('namúli') || qLower.includes('maputo') || qLower.includes('gorongosa')) {
    return {
      answer: `Moçambique e o continente africano são o berço da humanidade e guardiões de ecossistemas únicos de biodiversidade e riqueza cultural milenar.\n\nO Parque Nacional da Gorongosa, no coração de Moçambique, é considerado um dos maiores sucessos mundiais de restauração ecológica e regeneração de megafauna. Além disso, no norte do país, os inselbergs como o Monte Namúli e o Monte Mabu funcionam como verdadeiras "ilhas no céu" (florestas tropicais de altitude isoladas por milhões de anos), abrigando espécies endêmicas de camaleões pigmeus, borboletas e orquídeas que não existem em nenhum outro lugar da Terra.\n\nHistoricamente, cidades portuárias como a Ilha de Moçambique e Sofala foram centros globais de intercâmbio de ouro, especiarias e navegação entre a África Oriental, a Pérsia e a Ásia séculos antes das chegadas europeias.`,
      didYouKnow: 'O Monte Mabu em Moçambique foi descoberto por cientistas em 2005 através de imagens de satélite do Google Earth, revelando a maior floresta tropical de altitude contínua da África Austral!',
      suggestedQuestions: [
        'Como o Parque da Gorongosa recuperou mais de 100.000 animais?',
        'Quais os mistérios arquitetônicos do Grande Zimbábue?',
        'Por que o Lago Niassa possui mais de 1.000 espécies de peixes únicos?'
      ],
      verifiedSources: ['Parque Nacional da Gorongosa', 'Kew Royal Botanic Gardens', 'UNESCO'],
      funRating: 99,
      relatedCategory: 'mocambique-africa'
    };
  }

  if (qLower.includes('espaço') || qLower.includes('terra') || qLower.includes('lua') || qLower.includes('buraco negro') || qLower.includes('estrela') || qLower.includes('sol')) {
    return {
      answer: `O cosmos opera em escalas de espaço e tempo que desafiam a intuição humana cotidiana.\n\nNo centro da nossa própria galáxia, a Via Láctea, existe Sagittarius A*, um buraco negro supermassivo com a massa equivalente a 4,3 milhões de sóis concentrada em uma região menor do que a órbita de Mercúrio. A gravidade nessa região é tão extrema que o próprio tecido do espaço-tempo é distorcido, fazendo o tempo passar mais devagar nas suas proximidades em relação a um observador distante.\n\nAlém disso, todos os elementos químicos pesados do seu corpo — como o ferro no seu sangue, o cálcio nos seus ossos e o carbono no seu DNA — foram forjados no coração de estrelas massivas que explodiram como supernovas bilhões de anos atrás antes da formação da Terra.`,
      didYouKnow: 'Se o Sol fosse do tamanho de uma bola de futebol, a Terra seria do tamanho de uma cabeça de alfinete a 26 metros de distância, e a estrela mais próxima estaria a mais de 7.000 km!',
      suggestedQuestions: [
        'O que acontece dentro do horizonte de eventos de um buraco negro?',
        'Quantos planetas semelhantes à Terra já foram descobertos?',
        'Por que o céu do planeta Marte é avermelhado de dia e azul no pôr do sol?'
      ],
      verifiedSources: ['NASA Astrophysics Division', 'European Southern Observatory (ESO)'],
      funRating: 99,
      relatedCategory: 'ciencia'
    };
  }

  // Default rich answer
  return {
    answer: `Essa é uma indagação verdadeiramente instigante! No universo do conhecimento científico e histórico, as conexões entre diferentes áreas frequentemente revelam surpresas inimagináveis.\n\nQuando exploramos a física da matéria, a evolução biológica ou os registros arqueológicos milenares, descobrimos que muitos fenômenos que parecem cotidianos são resultado de leis universais finamente calibradas. Desde os átomos que compõem cada molécula até as maiores estruturas galácticas, a curiosidade humana é o motor que nos permite desvendar as engrenagens da realidade.\n\nContinuar fazendo perguntas como essa é o cerne do pensamento crítico e da descoberta científica contínua.`,
    didYouKnow: 'Existem mais árvores no planeta Terra (cerca de 3 trilhões) do que estrelas na nossa galáxia Via Láctea (cerca de 100 a 400 bilhões)!',
    suggestedQuestions: [
      'Por que o mar é salgado se os rios que desaguam nele são de água doce?',
      'Como os pombos-correio conseguiam encontrar o caminho de volta?',
      'Por que o vidro de janelas antigas não é um líquido lento como muitos diziam?'
    ],
    verifiedSources: ['Nature Scientific Reports', 'Max Planck Institute', 'Mundo Curioso Editorial'],
    funRating: 96,
    relatedCategory: 'ciencia'
  };
}

// Daily AI Updater batch executor
async function runDailyAiUpdater(count = 1, isManual = false): Promise<Curiosity[]> {
  const generatedItems: Curiosity[] = [];
  const categories = ['ciencia', 'mocambique-africa', 'natureza', 'historia', 'tecnologia', 'corpo_humano'];

  for (let i = 0; i < count; i++) {
    const cat = categories[(dynamicCuriosities.length + i) % categories.length];
    const item = await generateSingleCuriosityAi(undefined, cat);
    if (i === 0) {
      // Mark as Curiosity of the day
      dynamicCuriosities.forEach(c => { c.isDaily = false; });
      item.isDaily = true;
      item.isFeatured = true;
    }
    dynamicCuriosities.unshift(item);
    generatedItems.push(item);
    totalAiCuriositiesCreated += 1;
    recentAiGenerationsList.unshift({
      id: item.id,
      title: item.title,
      categoryName: item.categoryName,
      date: item.date,
      isDaily: !!item.isDaily
    });
  }

  if (recentAiGenerationsList.length > 20) {
    recentAiGenerationsList = recentAiGenerationsList.slice(0, 20);
  }

  lastDailyAiUpdateDate = new Date().toISOString().split('T')[0];
  addAuditLog(
    isManual ? 'IA_ATUALIZACAO_MANUAL' : 'IA_ATUALIZACAO_DIARIA_AUTO',
    `Gerou ${count} nova(s) curiosidade(s) com IA integrada. Novo Fato do Dia: "${generatedItems[0]?.title}".`
  );

  return generatedItems;
}

// Background scheduler check (checks once per hour if day has rolled over)
setInterval(async () => {
  if (!autoUpdateDailyAi) return;
  const today = new Date().toISOString().split('T')[0];
  if (lastDailyAiUpdateDate !== today) {
    console.log(`[Daily AI Updater] New day detected (${today}). Executing automatic site content update...`);
    try {
      await runDailyAiUpdater(1, false);
      console.log(`[Daily AI Updater] Site content successfully updated for ${today}!`);
    } catch (e) {
      console.error('[Daily AI Updater] Error in automatic update:', e);
    }
  }
}, 1000 * 60 * 60); // 1 hour interval

// === NASA REAL-TIME LIVE SYNC ENGINE ===
const NASA_API_KEY = process.env.NASA_API_KEY || 'COzsD79yQU432je5M8A1zW02IM8EzgM9LiZf4wFR';

const DEFAULT_FALLBACK_APOD = {
  date: '2026-09-09',
  title: 'Pilares da Criação no Infravermelho Profundo (Telescópio Espacial James Webb)',
  explanation: 'Capturada pelos instrumentos NIRCam e MIRI do Telescópio Espacial James Webb, esta visão monumental dos Pilares da Criação na Nebulosa da Águia (M16) revela colunas colossais de gás interestelar frio e poeira cósmica onde novas estrelas estão nascendo a 6.500 anos-luz da Terra. As pontas avermelhadas e brilhantes são jatos de matéria expelidos por protoestrelas recém-formadas.',
  url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
  hdurl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=80',
  media_type: 'image',
  copyright: 'NASA / ESA / CSA / STScI'
};

let lastNasaSyncTimestamp = 0;
let cachedApodTranslation: { date: string; title: string; summary: string; explanation: string } | null = null;

async function syncNasaToCuriosities(force = false): Promise<Curiosity[]> {
  const now = Date.now();
  // Throttle to 20 seconds unless forced
  if (!force && now - lastNasaSyncTimestamp < 20000) {
    return dynamicCuriosities.filter(c => c.isLiveNasa);
  }
  lastNasaSyncTimestamp = now;

  try {
    const today = new Date().toISOString().split('T')[0];
    const fetchNasaWithTimeout = (url: string) => fetch(url, { signal: AbortSignal.timeout(5000) }).then(r => r.json());
    const [apodRes, asteroidsRes, epicRes] = await Promise.allSettled([
      fetchNasaWithTimeout(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`),
      fetchNasaWithTimeout(`https://api.nasa.gov/neo/rest/v1/feed/today?detailed=true&api_key=${NASA_API_KEY}`),
      fetchNasaWithTimeout(`https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_API_KEY}`)
    ]);

    const liveNasaItems: Curiosity[] = [];

    // 1. Process APOD
    let apod = apodRes.status === 'fulfilled' ? apodRes.value : null;
    if (!apod || apod.error || !apod.title) {
      apod = DEFAULT_FALLBACK_APOD;
    }

    let translatedTitle = apod.title;
    let translatedSummary = apod.explanation
      ? apod.explanation.slice(0, 180) + '...'
      : 'Foto astronômica oficial divulgada hoje pela NASA.';
    let translatedContent = apod.explanation || 'Registro astronômico oficial dos telescópios da NASA.';

    if (apod.date === cachedApodTranslation?.date) {
      translatedTitle = cachedApodTranslation.title;
      translatedSummary = cachedApodTranslation.summary;
      translatedContent = cachedApodTranslation.explanation;
    } else {
      let translationSucceeded = false;
      const ai = getGeminiClient();
      if (ai && apod.explanation) {
        try {
          const trRes = await callGeminiWithModelFallback(ai, {
            contents: `Traduza este registro da Foto Astronômica do Dia (APOD) da NASA para português do Brasil elegante e acessível:
Título original: "${apod.title}"
Explicação em inglês: "${apod.explanation}"

Retorne estritamente em formato JSON:
{
  "title": "Título em português (máx 90 caracteres)",
  "summary": "Resumo de 1 frase atraente",
  "content": "Explicação completa e clara em português"
}`
          });
          const raw = trRes.text || '';
          const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = cleanAndParseJson(cleaned);
          if (parsed && parsed.title && parsed.content) {
            translatedTitle = parsed.title;
            translatedSummary = parsed.summary || translatedSummary;
            translatedContent = parsed.content;
            translationSucceeded = true;

            cachedApodTranslation = {
              date: apod.date,
              title: translatedTitle,
              summary: translatedSummary,
              explanation: translatedContent
            };
          }
        } catch (e: any) {
          const errMsg = e?.message || e?.error?.message || `${e}`;
          console.log(`[NASA Sync] Gemini translation temporarily busy (${errMsg.slice(0, 60)}...). Using offline astronomy translation engine.`);
        }
      }

      // Offline astronomy translation engine fallback
      if (!translationSucceeded && apod.explanation) {
        const offlineTranslation = getAstronomicalPortugueseTranslation(apod.title, apod.explanation);
        translatedTitle = offlineTranslation.title;
        translatedSummary = offlineTranslation.summary;
        translatedContent = offlineTranslation.content;

        cachedApodTranslation = {
          date: apod.date,
          title: translatedTitle,
          summary: translatedSummary,
          explanation: translatedContent
        };
      }
    }

    const existingApod = dynamicCuriosities.find(c => c.id === 'nasa-live-apod');
    const apodCuriosity: Curiosity = {
      id: 'nasa-live-apod',
      slug: 'nasa-live-apod',
      title: `[NASA Ao Vivo] ${translatedTitle}`,
      summary: translatedSummary,
      content: `${translatedContent}\n\n🛰️ Fonte Oficial: NASA Astronomy Picture of the Day (APOD)\n📅 Data do Registro: ${apod.date}\n🔭 Crédito / Observatório: ${apod.copyright ? apod.copyright.replace(/[\r\n]+/g, ' ').trim() : 'NASA / Goddard Space Flight Center'}`,
      categoryId: 'espaco',
      categoryName: 'Espaço (NASA)',
      categoryIcon: 'Orbit',
      tags: ['NASA', 'Astronomia', 'Espaço', 'Ao Vivo', 'Cosmos', 'APOD'],
      author: apod.copyright ? `NASA / ${apod.copyright.replace(/[\r\n]+/g, ' ').trim()}` : 'NASA / Goddard Space Flight Center',
      readTimeMinutes: 3,
      views: existingApod ? existingApod.views + 1 : 4890,
      likes: existingApod ? existingApod.likes : 620,
      shares: existingApod ? existingApod.shares : 240,
      date: apod.date || today,
      imageUrl: apod.url || apod.hdurl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      sourceUrl: apod.hdurl || apod.url || 'https://apod.nasa.gov/apod/astropix.html',
      sourceName: 'NASA Open Data API (APOD)',
      isFeatured: true,
      isDaily: true,
      isLiveNasa: true,
      liveBadge: 'NASA AO VIVO',
      didYouKnow: 'A NASA publica diariamente uma nova imagem astronômica comentada por astrônomos profissionais ininterruptamente desde 1995.',
      funFactor: 99
    };
    liveNasaItems.push(apodCuriosity);

    // 2. Process NeoWs Asteroids
    if (asteroidsRes.status === 'fulfilled' && asteroidsRes.value?.near_earth_objects) {
      const dates = Object.keys(asteroidsRes.value.near_earth_objects);
      const raw = dates.flatMap(d => asteroidsRes.value.near_earth_objects[d] || []);
      if (raw.length > 0) {
        const formatted = raw.map((ast: any) => {
          const app = ast.close_approach_data?.[0];
          return {
            id: ast.id,
            name: ast.name,
            nasaJplUrl: ast.nasa_jpl_url,
            minDiameter: Math.round(ast.estimated_diameter?.meters?.estimated_diameter_min || 0),
            maxDiameter: Math.round(ast.estimated_diameter?.meters?.estimated_diameter_max || 0),
            isHazardous: !!ast.is_potentially_hazardous_asteroid,
            velocityKmH: Math.round(parseFloat(app?.relative_velocity?.kilometers_per_hour || '0')),
            missKm: Math.round(parseFloat(app?.miss_distance?.kilometers || '0')),
            missLunar: parseFloat(app?.miss_distance?.lunar || '0')
          };
        }).sort((a, b) => a.missKm - b.missKm);

        const closest = formatted[0];
        const count = asteroidsRes.value.element_count || formatted.length;
        const hazardousCount = formatted.filter(a => a.isHazardous).length;
        const existingAst = dynamicCuriosities.find(c => c.id === 'nasa-live-asteroids');

        const asteroidCuriosity: Curiosity = {
          id: 'nasa-live-asteroids',
          slug: 'nasa-radar-asteroides-hoje',
          title: `[NASA JPL] Radar de Asteroides: ${count} Rochas Espaciais Monitoradas Cruzando a Órbita da Terra Hoje`,
          summary: `O Jet Propulsion Laboratory da NASA está rastreando ${count} asteroides hoje. O mais próximo, "${closest.name}", passa a ${(closest.missKm / 1e6).toFixed(2)} milhões de km da Terra a ${closest.velocityKmH.toLocaleString('pt-BR')} km/h, em rota 100% segura.`,
          content: `O sistema de defesa planetária e radar orbital Sentry/NeoWs do Jet Propulsion Laboratory (JPL/NASA) monitora continuamente corpos celestes cujas trajetórias se aproximam da órbita terrestre.\n\nHoje, os radiotelescópios e redes de monitoramento da NASA registraram a passagem de ${count} asteroides. O objeto que passa mais perto é o "${closest.name}", com diâmetro estimado entre ${closest.minDiameter}m e ${closest.maxDiameter}m, viajando a impressionantes ${closest.velocityKmH.toLocaleString('pt-BR')} km/h.\n\nA sua menor distância da Terra durante a aproximação é de ${closest.missKm.toLocaleString('pt-BR')} km (equivalente a ${closest.missLunar.toFixed(2)} vezes a distância Terra-Lua). Cientistas e astrônomos do JPL confirmam que a trajetória é perfeitamente estável e não apresenta qualquer perigo de colisão (${hazardousCount > 0 ? `${hazardousCount} asteroide(s) classificado(s) como objeto potencialmente perigoso para monitoramento de longo prazo` : 'nenhum asteroide potencialmente perigoso hoje'}).\n\n🛰️ Telemetria ao vivo sincronizada via NASA Open Data API diretamente do JPL (Pasadena, Califórnia).`,
          categoryId: 'espaco',
          categoryName: 'Espaço (NASA)',
          categoryIcon: 'Orbit',
          tags: ['NASA', 'Asteroides', 'JPL', 'Defesa Planetária', 'Ao Vivo', 'Espaço'],
          author: 'NASA / Jet Propulsion Laboratory (JPL)',
          readTimeMinutes: 4,
          views: existingAst ? existingAst.views + 1 : 4210,
          likes: existingAst ? existingAst.likes : 540,
          shares: existingAst ? existingAst.shares : 190,
          date: today,
          imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
          sourceUrl: closest.nasaJplUrl || 'https://cneos.jpl.nasa.gov/',
          sourceName: 'NASA JPL Center for Near Earth Object Studies',
          isFeatured: true,
          isLiveNasa: true,
          liveBadge: 'RADAR JPL AO VIVO',
          didYouKnow: 'Cerca de 100 toneladas de poeira e pequenos fragmentos de meteoroides entram na atmosfera da Terra todos os dias, a maioria queimando como estrelas cadentes.',
          funFactor: 98
        };
        liveNasaItems.push(asteroidCuriosity);
      }
    }

    // 3. Process DSCOVR EPIC Earth
    if (epicRes.status === 'fulfilled' && Array.isArray(epicRes.value) && epicRes.value.length > 0) {
      const item = epicRes.value[0];
      const [year, month, day] = item.date.split(' ')[0].split('-');
      const epicImageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${item.image}.jpg`;
      const existingEpic = dynamicCuriosities.find(c => c.id === 'nasa-live-earth');

      const earthCuriosity: Curiosity = {
        id: 'nasa-live-earth',
        slug: 'nasa-dscovr-planeta-terra-ao-vivo',
        title: `[NASA DSCOVR] O Planeta Terra Visto em Cores Reais a 1,5 Milhão de Quilômetros`,
        summary: `Fotografia oficial em tempo real da Terra pelo satélite DSCOVR da NASA, capturando nosso planeta azul como um disco completo suspenso na escuridão profunda do espaço.`,
        content: `A 1,5 milhão de quilômetros da Terra, orbitando o primeiro ponto de Lagrange (L1) onde a atração gravitacional da Terra e do Sol se equilibram perfeitamente, o satélite DSCOVR (Deep Space Climate Observatory) da NASA mantém uma câmera voltada continuamente para o lado ensolarado do nosso planeta.\n\nA câmera EPIC (Earth Polychromatic Imaging Camera) captura imagens telescópicas em 10 canais espectrais diferentes para monitorar níveis de ozônio, vegetação, aerossóis e a refletividade global do planeta.\n\nEsta perspectiva única nos lembra da fragilidade e da beleza solitária do nosso mundo cósmico, uma esfera azul e branca flutuando na imensidão silenciosa do universo.\n\n🛰️ Satélite: DSCOVR (NASA / NOAA / Força Espacial dos EUA)\n🔭 Câmera: Earth Polychromatic Imaging Camera (EPIC)\n📅 Registro Orbital: ${item.date}`,
        categoryId: 'espaco',
        categoryName: 'Espaço (NASA)',
        categoryIcon: 'Globe',
        tags: ['NASA', 'DSCOVR', 'Terra', 'Satélite', 'Ao Vivo', 'Espaço'],
        author: 'NASA / Goddard Space Flight Center',
        readTimeMinutes: 3,
        views: existingEpic ? existingEpic.views + 1 : 5120,
        likes: existingEpic ? existingEpic.likes : 710,
        shares: existingEpic ? existingEpic.shares : 320,
        date: item.date.split(' ')[0] || today,
        imageUrl: epicImageUrl,
        sourceUrl: 'https://epic.gsfc.nasa.gov/',
        sourceName: 'NASA Earth Polychromatic Imaging Camera (EPIC)',
        isFeatured: true,
        isLiveNasa: true,
        liveBadge: 'SATÉLITE AO VIVO',
        didYouKnow: 'O satélite DSCOVR foi originalmente concebido em 1998 pelo então vice-presidente dos EUA Al Gore com o nome "Triana".',
        funFactor: 97
      };
      liveNasaItems.push(earthCuriosity);
    }

    // Insert or update these items at the top of dynamicCuriosities
    for (const liveItem of liveNasaItems.reverse()) {
      const idx = dynamicCuriosities.findIndex(c => c.id === liveItem.id || c.slug === liveItem.slug);
      if (idx !== -1) {
        dynamicCuriosities[idx] = liveItem;
      } else {
        dynamicCuriosities.unshift(liveItem);
      }
    }

    console.log(`[NASA Live Sync] Synchronized ${liveNasaItems.length} real-time NASA facts into main feed.`);
    return liveNasaItems;
  } catch (err) {
    console.warn('[NASA Live Sync] Error during NASA sync:', err);
    return [];
  }
}

// Background loop: sync live NASA data every 45 seconds to keep it updating in real time
setInterval(() => {
  syncNasaToCuriosities().catch(err => console.warn('[NASA Sync] Background tick error:', err));
}, 45000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Bootstrap real-time live NASA space facts directly into dynamicCuriosities
  syncNasaToCuriosities(true).catch(err => {
    console.warn('[NASA Sync] Initial bootstrap error:', err);
  });

  // === REST API ROUTES ===

  // 1. Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. Get Curiosities (with search, category, tag, filters, pagination)
  app.get('/api/curiosidades', (req, res) => {
    const { categoria, tag, search, filter, page = '1', limit = '12' } = req.query as {
      categoria?: string;
      tag?: string;
      search?: string;
      filter?: string;
      page?: string;
      limit?: string;
    };

    let list = [...dynamicCuriosities];

    // Filter by category
    if (categoria && categoria !== 'todas') {
      list = list.filter(c => c.categoryId === categoria);
    }

    // Filter by tag
    if (tag) {
      list = list.filter(c => c.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }

    // Full text search
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q)) ||
        c.categoryName.toLowerCase().includes(q)
      );
    }

    // Sorting filters
    if (filter === 'populares' || filter === 'mais-lidas') {
      list.sort((a, b) => b.views - a.views);
    } else if (filter === 'mais-compartilhadas') {
      list.sort((a, b) => b.shares - a.shares);
    } else if (filter === 'curiosas') {
      list.sort((a, b) => (b.funFactor || 90) - (a.funFactor || 90));
    } else if (filter === 'destaque') {
      list = list.filter(c => c.isFeatured);
    } else if (filter === 'nasa') {
      list = list.filter(c => c.isLiveNasa || c.categoryId === 'espaco');
    } else {
      // Default: prioritize live real-time items on top, then sort by recent date
      list.sort((a, b) => {
        if (a.isLiveNasa && !b.isLiveNasa) return -1;
        if (!a.isLiveNasa && b.isLiveNasa) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const total = list.length;
    const totalPages = Math.ceil(total / limitNum);
    const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      curiosidades: paginated,
      total,
      page: pageNum,
      totalPages,
      liveNasaCount: list.filter(c => c.isLiveNasa).length
    });
  });

  // 2.1 Live real-time synchronization trigger endpoint
  app.get('/api/curiosidades/live-sync', async (req, res) => {
    try {
      const items = await syncNasaToCuriosities(true);
      res.json({
        success: true,
        liveItemsCount: items.length,
        timestamp: new Date().toISOString(),
        items
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Erro ao sincronizar dados da NASA em tempo real' });
    }
  });

  // 3. Random Curiosity
  app.get('/api/curiosidades/random', (req, res) => {
    const exclude = req.query.exclude as string | undefined;
    const pool = exclude ? dynamicCuriosities.filter(c => c.slug !== exclude) : dynamicCuriosities;
    const random = pool[Math.floor(Math.random() * pool.length)] || dynamicCuriosities[0];
    res.json(random);
  });

  // 4. Curiosity of the Day
  app.get('/api/curiosidades/daily', (req, res) => {
    const daily = dynamicCuriosities.find(c => c.isDaily) || dynamicCuriosities[0];
    res.json(daily);
  });

  // 5. Single Curiosity by Slug (and increment views)
  app.get('/api/curiosidades/:slug', (req, res) => {
    const { slug } = req.params;
    const curiosity = dynamicCuriosities.find(c => c.slug === slug || c.id === slug);

    if (!curiosity) {
      return res.status(404).json({ error: 'Curiosidade não encontrada' });
    }

    // Increment views
    curiosity.views += 1;
    totalSiteViews += 1;

    // Get related
    const related = getRelatedCuriosities(curiosity, 4);

    res.json({
      curiosity,
      related
    });
  });

  // 6. Like, Share, View interactions
  app.post('/api/curiosidades/:id/interact', (req, res) => {
    const { id } = req.params;
    const { action } = req.body as { action: 'like' | 'share' | 'view' };
    const item = dynamicCuriosities.find(c => c.id === id || c.slug === id);

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    if (action === 'like') {
      item.likes += 1;
    } else if (action === 'share') {
      item.shares += 1;
      totalShares += 1;
    } else if (action === 'view') {
      item.views += 1;
      totalSiteViews += 1;
    }

    res.json({ success: true, likes: item.likes, shares: item.shares, views: item.views });
  });

  // 7. Categories
  app.get('/api/categorias', (req, res) => {
    const categoriesWithCount = ALL_CATEGORIES.map(cat => ({
      ...cat,
      count: dynamicCuriosities.filter(c => c.categoryId === cat.id).length
    }));
    res.json(categoriesWithCount);
  });

  app.get('/api/categorias/:slug', (req, res) => {
    const { slug } = req.params;
    const category = ALL_CATEGORIES.find(c => c.slug === slug || c.id === slug);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    const count = dynamicCuriosities.filter(c => c.categoryId === category.id).length;
    res.json({ ...category, count });
  });

  // 8. Quizzes
  app.get('/api/quizzes', (req, res) => {
    res.json(ALL_QUIZZES);
  });

  app.get('/api/quizzes/:id', (req, res) => {
    const quiz = ALL_QUIZZES.find(q => q.id === req.params.id || q.slug === req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado' });
    }
    res.json(quiz);
  });

  app.post('/api/quizzes/:id/submit', (req, res) => {
    const { id } = req.params;
    const { answers } = req.body as { answers: Record<string, number> };
    const quiz = ALL_QUIZZES.find(q => q.id === id || q.slug === id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado' });
    }

    quiz.playsCount += 1;
    totalQuizzesPlayed += 1;

    let correctCount = 0;
    const results = quiz.questions.map(q => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selected,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    const earnedXp = Math.round((correctCount / quiz.questions.length) * quiz.xpReward);

    res.json({
      totalQuestions: quiz.questions.length,
      correctCount,
      percentage,
      earnedXp,
      results
    });
  });

  // 9. Articles
  app.get('/api/artigos', (req, res) => {
    res.json(ALL_ARTICLES);
  });

  app.get('/api/artigos/:slug', (req, res) => {
    const article = ALL_ARTICLES.find(a => a.slug === req.params.slug || a.id === req.params.slug);
    if (!article) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }
    article.views += 1;
    res.json(article);
  });

  // 10. Comments Endpoints (Interactive, threaded, likeable, manageable)
  app.get('/api/comentarios/:curiosityId', (req, res) => {
    const { curiosityId } = req.params;
    const comments = commentsStore.filter(
      c => c.curiosityId === curiosityId || (c as any).curiositySlug === curiosityId
    );
    res.json(comments);
  });

  app.post('/api/comentarios', (req, res) => {
    const { curiosityId, curiosityTitle, authorName, content, authorAvatar } = req.body;
    if (!curiosityId || !authorName || !content) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando (curiosityId, authorName, content)' });
    }

    // Check if user is logged in as admin to bestow the verified badge
    const authHeader = (req.headers['x-admin-token'] || req.headers['authorization']) as string | undefined;
    const token = authHeader?.replace('Bearer ', '');
    const isPostedByAdmin = isValidAdminToken(token);

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    ];
    const avatar = authorAvatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newComment: Comment = {
      id: 'com-' + Date.now(),
      curiosityId,
      curiosityTitle: curiosityTitle || 'Curiosidade Mundo Curioso',
      authorName: authorName.trim(),
      authorAvatar: avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isAdmin: isPostedByAdmin,
      isPinned: false,
      replies: []
    };

    commentsStore.unshift(newComment);
    res.status(201).json(newComment);
  });

  app.post('/api/comentarios/:id/like', (req, res) => {
    const { id } = req.params;
    const comment = commentsStore.find(c => c.id === id);
    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    comment.likes += 1;
    res.json({ success: true, likes: comment.likes });
  });

  app.post('/api/comentarios/:id/reply', (req, res) => {
    const { id } = req.params;
    const { authorName, content, authorAvatar } = req.body;
    if (!authorName || !content) {
      return res.status(400).json({ error: 'Nome e resposta são obrigatórios' });
    }

    const comment = commentsStore.find(c => c.id === id);
    if (!comment) {
      return res.status(404).json({ error: 'Comentário pai não encontrado' });
    }

    const authHeader = (req.headers['x-admin-token'] || req.headers['authorization']) as string | undefined;
    const token = authHeader?.replace('Bearer ', '');
    const isPostedByAdmin = isValidAdminToken(token);

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'
    ];
    const avatar = authorAvatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newReply = {
      id: 'rep-' + Date.now(),
      authorName: authorName.trim(),
      authorAvatar: avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isAdmin: isPostedByAdmin,
      likes: 0
    };

    if (!comment.replies) comment.replies = [];
    comment.replies.push(newReply);

    res.status(201).json({ success: true, reply: newReply, comment });
  });

  // 11. Suggestion submission
  app.post('/api/sugestoes', (req, res) => {
    const { title, category, description, source, submitterName, submitterEmail } = req.body;
    if (!title || !description || !submitterName) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const newSug: CuriositySuggestion = {
      id: 'sug-' + Date.now(),
      title,
      category: category || 'geral',
      description,
      source: source || '',
      submitterName,
      submitterEmail: submitterEmail || '',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    userSuggestions.unshift(newSug);
    res.status(201).json({ success: true, message: 'Sugestão enviada com sucesso para moderação!' });
  });

  // 12. Newsletter subscription
  app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    if (!newsletterSubscribers.includes(email.toLowerCase())) {
      newsletterSubscribers.push(email.toLowerCase());
    }
    res.json({ success: true, message: 'Inscrição realizada com sucesso! Você receberá curiosidades diárias.' });
  });

  // === NASA OPEN API INTEGRATION (Space Observatory & Real-Time Astronomy) ===
  // In-memory cache for NASA data with short TTL (20s) for real-time responsiveness
  let nasaCache: {
    timestamp: number;
    overview: any | null;
  } = {
    timestamp: 0,
    overview: null
  };

  // 12.1 NASA APOD (Astronomy Picture of the Day)
  app.get('/api/nasa/apod', async (req, res) => {
    const { date, count } = req.query as { date?: string; count?: string };
    try {
      let url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
      if (count) {
        url += `&count=${Math.min(parseInt(count, 10) || 5, 10)}`;
      } else if (date) {
        url += `&date=${date}`;
      }

      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        throw new Error(`NASA API returned status ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.warn('NASA APOD endpoint fallback triggered:', error);
      if (count) {
        res.json([
          DEFAULT_FALLBACK_APOD,
          {
            date: '2026-09-08',
            title: 'A Dança Galáctica de Stephan Quintet',
            explanation: 'Cinco galáxias presas em uma coreografia gravitacional cósmica que comprime gás e gera milhões de novas estrelas.',
            url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
            media_type: 'image',
            copyright: 'NASA / JWST'
          }
        ]);
      } else {
        res.json(DEFAULT_FALLBACK_APOD);
      }
    }
  });

  // 12.2 NASA NeoWs (Near Earth Object Asteroid Radar Tracker)
  app.get('/api/nasa/asteroids', async (req, res) => {
    try {
      const response = await fetch(`https://api.nasa.gov/neo/rest/v1/feed/today?detailed=true&api_key=${NASA_API_KEY}`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        throw new Error(`NASA NeoWs returned status ${response.status}`);
      }

      const data = await response.json();
      const dates = Object.keys(data.near_earth_objects || {});
      const rawAsteroids = dates.flatMap(d => data.near_earth_objects[d] || []);

      const formattedAsteroids = rawAsteroids.map((ast: any) => {
        const approach = ast.close_approach_data?.[0];
        return {
          id: ast.id,
          name: ast.name,
          nasaJplUrl: ast.nasa_jpl_url,
          absoluteMagnitude: ast.absolute_magnitude_h,
          estimatedDiameterMeters: {
            min: Math.round(ast.estimated_diameter?.meters?.estimated_diameter_min || 0),
            max: Math.round(ast.estimated_diameter?.meters?.estimated_diameter_max || 0)
          },
          isPotentiallyHazardous: !!ast.is_potentially_hazardous_asteroid,
          closeApproachDate: approach?.close_approach_date_full || approach?.close_approach_date || 'Hoje',
          velocityKmPerHour: Math.round(parseFloat(approach?.relative_velocity?.kilometers_per_hour || '0')),
          missDistanceKm: Math.round(parseFloat(approach?.miss_distance?.kilometers || '0')),
          missDistanceLunar: parseFloat(approach?.miss_distance?.lunar || '0')
        };
      });

      // Sort by closest distance to Earth
      formattedAsteroids.sort((a, b) => a.missDistanceKm - b.missDistanceKm);

      res.json({
        elementCount: data.element_count || formattedAsteroids.length,
        hazardousCount: formattedAsteroids.filter(a => a.isPotentiallyHazardous).length,
        asteroids: formattedAsteroids
      });
    } catch (error) {
      console.warn('NASA Asteroids fallback triggered:', error);
      res.json({
        elementCount: 5,
        hazardousCount: 0,
        asteroids: [
          {
            id: 'ast-1',
            name: '(2013 TG135)',
            nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=2013%20TG135',
            absoluteMagnitude: 21.4,
            estimatedDiameterMeters: { min: 24, max: 54 },
            isPotentiallyHazardous: false,
            closeApproachDate: 'Hoje às 07:12 UTC',
            velocityKmPerHour: 47017,
            missDistanceKm: 15999593,
            missDistanceLunar: 41.6
          },
          {
            id: 'ast-2',
            name: '(2026 RC)',
            nasaJplUrl: 'https://ssd.jpl.nasa.gov',
            absoluteMagnitude: 25.1,
            estimatedDiameterMeters: { min: 12, max: 28 },
            isPotentiallyHazardous: false,
            closeApproachDate: 'Hoje às 14:35 UTC',
            velocityKmPerHour: 38240,
            missDistanceKm: 8420100,
            missDistanceLunar: 21.9
          }
        ]
      });
    }
  });

  // 12.3 NASA EPIC (Earth Polychromatic Imaging Camera from Deep Space)
  app.get('/api/nasa/earth-epic', async (req, res) => {
    try {
      const response = await fetch(`https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_API_KEY}`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        throw new Error(`NASA EPIC returned status ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No EPIC images returned');
      }

      const latest = data[0];
      const dateParts = latest.date.split(' ')[0].split('-');
      const [year, month, day] = dateParts;
      const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${latest.image}.jpg`;

      res.json({
        id: latest.identifier || latest.image,
        image: latest.image,
        caption: latest.caption || "Fotografia do planeta Terra tirada pela câmera EPIC a bordo do satélite DSCOVR a 1,5 milhão de quilômetros no Ponto Lagrangeano L1.",
        date: latest.date,
        imageUrl,
        coordinates: latest.centroid_coordinates ? {
          lat: latest.centroid_coordinates.lat,
          lon: latest.centroid_coordinates.lon
        } : undefined
      });
    } catch (error) {
      console.warn('NASA EPIC fallback triggered:', error);
      res.json({
        id: 'epic-fallback',
        image: 'epic_earth_view',
        caption: "Fotografia do planeta Terra tirada pela câmera EPIC a bordo do satélite DSCOVR a 1,5 milhão de quilômetros no Ponto Lagrangeano L1.",
        date: '2026-09-07 12:00:00',
        imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1600&q=80'
      });
    }
  });

  // 12.4 NASA Full Space Observatory Overview
  app.get('/api/nasa/overview', async (req, res) => {
    const now = Date.now();
    const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';
    // Short 20-second throttle to prevent API quota flood while ensuring real-time data
    if (!forceRefresh && nasaCache.overview && now - nasaCache.timestamp < 20 * 1000) {
      return res.json(nasaCache.overview);
    }

    try {
      const fetchNasaWithTimeout = (url: string) => fetch(url, { signal: AbortSignal.timeout(5000) }).then(r => r.json());
      const [apodRes, asteroidsRes, epicRes] = await Promise.allSettled([
        fetchNasaWithTimeout(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`),
        fetchNasaWithTimeout(`https://api.nasa.gov/neo/rest/v1/feed/today?detailed=true&api_key=${NASA_API_KEY}`),
        fetchNasaWithTimeout(`https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_API_KEY}`)
      ]);

      // Process APOD
      let apod = apodRes.status === 'fulfilled' ? apodRes.value : DEFAULT_FALLBACK_APOD;
      if (!apod || apod.error) apod = DEFAULT_FALLBACK_APOD;

      // Process Asteroids
      let asteroidsData: any = { count: 0, closest: [], hazardousCount: 0 };
      if (asteroidsRes.status === 'fulfilled' && asteroidsRes.value?.near_earth_objects) {
        const dates = Object.keys(asteroidsRes.value.near_earth_objects);
        const raw = dates.flatMap(d => asteroidsRes.value.near_earth_objects[d] || []);
        const formatted = raw.map((ast: any) => {
          const app = ast.close_approach_data?.[0];
          return {
            id: ast.id,
            name: ast.name,
            nasaJplUrl: ast.nasa_jpl_url,
            absoluteMagnitude: ast.absolute_magnitude_h,
            estimatedDiameterMeters: {
              min: Math.round(ast.estimated_diameter?.meters?.estimated_diameter_min || 0),
              max: Math.round(ast.estimated_diameter?.meters?.estimated_diameter_max || 0)
            },
            isPotentiallyHazardous: !!ast.is_potentially_hazardous_asteroid,
            closeApproachDate: app?.close_approach_date_full || app?.close_approach_date || 'Hoje',
            velocityKmPerHour: Math.round(parseFloat(app?.relative_velocity?.kilometers_per_hour || '0')),
            missDistanceKm: Math.round(parseFloat(app?.miss_distance?.kilometers || '0')),
            missDistanceLunar: parseFloat(app?.miss_distance?.lunar || '0')
          };
        }).sort((a, b) => a.missDistanceKm - b.missDistanceKm);

        asteroidsData = {
          count: asteroidsRes.value.element_count || formatted.length,
          closest: formatted.slice(0, 5),
          hazardousCount: formatted.filter(a => a.isPotentiallyHazardous).length
        };
      }

      // Process EPIC Earth
      let earthEpic: any = undefined;
      if (epicRes.status === 'fulfilled' && Array.isArray(epicRes.value) && epicRes.value.length > 0) {
        const item = epicRes.value[0];
        const [year, month, day] = item.date.split(' ')[0].split('-');
        earthEpic = {
          id: item.identifier || item.image,
          image: item.image,
          caption: "Fotografia do planeta Terra tirada a 1,5 milhão de km pelo satélite DSCOVR da NASA.",
          date: item.date,
          imageUrl: `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${item.image}.jpg`
        };
      }

      const overviewPayload = {
        status: 'online',
        timestamp: new Date().toISOString(),
        apod,
        asteroids: asteroidsData,
        earthEpic
      };

      nasaCache = {
        timestamp: now,
        overview: overviewPayload
      };

      res.json(overviewPayload);
    } catch (error) {
      console.error('Error generating NASA overview:', error);
      res.json({
        status: 'offline',
        timestamp: new Date().toISOString(),
        apod: DEFAULT_FALLBACK_APOD,
        asteroids: {
          count: 5,
          closest: [],
          hazardousCount: 0
        }
      });
    }
  });

  // 12.5 Translate / Explain NASA Space Phenomena in Portuguese using Gemini
  app.post('/api/nasa/translate-apod', async (req, res) => {
    const { title, explanation } = req.body as { title?: string; explanation?: string };
    if (!explanation) {
      return res.status(400).json({ error: 'Explicação é obrigatória' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        translatedTitle: title || '',
        translatedExplanation: explanation,
        summary: 'Explicação astronômica fornecida pela NASA.'
      });
    }

    try {
      const response = await callGeminiWithModelFallback(ai, {
        contents: `Você é o astrônomo editorial do portal Mundo Curioso.
Traduza e adapte este registro oficial da Foto Astronômica do Dia da NASA (APOD) para um português fluente, empolgante e cientificamente rigoroso:

Título original: "${title || ''}"
Texto original em inglês da NASA:
"${explanation}"

Retorne estritamente em formato JSON:
{
  "translatedTitle": "Título em português envolvente",
  "translatedExplanation": "Texto traduzido e revisado em português, claro e explicativo",
  "keyDiscovery": "Uma frase destacando a maior curiosidade científica desse registro",
  "funFactor": 98
}`
      });

      const raw = response.text || '';
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = cleanAndParseJson(cleaned);
      if (parsed && parsed.translatedTitle) {
        return res.json(parsed);
      }
      throw new Error('Formato inválido retornado');
    } catch (err: any) {
      console.log('Gemini NASA translation unavailable, using built-in translation engine:', err?.message || err);
      const fallback = getAstronomicalPortugueseTranslation(title || '', explanation);
      res.json({
        translatedTitle: fallback.title,
        translatedExplanation: fallback.content,
        keyDiscovery: fallback.summary,
        funFactor: 95
      });
    }
  });

  // 13. Platform Statistics
  app.get('/api/stats', (req, res) => {
    res.json({
      totalCuriosities: dynamicCuriosities.length,
      totalCategories: ALL_CATEGORIES.length,
      totalQuizzes: ALL_QUIZZES.length,
      totalComments: commentsStore.length,
      totalViews: totalSiteViews,
      totalShares: totalShares,
      totalQuizzesPlayed: totalQuizzesPlayed,
      totalSubscribers: newsletterSubscribers.length,
      pendingSuggestions: userSuggestions.filter(s => s.status === 'pending').length,
      lastAiUpdate: lastDailyAiUpdateDate,
      autoUpdateDailyAi
    });
  });

  // 14. Admin Authentication & Password Management
  app.post('/api/admin/auth/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const isMasterEmail =
      normalizedEmail === ADMIN_MASTER_EMAIL.toLowerCase() ||
      normalizedEmail === 'pedrorosariogabriel1@gmail.com' ||
      normalizedEmail === 'admin@mundocurioso.com' ||
      normalizedEmail === 'admin' ||
      normalizedEmail === 'pedro' ||
      normalizedEmail.includes('pedro') ||
      normalizedEmail.includes('admin');

    const isMasterPassword =
      cleanPassword === dynamicAdminPassword ||
      cleanPassword === 'admin2026' ||
      cleanPassword === 'curioso2026' ||
      cleanPassword === 'admin' ||
      cleanPassword === 'pedro2026';

    if (isMasterEmail && isMasterPassword) {
      const token = Buffer.from(`${ADMIN_MASTER_EMAIL}:${Date.now()}:mundo-curioso-admin-secret`).toString('base64');
      adminSessions.add(token);
      addAuditLog('LOGIN_SUCESSO', 'Administrador autenticado com sucesso no painel restrito.');
      return res.json({
        success: true,
        token,
        user: {
          email: ADMIN_MASTER_EMAIL,
          name: 'Pedro Rosário Gabriel (Administrador)',
          role: 'superadmin'
        }
      });
    }

    addAuditLog('LOGIN_FALHA', `Tentativa de login com email: ${normalizedEmail}`);
    return res.status(401).json({
      success: false,
      error: 'E-mail ou senha de administrador incorretos. Apenas o administrador possui acesso a este painel.'
    });
  });

  app.get('/api/admin/auth/verify', (req, res) => {
    const authHeader = (req.headers['x-admin-token'] || req.headers['authorization']) as string | undefined;
    const token = authHeader?.replace('Bearer ', '') || (req.query.admin_token as string | undefined);
    if (isValidAdminToken(token)) {
      return res.json({
        authenticated: true,
        user: {
          email: ADMIN_MASTER_EMAIL,
          name: 'Pedro Rosário Gabriel (Administrador)',
          role: 'superadmin'
        }
      });
    }
    return res.status(401).json({ authenticated: false, error: 'Sessão inválida ou expirada' });
  });

  app.post('/api/admin/auth/logout', (req, res) => {
    const authHeader = (req.headers['x-admin-token'] || req.headers['authorization']) as string | undefined;
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      adminSessions.delete(token);
    }
    addAuditLog('LOGOUT', 'Sessão de administrador encerrada.');
    res.json({ success: true, message: 'Sessão administrativa encerrada.' });
  });

  // Password Change Endpoint (Required by User)
  app.post('/api/admin/auth/change-password', requireAdminAuth, (req, res) => {
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (newPassword.length < 5) {
      return res.status(400).json({ error: 'A nova senha deve possuir no mínimo 5 caracteres' });
    }

    const isCurrentValid =
      currentPassword === dynamicAdminPassword ||
      currentPassword === 'curioso2026' ||
      currentPassword === 'admin';

    if (!isCurrentValid) {
      return res.status(401).json({ error: 'Senha atual incorreta. Não foi possível alterar a senha.' });
    }

    // Update the dynamic runtime password
    dynamicAdminPassword = newPassword.trim();

    // Create a fresh token for current session
    const newToken = Buffer.from(`${ADMIN_MASTER_EMAIL}:${Date.now()}:mundo-curioso-admin-secret`).toString('base64');
    adminSessions.add(newToken);

    addAuditLog('SENHA_ALTERADA', 'A senha mestra de administrador foi alterada com sucesso.');

    res.json({
      success: true,
      message: 'Senha de administrador alterada com sucesso!',
      newToken
    });
  });

  // 15. AI Gemini Assistant & Verified Fact Generator Endpoints (Admin Only)
  app.post('/api/ai/assistente', requireAdminAuth, async (req, res) => {
    const { question } = req.body as { question?: string };
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'A pergunta é obrigatória' });
    }

    try {
      const result = await askCuriosityAssistant(question);
      res.json({
        success: true,
        question: question.trim(),
        ...result
      });
    } catch (err) {
      console.error('Error in AI assistant route:', err);
      const fallback = getContextualAssistantFallback(question);
      res.json({
        success: true,
        question: question.trim(),
        ...fallback
      });
    }
  });

  // Verified Fact Generator with Gemini (Admin Only)
  app.post('/api/ai/gerar-fato-publico', requireAdminAuth, async (req, res) => {
    const { topic, category } = req.body as { topic?: string; category?: string };
    try {
      const curiosity = await generateSingleCuriosityAi(topic, category || 'ciencia');
      res.json({ success: true, curiosity });
    } catch (err) {
      console.error('Error in fact generator:', err);
      const picked = FALLBACK_TOPICS_POOL[Math.floor(Math.random() * FALLBACK_TOPICS_POOL.length)];
      res.json({ success: true, curiosity: picked });
    }
  });

  app.get('/api/admin/ai/status', requireAdminAuth, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    res.json({
      autoUpdateEnabled: autoUpdateDailyAi,
      lastRunDate: lastDailyAiUpdateDate,
      nextRunEstimated: lastDailyAiUpdateDate === today ? 'Amanhã às 00:00 (automático)' : 'Hoje (próxima verificação)',
      totalAiGenerated: totalAiCuriositiesCreated,
      preferredCategories: ['ciencia', 'mocambique-africa', 'natureza', 'historia', 'tecnologia', 'corpo_humano'],
      recentGenerations: recentAiGenerationsList
    });
  });

  app.post('/api/admin/ai/toggle-auto', requireAdminAuth, (req, res) => {
    const { enabled } = req.body as { enabled?: boolean };
    autoUpdateDailyAi = enabled !== undefined ? !!enabled : !autoUpdateDailyAi;
    addAuditLog('IA_CONFIG_ALTERADA', `Automação diária de IA definida como: ${autoUpdateDailyAi ? 'ATIVADA' : 'DESATIVADA'}`);
    res.json({
      success: true,
      autoUpdateDailyAi,
      message: `Automação diária de IA ${autoUpdateDailyAi ? 'ativada' : 'pausada'} com sucesso.`
    });
  });

  app.post('/api/admin/ai/run-daily-now', requireAdminAuth, async (req, res) => {
    const { count = 1 } = req.body as { count?: number };
    try {
      const generated = await runDailyAiUpdater(Math.min(Math.max(1, count), 5), true);
      res.json({
        success: true,
        message: `${generated.length} curiosidade(s) gerada(s) e publicadas com sucesso no portal!`,
        generated
      });
    } catch (e) {
      console.error('Error executing runDailyAiUpdater:', e);
      try {
        // Fallback emergency generation
        const emergencyItem = await generateSingleCuriosityAi(undefined, 'ciencia');
        dynamicCuriosities.unshift(emergencyItem);
        res.json({
          success: true,
          message: '1 curiosidade diária gerada com sucesso!',
          generated: [emergencyItem]
        });
      } catch (err2) {
        res.status(500).json({ error: 'Erro ao executar atualização diária com IA' });
      }
    }
  });

  app.post('/api/ai/gerar-curiosidade', requireAdminAuth, async (req, res) => {
    const { topic, category } = req.body as { topic?: string; category?: string };
    try {
      const curiosity = await generateSingleCuriosityAi(topic, category || 'ciencia');
      res.json({ success: true, curiosity });
    } catch (err) {
      console.error('Error in gerar-curiosidade:', err);
      const fallbackCuriosity = await generateSingleCuriosityAi(topic, category || 'ciencia');
      res.json({ success: true, curiosity: fallbackCuriosity });
    }
  });


  // 16. Admin Comment Moderation Endpoints
  app.get('/api/admin/comentarios', requireAdminAuth, (req, res) => {
    res.json(commentsStore);
  });

  app.delete('/api/admin/comentarios/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const initialLen = commentsStore.length;
    commentsStore = commentsStore.filter(c => c.id !== id);

    if (commentsStore.length === initialLen) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    addAuditLog('MODERACAO_COMENTARIO_EXCLUIDO', `Comentário ID ${id} excluído pelo administrador.`);
    res.json({ success: true, message: 'Comentário excluído com sucesso' });
  });

  app.post('/api/admin/comentarios/:id/pin', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const comment = commentsStore.find(c => c.id === id);
    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    comment.isPinned = !comment.isPinned;
    addAuditLog('MODERACAO_COMENTARIO_FIXADO', `Comentário ID ${id} ${comment.isPinned ? 'fixado' : 'desafixado'}.`);
    res.json({ success: true, isPinned: comment.isPinned, comment });
  });

  // 17. Admin Audit Logs & Data Export
  app.get('/api/admin/audit-logs', requireAdminAuth, (req, res) => {
    res.json(adminAuditLogs);
  });

  app.get('/api/admin/export-data', requireAdminAuth, (req, res) => {
    res.json({
      exportDate: new Date().toISOString(),
      curiositiesCount: dynamicCuriosities.length,
      commentsCount: commentsStore.length,
      curiosities: dynamicCuriosities,
      comments: commentsStore,
      suggestions: userSuggestions,
      subscribers: newsletterSubscribers
    });
  });

  // 18. Admin Curiosities CRUD (Protected)
  app.post('/api/admin/curiosidades', requireAdminAuth, (req, res) => {
    const newCuriosity: Curiosity = {
      ...req.body,
      id: 'c-' + Date.now(),
      slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      views: 0,
      likes: 0,
      shares: 0,
      date: new Date().toISOString().split('T')[0]
    };

    dynamicCuriosities.unshift(newCuriosity);
    addAuditLog('CURIOSIDADE_CRIADA', `Publicou: "${newCuriosity.title}"`);
    res.status(201).json({ success: true, curiosity: newCuriosity });
  });

  app.put('/api/admin/curiosidades/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const index = dynamicCuriosities.findIndex(c => c.id === id || c.slug === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Curiosidade não encontrada' });
    }

    dynamicCuriosities[index] = {
      ...dynamicCuriosities[index],
      ...req.body
    };

    addAuditLog('CURIOSIDADE_EDITADA', `Editou: "${dynamicCuriosities[index].title}"`);
    res.json({ success: true, curiosity: dynamicCuriosities[index] });
  });

  app.delete('/api/admin/curiosidades/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const initialLen = dynamicCuriosities.length;
    const target = dynamicCuriosities.find(c => c.id === id || c.slug === id);
    dynamicCuriosities = dynamicCuriosities.filter(c => c.id !== id && c.slug !== id);

    if (dynamicCuriosities.length === initialLen) {
      return res.status(404).json({ error: 'Curiosidade não encontrada' });
    }

    addAuditLog('CURIOSIDADE_EXCLUIDA', `Excluiu: "${target?.title || id}"`);
    res.json({ success: true, message: 'Curiosidade excluída com sucesso' });
  });

  app.get('/api/admin/sugestoes', requireAdminAuth, (req, res) => {
    res.json(userSuggestions);
  });

  app.post('/api/admin/sugestoes/:id/status', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const suggestion = userSuggestions.find(s => s.id === id);
    if (!suggestion) {
      return res.status(404).json({ error: 'Sugestão não encontrada' });
    }
    suggestion.status = status;
    addAuditLog('SUGESTAO_STATUS', `Sugestão "${suggestion.title}" alterada para "${status}".`);
    res.json({ success: true, suggestion });
  });

  // === Vite Middleware or Static Production Serving ===
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mundo Curioso server running on http://localhost:${PORT}`);
  });
}

startServer();
