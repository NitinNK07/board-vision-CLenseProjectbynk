import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useScanStore = create(
  persist(
    (set, get) => ({
      allowance: {
        trialRemainingToday: 3,
        adCredits: 0,
        paidCredits: 0,
      },
      pgn: null,
      originalImage: null,
      isScanning: false,
      scanHistory: [],

      setAllowance: (allowance) => set({ allowance }),

      setPgn: (pgn) => set({ pgn }),

      setOriginalImage: (image) => set({ originalImage: image }),

      setIsScanning: (isScanning) => set({ isScanning }),

      addScanHistory: (scan) => set((state) => ({
        scanHistory: [scan, ...state.scanHistory].slice(0, 10),
      })),

      clearResult: () => set({ pgn: null, originalImage: null }),

      getTotalScans: () => {
        const state = get();
        return state.allowance.trialRemainingToday + state.allowance.adCredits + state.allowance.paidCredits;
      },
    }),
    {
      name: 'scan-storage',
      partialize: (state) => ({ scanHistory: state.scanHistory }),
    }
  )
);

export default useScanStore;
export { useScanStore };
