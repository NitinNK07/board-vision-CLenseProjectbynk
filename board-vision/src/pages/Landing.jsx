import { Link } from 'react-router-dom';
import { Camera, Database, TrendingUp, Zap, Crown } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="header-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 mb-8">
              <Crown className="w-4 h-4 text-primary-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                AI-Powered Chess Position Analysis
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Turn Any Chess Board Into{' '}
              <span className="gradient-text">Digital Games</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
              Scan chess positions with your camera, analyze your games, track statistics, 
              and build your personal chess database.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary text-lg px-8 py-4">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Powerful features to help you improve your chess game
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* OCR Scanning */}
            <div className="card">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">OCR Position Scanning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take a photo of any chess position and instantly convert it to digital format 
                with AI-powered recognition.
              </p>
            </div>

            {/* Games Database */}
            <div className="card">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Games Database</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Store, organize, and search through all your scanned games with powerful 
                filtering and management tools.
              </p>
            </div>

            {/* Player Statistics */}
            <div className="card">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Player Statistics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your performance with detailed stats, win rates, opening repertoire, 
                and progress over time.
              </p>
            </div>

            {/* Game Analysis */}
            <div className="card">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Game Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant analysis of your games with move-by-move evaluation and 
                improvement suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free with daily scans and earn more by watching ads
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="card border-2 border-primary-600 dark:border-primary-500">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Free Forever</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Everything you need to get started
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  '3 free scans per day',
                  'Watch ads for additional scans',
                  'Unlimited game storage',
                  'Full statistics dashboard',
                  'Game analysis tools',
                  'PGN export & sharing',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup" className="btn-primary w-full block text-center">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 header-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Digitize Your Chess Games?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of chess players using Board Vision to improve their game.
          </p>
          <Link to="/scan" className="btn-primary text-lg px-8 py-4 inline-block">
            Start Scanning Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
