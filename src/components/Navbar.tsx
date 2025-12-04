import { Link, useNavigate } from 'react-router-dom';
import { Camera, Menu, LogOut, User, Calendar, Image, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="navbar bg-base-200 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <button
            tabIndex={0}
            className="btn btn-ghost lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          {mobileMenuOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52"
            >
              <li>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Image size={18} /> Galería
                </Link>
              </li>
              <li>
                <Link to="/events" onClick={() => setMobileMenuOpen(false)}>
                  <Calendar size={18} /> Eventos
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <User size={18} /> Mi Perfil
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
        <Link to="/" className="btn btn-ghost text-xl gap-2">
          <Camera className="text-primary" size={28} />
          <span className="font-bold hidden sm:inline">EventGallery</span>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li>
            <Link to="/" className="font-medium">
              <Image size={18} /> Galería
            </Link>
          </li>
          <li>
            <Link to="/events" className="font-medium">
              <Calendar size={18} /> Eventos
            </Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        <form onSubmit={handleSearch} className="hidden sm:flex">
          <div className="join">
            <input
              type="text"
              placeholder="Buscar..."
              className="input input-bordered input-sm join-item w-32 md:w-48"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-sm btn-primary join-item" aria-label="Buscar">
              <Search size={16} />
            </button>
          </div>
        </form>

        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-circle avatar" aria-label="Menú de usuario">
              <div className="w-10 rounded-full bg-primary/20 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="rounded-full" />
                ) : (
                  <User size={24} className="text-primary" />
                )}
              </div>
            </button>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52"
            >
              <li className="menu-title px-4 py-2">
                <span className="text-base-content font-semibold">{user?.username}</span>
              </li>
              <div className="divider my-0"></div>
              <li>
                <Link to="/profile">
                  <User size={16} /> Mi Perfil
                </Link>
              </li>
              <li>
                <Link to="/my-events">
                  <Calendar size={16} /> Mis Eventos
                </Link>
              </li>
              <div className="divider my-0"></div>
              <li>
                <button onClick={handleLogout} className="text-error">
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Ingresar
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

