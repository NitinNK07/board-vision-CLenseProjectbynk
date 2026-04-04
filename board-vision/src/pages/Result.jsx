import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit3, Check, X, Save, Sparkles, Loader2, RotateCcw, Download, Share2, Copy, CheckCircle } from 'lucide-react';
import { scanAPI, analysisAPI } from '@/lib/api';
import { useScanStore } from '@/store/scanStore';
import toast from 'react-hot-toast';

/**
 * Result page — shows scanned PGN for user editing, saving, downloading, sharing
 * Flow: Scan → Result (edit PGN) → Save / Download / Share / Analyze
 */
const Result = () => {
  const navigate = useNavigate();
  const { pgn: scannedPgn, clearResult } = useScanStore();

  const [pgnText, setPgnText] = useState(scannedPgn || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedGameId, setSavedGameId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedFen] = useState(() => localStorage.getItem('lastScannedFEN') || '');

  useEffect(() => {
    if (scannedPgn) setPgnText(scannedPgn);
  }, [scannedPgn]);

  if (!pgnText) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No scan result found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload an image first to see the extracted PGN.
          </p>
          <button onClick={() => navigate('/scan')} className="btn-primary">
            Go to Scan
          </button>
        </div>
      </div>
    );
  }

  // ========== SAVE to Database ==========
  const handleSave = async () => {
    if (!pgnText.trim()) {
      toast.error('PGN is empty');
      return;
    }
    setIsSaving(true);
    try {
      const saveRes = await scanAPI.confirmScan(pgnText, savedFen);
      const gameId = saveRes.data.gameId;
      setSavedGameId(gameId);
      toast.success('Game saved to database!');
    } catch (err) {
      toast.error('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  // ========== ANALYZE (requires save first) ==========
  const handleAnalyze = async () => {
    let gameId = savedGameId;

    // Save first if not yet saved
    if (!gameId) {
      setIsSaving(true);
      try {
        const saveRes = await scanAPI.confirmScan(pgnText, savedFen);
        gameId = saveRes.data.gameId;
        setSavedGameId(gameId);
        toast.success('Game saved!');
      } catch (err) {
        toast.error('Failed to save: ' + (err.response?.data?.message || err.message));
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }

    // Now analyze
    setIsAnalyzing(true);
    try {
      const analysisRes = await analysisAPI.analyzeGame(gameId);
      toast.success('Analysis complete!');
      clearResult();
      navigate('/view-game', {
        state: { pgn: pgnText, gameId, analysis: analysisRes.data },
      });
    } catch (err) {
      toast.error('Analysis failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ========== DOWNLOAD as .pgn file ==========
  const handleDownload = () => {
    const blob = new Blob([pgnText], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Extract white/black names for filename
    const whiteMatch = pgnText.match(/\[White\s+"([^"]+)"\]/);
    const blackMatch = pgnText.match(/\[Black\s+"([^"]+)"\]/);
    const white = whiteMatch?.[1]?.replace(/[^a-zA-Z0-9]/g, '') || 'White';
    const black = blackMatch?.[1]?.replace(/[^a-zA-Z0-9]/g, '') || 'Black';
    a.download = `${white}_vs_${black}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('PGN downloaded!');
  };

  // ========== COPY to clipboard ==========
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pgnText);
      setCopied(true);
      toast.success('PGN copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // ========== SHARE ==========
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chess Game PGN',
          text: pgnText,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy(); // fallback to copy
        }
      }
    } else {
      handleCopy(); // fallback to copy on desktop
    }
  };

  const handleDiscard = () => {
    clearResult();
    localStorage.removeItem('lastScannedFEN');
    navigate('/scan');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/scan')}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Scan Result</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Edit the PGN below, then Save / Download / Share
              </p>
            </div>
          </div>

          {/* Saved indicator */}
          {savedGameId && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Saved (ID: {savedGameId})
            </div>
          )}
        </div>

        {/* PGN Editor - Full width textarea */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">📝 Edit PGN</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Fix any moves the AI misread before saving
            </span>
          </div>
          <textarea
            value={pgnText}
            onChange={(e) => { setPgnText(e.target.value); setSavedGameId(null); }}
            rows={16}
            spellCheck={false}
            className="w-full font-mono text-sm p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y leading-relaxed"
            placeholder="Paste or edit your PGN here..."
          />
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <Edit3 className="w-3 h-3" />
            Editing PGN will reset save status. Remember to save again after making changes.
          </p>
        </div>

        {/* Action Buttons - Grid layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* SAVE to Database */}
          <button
            onClick={handleSave}
            disabled={isSaving || !pgnText.trim()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? 'Saving...' : savedGameId ? 'Saved ✓' : 'Save to DB'}
          </button>

          {/* DOWNLOAD .pgn file */}
          <button
            onClick={handleDownload}
            disabled={!pgnText.trim()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            <Download className="w-5 h-5" />
            Download
          </button>

          {/* COPY / SHARE */}
          <button
            onClick={handleShare}
            disabled={!pgnText.trim()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Share'}
          </button>

          {/* COPY to clipboard */}
          <button
            onClick={handleCopy}
            disabled={!pgnText.trim()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy PGN'}
          </button>
        </div>

        {/* Analyze Button - Full width */}
        <div className="card p-4 mb-4">
          <button
            onClick={handleAnalyze}
            disabled={isSaving || isAnalyzing || !pgnText.trim()}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 text-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Game...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {savedGameId ? 'Analyze Game' : 'Save & Analyze Game'}
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            Saves to database (if not saved) then runs AI analysis → accuracy, blunders, best moves
          </p>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => { setPgnText(scannedPgn || ''); setSavedGameId(null); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Original
          </button>
          <button
            onClick={handleDiscard}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Discard & Rescan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
