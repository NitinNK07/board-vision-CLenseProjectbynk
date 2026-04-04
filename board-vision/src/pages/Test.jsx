import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

const Test = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Welcome to Board Vision</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">AI-powered chess position scanning and analysis</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/signup')} className="btn-primary">
            Get Started
          </button>
          <button onClick={() => navigate('/login')} className="btn-secondary">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Test;
