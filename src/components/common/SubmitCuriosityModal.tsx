import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { playSuccessChime } from '../../utils/audio';

interface SubmitCuriosityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitCuriosityModal: React.FC<SubmitCuriosityModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'ciencia',
    description: '',
    source: '',
    submitterName: '',
    submitterEmail: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.submitterName) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sugestoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
        playSuccessChime();
        setTimeout(() => {
          setSubmitted(false);
          onClose();
          setFormData({
            title: '',
            category: 'ciencia',
            description: '',
            source: '',
            submitterName: '',
            submitterEmail: ''
          });
        }, 2500);
      }
    } catch {
      // Offline fallback
      setSubmitted(true);
      playSuccessChime();
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Envie uma Curiosidade
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Conhece um fato incrível? Compartilhe e ganhe créditos no portal!
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Muito obrigado pela contribuição!
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Nossa equipe editorial analisará o fato e você será creditado quando a curiosidade for publicada.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Título ou Fato Principal *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: O som dos trovões ecoa por vários segundos..."
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ciencia">Ciência & Física</option>
                  <option value="espaco">Espaço & Universo</option>
                  <option value="mocambique-africa">Moçambique & África</option>
                  <option value="animais">Animais & Natureza</option>
                  <option value="historia">História & Civilizações</option>
                  <option value="psicologia">Cérebro & Psicologia</option>
                  <option value="oceanos">Oceanos & Abissal</option>
                  <option value="tecnologia">Tecnologia & IA</option>
                  <option value="misterios">Mistérios & Fenômenos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Fonte ou Referência (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: NASA, Artigo Nature, Livro..."
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Explicação / Detalhes *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Conte-nos como funciona ou por que este fato é tão fascinante..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome ou apelido"
                  value={formData.submitterName}
                  onChange={e => setFormData({ ...formData, submitterName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Seu Email (Para aviso de publicação)
                </label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.submitterEmail}
                  onChange={e => setFormData({ ...formData, submitterEmail: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Enviando...'
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Enviar para Moderação Editorial
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
