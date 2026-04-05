import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, ChevronLeft } from 'lucide-react';
import { gamesAPI } from '@/lib/api';
import GameViewer from '@/components/game/GameViewer';
import toast from 'react-hot-toast';

/**
 * GameById — fetches a game by ID from the URL (/game/:id)
 * and displays it with the GameViewer, or shows a friendly error
 * if the game is not found in the database.
 */
const GameById = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await gamesAPI.getById(id);
        setGame(response.data);
      } catch (err) {
        console.error('Failed to fetch game:', err);
        if (err.response?.status === 404) {
          setError('Game not found. It may have been deleted or the link is invalid.');
        } else if (err.response?.status === 401) {
          setError('Please log in to view this game.');
        } else {
          setError('Failed to load game. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchGame();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading game #{id}...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Game Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'This game could not be found in the database.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/games')}
              className="btn-primary"
            >
              Browse Games
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success — redirect to ViewGame with the fetched data
  // We render inline instead of navigating to avoid losing state
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {game.whitePlayer || 'White'} vs {game.blackPlayer || 'Black'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {game.opening || 'Standard Game'} • {game.result || '*'}
              {game.gameDate && ` • ${new Date(game.gameDate).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        {/* Game Viewer */}
        <div className="card p-4">
          {game.pgnContent ? (
            <GameViewer pgn={game.pgnContent} width={440} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No PGN data available for this game.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameById;
