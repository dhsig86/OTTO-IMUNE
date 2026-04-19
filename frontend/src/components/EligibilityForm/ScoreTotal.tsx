export default function ScoreTotal({ totalScore }: { totalScore: number }) {
  const isEligible = totalScore >= 14;
  const colorClass =
    totalScore === 0
      ? "text-otto-muted"
      : isEligible
        ? "text-otto-success"
        : "text-otto-warn";

  return (
    <div className="flex flex-col items-center mt-8 mb-2">
      <label className="flex items-center gap-1.5 font-semibold text-[0.95rem] text-otto-text mb-1.5 justify-center">
        Pontuação Total
      </label>
      <input
        type="number"
        className={`w-[120px] text-center font-bold text-[1.6rem] bg-otto-bg border-2 border-otto-border rounded-lg px-3 py-2 outline-none cursor-default transition-colors ${colorClass}`}
        value={totalScore}
        readOnly
      />
    </div>
  );
}
