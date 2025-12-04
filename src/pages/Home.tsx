import { useEffect, useState } from 'react';
import { Star, Clock, TrendingUp, Image as ImageIcon, Calendar, Users, Heart, MessageCircle } from 'lucide-react';
import { galleryApi } from '../services/api';
import { ImageCard, LoadingSpinner } from '../components';
import type { GalleryImage, GalleryStats } from '../types';

type TabType = 'featured' | 'recent' | 'popular';

export function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('featured');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [stats, setStats] = useState<GalleryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadImages();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const data = await galleryApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: GalleryImage[];
      switch (activeTab) {
        case 'featured':
          data = await galleryApi.getFeatured(12);
          break;
        case 'recent':
          const recentRes = await galleryApi.getRecent(1, 12);
          data = recentRes.data;
          break;
        case 'popular':
          const popularRes = await galleryApi.getPopular(1, 12);
          data = popularRes.data;
          break;
      }
      setImages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar imágenes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-3xl" />
        <div className="container mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Event Gallery
              </span>
            </h1>
            <p className="text-lg text-base-content/70 mb-8">
              Comparte y descubre momentos inolvidables de eventos increíbles
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto mt-8">
              <div className="stat bg-base-100 rounded-box shadow-md p-4 text-center">
                <div className="stat-figure text-primary">
                  <ImageIcon size={24} />
                </div>
                <div className="stat-value text-2xl">{stats.totalImages}</div>
                <div className="stat-title text-xs">Imágenes</div>
              </div>
              <div className="stat bg-base-100 rounded-box shadow-md p-4 text-center">
                <div className="stat-figure text-secondary">
                  <Calendar size={24} />
                </div>
                <div className="stat-value text-2xl">{stats.totalEvents}</div>
                <div className="stat-title text-xs">Eventos</div>
              </div>
              <div className="stat bg-base-100 rounded-box shadow-md p-4 text-center">
                <div className="stat-figure text-accent">
                  <Users size={24} />
                </div>
                <div className="stat-value text-2xl">{stats.totalUsers}</div>
                <div className="stat-title text-xs">Usuarios</div>
              </div>
              <div className="stat bg-base-100 rounded-box shadow-md p-4 text-center">
                <div className="stat-figure text-error">
                  <Heart size={24} />
                </div>
                <div className="stat-value text-2xl">{stats.totalLikes}</div>
                <div className="stat-title text-xs">Likes</div>
              </div>
              <div className="stat bg-base-100 rounded-box shadow-md p-4 text-center col-span-2 md:col-span-1">
                <div className="stat-figure text-info">
                  <MessageCircle size={24} />
                </div>
                <div className="stat-value text-2xl">{stats.totalComments}</div>
                <div className="stat-title text-xs">Comentarios</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {/* Tabs */}
            <div role="tablist" className="tabs tabs-box mb-6">
              <button
                role="tab"
                className={`tab gap-2 ${activeTab === 'featured' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('featured')}
              >
                <Star size={16} />
                <span className="hidden sm:inline">Destacadas</span>
              </button>
              <button
                role="tab"
                className={`tab gap-2 ${activeTab === 'recent' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('recent')}
              >
                <Clock size={16} />
                <span className="hidden sm:inline">Recientes</span>
              </button>
              <button
                role="tab"
                className={`tab gap-2 ${activeTab === 'popular' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('popular')}
              >
                <TrendingUp size={16} />
                <span className="hidden sm:inline">Populares</span>
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Cargando imágenes..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span>{error}</span>
                <button className="btn btn-sm btn-ghost" onClick={loadImages}>
                  Reintentar
                </button>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon size={64} className="mx-auto text-base-content/30 mb-4" />
                <p className="text-base-content/60">No hay imágenes disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <ImageCard key={image.id} image={image} showEventLink />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

