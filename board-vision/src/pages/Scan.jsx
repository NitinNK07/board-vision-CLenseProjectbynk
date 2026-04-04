import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Upload, Play, Loader2, Sparkles } from 'lucide-react';
import { scanAPI } from '@/lib/api';
import { useScanStore } from '@/store/scanStore';

const Scan = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { allowance, setAllowance, setPgn, setOriginalImage } = useScanStore();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(30);
  const [scanMode, setScanMode] = useState('vision'); // 'vision' or 'legacy'

  const { refetch: refetchAllowance } = useQuery({
    queryKey: ['scanAllowance'],
    queryFn: async () => {
      try {
        const response = await scanAPI.getAllowance();
        const allowanceData = response.data;
        // Handle both direct allowance response and /auth/me response format
        const allowance = allowanceData.balance || allowanceData;
        setAllowance({
          trialRemainingToday: allowance.trialRemainingToday || 3,
          adCredits: allowance.adCredits || 0,
          paidCredits: allowance.paidCredits || 0,
        });
        return allowance;
      } catch (error) {
        console.error('Failed to fetch allowance:', error);
        // Default to 3 trial scans if fetch fails
        setAllowance({
          trialRemainingToday: 3,
          adCredits: 0,
          paidCredits: 0,
        });
        return { trialRemainingToday: 3, adCredits: 0, paidCredits: 0 };
      }
    },
    refetchOnMount: true,
  });

  const scanMutation = useMutation({
    mutationFn: async (imageFile) => {
      console.log('🔵 SCAN STARTED');
      console.log('📸 Image file:', imageFile.name, 'Size:', imageFile.size, 'bytes');
      console.log('🎯 Scan mode:', scanMode);
      
      // Use Vision API for better chess position recognition
      if (scanMode === 'vision') {
        console.log('🚀 Calling Vision API endpoint: /api/scan/vision');
        const response = await scanAPI.scanVisionFile(imageFile);
        console.log('📥 Vision API response:', response.data);
        return response.data;
      } else {
        // Legacy OCR (fallback) - use base64
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64 = reader.result.split(',')[1];
              const response = await scanAPI.scan(base64);
              resolve(response.data);
            } catch (err) { reject(err); }
          };
          reader.readAsDataURL(imageFile);
        });
      }
    },
    onSuccess: (data) => {
      console.log('✅ SCAN SUCCESS:', data);
      if (data.pgn) {
        setPgn(data.pgn);
        // Store FEN if available
        if (data.fen) {
          localStorage.setItem('lastScannedFEN', data.fen);
          console.log('💾 Saved FEN to localStorage:', data.fen);
        }
        toast.success(data.message || 'Position scanned successfully!');
        navigate('/result');
      } else {
        console.error('❌ No PGN in response');
        toast.error('No PGN generated from scan');
      }
    },
    onError: (error) => {
      console.error('❌ SCAN ERROR:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);

      let message = 'Failed to scan position. Please try again.';

      if (error?.response?.status === 401) {
        message = 'Please log in to scan positions';
      } else if (error?.response?.status === 403) {
        message = 'No scans remaining. Watch an ad to earn more!';
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }

      toast.error(message);
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = () => {
    if (!image) {
      toast.error('Please select an image first');
      return;
    }
    // Pass the actual file directly to mutation
    scanMutation.mutate(image);
  };

  const watchAdMutation = useMutation({
    mutationFn: async () => {
      const response = await scanAPI.watchAd();
      return response.data;
    },
    onSuccess: (data) => {
      setAllowance({
        trialRemainingToday: data.trialRemainingToday || 0,
        adCredits: data.adCredits || 0,
        paidCredits: data.paidCredits || 0,
      });
      toast.success('Ad watched! You earned 1 scan credit.');
    },
    onError: (error) => {
      toast.error('Failed to grant ad credit. Please try again.');
      console.error('Ad watch error:', error);
    },
  });

  const handleWatchAd = () => {
    setIsWatchingAd(true);
    let seconds = 5; // Reduced to 5 seconds for testing (change to 30 for production)
    const interval = setInterval(() => {
      seconds--;
      setAdCountdown(seconds);
      if (seconds <= 0) {
        clearInterval(interval);
        setIsWatchingAd(false);
        setAdCountdown(30);
        // Call backend to grant ad credit
        watchAdMutation.mutate();
      }
    }, 1000);
  };

  const getTotalScans = () => {
    return allowance.trialRemainingToday + allowance.adCredits + allowance.paidCredits;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Scan Chess Position</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload an image of a chess board and we'll convert it to PGN
          </p>
          {/* AI Vision Mode Toggle */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scanMode === 'vision'}
                onChange={(e) => setScanMode(e.target.checked ? 'vision' : 'legacy')}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Use AI Vision (More Accurate)
              </span>
            </label>
          </div>
          {scanMode === 'vision' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Powered by HuggingFace Qwen2.5-VL • 99% accuracy on chess positions
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Your Allowance</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Trial Remaining:</span>
                <span className="font-semibold">{allowance.trialRemainingToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Ad Credits:</span>
                <span className="font-semibold">{allowance.adCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Paid Credits:</span>
                <span className="font-semibold">{allowance.paidCredits}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Available:</span>
                  <span className="font-bold text-primary-600">{getTotalScans()}</span>
                </div>
              </div>
            </div>

            {allowance.adCredits < 5 && (
              <button
                onClick={handleWatchAd}
                disabled={isWatchingAd}
                className="btn-secondary w-full mt-4"
              >
                {isWatchingAd ? `Watching Ad... (${adCountdown}s)` : 'Watch Ad for Free Scan'}
              </button>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <button
              onClick={handleScan}
              disabled={scanMutation.isPending || !image || getTotalScans() <= 0}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Scan Position
                </>
              )}
            </button>

            {getTotalScans() <= 0 && (
              <p className="text-sm text-red-600 mt-2 text-center">
                No scans remaining. Watch an ad to earn more!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
