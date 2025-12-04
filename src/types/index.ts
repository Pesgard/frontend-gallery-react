// ========== User Types ==========
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface UserPublic {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

// ========== Auth Types ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  user: User;
  sessionId: string;
}

// ========== Event Types ==========
export interface Event {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  isPrivate: boolean;
  inviteCode: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  participantCount: number;
  imageCount: number;
  isParticipant?: boolean;
  isOwner?: boolean;
  createdBy?: UserPublic;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  isPrivate?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ========== Image Types ==========
export interface GalleryImage {
  id: string;
  eventId: string;
  userId: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  imageKey: string;
  thumbnailUrl: string | null;
  thumbnailKey: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  mimeType: string | null;
  uploadedAt: string;
  likeCount: number;
  commentCount: number;
}

export interface ImageDetail extends GalleryImage {
  user: UserPublic;
  isLikedByCurrentUser: boolean;
  comments: Comment[];
}

export interface ImageFilters {
  page?: number;
  limit?: number;
  eventId?: string;
  userId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ========== Comment Types ==========
export interface Comment {
  id: string;
  imageId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: UserPublic;
}

// ========== Gallery Stats ==========
export interface GalleryStats {
  totalEvents: number;
  totalImages: number;
  totalUsers: number;
  totalLikes: number;
  totalComments: number;
}

// ========== Pagination ==========
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ========== API Response ==========
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

