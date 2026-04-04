import { Link } from 'react-router-dom';
import { Crown, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated Crown Icon */}
        <div className="mb-8 animate-bounce">
          <Crown className="w-24 h-24 mx-auto text-primary-600" />
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Illegal Move!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Oops! It looks like you've tried to make a move that doesn't exist. 
          The page you're looking for can't be found.
        </p>

        {/* Additional Message */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-8 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            ♟️ Chess Tip:
          </p>
          <p className="text-gray-700 dark:text-gray-300 italic">
            "Every mistake is a learning opportunity. Even grandmasters blunder!"
          </p>
        </div>

        {/* Back Home Button */}
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-5 h-5" />
          Back to Home
        </Link>

        {/* Additional Links */}
        <div className="mt-6 flex justify-center gap-4 text-sm flex-wrap">
          <Link to="/scan" className="text-primary-600 hover:text-primary-700 font-medium">
            Scan Position
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/games" className="text-primary-600 hover:text-primary-700 font-medium">
            My Games
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/stats" className="text-primary-600 hover:text-primary-700 font-medium">
            Statistics
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/training" className="text-primary-600 hover:text-primary-700 font-medium">
            Training
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
