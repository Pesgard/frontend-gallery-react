import { Heart, MessageCircle } from 'lucide-react';
import type { GalleryImage } from '../types';
import { Link } from 'react-router-dom';

interface ImageCardProps {
  image: GalleryImage;
  showEventLink?: boolean;
}

export function ImageCard({ image, showEventLink = false }: ImageCardProps) {
  const imageUrl = image.thumbnailUrl || image.imageUrl;
  const formattedDate = new Date(image.uploadedAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <Link to={`/images/${image.id}`} className="group">
      <div className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        <figure className="relative aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={image.title || 'Imagen del evento'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Stats overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm">
                  <Heart size={14} className="fill-current" />
                  {image.likeCount}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <MessageCircle size={14} />
                  {image.commentCount}
                </span>
              </div>
              <span className="text-xs opacity-80">{formattedDate}</span>
            </div>
          </div>
        </figure>

        {(image.title || showEventLink) && (
          <div className="card-body p-3">
            {image.title && (
              <h3 className="card-title text-sm line-clamp-1">{image.title}</h3>
            )}
            {showEventLink && (
              <Link
                to={`/events/${image.eventId}`}
                className="text-xs text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Ver evento →
              </Link>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

