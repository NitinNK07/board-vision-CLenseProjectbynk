import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Gamepad2,
  Upload,
  TrendingUp,
  Trophy,
  BookOpen,
  Target,
  Play,
  Clock,
  Award,
  Search,
  Plus,
  ArrowRight,
  Zap,
  Brain,
  Users
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { scanAPI, gamesAPI, statsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // Fetch allowance
  const { data: allowance } = useQuery({
    queryKey: ['scanAllowance'],
    queryFn: async () => {
      try {
        const response = await scanAPI.getAllowance();
        return response.data;
      } catch {
        return { trialRemainingToday: 3, adCredits: 0, paidCredits: 0 };
      }
    },
    enabled: isAuthenticated,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      try {
        const response = await statsAPI.getMe();
        return response.data;
      } catch {
        return {
          totalGames: 0,
          wins: 0,
          winRate: 0,
          rating: 1200,
          currentStreak: 0,
        };
      }
    },
    enabled: isAuthenticated,
  });

  // Fetch recent games
  const { data: recentGames } = useQuery({
    queryKey: ['recentGames'],
    queryFn: async () => {
      try {
        const response = await gamesAPI.getMyGames();
        return response.data?.slice(0, 3) || [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
  });

  const totalScans = (allowance?.trialRemainingToday || 0) + 
                     (allowance?.adCredits || 0) + 
                     (allowance?.paidCredits || 0);

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color, shortcut }) => (
    <button
      onClick={onClick}
      className="card p-6 text-left hover:shadow-lg transition-all hover:-translate-y-1 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {shortcut && (
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {shortcut}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <div className="mt-4 flex items-center gap-2 text-primary-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Get Started <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );

  const StatWidget = ({ icon: Icon, label, value, subValue, trend, color }) => (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Board Vision</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            AI-powered chess position scanning and analysis
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/signup')} className="btn-primary text-lg px-8">
              Get Started Free
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary text-lg px-8">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back, {user?.name || 'Chess Player'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to analyze some games today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickActionCard
            icon={Gamepad2}
            title="Scan Position"
            description="Upload a chess board image for instant analysis"
            onClick={() => navigate('/scan')}
            color="bg-primary-600"
            shortcut="S"
          />
          <QuickActionCard
            icon={Upload}
            title="Import PGN"
            description="Upload existing games from other platforms"
            onClick={() => navigate('/import')}
            color="bg-blue-600"
            shortcut="I"
          />
          <QuickActionCard
            icon={Brain}
            title="Tactical Training"
            description="Practice puzzles based on your mistakes"
            onClick={() => navigate('/training')}
            color="bg-purple-600"
            shortcut="T"
          />
          <QuickActionCard
            icon={Users}
            title="Opponent Scout"
            description="Analyze your opponent's playing style"
            onClick={() => navigate('/opponents')}
            color="bg-orange-600"
            shortcut="O"
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatWidget
            icon={Gamepad2}
            label="Total Games"
            value={stats?.totalGames || 0}
            subValue="All time"
            color="bg-blue-500"
          />
          <StatWidget
            icon={Trophy}
            label="Win Rate"
            value={`${stats?.winRate?.toFixed(1) || 0}%`}
            trend={5}
            color="bg-green-500"
          />
          <StatWidget
            icon={Target}
            label="Current Rating"
            value={stats?.rating || 1200}
            subValue={`${stats?.ratingChange > 0 ? '+' : ''}${stats?.ratingChange || 0}`}
            color="bg-purple-500"
          />
          <StatWidget
            icon={Clock}
            label="Scans Available"
            value={totalScans}
            subValue={`${allowance?.trialRemainingToday || 0} trial, ${allowance?.adCredits || 0} ad`}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Games */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Recent Games
                </h2>
                <button
                  onClick={() => navigate('/games')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {recentGames && recentGames.length > 0 ? (
                <div className="space-y-3">
                  {recentGames.map((game, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => navigate(`/game/${game.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          game.result === '1-0' ? 'bg-green-500' :
                          game.result === '0-1' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {game.whitePlayer || 'White'} vs {game.blackPlayer || 'Black'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {game.opening || 'Standard Game'} • {game.result || '*'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No games yet. Start building your database!
                  </p>
                  <button onClick={() => navigate('/scan')} className="btn-primary">
                    Scan Your First Game
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Daily Scans */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Daily Scans
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Trial Remaining</span>
                  <span className="font-semibold">{allowance?.trialRemainingToday || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Ad Credits</span>
                  <span className="font-semibold">{allowance?.adCredits || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Paid Credits</span>
                  <span className="font-semibold">{allowance?.paidCredits || 0}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Available</span>
                    <span className="font-bold text-primary-600">{totalScans}</span>
                  </div>
                </div>
                {allowance?.adCredits < 3 && (
                  <button
                    onClick={() => navigate('/scan')}
                    className="w-full mt-3 btn-secondary text-sm"
                  >
                    Watch Ad for More Scans
                  </button>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Achievements
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Trophy className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">First Scan</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 opacity-50">
                  <Target className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">10 Games</p>
                    <p className="text-xs text-gray-500">0/10</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 opacity-50">
                  <Brain className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">Tactical Master</p>
                    <p className="text-xs text-gray-500">Locked</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Search */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Games
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by player, opening..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/games?search=${e.target.value}`);
                    }
                  }}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                onClick={() => navigate('/games')}
                className="w-full mt-3 btn-primary text-sm"
              >
                Advanced Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
