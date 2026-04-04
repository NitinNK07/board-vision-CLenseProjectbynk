import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Scan from '@/pages/Scan';
import Result from '@/pages/Result';
import NotFound from '@/pages/NotFound';
import Test from '@/pages/Test';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Games from '@/pages/Games';
import ImportPGN from '@/pages/ImportPGN';
import VerifyEmail from '@/pages/VerifyEmail';
import ViewGame from '@/pages/ViewGame';
import Stats from '@/pages/Stats';
import Training from '@/pages/Training';
import About from '@/pages/About';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Test />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
              <Route path="/import" element={<ProtectedRoute><ImportPGN /></ProtectedRoute>} />
              <Route path="/view-game" element={<ProtectedRoute><ViewGame /></ProtectedRoute>} />
              <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
              <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
              <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
