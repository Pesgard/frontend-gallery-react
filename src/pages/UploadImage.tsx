import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, Image as ImageIcon, ArrowLeft, X } from 'lucide-react';
import { imagesApi, eventsApi } from '../services/api';
import { LoadingSpinner } from '../components';
import type { Event } from '../types';

export function UploadImage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    if (!eventId) return;
    try {
      const data = await eventsApi.getOne(eventId);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !eventId) {
      setError('Selecciona una imagen');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('eventId', eventId);
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);

      const result = await imagesApi.upload(formData);
      navigate(`/images/${result.image.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <p className="text-error">{error || 'Evento no encontrado'}</p>
            <Link to="/events" className="btn btn-primary mt-4">
              Volver a Eventos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Back Button */}
        <Link to={`/events/${eventId}`} className="btn btn-ghost gap-2 mb-4">
          <ArrowLeft size={20} />
          Volver a {event.name}
        </Link>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl mb-4">
              <Upload className="text-primary" />
              Subir Foto
            </h1>

            <p className="text-base-content/70 mb-4">
              Subiendo a: <span className="font-semibold">{event.name}</span>
            </p>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Imagen *</span>
                </label>

                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-96 object-contain rounded-lg bg-base-200"
                    />
                    <button
                      type="button"
                      className="btn btn-circle btn-sm btn-error absolute top-2 right-2"
                      onClick={handleRemoveFile}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="h-64 rounded-lg border-2 border-dashed border-base-300 hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center"
                    onClick={() => document.getElementById('image-input')?.click()}
                  >
                    <ImageIcon size={48} className="text-base-content/30" />
                    <p className="mt-2 text-base-content/50">
                      Haz clic o arrastra una imagen aquí
                    </p>
                    <p className="text-xs text-base-content/30 mt-1">
                      JPG, PNG, GIF hasta 10MB
                    </p>
                  </div>
                )}

                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Título (opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Momento especial"
                  className="input input-bordered"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Descripción (opcional)</span>
                </label>
                <textarea
                  placeholder="Describe esta foto..."
                  className="textarea textarea-bordered h-24"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`btn btn-primary w-full gap-2 ${uploading ? 'loading' : ''}`}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  'Subiendo...'
                ) : (
                  <>
                    <Upload size={20} />
                    Subir Foto
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

