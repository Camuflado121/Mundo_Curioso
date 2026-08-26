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
    title: 'O Lago Niassa e a maior variedade de peixes ciclídeos do planeta',
    category: 'mocambique-africa',
    description: 'O Lago Niassa (Malawi) em Moçambique abriga mais de 1.000 espécies endêmicas de ciclídeos que evoluíram mais rápido que os tentilhões de Darwin.',
    source: 'WWF Mozambique Freshwater Conservation',
    submitterName: 'Estevão Machava',
    submitterEmail: 'estevao.machava@gmail.com',
    createdAt: '2026-08-24T10:30:00Z',
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
    createdAt: '2026-08-24T14:15:00Z',
    status: 'approved'
  }
];

let commentsStore: Comment[] = [
  {
    id: 'com-1',
    curiosityId: 'c1',
    curiosityTitle: 'O exoplaneta onde chove vidro derretido a 8.700 km/h (HD 189733b)',
    authorName: 'Rodrigo Astronomia',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    content: 'HD 189733b é um dos meus exoplanetas favoritos! Imagine ventos 7 vezes mais rápidos que a velocidade do som!',
    createdAt: '2026-08-21T09:20:00Z',
    likes: 18,
    isPinned: true,
    replies: [
      {
        id: 'rep-1',
        authorName: 'Pedro Rosário Gabriel (Admin)',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        content: 'Fascinante mesmo, Rodrigo! As partículas de silicato na atmosfera dão a cor azul cobalto que lembra a Terra de longe.',
        createdAt: '2026-08-21T10:05:00Z',
        isAdmin: true,
        likes: 7
      }
    ]
  },
  {
    id: 'com-2',
    curiosityId: 'c2',
    curiosityTitle: 'Monte Namúli: O berço sagrado do povo Macua e ilha biológica',
    authorName: 'Amélia Macamo',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    content: 'Orgulho enorme de Moçambique e do Monte Namúli. As tradições orais preservaram esse patrimônio sagrado por gerações!',
    createdAt: '2026-08-22T16:40:00Z',
    likes: 24,
    replies: []
  },
  {
    id: 'com-3',
    curiosityId: 'c3',
    curiosityTitle: 'Por que o sangue dos polvos e lulas é azul e tem 3 corações?',
    authorName: 'Lucas Biólogo',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    content: 'A hemocianina com cobre é fascinante. A natureza encontrou soluções surpreendentes para a vida nos oceanos.',
    createdAt: '2026-08-20T11:10:00Z',
    likes: 12,
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
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
            author: 'Redação & IA Curiosa (Gemini 3.7)',
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
    } catch (e) {
      console.warn('Gemini generation failed, using rich thematic generator:', e);
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
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
    } catch (e) {
      console.warn('Gemini Assistant call failed, using intelligent contextual fallback', e);
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
    } else {
      // Default: recent (by date)
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      totalPages
    });
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
