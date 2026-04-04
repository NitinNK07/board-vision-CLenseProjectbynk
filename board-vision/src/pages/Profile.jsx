import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Mail,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Gamepad2,
  Award,
  Clock,
  BookOpen,
  Settings,
  Edit2,
  Save,
  X,
  LogOut,
  Shield,
  Calendar,
  CheckCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { gamesAPI, statsAPI, authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingRating, setIsFetchingRating] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    fideId: user?.fideId || '',
    country: user?.country || '',
    title: user?.title || '',
    role: user?.role ? (Array.isArray(user.role) ? user.role : [user.role]) : ['PLAYER'],
    dob: user?.dob || '',
    rating: 1200,
  });

  // Fetch user statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      try {
        const response = await statsAPI.getMe();
        return response.data;
      } catch (error) {
        return {
          totalGames: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
          rating: 1200,
          ratingChange: 0,
          bestRating: 1200,
          currentStreak: 0,
          longestWinStreak: 0,
          mostPlayedOpening: 'Unknown',
          bestOpening: 'Unknown',
          recentForm: '',
          gamesAsWhite: 0,
          gamesAsBlack: 0,
          winRateAsWhite: 0,
          winRateAsBlack: 0,
        };
      }
    },
    enabled: isAuthenticated,
  });

  // Refetch user data when coming back from verification
  const { refetch: refetchUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authAPI.getMe();
      const userData = response.data;
      setUser(userData);
      return userData;
    },
    enabled: isAuthenticated,
    refetchOnMount: true,
  });

  // Update formData.rating when stats is loaded
  useEffect(() => {
    if (stats?.rating) {
      setFormData(prev => ({ ...prev, rating: stats.rating }));
    }
  }, [stats?.rating]);

  // Fetch recent games
  const { data: gamesData } = useQuery({
    queryKey: ['recentGames'],
    queryFn: async () => {
      try {
        const response = await gamesAPI.getMyGames();
        return response.data?.slice(0, 5) || [];
      } catch (error) {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleSaveProfile = async () => {
    try {
      // Apply rating rule: < 1400 = Unrated
      const displayRating = formData.rating < 1400 ? 0 : formData.rating;
      const updates = { ...formData, rating: displayRating };
      
      // TODO: Call API to update profile
      // await api.put('/api/users/profile', updates);
      setUser({ ...user, ...updates });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleRoleToggle = (roleValue) => {
    setFormData(prev => {
      const roles = prev.role || [];
      if (roles.includes(roleValue)) {
        // Remove role if already selected (keep at least one role)
        if (roles.length > 1) {
          return { ...prev, role: roles.filter(r => r !== roleValue) };
        }
        return prev;
      } else {
        // Add role
        return { ...prev, role: [...roles, roleValue] };
      }
    });
  };

  const handleRequestVerification = async () => {
    try {
      await otpAPI.request({ email: user?.email });
      toast.success('Verification code sent to your email');
      navigate('/verify-email', { state: { email: user?.email } });
    } catch (error) {
      toast.error('Failed to send verification code');
    }
  };

  const handleFetchFideRating = async () => {
    const fideId = formData.fideId?.trim();
    if (!fideId) {
      toast.error('Please enter your FIDE ID');
      return;
    }
    
    setIsFetchingRating(true);
    
    // Open FIDE profile IMMEDIATELY (browsers block delayed popups)
    const fideUrl = `https://ratings.fide.com/profile/${fideId}`;
    const newWindow = window.open(fideUrl, '_blank');
    
    // Show helpful message after 1 second
    setTimeout(() => {
      toast('We are unable to auto-fill. Please check details on FIDE page and paste here.', {
        duration: 6000,
        icon: '📋',
        position: 'top-center',
        style: {
          background: '#F59E0B',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
    }, 1000);
    
    // Try to fetch from backend (for future use if FIDE allows)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8082'}/api/fide/player/${fideId}`);
      const data = await response.json();
      console.log('FIDE response:', data);
      
      // Auto-fill if somehow FIDE allows (very unlikely)
      if (!data.requiresManualEntry && data.name && data.name !== 'Unknown') {
        const updates = {};
        let message = `✓ ${data.name}`;
        
        if (data.name) updates.name = data.name;
        if (data.standard && data.standard > 0) {
          updates.rating = data.standard;
          message += ` | Rating: ${data.standard}`;
        }
        if (data.country) updates.country = data.country;
        if (data.title) updates.title = data.title;
        
        setFormData(prev => ({ ...prev, ...updates }));
        toast.success(message);
      }
    } catch (error) {
      console.error('FIDE fetch error:', error);
    } finally {
      setIsFetchingRating(false);
    }
  };

  const getFormColor = (result) => {
    if (result === 'W') return 'bg-green-500';
    if (result === 'L') return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getRatingChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const StatCard = ({ icon: Icon, label, value, subValue, color }) => (
    <div className="card p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {subValue && (
            <p className="text-xs text-gray-500 dark:text-gray-500">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );

  const InputField = ({ label, icon: Icon, value, onChange, type = 'text', disabled = false }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <Icon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
            disabled ? 'border-gray-200 dark:border-gray-700 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="card mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 gap-4">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <div className="flex-1 mt-2">
                <div className="flex items-center gap-3 mb-3">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-2xl font-bold bg-transparent border-b-2 border-primary-500 focus:outline-none text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {user?.name || 'Chess Player'}
                    </h1>
                  )}
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Email with verification status */}
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{user?.email}</span>
                  {user?.emailVerified ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm">
                    <Trophy className="w-3 h-3" />
                    Rating: {formData.rating && formData.rating >= 1400 ? formData.rating : 'Unrated'}
                  </span>
                  {stats?.ratingChange && (
                    <span className="inline-flex items-center gap-1 text-sm">
                      {getRatingChangeIcon(stats.ratingChange)}
                      <span className={stats.ratingChange > 0 ? 'text-green-500' : stats.ratingChange < 0 ? 'text-red-500' : 'text-gray-500'}>
                        {stats.ratingChange > 0 ? '+' : ''}{stats.ratingChange}
                      </span>
                    </span>
                  )}
                  {/* Show Roles */}
                  {formData.role && formData.role.length > 0 && (
                    <div className="flex gap-1">
                      {formData.role.map(r => (
                        <span key={r} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form - Shows when editing */}
        {isEditing && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Edit Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Name (auto-filled from FIDE)"
                icon={User}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (cannot be changed)</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Contact support to change email</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Roles (select all that apply)</label>
                <div className="grid grid-cols-2 gap-2">
                  {['PLAYER', 'ARBITER', 'COACH', 'ORGANIZER'].map(roleValue => (
                    <label
                      key={roleValue}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.role?.includes(roleValue)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.role?.includes(roleValue)}
                        onChange={() => handleRoleToggle(roleValue)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {roleValue.charAt(0) + roleValue.slice(1).toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title (e.g., GM, IM, FM)</label>
                <div className="relative">
                  <Award className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">FIDE ID</label>
                <div className="relative">
                  <Shield className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.fideId}
                    onChange={(e) => setFormData({ ...formData, fideId: e.target.value })}
                    placeholder="Enter your FIDE ID"
                    className="w-full pl-10 pr-16 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleFetchFideRating}
                    disabled={isFetchingRating || !formData.fideId}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isFetchingRating ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enter FIDE ID to auto-fetch your rating</p>
              </div>
              <InputField
                label="Country"
                icon={Globe}
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rating 
                  <span className="text-xs text-gray-500 ml-2">(Below 1400 = Unrated)</span>
                </label>
                <div className="relative">
                  <Trophy className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 0 })}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                      formData.rating < 1400 ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
                {formData.rating < 1400 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    ⚠️ This rating will be shown as "Unrated"
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleSaveProfile} className="btn-primary">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Gamepad2}
            label="Total Games"
            value={stats?.totalGames || 0}
            subValue={`${stats?.gamesAsWhite || 0} as White, ${stats?.gamesAsBlack || 0} as Black`}
            color="bg-blue-500"
          />
          <StatCard
            icon={Trophy}
            label="Win Rate"
            value={`${stats?.winRate?.toFixed(1) || 0}%`}
            subValue={`${stats?.wins || 0}W / ${stats?.losses || 0}L / ${stats?.draws || 0}D`}
            color="bg-green-500"
          />
          <StatCard
            icon={Target}
            label="White Win Rate"
            value={`${stats?.winRateAsWhite?.toFixed(1) || 0}%`}
            color="bg-purple-500"
          />
          <StatCard
            icon={Target}
            label="Black Win Rate"
            value={`${stats?.winRateAsBlack?.toFixed(1) || 0}%`}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Form */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Form
              </h2>
              <div className="flex gap-2">
                {(stats?.recentForm || 'NNNNN').split('').slice(0, 10).map((result, idx) => (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-lg ${getFormColor(result)} flex items-center justify-center text-white font-bold text-sm`}
                    title={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Games */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Recent Games
              </h2>
              {gamesData && gamesData.length > 0 ? (
                <div className="space-y-3">
                  {gamesData.map((game, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => navigate(`/game/${game.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          game.result === '1-0' ? 'bg-green-500' :
                          game.result === '0-1' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {game.whitePlayer || 'Unknown'} vs {game.blackPlayer || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">{game.opening || 'Standard Game'}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {game.result || '*'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No games yet. Start scanning to build your database!</p>
                  <button
                    onClick={() => navigate('/scan')}
                    className="mt-4 btn-primary"
                  >
                    Scan Your First Game
                  </button>
                </div>
              )}
            </div>

            {/* Openings */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Opening Repertoire
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400 mb-1">Most Played</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats?.mostPlayedOpening || 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Best Performance</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats?.bestOpening || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/scan')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Gamepad2 className="w-5 h-5 text-primary-600" />
                  <span>Scan New Game</span>
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  <span>View All Games</span>
                </button>
                <button
                  onClick={() => navigate('/stats')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  <span>Detailed Statistics</span>
                </button>
              </div>
            </div>

            {/* Streaks */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Streaks & Achievements
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">Current Streak</span>
                  </div>
                  <span className="font-bold text-orange-500">
                    {stats?.currentStreak || 0} games
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700 dark:text-gray-300">Best Streak</span>
                  </div>
                  <span className="font-bold text-yellow-500">
                    {stats?.longestWinStreak || 0} wins
                  </span>
                </div>
              </div>
            </div>

            {/* Account Info & Verification */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{user?.email}</span>
                  </div>
                  {user?.emailVerified ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={handleRequestVerification}
                      className="text-primary-600 hover:text-primary-700 font-medium text-xs"
                    >
                      Verify
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
