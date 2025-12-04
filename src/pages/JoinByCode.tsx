import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { eventsApi } from '../services/api';

export function JoinByCode() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      setError('Ingresa un código de invitación');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await eventsApi.joinByCode(inviteCode.trim());
      navigate(`/events/${result.event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-100 to-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* Back */}
          <Link to="/events" className="btn btn-ghost btn-sm gap-2 self-start mb-2">
            <ArrowLeft size={16} />
            Volver
          </Link>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Unirse con Código</h1>
            <p className="text-base-content/60 mt-2">
              Ingresa el código de invitación del evento
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <input
                type="text"
                placeholder="Código de invitación"
                className="input input-bordered text-center text-lg font-mono tracking-widest uppercase"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
              disabled={loading || !inviteCode.trim()}
            >
              {loading ? 'Verificando...' : 'Unirse al Evento'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

