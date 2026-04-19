import type { EligibilityDecision } from "@/lib/eligibility";

type ResultBadgeProps = {
  decision: EligibilityDecision | null;
  totalScore: number;
  submission: { persisted: boolean; message: string; recordId: string | null } | null;
  errorMessage: string | null;
};

export default function ResultBadge({ decision, totalScore, submission, errorMessage }: ResultBadgeProps) {
  return (
    <>
      {decision && (
        <div className={`otto-result ${decision.eligible ? "success" : "error"}`}>
          <span style={{ fontSize: "2rem", fontWeight: 800, display: "block", marginBottom: "4px" }}>
            {totalScore} pontos
          </span>
          {decision.message}
        </div>
      )}

      {submission && (
        <div
          className="otto-result"
          style={{
            marginTop: "12px",
            fontSize: "0.95rem",
            backgroundColor: "var(--otto-bg)",
            color: "var(--otto-text)",
            border: "1px solid var(--otto-border)"
          }}
        >
          <strong>{submission.message}</strong>
          {submission.recordId && (
            <p style={{ fontSize: "0.8rem", color: "var(--otto-muted)", margin: "4px 0 0" }}>
              ID: {submission.recordId}
            </p>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="otto-result error" style={{ fontSize: "0.95rem", marginTop: "12px" }}>
          {errorMessage}
        </div>
      )}
    </>
  );
}
