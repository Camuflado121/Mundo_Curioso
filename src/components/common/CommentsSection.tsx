import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Heart,
  CornerDownRight,
  ShieldCheck,
  Pin,
  Trash2,
  Smile,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Comment, CommentReply } from '../../types';
import { playPopSound, playSuccessChime } from '../../utils/audio';

interface CommentsSectionProps {
  targetId: string;
  targetTitle?: string;
  isAdmin?: boolean;
  adminName?: string;
  token?: string | null;
}

const AVATAR_PRESETS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', label: 'Explorador' },
  { id: '2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', label: 'Cientista' },
  { id: '3', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80', label: 'Biólogo' },
  { id: '4', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80', label: 'Historiadora' },
  { id: '5', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', label: 'Astrônomo' }
];

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    return new Date(isoString).toLocaleDateString('pt-BR');
  } catch {
    return 'recentemente';
  }
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  targetId,
  targetTitle,
  isAdmin = false,
  adminName = 'Pedro Rosário Gabriel (Administrador)',
  token
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState(isAdmin ? adminName : '');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState(isAdmin ? adminName : '');
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'x-admin-token': token } : {})
  };

  const fetchComments = () => {
    setLoading(true);
    fetch(`/api/comentarios/${targetId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setComments(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, [targetId]);

  useEffect(() => {
    if (isAdmin && !authorName) {
      setAuthorName(adminName);
      setReplyAuthor(adminName);
    }
  }, [isAdmin, adminName]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comentarios', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          curiosityId: targetId,
          curiosityTitle: targetTitle || 'Curiosidade Mundo Curioso',
          authorName: authorName.trim(),
          content: content.trim(),
          authorAvatar: selectedAvatar
        })
      });

      if (res.ok) {
        const newCom: Comment = await res.json();
        setComments(prev => [newCom, ...prev]);
        setContent('');
        playSuccessChime();
      }
    } catch {
      // Fallback
      const mockCom: Comment = {
        id: 'com-' + Date.now(),
        curiosityId: targetId,
        curiosityTitle: targetTitle,
        authorName: authorName.trim(),
        authorAvatar: selectedAvatar,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        isAdmin,
        replies: []
      };
      setComments(prev => [mockCom, ...prev]);
      setContent('');
      playSuccessChime();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (likedCommentIds.has(commentId)) return;
    playPopSound();
    setLikedCommentIds(prev => new Set(prev).add(commentId));

    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );

    try {
      await fetch(`/api/comentarios/${commentId}/like`, { method: 'POST' });
    } catch {}
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim() || !replyAuthor.trim()) return;

    try {
      const res = await fetch(`/api/comentarios/${commentId}/reply`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          authorName: replyAuthor.trim(),
          content: replyText.trim(),
          authorAvatar: selectedAvatar
        })
      });

      if (res.ok) {
        const data = await res.json();
        setComments(prev =>
          prev.map(c => {
            if (c.id === commentId) {
              return {
                ...c,
                replies: [...(c.replies || []), data.reply]
              };
            }
            return c;
          })
        );
        setReplyText('');
        setActiveReplyId(null);
        playSuccessChime();
      }
    } catch {
      // Local fallback
      const mockReply: CommentReply = {
        id: 'rep-' + Date.now(),
        authorName: replyAuthor.trim(),
        authorAvatar: selectedAvatar,
        content: replyText.trim(),
        createdAt: new Date().toISOString(),
        isAdmin,
        likes: 0
      };
      setComments(prev =>
        prev.map(c => (c.id === commentId ? { ...c, replies: [...(c.replies || []), mockReply] } : c))
      );
      setReplyText('');
      setActiveReplyId(null);
      playSuccessChime();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Deseja realmente remover este comentário da comunidade?')) return;

    try {
      const res = await fetch(`/api/admin/comentarios/${commentId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        playPopSound();
      }
    } catch {}
  };

  const handleTogglePin = async (commentId: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/admin/comentarios/${commentId}/pin`, {
        method: 'POST',
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev =>
          prev.map(c => (c.id === commentId ? { ...c, isPinned: data.isPinned } : c))
        );
        playPopSound();
      }
    } catch {}
  };

  // Sort comments: pinned first, then newest
  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black font-serif text-neutral-950 dark:text-white">
              Comentários e Debates
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {comments.length} {comments.length === 1 ? 'opinião registrada' : 'reflexões da comunidade'}
            </p>
          </div>
        </div>

        {isAdmin && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Modo Moderador Ativo
          </span>
        )}
      </div>

      {/* Post Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8 p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800">
        <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Deixe sua contribuição ou dúvida científica:
        </div>

        {/* Identity & Avatar Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">
              Seu Nome ou Apelido
            </label>
            <input
              type="text"
              required
              maxLength={40}
              placeholder="Ex: Dra. Mariana, Curioso de Maputo..."
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block mb-1">
              Escolha seu Avatar
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_PRESETS.map(av => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setSelectedAvatar(av.url)}
                  className={`relative rounded-full p-0.5 transition-all ${
                    selectedAvatar === av.url
                      ? 'ring-2 ring-amber-500 scale-110 shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={av.label}
                >
                  <img
                    src={av.url}
                    alt={av.label}
                    className="w-7 h-7 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comment Text */}
        <div className="mb-3">
          <textarea
            required
            rows={3}
            maxLength={500}
            placeholder="Compartilhe seu ponto de vista, um fato complementar ou faça uma pergunta sobre esta descoberta..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1 px-1">
            <span>Seja respeitoso e construtivo com a comunidade</span>
            <span>{content.length}/500 caracteres</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {isAdmin ? (
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              👑 Publicando com selo oficial de Administrador
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || !authorName.trim()}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs hover:shadow-md cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Publicar Comentário
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-neutral-400 flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> Carregando comentários...
          </div>
        ) : sortedComments.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-dashed border-neutral-200 dark:border-neutral-800">
            <MessageSquare className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Ainda não há comentários nesta publicação.
            </p>
            <p className="text-[11px] text-neutral-500">
              Seja a primeira pessoa a compartilhar seus pensamentos e inaugurar este debate!
            </p>
          </div>
        ) : (
          sortedComments.map(c => {
            const hasLiked = likedCommentIds.has(c.id);
            const isReplying = activeReplyId === c.id;

            return (
              <div
                key={c.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  c.isPinned
                    ? 'bg-amber-500/5 border-amber-500/30 shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-950/50 border-neutral-200/60 dark:border-neutral-800/80'
                }`}
              >
                {/* Pinned Badge */}
                {c.isPinned && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                    <Pin className="w-3 h-3 fill-amber-500" /> Comentário em Destaque pela Redação
                  </div>
                )}

                {/* Comment Content */}
                <div className="flex items-start gap-3">
                  <img
                    src={c.authorAvatar || AVATAR_PRESETS[0].url}
                    alt={c.authorName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="grow min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {c.authorName}
                        </span>
                        {c.isAdmin && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                            👑 Administrador
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-neutral-400">
                        {formatTimeAgo(c.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed break-words mb-3">
                      {c.content}
                    </p>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <button
                        onClick={() => handleLike(c.id)}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                          hasLiked ? 'text-red-500 font-bold' : 'hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{c.likes > 0 ? c.likes : 'Curtir'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveReplyId(isReplying ? null : c.id);
                          if (!replyAuthor && isAdmin) setReplyAuthor(adminName);
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold hover:text-amber-500 transition-colors"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>Responder</span>
                      </button>

                      {/* Admin moderation tools */}
                      {isAdmin && (
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            onClick={() => handleTogglePin(c.id)}
                            className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                            title={c.isPinned ? 'Desafixar comentário' : 'Fixar no topo'}
                          >
                            <Pin className="w-3 h-3" />
                            <span>{c.isPinned ? 'Desafixar' : 'Fixar'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-0.5 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Excluir este comentário"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline Reply Form */}
                {isReplying && (
                  <div className="mt-4 ml-10 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 animate-in fade-in duration-200">
                    <div className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                      Respondendo a <strong>{c.authorName}</strong>:
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Seu nome"
                        value={replyAuthor}
                        onChange={e => setReplyAuthor(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 text-xs"
                      />
                      <textarea
                        rows={2}
                        placeholder="Escreva sua resposta..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 text-xs resize-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveReplyId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(c.id)}
                          disabled={!replyText.trim() || !replyAuthor.trim()}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold disabled:opacity-50"
                        >
                          Enviar Resposta
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nested Replies List */}
                {c.replies && c.replies.length > 0 && (
                  <div className="mt-4 ml-8 sm:ml-12 space-y-2.5 pt-3 border-t border-neutral-200/50 dark:border-neutral-800/60">
                    {c.replies.map(r => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-start gap-2.5"
                      >
                        <img
                          src={r.authorAvatar || AVATAR_PRESETS[0].url}
                          alt={r.authorName}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="grow min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-neutral-900 dark:text-white">
                                {r.authorName}
                              </span>
                              {r.isAdmin && (
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[8px] font-black uppercase">
                                  👑 Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-neutral-400">
                              {formatTimeAgo(r.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed break-words">
                            {r.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
