import { useMemo } from 'react';

/**
 * Evaluation Bar — vertical bar showing white/black advantage (like chess.com)
 * score: evaluation in pawns (positive = white advantage)
 */
const EvalBar = ({ score = 0, height = 400 }) => {
  const { whitePercent, label, isMate } = useMemo(() => {
    if (score >= 100) return { whitePercent: 100, label: `M${Math.max(1, Math.round(200 - score))}`, isMate: true };
    if (score <= -100) return { whitePercent: 0, label: `M${Math.max(1, Math.round(200 + score))}`, isMate: true };

    // Sigmoid-like mapping: score in pawns → 0-100%
    // At 0 → 50%, at +3 → ~88%, at -3 → ~12%
    const pct = 50 + 50 * (2 / (1 + Math.exp(-0.7 * score)) - 1);
    const clamped = Math.min(98, Math.max(2, pct));
    const lbl = score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
    return { whitePercent: clamped, label: lbl, isMate: false };
  }, [score]);

  const isWhiteAdvantage = score >= 0;

  return (
    <div
      className="relative rounded-md overflow-hidden flex-shrink-0"
      style={{ width: 32, height }}
    >
      {/* Black zone (top) */}
      <div
        className="absolute top-0 left-0 w-full transition-all duration-500 ease-out"
        style={{
          height: `${100 - whitePercent}%`,
          background: 'linear-gradient(180deg, #262626 0%, #404040 100%)',
        }}
      />
      {/* White zone (bottom) */}
      <div
        className="absolute bottom-0 left-0 w-full transition-all duration-500 ease-out"
        style={{
          height: `${whitePercent}%`,
          background: 'linear-gradient(180deg, #f5f5f5 0%, #e0e0e0 100%)',
        }}
      />
      {/* Label */}
      <div
        className="absolute left-0 w-full flex items-center justify-center transition-all duration-500"
        style={{
          top: isWhiteAdvantage ? `${100 - whitePercent}%` : undefined,
          bottom: !isWhiteAdvantage ? `${whitePercent}%` : undefined,
          transform: 'translateY(-50%)',
        }}
      >
        <span
          className={`text-[10px] font-bold px-1 py-0.5 rounded ${
            isWhiteAdvantage
              ? 'text-gray-900 bg-white/90'
              : 'text-white bg-black/80'
          } ${isMate ? 'text-red-600' : ''}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default EvalBar;
