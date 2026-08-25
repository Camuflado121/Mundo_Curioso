import React, { useState } from 'react';
import { ArrowLeft, Mail, Shield, Sparkles, Send, CheckCircle2, Heart, Award, Globe2 } from 'lucide-react';
import { playSuccessChime } from '../../utils/audio';

interface StaticPageProps {
  onBack: () => void;
  onOpenSubmit: () => void;
}

export const AboutPage: React.FC<StaticPageProps> = ({ onBack, onOpenSubmit }) => {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </button>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-4 h-4" /> Nossa Missão
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-neutral-950 dark:text-white mb-6">
          Sobre o Projeto Mundo Curioso
        </h1>

        <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-5">
          <p>
            O <strong>Mundo Curioso</strong> nasceu com um propósito simples e inspirador: transformar o fascínio pelo desconhecido em uma jornada diária de aprendizado contínuo. Acreditamos que a curiosidade é a faísca fundamental que impulsiona a ciência, as artes, a exploração e a evolução humana.
          </p>

          <h3 className="text-xl font-bold font-serif text-neutral-950 dark:text-white pt-4">
            Rigor Científico e Verificação Factual
          </h3>
          <p>
            Em um mundo repleto de mitos e desinformação viral, cada artigo e fato publicado no Mundo Curioso passa por um processo rigoroso de conferência com fontes acadêmicas, arquivos históricos, publicações científicas internacionais (NASA, Nature, Science, UNESCO) e especialistas em patrimônio cultural africano e global.
          </p>

          <h3 className="text-xl font-bold font-serif text-neutral-950 dark:text-white pt-4">
            Moçambique & A Riqueza Ancestral de África
          </h3>
          <p>
            Dedicamos um espaço prioritário para desvendar as maravilhas naturais, históricas e artísticas de Moçambique e do continente africano — desde a recuperação ecológica lendária da Gorongosa até os segredos astronômicos e os reinos medievais que moldaram o comércio internacional.
          </p>

          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 my-8">
            <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-amber-500" /> Tem uma curiosidade para compartilhar?
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-4">
              Nossa comunidade é aberta a pesquisadores, estudantes e leitores apaixonados. Envie sua sugestão e ganhe destaque nos créditos da plataforma.
            </p>
            <button
              onClick={onOpenSubmit}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Enviar Sugestão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC<StaticPageProps> = ({ onBack }) => {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    playSuccessChime();
  };

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </button>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Mail className="w-4 h-4" /> Fale com a Redação
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-neutral-950 dark:text-white mb-2">
          Contato & Parcerias
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-8">
          Dúvidas editoriais, correções factuais, propostas de patrocínio ou parcerias educacionais: envie sua mensagem diretamente para nossa equipe.
        </p>

        {sent ? (
          <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
              Mensagem enviada com sucesso!
            </h3>
            <p className="text-xs text-neutral-500">
              Nossa equipe responderá em até 24 horas úteis.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Seu Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Assunto
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Parceria institucional, Sugestão de correção..."
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Mensagem
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Enviar Mensagem
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC<StaticPageProps> = ({ onBack }) => {
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </button>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Shield className="w-4 h-4" /> Termos & Privacidade
        </div>

        <h1 className="text-3xl font-black font-serif text-neutral-950 dark:text-white mb-6">
          Política de Privacidade e Termos de Uso
        </h1>

        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-4">
          <p>
            O portal <strong>Mundo Curioso</strong> respeita a privacidade de seus visitantes e assume o compromisso de proteger os dados pessoais coletados de forma ética e transparente, em conformidade com as legislações internacionais de proteção de dados.
          </p>

          <h3 className="text-base font-bold text-neutral-950 dark:text-white pt-2">
            1. Coleta de Informações
          </h3>
          <p>
            Não exigimos cadastro obrigatório para a leitura de curiosidades. Os dados de progresso e gamificação (nível, pontuação XP e favoritos salvos) são armazenados localmente no navegador do usuário via LocalStorage. Coletamos e-mails apenas quando fornecidos voluntariamente para o boletim informativo diário.
          </p>

          <h3 className="text-base font-bold text-neutral-950 dark:text-white pt-2">
            2. Uso de Cookies e Publicidade
          </h3>
          <p>
            Utilizamos identificadores anônimos para mensurar estatísticas de acesso e audiência, além de exibir parcerias patrocinadas não invasivas para financiar a manutenção da infraestrutura do portal.
          </p>

          <h3 className="text-base font-bold text-neutral-950 dark:text-white pt-2">
            3. Direitos Autorais e Citações
          </h3>
          <p>
            Todo o conteúdo textual é produzido e revisado por nossa equipe editorial. Fatos, estudos científicos e dados históricos são atribuídos às suas fontes oficiais e autores originais.
          </p>
        </div>
      </div>
    </div>
  );
};
