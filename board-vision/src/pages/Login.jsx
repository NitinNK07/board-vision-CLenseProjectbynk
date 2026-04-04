import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Crown, Eye, EyeOff } from 'lucide-react';
import FloatingChessPieces from '@/components/ui/FloatingChessPieces';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8082';

const Login = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || 'Login failed. Please check your credentials.');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      console.log('✅ Login response:', data);
      if (data.accessToken) {
        try {
          setToken(data.accessToken);
          const userResponse = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`,
              'Accept': 'application/json',
            },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
            toast.success('Welcome back!');
            navigate('/scan');
          } else {
            toast.error('Failed to fetch user data');
          }
        } catch (err) {
          console.error('Failed to fetch user:', err);
          toast.error('Login successful but failed to fetch user data');
        }
      } else {
        console.error('❌ No accessToken in response:', data);
        toast.error('No token received from server');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    },
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      loginMutation.mutate({
        email: formData.email.trim(),
        password: formData.password,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Left side — 3D Floating Chess Animation (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] p-4">
        <FloatingChessPieces />
      </div>

      {/* Right side — Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
              <Crown className="w-9 h-9 text-primary-600 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold gradient-text">Board Vision</span>
            </Link>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic" style={{ fontFamily: 'Georgia, serif' }}>
              - powered by CLense
            </p>
            <h1 className="text-3xl font-bold mb-2 mt-6">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form Card */}
          <div className="card" style={{
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(168,130,255,0.08)',
          }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input pr-11 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast('Password reset coming soon!')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="btn-primary w-full text-lg py-3 relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          {/* Mobile-only chess piece hint */}
          <div className="lg:hidden mt-8 text-center">
            <span className="text-4xl opacity-30 select-none">♚ ♛ ♞ ♜</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
