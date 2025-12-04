import { useEffect, useState } from 'react';
import { User, Calendar, Image as ImageIcon, Heart, Edit, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { imagesApi, eventsApi } from '../services/api';
import { ImageCard, EventCard, LoadingSpinner } from '../components';
import type { GalleryImage, Event } from '../types';

type TabType = 'images' | 'events';

export function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('images');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab, user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (activeTab === 'images') {
        const response = await imagesApi.getAll({ userId: user.id, limit: 20 });
        setImages(response.data);
      } else {
        const response = await eventsApi.getAll({ limit: 20 });
        // Filtrar eventos donde el usuario es participante o creador
        setEvents(response.data.filter((e) => e.isParticipant || e.isOwner));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Profile Header */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="avatar">
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center ring ring-primary ring-offset-base-100 ring-offset-2">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} />
                      ) : (
                        <User size={64} className="text-primary" />
                      )}
                    </div>
                  </div>
                  <button className="btn btn-circle btn-sm btn-primary absolute bottom-0 right-0" aria-label="Cambiar foto de perfil">
                    <Camera size={16} />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
                    <span className="badge badge-outline">@{user.username}</span>
                  </div>

                  {user.bio && (
                    <p className="text-base-content/70 mb-4 max-w-xl">{user.bio}</p>
                  )}

                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} className="text-primary" />
                      <span>
                        Miembro desde{' '}
                        {new Date(user.createdAt).toLocaleDateString('es-ES', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <button className="btn btn-outline btn-sm mt-4 gap-2">
                    <Edit size={16} />
                    Editar Perfil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-12">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Tabs */}
            <div role="tablist" className="tabs tabs-box mb-6">
              <button
                role="tab"
                className={`tab gap-2 ${activeTab === 'images' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('images')}
              >
                <ImageIcon size={16} />
                Mis Fotos
              </button>
              <button
                role="tab"
                className={`tab gap-2 ${activeTab === 'events' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('events')}
              >
                <Calendar size={16} />
                Mis Eventos
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : activeTab === 'images' ? (
              images.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon size={64} className="mx-auto text-base-content/30 mb-4" />
                  <p className="text-base-content/60">No has subido ninguna foto aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <ImageCard key={image.id} image={image} showEventLink />
                  ))}
                </div>
              )
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={64} className="mx-auto text-base-content/30 mb-4" />
                <p className="text-base-content/60">No participas en ningún evento aún</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

