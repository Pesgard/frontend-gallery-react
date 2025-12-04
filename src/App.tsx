import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, ProtectedRoute } from './components';
import {
  Home,
  Login,
  Register,
  Events,
  EventDetail,
  Profile,
  ImageDetail,
  CreateEvent,
  UploadImage,
  JoinByCode,
} from './pages';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes (no navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public routes with navbar */}
          <Route
            path="/"
            element={
              <AppLayout>
                <Home />
              </AppLayout>
            }
          />
          <Route
            path="/events"
            element={
              <AppLayout>
                <Events />
              </AppLayout>
            }
          />
          <Route
            path="/events/:id"
            element={
              <AppLayout>
                <EventDetail />
              </AppLayout>
            }
          />
          <Route
            path="/images/:id"
            element={
              <AppLayout>
                <ImageDetail />
              </AppLayout>
            }
          />

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-events"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/create"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateEvent />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/upload"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <UploadImage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/join"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <JoinByCode />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <AppLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                    <p className="text-xl text-base-content/70 mb-4">Página no encontrada</p>
                    <a href="/" className="btn btn-primary">
                      Volver al inicio
                    </a>
                  </div>
                </div>
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
