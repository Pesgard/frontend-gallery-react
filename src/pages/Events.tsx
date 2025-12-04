import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, Filter } from 'lucide-react';
import { eventsApi } from '../services/api';
import { EventCard, LoadingSpinner } from '../components';
import { useAuth } from '../context/AuthContext';
import type { Event, PaginatedResponse } from '../types';

export function Events() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginatedResponse<Event>['meta'] | null>(null);

  useEffect(() => {
    loadEvents();
  }, [page]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventsApi.getAll({
        page,
        limit: 12,
        search: search || undefined,
      });
      setEvents(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadEvents();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Header */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Calendar className="text-primary" />
                Eventos
              </h1>
              <p className="text-base-content/70 mt-1">
                Descubre eventos y comparte tus fotos
              </p>
            </div>

            {isAuthenticated && (
              <Link to="/events/create" className="btn btn-primary gap-2">
                <Plus size={20} />
                Crear Evento
              </Link>
            )}
          </div>

          {/* Search & Filters */}
          <div className="card bg-base-100 shadow-md mb-8">
            <div className="card-body p-4">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="join flex-1">
                  <input
                    type="text"
                    placeholder="Buscar eventos..."
                    className="input input-bordered join-item w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary join-item">
                    <Search size={20} />
                  </button>
                </div>
                <div className="dropdown dropdown-end">
                  <button type="button" tabIndex={0} className="btn btn-outline gap-2">
                    <Filter size={18} />
                    Filtros
                  </button>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <button onClick={() => loadEvents()}>Todos</button>
                    </li>
                    <li>
                      <button onClick={() => loadEvents()}>Públicos</button>
                    </li>
                    <li>
                      <button onClick={() => loadEvents()}>Más recientes</button>
                    </li>
                  </ul>
                </div>
              </form>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Cargando eventos..." />
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span>{error}</span>
              <button className="btn btn-sm btn-ghost" onClick={loadEvents}>
                Reintentar
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body text-center py-16">
                <Calendar size={64} className="mx-auto text-base-content/30 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No hay eventos</h2>
                <p className="text-base-content/60 mb-4">
                  {search
                    ? 'No se encontraron eventos con esa búsqueda'
                    : 'Sé el primero en crear un evento'}
                </p>
                {isAuthenticated && (
                  <Link to="/events/create" className="btn btn-primary mx-auto">
                    Crear Evento
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="join">
                    <button
                      className="join-item btn"
                      disabled={!meta.hasPreviousPage}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      «
                    </button>
                    <button className="join-item btn">
                      Página {meta.page} de {meta.totalPages}
                    </button>
                    <button
                      className="join-item btn"
                      disabled={!meta.hasNextPage}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

