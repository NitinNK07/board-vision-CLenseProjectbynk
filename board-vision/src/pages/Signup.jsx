import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Crown, Eye, EyeOff } from 'lucide-react';
import FloatingChessPieces from '@/components/ui/FloatingChessPieces';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8082';

const Signup = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PLAYER',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async (data) => {
      console.log('📤 Sending signup request...', data);
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log('📥 Response status:', response.status);
      const responseData = await response.json();
      console.log('📥 Response data:', responseData);
      if (!response.ok) {
        throw new Error(responseData.message || 'Signup failed. Please try again.');
      }
      return responseData;
    },
    onSuccess: async (data) => {
      console.log('✅ onSuccess - data:', data);
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
            toast.success('Account created successfully!');

            // Request OTP for email verification
            try {
              await fetch(`${API_BASE}/otp/request`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.accessToken}`,
                },
                body: JSON.stringify({ email: formData.email }),
              });
              toast.success('Verification code sent to your email!');
              navigate('/verify-email', { state: { email: formData.email } });
            } catch (otpError) {
              console.error('Failed to send OTP:', otpError);
              navigate('/scan');
            }
          } else {
            toast.error('Failed to fetch user data');
          }
        } catch (err) {
          console.error('Failed to fetch user:', err);
          toast.error('Signup successful but failed to fetch user data');
        }
      } else {
        console.error('No accessToken in response:', data);
        toast.error('No token received from server');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Signup failed. Please try again.');
    },
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      signupMutation.mutate({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
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

      {/* Right side — Signup Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
              <Crown className="w-9 h-9 text-primary-600 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold gradient-text">Board Vision</span>
            </Link>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic" style={{ fontFamily: 'Georgia, serif' }}>
              - powered by CLense
            </p>
            <h1 className="text-3xl font-bold mb-2 mt-5">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign up to get started with Board Vision
            </p>
          </div>

          {/* Form Card */}
          <div className="card" style={{
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(168,130,255,0.08)',
          }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

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
                    autoComplete="new-password"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input pr-11 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="btn-primary w-full text-lg py-3 relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {signupMutation.isPending ? 'Creating account...' : 'Create Account'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Mobile-only chess piece hint */}
          <div className="lg:hidden mt-6 text-center">
            <span className="text-4xl opacity-30 select-none">♚ ♛ ♞ ♜</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
