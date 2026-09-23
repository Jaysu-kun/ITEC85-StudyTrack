import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ThemeProvider from './components/ThemeProvider';
import ToastContainer from './components/ui/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AmbientBackground from './components/ui/AmbientBackground';
import { PageLoadingFallback } from './components/ui/LoadingSpinner';
import useAuthStore from './store/useAuthStore';
import useTaskStore from './store/useTaskStore';

// Lazy-loaded page components for route-level code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export const App: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchTasks } = useTaskStore();

  // Fetch tasks when user is logged in
  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id, fetchTasks]);

  return (
    <ThemeProvider>
      <Router>
        <div className="relative min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-250 selection:bg-sky-500/20 selection:text-sky-600 dark:selection:text-sky-300">
          <AmbientBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <ToastContainer />
            <Navbar />

            <main className="flex-grow">
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Public Auth Routes */}
                  <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
                  />
                  <Route
                    path="/signup"
                    element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />}
                  />

                  {/* Catch-all 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
