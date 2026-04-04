import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

/**
 * Evaluation Graph — line chart showing game evaluation over time
 * moveEvaluations: array of { moveNumber, move, score, classification, isWhite }
 * onMoveClick: (moveIndex) => void — jump to a specific move
 * currentMove: number — currently active move index
 */
const EvalGraph = ({ moveEvaluations = [], onMoveClick, currentMove = 0 }) => {
  const data = useMemo(() => {
    if (!moveEvaluations?.length) return [];
    return moveEvaluations.map((ev, i) => ({
      index: i,
      name: `${ev.isWhite ? '' : '...'}${ev.move}`,
      label: `${ev.moveNumber}${ev.isWhite ? '.' : '...'} ${ev.move}`,
      score: Math.max(-5, Math.min(5, ev.score || 0)),
      rawScore: ev.score || 0,
      classification: ev.classification,
      move: ev.move,
    }));
  }, [moveEvaluations]);

  if (!data.length) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const cls = d.classification;
    const color =
      cls === 'BLUNDER' ? '#ef4444' :
      cls === 'MISTAKE' ? '#f97316' :
      cls === 'INACCURACY' ? '#eab308' :
      cls === 'BRILLIANT' ? '#06b6d4' :
      cls === 'GREAT' ? '#22c55e' : '#94a3b8';

    return (
      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700">
        <p className="font-bold mb-1">{d.label}</p>
        <p>Eval: <span className="font-mono">{d.rawScore > 0 ? '+' : ''}{d.rawScore.toFixed(2)}</span></p>
        <p style={{ color }}>
          {cls === 'BRILLIANT' && '💎 '}{cls === 'GREAT' && '✨ '}{cls === 'BLUNDER' && '?? '}
          {cls === 'MISTAKE' && '? '}{cls === 'INACCURACY' && '?! '}
          {cls}
        </p>
      </div>
    );
  };

  const gradientOffset = () => {
    const max = Math.max(...data.map(d => d.score));
    const min = Math.min(...data.map(d => d.score));
    if (max <= 0) return 0;
    if (min >= 0) return 1;
    return max / (max - min);
  };
  const off = gradientOffset();

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
        Evaluation Graph
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
          onClick={(e) => {
            if (e?.activeTooltipIndex != null && onMoveClick) {
              onMoveClick(e.activeTooltipIndex + 1);
            }
          }}
          style={{ cursor: onMoveClick ? 'pointer' : 'default' }}
        >
          <defs>
            <linearGradient id="evalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="#ffffff" stopOpacity={0.9} />
              <stop offset={off} stopColor="#ffffff" stopOpacity={0.15} />
              <stop offset={off} stopColor="#262626" stopOpacity={0.15} />
              <stop offset={1} stopColor="#262626" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <XAxis dataKey="index" hide />
          <YAxis domain={[-5, 5]} hide />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          {currentMove > 0 && (
            <ReferenceLine
              x={currentMove - 1}
              stroke="#6366f1"
              strokeWidth={2}
            />
          )}
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#evalGradient)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvalGraph;
