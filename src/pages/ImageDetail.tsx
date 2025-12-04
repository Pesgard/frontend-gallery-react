import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Calendar,
  User,
  Trash2,
  Edit,
  Send,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { imagesApi, commentsApi } from '../services/api';
import { LoadingSpinner } from '../components';
import { useAuth } from '../context/AuthContext';
import type { ImageDetail as ImageDetailType, Comment } from '../types';

export function ImageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [image, setImage] = useState<ImageDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const loadImage = useCallback(async () => {
    if (!id) return;
    try {
      const data = await imagesApi.getOne(id);
      setImage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la imagen');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const handleLike = async () => {
    if (!id || !isAuthenticated || !image) return;
    setLikeLoading(true);
    try {
      if (image.isLikedByCurrentUser) {
        const result = await imagesApi.unlike(id);
        setImage((prev) =>
          prev ? { ...prev, isLikedByCurrentUser: false, likeCount: result.likeCount } : null
        );
      } else {
        const result = await imagesApi.like(id);
        setImage((prev) =>
          prev ? { ...prev, isLikedByCurrentUser: true, likeCount: result.likeCount } : null
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    setSubmitting(true);
    try {
      const comment = await commentsApi.create(id, newComment.trim());
      setImage((prev) =>
        prev
          ? {
              ...prev,
              comments: [comment, ...prev.comments],
              commentCount: prev.commentCount + 1,
            }
          : null
      );
      setNewComment('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al comentar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
      await commentsApi.delete(commentId);
      setImage((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.filter((c) => c.id !== commentId),
              commentCount: prev.commentCount - 1,
            }
          : null
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleDeleteImage = async () => {
    if (!id) return;
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;
    try {
      await imagesApi.delete(id);
      navigate(-1);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando imagen..." />
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <p className="text-error">{error || 'Imagen no encontrada'}</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate(-1)}>
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === image.userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost gap-2 mb-4">
          <ArrowLeft size={20} />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image */}
          <div className="lg:col-span-3">
            <div className="card bg-base-100 shadow-xl overflow-hidden">
              <figure className="relative">
                <img
                  src={image.imageUrl}
                  alt={image.title || 'Imagen'}
                  className="w-full max-h-[80vh] object-contain bg-black"
                />
              </figure>
            </div>
          </div>

          {/* Info & Comments */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image Info */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {/* User */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full bg-primary/20">
                      {image.user.avatarUrl ? (
                        <img src={image.user.avatarUrl} alt={image.user.username} />
                      ) : (
                        <User size={24} className="m-auto text-primary" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{image.user.fullName || image.user.username}</p>
                    <p className="text-xs text-base-content/60">@{image.user.username}</p>
                  </div>
                </div>

                {/* Title & Description */}
                {image.title && <h1 className="text-xl font-bold">{image.title}</h1>}
                {image.description && (
                  <p className="text-base-content/70">{image.description}</p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-base-content/60 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(image.uploadedAt).toLocaleDateString('es-ES')}
                  </span>
                  <Link
                    to={`/events/${image.eventId}`}
                    className="link link-primary"
                  >
                    Ver evento →
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-200">
                  <button
                    className={`btn btn-sm gap-2 ${image.isLikedByCurrentUser ? 'btn-error' : 'btn-ghost'}`}
                    onClick={handleLike}
                    disabled={!isAuthenticated || likeLoading}
                  >
                    <Heart size={18} className={image.isLikedByCurrentUser ? 'fill-current' : ''} />
                    {image.likeCount}
                  </button>
                  <span className="flex items-center gap-1 text-sm">
                    <MessageCircle size={18} />
                    {image.commentCount}
                  </span>
                  <div className="flex-1" />
                  <a
                    href={image.imageUrl}
                    download
                    className="btn btn-sm btn-ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download size={18} />
                  </a>
                  {isOwner && (
                    <>
                      <button className="btn btn-sm btn-ghost">
                        <Edit size={18} />
                      </button>
                      <button className="btn btn-sm btn-ghost text-error" onClick={handleDeleteImage}>
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-lg">
                  Comentarios ({image.commentCount})
                </h2>

                {/* Comment Form */}
                {isAuthenticated ? (
                  <form onSubmit={handleComment} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Escribe un comentario..."
                      className="input input-bordered input-sm flex-1"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={submitting}
                    />
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary"
                      disabled={!newComment.trim() || submitting}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-base-content/60">
                    <Link to="/login" className="link link-primary">
                      Inicia sesión
                    </Link>{' '}
                    para comentar
                  </p>
                )}

                {/* Comments List */}
                <div className="space-y-4 mt-4 max-h-96 overflow-y-auto">
                  {image.comments.length === 0 ? (
                    <p className="text-center text-base-content/50 py-4">
                      No hay comentarios aún
                    </p>
                  ) : (
                    image.comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        canDelete={user?.id === comment.userId}
                        onDelete={() => handleDeleteComment(comment.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  canDelete,
  onDelete,
}: {
  comment: Comment;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-3">
      <div className="avatar">
        <div className="w-8 h-8 rounded-full bg-primary/20">
          {comment.user.avatarUrl ? (
            <img src={comment.user.avatarUrl} alt={comment.user.username} />
          ) : (
            <User size={16} className="m-auto text-primary" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {comment.user.fullName || comment.user.username}
          </span>
          <span className="text-xs text-base-content/50">
            {new Date(comment.createdAt).toLocaleDateString('es-ES')}
          </span>
          {canDelete && (
            <button
              className="btn btn-ghost btn-xs text-error ml-auto"
              onClick={onDelete}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        <p className="text-sm text-base-content/80">{comment.content}</p>
      </div>
    </div>
  );
}

