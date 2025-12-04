import { Calendar, Users, Image, Lock, Globe } from 'lucide-react';
import type { Event } from '../types';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const formattedDate = event.startDate
    ? new Date(event.startDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Link to={`/events/${event.id}`} className="group">
      <div className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 h-full">
        <figure className="relative h-48 overflow-hidden">
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Calendar size={48} className="text-primary/50" />
            </div>
          )}
          
          {/* Privacy badge */}
          <div className="absolute top-3 right-3">
            <div className={`badge ${event.isPrivate ? 'badge-warning' : 'badge-success'} gap-1`}>
              {event.isPrivate ? <Lock size={12} /> : <Globe size={12} />}
              {event.isPrivate ? 'Privado' : 'Público'}
            </div>
          </div>

          {/* Participant indicator */}
          {event.isParticipant && (
            <div className="absolute top-3 left-3">
              <div className="badge badge-primary">Participante</div>
            </div>
          )}
        </figure>

        <div className="card-body p-4">
          <h2 className="card-title text-lg line-clamp-1">{event.name}</h2>
          
          {event.description && (
            <p className="text-sm text-base-content/70 line-clamp-2">{event.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {formattedDate && (
              <div className="badge badge-outline gap-1">
                <Calendar size={12} />
                {formattedDate}
              </div>
            )}
            <div className="badge badge-outline gap-1">
              <Users size={12} />
              {event.participantCount}
            </div>
            <div className="badge badge-outline gap-1">
              <Image size={12} />
              {event.imageCount}
            </div>
          </div>

          {event.location && (
            <p className="text-xs text-base-content/60 mt-2 truncate">📍 {event.location}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

