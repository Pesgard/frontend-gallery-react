import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Event,
  EventFilters,
  GalleryImage,
  ImageDetail,
  ImageFilters,
  GalleryStats,
  PaginatedResponse,
  Comment,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://escuela.esgardpeinado.dev/api';

// ========== Helper Functions ==========
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error ${response.status}`);
  }
  const json = await response.json();
  // El backend envuelve respuestas en { success: true, data: ... }
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

// ========== Auth API ==========
export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  async logout(): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
  },

  async me(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<User>(response);
  },

  async validateSession(): Promise<{ valid: boolean; user: User }> {
    const response = await fetch(`${API_URL}/auth/validate-session`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(response);
  },
};

// ========== Gallery API ==========
export const galleryApi = {
  async getFeatured(limit = 12): Promise<GalleryImage[]> {
    const response = await fetch(`${API_URL}/gallery/featured?limit=${limit}`);
    return handleResponse<GalleryImage[]>(response);
  },

  async getRecent(page = 1, limit = 12): Promise<PaginatedResponse<GalleryImage>> {
    const response = await fetch(`${API_URL}/gallery/recent?page=${page}&limit=${limit}`);
    return handleResponse<PaginatedResponse<GalleryImage>>(response);
  },

  async getPopular(page = 1, limit = 12): Promise<PaginatedResponse<GalleryImage>> {
    const response = await fetch(`${API_URL}/gallery/popular?page=${page}&limit=${limit}`);
    return handleResponse<PaginatedResponse<GalleryImage>>(response);
  },

  async getStats(): Promise<GalleryStats> {
    const response = await fetch(`${API_URL}/gallery/stats`);
    return handleResponse<GalleryStats>(response);
  },
};

// ========== Events API ==========
export const eventsApi = {
  async getAll(filters: EventFilters = {}): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.search) params.set('search', filters.search);
    if (filters.isPrivate !== undefined) params.set('isPrivate', String(filters.isPrivate));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const response = await fetch(`${API_URL}/events?${params}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<PaginatedResponse<Event>>(response);
  },

  async getOne(id: string): Promise<Event> {
    const response = await fetch(`${API_URL}/events/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<Event>(response);
  },

  async create(data: FormData): Promise<Event> {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: data,
    });
    return handleResponse<Event>(response);
  },

  async update(id: string, data: FormData): Promise<Event> {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders() },
      body: data,
    });
    return handleResponse<Event>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al eliminar evento');
    }
  },

  async join(id: string): Promise<{ event: Event; message: string }> {
    const response = await fetch(`${API_URL}/events/${id}/join`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(response);
  },

  async joinByCode(inviteCode: string): Promise<{ event: Event; message: string }> {
    const response = await fetch(`${API_URL}/events/join-by-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ inviteCode }),
    });
    return handleResponse(response);
  },

  async leave(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/events/${id}/leave`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al salir del evento');
    }
  },

  async getParticipants(id: string): Promise<{ participants: Array<{ user: User; joinedAt: string }> }> {
    const response = await fetch(`${API_URL}/events/${id}/participants`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(response);
  },

  async getStatistics(id: string): Promise<{ imageCount: number; participantCount: number; likeCount: number; commentCount: number }> {
    const response = await fetch(`${API_URL}/events/${id}/statistics`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(response);
  },
};

// ========== Images API ==========
export const imagesApi = {
  async getAll(filters: ImageFilters = {}): Promise<PaginatedResponse<GalleryImage>> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.eventId) params.set('eventId', filters.eventId);
    if (filters.userId) params.set('userId', filters.userId);
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const response = await fetch(`${API_URL}/images?${params}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<PaginatedResponse<GalleryImage>>(response);
  },

  async getOne(id: string): Promise<ImageDetail> {
    const response = await fetch(`${API_URL}/images/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<ImageDetail>(response);
  },

  async upload(data: FormData): Promise<{ image: GalleryImage; message: string }> {
    const response = await fetch(`${API_URL}/images`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: data,
    });
    return handleResponse(response);
  },

  async update(id: string, data: { title?: string; description?: string }): Promise<GalleryImage> {
    const response = await fetch(`${API_URL}/images/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<GalleryImage>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/images/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al eliminar imagen');
    }
  },

  async like(id: string): Promise<{ liked: boolean; likeCount: number }> {
    const response = await fetch(`${API_URL}/images/${id}/like`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(response);
  },

  async unlike(id: string): Promise<{ liked: boolean; likeCount: number }> {
    const response = await fetch(`${API_URL}/images/${id}/unlike`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(response);
  },
};

// ========== Comments API ==========
export const commentsApi = {
  async create(imageId: string, content: string): Promise<Comment> {
    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ imageId, content }),
    });
    return handleResponse<Comment>(response);
  },

  async update(id: string, content: string): Promise<Comment> {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ content }),
    });
    return handleResponse<Comment>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error al eliminar comentario');
    }
  },
};

// ========== Search API ==========
export const searchApi = {
  async search(
    query: string,
    type: 'all' | 'events' | 'images' | 'users' = 'all',
    page = 1,
    limit = 20
  ): Promise<{
    events?: Event[];
    images?: GalleryImage[];
    users?: User[];
  }> {
    const params = new URLSearchParams({
      q: query,
      type,
      page: String(page),
      limit: String(limit),
    });
    const response = await fetch(`${API_URL}/search?${params}`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse(response);
  },
};

