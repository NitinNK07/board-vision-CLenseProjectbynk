import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import GameViewer from '@/components/game/GameViewer';
import AnalysisSummary from '@/components/analysis/AnalysisSummary';
import { analysisAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const ViewGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pgn = location.state?.pgn || '';
  const gameId = location.state?.gameId || location.state?.game?.id || null;
  const passedAnalysis = location.state?.analysis || null;

  const [analysis, setAnalysis] = useState(passedAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Fetch existing analysis if gameId is available
  useEffect(() => {
    if (gameId && !analysis) {
      setLoadingAnalysis(true);
      analysisAPI.getAnalysis(gameId)
        .then(res => {
          setAnalysis(res.data);
        })
        .catch(() => {
          // No analysis exists yet — that's fine
        })
        .finally(() => setLoadingAnalysis(false));
    }
  }, [gameId, analysis]);

  // Trigger AI analysis
  const handleAnalyze = async () => {
    if (!gameId) {
      // If no gameId, analyze PGN directly
      setIsAnalyzing(true);
      try {
        const res = await analysisAPI.analyzePgn(pgn);
        setAnalysis(res.data);
        toast.success('Analysis complete!');
      } catch (err) {
        toast.error('Analysis failed: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await analysisAPI.analyzeGame(gameId);
      setAnalysis(res.data);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error('Analysis failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!pgn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No PGN data found</h1>
          <button onClick={() => navigate('/import')} className="btn-primary">
            Import PGN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Game Analysis</h1>
          </div>

          {/* Analyze Button */}
          {!analysis && !loadingAnalysis && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Game
                </>
              )}
            </button>
          )}
        </div>

        {/* Main Layout — Board left, Analysis right */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Game Viewer with Board + Moves */}
          <div className="flex-1 card p-4">
            <GameViewer pgn={pgn} analysis={analysis} width={440} />
          </div>

          {/* Right: Analysis Summary Panel */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {loadingAnalysis && (
              <div className="card p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
                <span>Loading analysis...</span>
              </div>
            )}

            {isAnalyzing && (
              <div className="card p-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg mb-1">Analyzing Game...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Evaluating each move with engine analysis
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="card p-4">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Game Insights
                </h2>
                <AnalysisSummary analysis={analysis} />
              </div>
            )}

            {!analysis && !isAnalyzing && !loadingAnalysis && (
              <div className="card p-6 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Click "Analyze Game" to get AI-powered insights — accuracy, blunders, brilliant moves, and more.
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="btn-primary w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2 inline" />
                  Analyze Game
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGame;
