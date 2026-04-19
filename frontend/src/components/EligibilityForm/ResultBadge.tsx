import type { EligibilityDecision } from "@/lib/eligibility";

type ResultBadgeProps = {
  decision: EligibilityDecision | null;
  totalScore: number;
  submission: { persisted: boolean; message: string; recordId: string | null } | null;
  errorMessage: string | null;
};

export default function ResultBadge({ decision, totalScore, submission, errorMessage }: ResultBadgeProps) {
  const resultBase = "p-4 rounded-lg text-center font-semibold mt-5";
  const resultSuccess = `${resultBase} bg-green-50 border-2 border-otto-success text-otto-success`;
  const resultError = `${resultBase} bg-red-50 border-2 border-otto-warn text-otto-warn`;
  const resultNeutral = `${resultBase} bg-otto-bg border border-otto-border text-otto-text text-[0.95rem] !mt-3`;

  return (
    <>
      {decision && (
        <div className={decision.eligible ? resultSuccess : resultError}>
          <span className="text-[2rem] font-extrabold block mb-1">
            {totalScore} pontos
          </span>
          {decision.message}
        </div>
      )}

      {submission && (
        <div className={resultNeutral}>
          <strong>{submission.message}</strong>
          {submission.recordId && (
            <p className="text-[0.8rem] text-otto-muted m-0 mt-1">
              ID: {submission.recordId}
            </p>
          )}
        </div>
      )}

      {errorMessage && (
        <div className={`${resultError} text-[0.95rem] !mt-3`}>
          {errorMessage}
        </div>
      )}
    </>
  );
}
