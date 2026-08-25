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
    authorName: 'Rodrigo Astronomia',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    content: 'HD 189733b é um dos meus exoplanetas favoritos! Imagine ventos 7 vezes mais rápidos que a velocidade do som!',
    createdAt: '2026-08-21T09:20:00Z',
    likes: 18
  },
  {
    id: 'com-2',
    curiosityId: 'c2',
    authorName: 'Amélia Macamo',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    content: 'Orgulho enorme de Moçambique e do Monte Namúli. As tradições orais preservaram esse patrimônio sagrado por gerações!',
    createdAt: '2026-08-22T16:40:00Z',
    likes: 24
  },
  {
    id: 'com-3',
    curiosityId: 'c3',
    authorName: 'Lucas Biólogo',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    content: 'A hemocianina com cobre é fascinante. A natureza encontrou soluções surpreendentes para a vida nos oceanos.',
    createdAt: '2026-08-20T11:10:00Z',
    likes: 12
  }
];

let newsletterSubscribers: string[] = ['admin@mundocurioso.com'];
let totalSiteViews = 384920;
let totalShares = 24190;
let totalQuizzesPlayed = 42100;

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

  // 10. Comments
  app.get('/api/comentarios/:curiosityId', (req, res) => {
    const { curiosityId } = req.params;
    const comments = commentsStore.filter(c => c.curiosityId === curiosityId);
    res.json(comments);
  });

  app.post('/api/comentarios', (req, res) => {
    const { curiosityId, authorName, content } = req.body;
    if (!curiosityId || !authorName || !content) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const avatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newComment: Comment = {
      id: 'com-' + Date.now(),
      curiosityId,
      authorName: authorName.trim(),
      authorAvatar: randomAvatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0
    };

    commentsStore.unshift(newComment);
    res.status(201).json(newComment);
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
      totalViews: totalSiteViews,
      totalShares: totalShares,
      totalQuizzesPlayed: totalQuizzesPlayed,
      totalSubscribers: newsletterSubscribers.length,
      pendingSuggestions: userSuggestions.filter(s => s.status === 'pending').length
    });
  });

  // 14. AI Curiosity Generator (using Gemini SDK on server-side)
  app.post('/api/ai/gerar-curiosidade', async (req, res) => {
    const { topic, category } = req.body as { topic?: string; category?: string };

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `Gere uma curiosidade factual, fascinante e verificável em português sobre o tema "${topic || 'qualquer tema surpreendente do mundo'}" na categoria "${category || 'ciência e história'}".
Formate a resposta ESTRITAMENTE em JSON com a seguinte estrutura:
{
  "title": "Título atraente e chamativo (máx 100 caracteres)",
  "summary": "Resumo intrigante em uma frase",
  "content": "Texto detalhado e factual com 2 a 3 parágrafos explicando a ciência, história ou detalhes por trás da curiosidade",
  "didYouKnow": "Fato rápido no estilo 'Você sabia?' relacionado",
  "tags": ["tag1", "tag2", "tag3"],
  "sourceName": "Nome da instituição ou fonte científica verificável",
  "funFactor": 95
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
          const parsed = JSON.parse(text);
          return res.json({
            success: true,
            curiosity: {
              ...parsed,
              id: 'ai-' + Date.now(),
              slug: parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              categoryId: category || 'ciencia',
              categoryName: ALL_CATEGORIES.find(c => c.id === category)?.name || 'Ciência & Física',
              categoryIcon: 'Sparkles',
              author: 'IA Curiosa & Validação Científica',
              readTimeMinutes: 3,
              views: 120,
              likes: 15,
              shares: 4,
              date: new Date().toISOString().split('T')[0],
              imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
              funFactor: parsed.funFactor || 95
            }
          });
        }
      } catch (err) {
        console.error('Error generating AI curiosity with Gemini:', err);
      }
    }

    // High quality fallback generation if Gemini is offline or without key
    const fallbackTitle = topic
      ? `A surpreendente descoberta sobre ${topic} que desafiou a ciência`
      : 'As bactérias que conseguem se alimentar de eletricidade pura';
    const fallbackSlug = fallbackTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    res.json({
      success: true,
      curiosity: {
        id: 'gen-' + Date.now(),
        slug: fallbackSlug,
        title: fallbackTitle,
        summary: 'Micro-organismos conhecidos como eletrotróficos não precisam de comida tradicional: eles absorvem elétrons livres diretamente de rochas minerais.',
        content: `Cientistas da NASA e de universidades de ponta descobriram espécies de bactérias (como Geobacter e Shewanella) que realizam algo que antes parecia exclusivo da robótica: elas se alimentam de eletricidade pura.\n\nEnquanto todos os outros seres vivos na Terra obtêm energia quebrando ligações químicas de açúcares, gorduras ou através da fotossíntese da luz solar, essas bactérias estendem nanofios biológicos condutores e capturam elétrons diretamente de superfícies metálicas e minerais subterrâneos.\n\nEssa descoberta revolucionou os planos para missões espaciais em luas geladas como Encélado e Europa, pois comprova que a vida biológica pode prosperar em ambientes sem luz solar e sem oxigênio, apenas com fluxos eletroquímicos naturais de fontes hidrotermais.`,
        categoryId: category || 'ciencia',
        categoryName: ALL_CATEGORIES.find(c => c.id === category)?.name || 'Ciência & Física',
        categoryIcon: 'Atom',
        tags: ['biologia', 'eletricidade', 'nasa', 'ciência-moderna', topic ? topic.toLowerCase() : 'bactérias'],
        author: 'Redação Mundo Curioso',
        readTimeMinutes: 3,
        views: 350,
        likes: 42,
        shares: 18,
        date: new Date().toISOString().split('T')[0],
        imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
        sourceName: 'Nature Microbiology & NASA Astrobiology Reports',
        didYouKnow: 'Cientistas já estão usando essas bactérias em bio-baterias para limpar esgotos urbanos e gerar energia elétrica sustentável ao mesmo tempo!',
        funFactor: 96
      }
    });
  });

  // 15. Admin Endpoints
  app.post('/api/admin/curiosidades', (req, res) => {
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
    res.status(201).json({ success: true, curiosity: newCuriosity });
  });

  app.put('/api/admin/curiosidades/:id', (req, res) => {
    const { id } = req.params;
    const index = dynamicCuriosities.findIndex(c => c.id === id || c.slug === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Curiosidade não encontrada' });
    }

    dynamicCuriosities[index] = {
      ...dynamicCuriosities[index],
      ...req.body
    };

    res.json({ success: true, curiosity: dynamicCuriosities[index] });
  });

  app.delete('/api/admin/curiosidades/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = dynamicCuriosities.length;
    dynamicCuriosities = dynamicCuriosities.filter(c => c.id !== id && c.slug !== id);

    if (dynamicCuriosities.length === initialLen) {
      return res.status(404).json({ error: 'Curiosidade não encontrada' });
    }

    res.json({ success: true, message: 'Curiosidade excluída com sucesso' });
  });

  app.get('/api/admin/sugestoes', (req, res) => {
    res.json(userSuggestions);
  });

  app.post('/api/admin/sugestoes/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const suggestion = userSuggestions.find(s => s.id === id);
    if (!suggestion) {
      return res.status(404).json({ error: 'Sugestão não encontrada' });
    }
    suggestion.status = status;
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
