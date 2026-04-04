import { BarChart3, TrendingUp, Award, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '@/lib/api';

const Stats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      try {
        const response = await statsAPI.getMe();
        return response.data;
      } catch {
        return null;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your chess performance and improvement
          </p>
        </div>

        {!stats ? (
          <div className="card p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No Statistics Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start scanning games to build your statistics
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-primary-600" />
                <span className="text-3xl font-bold">{stats.totalGames || 0}</span>
              </div>
              <h3 className="font-semibold">Total Games</h3>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold">{stats.wins || 0}</span>
              </div>
              <h3 className="font-semibold">Wins</h3>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold">{stats.winRate || 0}%</span>
              </div>
              <h3 className="font-semibold">Win Rate</h3>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold">{stats.averageAccuracy || 0}%</span>
              </div>
              <h3 className="font-semibold">Avg Accuracy</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
