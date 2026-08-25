import React, { useState } from 'react';
import { X, Check, Copy, Share2, Send } from 'lucide-react';
import { Curiosity } from '../../types';
import { playSuccessChime } from '../../utils/audio';

interface ShareModalProps {
  curiosity: Curiosity;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ curiosity, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/curiosidades/${curiosity.slug}`
    : `https://mundocurioso.com/curiosidades/${curiosity.slug}`;

  const shareText = `Você sabia disso? "${curiosity.title}" 🌍 Descubra mais em Mundo Curioso:`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText}\n${currentUrl}`);
    setCopied(true);
    playSuccessChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Compartilhar Conhecimento
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Surpreenda seus amigos e espalhe curiosidades incríveis!
            </p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <img
            src={curiosity.imageUrl}
            alt={curiosity.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
              {curiosity.categoryName}
            </span>
            <p className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-2 mt-0.5">
              {curiosity.title}
            </p>
          </div>
        </div>

        {/* Social Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium text-xs transition-colors gap-1.5"
          >
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-xs">
              WA
            </span>
            WhatsApp
          </button>

          <button
            onClick={shareTelegram}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-medium text-xs transition-colors gap-1.5"
          >
            <span className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-sm font-bold shadow-xs">
              <Send className="w-4 h-4 ml-0.5" />
            </span>
            Telegram
          </button>

          <button
            onClick={shareX}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium text-xs transition-colors gap-1.5"
          >
            <span className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-sm font-bold shadow-xs">
              𝕏
            </span>
            Twitter / 𝕏
          </button>

          <button
            onClick={shareFacebook}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-medium text-xs transition-colors gap-1.5"
          >
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
              f
            </span>
            Facebook
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1.5 pl-4 border border-neutral-200 dark:border-neutral-700">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="bg-transparent text-xs text-neutral-600 dark:text-neutral-300 w-full outline-hidden truncate"
          />
          <button
            onClick={copyToClipboard}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copiar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
