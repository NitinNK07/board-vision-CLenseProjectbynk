import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Crown } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileDropdown(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Crown className="w-8 h-8 text-primary-600 group-hover:text-primary-500 transition-colors" />
          <span className="text-xl font-bold gradient-text">Board Vision</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 italic hidden sm:inline" style={{ fontFamily: 'Georgia, serif' }}>
            - powered by CLense
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Navigation Links - Only visible when authenticated */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/games"
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Games
              </Link>
              <Link
                to="/scan"
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Scan
              </Link>
            </nav>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-accent-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <span className="font-medium">{user?.name || 'Profile'}</span>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      👤 My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      📊 Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/games');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      📚 My Games
                    </button>
                    <button
                      onClick={() => {
                        navigate('/scan');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      📸 Scan Position
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
