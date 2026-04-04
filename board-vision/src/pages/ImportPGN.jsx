import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Chess } from 'chess.js';
import { gamesAPI, analysisAPI } from '@/lib/api';

const ImportPGN = () => {
  const navigate = useNavigate();
  const [pgnText, setPgnText] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const importMutation = useMutation({
    mutationFn: async (pgn) => {
      // Validate PGN
      try {
        const chess = new Chess();
        chess.load_pgn(pgn);
        console.log('✅ PGN validated successfully');
        console.log('📊 Game info:', {
          white: chess.header('White'),
          black: chess.header('Black'),
          result: chess.header('Result'),
          moveCount: chess.history().length
        });
        
        // Save to backend
        const saveResponse = await gamesAPI.import(pgn);
        console.log('💾 Game saved to backend:', saveResponse.data);
        
        return { valid: true, pgn, gameId: saveResponse.data.gameId };
      } catch (error) {
        console.error('❌ PGN validation failed:', error.message);
        throw new Error('Invalid PGN format: ' + error.message);
      }
    },
    onSuccess: async (data) => {
      toast.success('PGN imported successfully! Analyzing...');
      // Auto-trigger analysis
      let analysis = null;
      if (data.gameId) {
        try {
          const analysisRes = await analysisAPI.analyzeGame(data.gameId);
          analysis = analysisRes.data;
          toast.success('Analysis complete!');
        } catch (err) {
          console.warn('Auto-analysis failed:', err);
          toast('Click "Analyze Game" to generate insights', { icon: '💡' });
        }
      }
      // Navigate to game viewer with PGN + analysis
      navigate('/view-game', { state: { pgn: data.pgn, gameId: data.gameId, analysis } });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to import PGN');
    },
  });

  const handleFileSelect = (selectedFile) => {
    // Check file extension instead of MIME type (PGN files often have no/unknown MIME type)
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      const isPgnFile = fileName.endsWith('.pgn') || selectedFile.type === 'application/x-chess-pgn' || selectedFile.type === 'text/plain';
      
      if (isPgnFile) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPgnText(e.target.result);
        };
        reader.readAsText(selectedFile);
      } else {
        toast.error('Please select a valid PGN file (.pgn)');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pgnText.trim()) {
      toast.error('Please enter or upload a PGN');
      return;
    }
    importMutation.mutate(pgnText);
  };

  const loadSamplePGN = () => {
    const sample = `[Event "F/S Return Match"]
[Site "Belgrade, Serbia Yugoslavia|JUG"]
[Date "1992.11.04"]
[Round "29"]
[Result "1/2-1/2"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 22. Bxc4 Nb6 23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg5 28. Qxg5 hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33. f3 Bc8 34. Kf2 Bf5 35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5 40. Rd6 Kc5 41. Ra6 Nf2 42. g4 Bd3 43. Re6 1/2-1/2`;
    setPgnText(sample);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Import PGN
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your existing chess games from other platforms
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit}>
            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
              }`}
            >
              <input
                type="file"
                accept=".pgn"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
                id="pgn-upload"
              />
              <label htmlFor="pgn-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Drop your PGN file here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or click to browse
                </p>
              </label>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>

            {/* Or Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              <span className="text-gray-500">or paste PGN text</span>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            {/* PGN Text Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                PGN Content
              </label>
              <textarea
                value={pgnText}
                onChange={(e) => setPgnText(e.target.value)}
                placeholder="Paste your PGN here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono text-sm"
              />
            </div>

            {/* Sample PGN Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={loadSamplePGN}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Load Sample PGN
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={importMutation.isPending || !pgnText.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Import PGN
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  What is PGN?
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  PGN (Portable Game Notation) is a standard format for recording chess games.
                  You can export PGN files from chess.com, Lichess, and other chess platforms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Export from Platform</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download your games from chess.com, Lichess, or any chess platform as a PGN file.
            </p>
          </div>
          <div className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">Upload or Paste</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload the PGN file or paste the content directly into the text area above.
            </p>
          </div>
          <div className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Analyze & Track</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your games will be analyzed and added to your statistics and performance tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPGN;
