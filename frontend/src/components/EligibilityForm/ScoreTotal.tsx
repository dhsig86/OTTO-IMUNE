export default function ScoreTotal({ totalScore }: { totalScore: number }) {
  const isEligible = totalScore >= 14;
  const color =
    totalScore === 0
      ? "var(--otto-muted)"
      : isEligible
        ? "var(--otto-success)"
        : "var(--otto-warn)";

  return (
    <div className="otto-field" style={{ alignItems: "center", marginTop: "32px", marginBottom: "8px" }}>
      <label className="otto-label" style={{ justifyContent: "center" }}>
        Pontuação Total
      </label>
      <input
        type="number"
        style={{
          width: "120px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.6rem",
          color,
          backgroundColor: "var(--otto-bg)",
          border: "2px solid var(--otto-border)",
          borderRadius: "8px",
          padding: "8px 12px",
          outline: "none",
          cursor: "default",
          transition: "color 0.3s"
        }}
        value={totalScore}
        readOnly
      />
    </div>
  );
}
