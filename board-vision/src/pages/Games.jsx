import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Eye,
  Gamepad2,
  Calendar,
  Trophy,
  X,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { gamesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const Games = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    result: searchParams.get('result') || '',
    opening: searchParams.get('opening') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    sortBy: searchParams.get('sortBy') || 'date',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['games', currentPage, filters],
    queryFn: async () => {
      try {
        const response = await gamesAPI.getPaginated(currentPage, 10);
        return response.data;
      } catch {
        return { content: [], totalElements: 0, totalPages: 0 };
      }
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(filters);
    refetch();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      result: '',
      opening: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date',
      sortOrder: 'desc',
    });
    setSearchParams({});
    setCurrentPage(0);
  };

  const getResultColor = (result) => {
    if (result === '1-0') return 'bg-green-500';
    if (result === '0-1') return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getResultText = (result, whitePlayer, userEmail) => {
    if (!result || result === '*') return 'Draw';
    if (result === '1-0' || result === '0-1') {
      return result === '1-0' ? 'Win' : 'Loss';
    }
    return result;
  };

  const handleDeleteGame = async (gameId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this game?')) {
      try {
        await gamesAPI.delete(gameId);
        toast.success('Game deleted successfully');
        refetch();
      } catch {
        toast.error('Failed to delete game');
      }
    }
  };

  const handleExportPGN = (game, e) => {
    e.stopPropagation();
    const blob = new Blob([game.pgnContent || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-${game.id}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('PGN downloaded!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Games Database
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {data?.totalElements || 0} games in your collection
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by player name, opening, or event..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <button type="submit" className="btn-primary px-6">
              Search
            </button>
            {(filters.search || filters.result || filters.opening) && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Result</label>
                <select
                  value={filters.result}
                  onChange={(e) => handleFilterChange('result', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">All Results</option>
                  <option value="1-0">Win (1-0)</option>
                  <option value="0-1">Loss (0-1)</option>
                  <option value="1/2-1/2">Draw (1/2-1/2)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Opening</label>
                <input
                  type="text"
                  value={filters.opening}
                  onChange={(e) => handleFilterChange('opening', e.target.value)}
                  placeholder="e.g., Sicilian Defense"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="date">Date</option>
                  <option value="result">Result</option>
                  <option value="opening">Opening</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchParams(filters);
                  refetch();
                }}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Games List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading games...</p>
          </div>
        ) : data?.content?.length > 0 ? (
          <>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Players
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opening
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.content.map((game) => (
                      <tr
                        key={game.id}
                        onClick={() => navigate('/view-game', { state: { pgn: game.pgnContent, game } })}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            game.result === '1-0' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            game.result === '0-1' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {game.result || '*'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {game.whitePlayer || 'White'} vs {game.blackPlayer || 'Black'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {game.opening || 'Standard Game'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {game.gameDate ? new Date(game.gameDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => handleExportPGN(game, e)}
                              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="Download PGN"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteGame(game.id, e)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                              title="Delete Game"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage * 10) + 1} to {Math.min((currentPage + 1) * 10, data.totalElements)} of {data.totalElements} games
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= data.totalPages - 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="card p-12 text-center">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No games found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filters.search || filters.result || filters.opening
                ? 'Try adjusting your search or filters'
                : 'Start scanning games to build your database'}
            </p>
            {!filters.search && !filters.result && !filters.opening && (
              <button onClick={() => navigate('/scan')} className="btn-primary">
                Scan Your First Game
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
