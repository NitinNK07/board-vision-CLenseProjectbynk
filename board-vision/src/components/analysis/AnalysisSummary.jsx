/**
 * AnalysisSummary — chess.com-style accuracy panel
 * Shows accuracy %, move classification breakdown, opening name
 */
const AnalysisSummary = ({ analysis }) => {
  if (!analysis) return null;

  const AccuracyCircle = ({ value, label, color }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radius} fill="none"
              stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="6" />
            <circle cx="40" cy="40" r={radius} fill="none"
              stroke={color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{value?.toFixed(1)}%</span>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</span>
      </div>
    );
  };

  const ClassificationRow = ({ icon, label, countW, countB, color }) => (
    <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium" style={{ color }}>{label}</span>
      </div>
      <div className="flex items-center gap-6 text-sm font-mono">
        <span className="w-6 text-center font-bold">{countW || 0}</span>
        <span className="w-6 text-center font-bold">{countB || 0}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Opening */}
      {analysis.openingName && (
        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-0.5">Opening</p>
          <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
            {analysis.openingEco && <span className="text-indigo-500 mr-1.5">[{analysis.openingEco}]</span>}
            {analysis.openingName}
          </p>
        </div>
      )}

      {/* Accuracy Circles */}
      <div className="flex justify-center gap-10">
        <AccuracyCircle value={analysis.accuracyWhite || 0} label="White" color="#16a34a" />
        <AccuracyCircle value={analysis.accuracyBlack || 0} label="Black" color="#dc2626" />
      </div>

      {/* Move Classification Breakdown */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Move Quality</span>
          <div className="flex items-center gap-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span className="w-6 text-center">♔</span>
            <span className="w-6 text-center">♚</span>
          </div>
        </div>

        <ClassificationRow icon="💎" label="Brilliant" countW={analysis.brilliantWhite} countB={analysis.brilliantBlack} color="#06b6d4" />
        <ClassificationRow icon="✨" label="Great" countW={analysis.greatWhite} countB={analysis.greatBlack} color="#22c55e" />
        <ClassificationRow icon="✅" label="Best" countW={analysis.bestMovesWhite} countB={analysis.bestMovesBlack} color="#16a34a" />
        <ClassificationRow icon="⚠️" label="Inaccuracy" countW={analysis.inaccuraciesWhite} countB={analysis.inaccuraciesBlack} color="#eab308" />
        <ClassificationRow icon="❓" label="Mistake" countW={analysis.mistakesWhite} countB={analysis.mistakesBlack} color="#f97316" />
        <ClassificationRow icon="❌" label="Blunder" countW={analysis.blundersWhite} countB={analysis.blundersBlack} color="#ef4444" />
      </div>
    </div>
  );
};

export default AnalysisSummary;
