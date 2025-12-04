import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  Lock,
  Globe,
  Share2,
  Upload,
  UserPlus,
  LogOut,
  Trash2,
  Edit,
  Copy,
  Check,
} from 'lucide-react';
import { eventsApi, imagesApi } from '../services/api';
import { ImageCard, LoadingSpinner } from '../components';
import { useAuth } from '../context/AuthContext';
import type { Event, GalleryImage, PaginatedResponse } from '../types';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePage, setImagePage] = useState(1);
  const [imageMeta, setImageMeta] = useState<PaginatedResponse<GalleryImage>['meta'] | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!id) return;
    try {
      const data = await eventsApi.getOne(id);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el evento');
    }
  }, [id]);

  const loadImages = useCallback(async () => {
    if (!id) return;
    try {
      const response = await imagesApi.getAll({ eventId: id, page: imagePage, limit: 12 });
      setImages(response.data);
      setImageMeta(response.meta);
    } catch (err) {
      console.error('Error loading images:', err);
    }
  }, [id, imagePage]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadEvent(), loadImages()]);
      setLoading(false);
    };
    load();
  }, [loadEvent, loadImages]);

  const handleJoin = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await eventsApi.join(id);
      await loadEvent();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al unirse');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!id) return;
    if (!confirm('¿Estás seguro de que quieres salir de este evento?')) return;
    setActionLoading(true);
    try {
      await eventsApi.leave(id);
      await loadEvent();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al salir');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) return;
    setActionLoading(true);
    try {
      await eventsApi.delete(id);
      navigate('/events');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setActionLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (event?.inviteCode) {
      navigator.clipboard.writeText(event.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando evento..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <Calendar size={64} className="mx-auto text-error mb-4" />
            <h2 className="text-xl font-bold">Error</h2>
            <p className="text-base-content/70">{error || 'Evento no encontrado'}</p>
            <Link to="/events" className="btn btn-primary mt-4">
              Volver a Eventos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === event.createdById;
  const canUpload = event.isParticipant || isOwner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Hero */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className={`badge ${event.isPrivate ? 'badge-warning' : 'badge-success'} gap-1`}>
                {event.isPrivate ? <Lock size={12} /> : <Globe size={12} />}
                {event.isPrivate ? 'Privado' : 'Público'}
              </div>
              {event.isParticipant && <div className="badge badge-primary">Participante</div>}
              {isOwner && <div className="badge badge-secondary">Organizador</div>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{event.name}</h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {event.description && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title">Descripción</h2>
                  <p className="text-base-content/80 whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            )}

            {/* Images */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title">
                    <ImageIcon size={20} />
                    Galería ({event.imageCount})
                  </h2>
                  {canUpload && (
                    <Link to={`/events/${id}/upload`} className="btn btn-primary btn-sm gap-2">
                      <Upload size={16} />
                      Subir Foto
                    </Link>
                  )}
                </div>

                {images.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon size={48} className="mx-auto text-base-content/30 mb-4" />
                    <p className="text-base-content/60">No hay fotos aún</p>
                    {canUpload && (
                      <Link to={`/events/${id}/upload`} className="btn btn-primary btn-sm mt-4">
                        Sube la primera foto
                      </Link>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {images.map((image) => (
                        <ImageCard key={image.id} image={image} />
                      ))}
                    </div>

                    {imageMeta && imageMeta.totalPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <div className="join">
                          <button
                            className="join-item btn btn-sm"
                            disabled={!imageMeta.hasPreviousPage}
                            onClick={() => setImagePage((p) => p - 1)}
                          >
                            «
                          </button>
                          <button className="join-item btn btn-sm">
                            {imageMeta.page} / {imageMeta.totalPages}
                          </button>
                          <button
                            className="join-item btn btn-sm"
                            disabled={!imageMeta.hasNextPage}
                            onClick={() => setImagePage((p) => p + 1)}
                          >
                            »
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-lg">Información</h2>

                <div className="space-y-3 mt-2">
                  {event.startDate && (
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-primary" />
                      <div>
                        <p className="text-sm font-medium">Fecha</p>
                        <p className="text-sm text-base-content/70">
                          {new Date(event.startDate).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-primary" />
                      <div>
                        <p className="text-sm font-medium">Ubicación</p>
                        <p className="text-sm text-base-content/70">{event.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium">Participantes</p>
                      <p className="text-sm text-base-content/70">{event.participantCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ImageIcon size={18} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium">Fotos</p>
                      <p className="text-sm text-base-content/70">{event.imageCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-lg">Acciones</h2>

                <div className="space-y-2 mt-2">
                  {isAuthenticated ? (
                    <>
                      {!event.isParticipant && !isOwner && (
                        <button
                          className="btn btn-primary w-full gap-2"
                          onClick={handleJoin}
                          disabled={actionLoading}
                        >
                          <UserPlus size={18} />
                          Unirse al Evento
                        </button>
                      )}

                      {event.isParticipant && !isOwner && (
                        <button
                          className="btn btn-outline btn-error w-full gap-2"
                          onClick={handleLeave}
                          disabled={actionLoading}
                        >
                          <LogOut size={18} />
                          Salir del Evento
                        </button>
                      )}

                      {isOwner && (
                        <>
                          <Link to={`/events/${id}/edit`} className="btn btn-outline w-full gap-2">
                            <Edit size={18} />
                            Editar Evento
                          </Link>
                          <button
                            className="btn btn-outline btn-error w-full gap-2"
                            onClick={handleDelete}
                            disabled={actionLoading}
                          >
                            <Trash2 size={18} />
                            Eliminar Evento
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <Link to="/login" className="btn btn-primary w-full gap-2">
                      <UserPlus size={18} />
                      Inicia sesión para unirte
                    </Link>
                  )}

                  <button
                    className="btn btn-ghost w-full gap-2"
                    onClick={() => navigator.share?.({ title: event.name, url: window.location.href })}
                  >
                    <Share2 size={18} />
                    Compartir
                  </button>
                </div>
              </div>
            </div>

            {/* Invite Code (for private events) */}
            {event.isPrivate && event.inviteCode && (isOwner || event.isParticipant) && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg">Código de Invitación</h2>
                  <p className="text-sm text-base-content/70 mb-2">
                    Comparte este código para invitar a otros
                  </p>
                  <div className="join w-full">
                    <input
                      type="text"
                      value={event.inviteCode}
                      readOnly
                      className="input input-bordered join-item flex-1 font-mono"
                    />
                    <button className="btn btn-primary join-item" onClick={copyInviteCode}>
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

