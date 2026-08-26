import React, { useState } from 'react';
import { Sparkles, Send, Heart, Mail, CheckCircle2, Shield, Compass, BookOpen } from 'lucide-react';
import { ALL_CATEGORIES } from '../../data/allCuriosities';
import { playSuccessChime } from '../../utils/audio';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  onTriggerRandom: () => void;
  onOpenSubmit: () => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onTriggerRandom,
  onOpenSubmit,
  isAdmin = false,
  onOpenAdminLogin
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setLoading(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setSubscribed(true);
      playSuccessChime();
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch {
      setSubscribed(true);
      playSuccessChime();
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-900 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-900 border border-neutral-800 p-8 sm:p-12 mb-16 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
              <Mail className="w-3.5 h-3.5" /> Boletim do Curioso Diário
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white mb-3">
              Receba um fato surpreendente todas as manhãs no seu e-mail
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
              Junte-se a mais de 10.000 exploradores que começam o dia aprendendo algo fascinante sobre o universo, história, natureza e ciência. 100% gratuito e sem spam.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-4 py-3 rounded-2xl text-xs font-medium max-w-md">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Inscrição confirmada com sucesso! Bem-vindo à expedição do saber.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Seu melhor e-mail..."
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="grow px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {loading ? 'Inscrevendo...' : (
                    <>
                      Assinar Grátis <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-12 border-b border-neutral-900 text-xs">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer mb-4"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-white font-serif">
                Mundo<span className="text-amber-500">Curioso</span>
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed mb-4 pr-6">
              A enciclopédia definitiva de fatos verificados, segredos da história, maravilhas da ciência, tesouros de Moçambique e mistérios do cosmos. Feito para mentes inquietas que nunca cansam de aprender.
            </p>
            <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Conteúdo Factual & Fontes Verificadas</span>
            </div>
          </div>

          {/* Categorias Populares */}
          <div>
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] mb-4">
              Categorias
            </h4>
            <ul className="space-y-2.5 text-neutral-400">
              {ALL_CATEGORIES.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('categoria', cat.slug)}
                    className="hover:text-amber-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Mais Categorias */}
          <div>
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] mb-4">
              Mais Temas
            </h4>
            <ul className="space-y-2.5 text-neutral-400">
              {ALL_CATEGORIES.slice(6, 12).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('categoria', cat.slug)}
                    className="hover:text-amber-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Úteis & Comunidade */}
          <div>
            <h4 className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] mb-4">
              Exploração
            </h4>
            <ul className="space-y-2.5 text-neutral-400">
              <li>
                <button onClick={onTriggerRandom} className="hover:text-amber-400 transition-colors text-left flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Fato Aleatório
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('quizzes')} className="hover:text-amber-400 transition-colors text-left">
                  Quizzes & Desafios
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('artigos')} className="hover:text-amber-400 transition-colors text-left">
                  Artigos Especiais
                </button>
              </li>
              {isAdmin && (
                <li>
                  <button onClick={onOpenSubmit} className="hover:text-amber-400 transition-colors text-left text-amber-400 font-semibold">
                    + Publicar Curiosidade (Admin)
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => onNavigate('sobre')} className="hover:text-amber-400 transition-colors text-left">
                  Sobre Nós
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contato')} className="hover:text-amber-400 transition-colors text-left">
                  Contato & Sugestões
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacidade')} className="hover:text-amber-400 transition-colors text-left">
                  Privacidade & Termos
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} Mundo Curioso. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              Feito com <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> para os apaixonados por conhecimento ao redor do mundo.
            </p>
            {isAdmin ? (
              <button
                onClick={() => onNavigate('admin')}
                className="text-amber-500 hover:text-amber-400 font-semibold transition-colors flex items-center gap-1"
                title="Acessar Painel de Controle"
              >
                👑 Painel Admin (Conectado)
              </button>
            ) : (
              onOpenAdminLogin && (
                <button
                  onClick={onOpenAdminLogin}
                  className="text-neutral-600 hover:text-neutral-400 transition-colors flex items-center gap-1"
                  title="Acesso exclusivo para o administrador"
                >
                  <Shield className="w-3 h-3" /> Área do Administrador
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
