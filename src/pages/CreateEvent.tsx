import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Lock, Globe, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { eventsApi } from '../services/api';

export function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
    time: '',
    category: 'other',
    isPrivate: false,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('El nombre del evento es requerido');
      return;
    }

    if (!formData.location.trim()) {
      setError('La ubicación es requerida');
      return;
    }

    if (!formData.date) {
      setError('La fecha es requerida');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      if (formData.description) data.append('description', formData.description);
      data.append('location', formData.location.trim());
      // Convertir fecha a ISO 8601
      data.append('date', new Date(formData.date).toISOString());
      if (formData.time) data.append('time', formData.time);
      data.append('category', formData.category);
      data.append('isPrivate', String(formData.isPrivate));
      if (coverImage) data.append('coverImage', coverImage);

      const event = await eventsApi.create(data);
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Back Button */}
        <Link to="/events" className="btn btn-ghost gap-2 mb-4">
          <ArrowLeft size={20} />
          Volver a Eventos
        </Link>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl mb-4">
              <Calendar className="text-primary" />
              Crear Nuevo Evento
            </h1>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Image */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Imagen de portada</span>
                </label>
                <div
                  className="relative h-48 rounded-lg border-2 border-dashed border-base-300 hover:border-primary transition-colors cursor-pointer overflow-hidden"
                  onClick={() => document.getElementById('cover-input')?.click()}
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-base-content/50">
                      <ImageIcon size={48} />
                      <p className="mt-2">Haz clic para subir una imagen</p>
                    </div>
                  )}
                  <input
                    id="cover-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Nombre del evento *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ej: Fiesta de cumpleaños"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Descripción</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Describe tu evento..."
                  className="textarea textarea-bordered h-24"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Location */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Ubicación *</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <MapPin size={18} className="text-base-content/50" />
                  <input
                    type="text"
                    name="location"
                    placeholder="Ej: Parque Central"
                    className="grow"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              {/* Category */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Categoría</span>
                </label>
                <select
                  name="category"
                  className="select select-bordered"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="other">Otro</option>
                  <option value="wedding">Boda</option>
                  <option value="birthday">Cumpleaños</option>
                  <option value="conference">Conferencia</option>
                  <option value="music">Música</option>
                  <option value="sports">Deportes</option>
                  <option value="art">Arte</option>
                  <option value="corporate">Corporativo</option>
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Fecha *</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="input input-bordered"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Hora</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    className="input input-bordered"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Privacy */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    className="toggle toggle-primary"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                  />
                  <span className="label-text flex items-center gap-2">
                    {formData.isPrivate ? (
                      <>
                        <Lock size={18} className="text-warning" />
                        Evento privado (solo por invitación)
                      </>
                    ) : (
                      <>
                        <Globe size={18} className="text-success" />
                        Evento público (visible para todos)
                      </>
                    )}
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Creando evento...' : 'Crear Evento'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

