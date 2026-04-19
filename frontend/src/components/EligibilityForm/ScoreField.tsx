
import type { ScoreKey } from "@/lib/eligibility";

type ScoreOption = { value: number; label: string };

type ScoreFieldProps = {
  fieldKey: ScoreKey;
  label: string;
  options: ScoreOption[];
  currentValue: number;
  onChange: (key: ScoreKey, value: number) => void;
  isSnot?: boolean;
  onInfoClick?: () => void;
};

export default function ScoreField({
  fieldKey,
  label,
  options,
  currentValue,
  onChange,
  isSnot,
  onInfoClick
}: ScoreFieldProps) {
  return (
    <div className="otto-field">
      <label className="otto-label">
        {isSnot ? (
          <a href="https://dhsig86.github.io/Snot22score/" target="_blank" rel="noopener noreferrer" title="Abrir SNOT-22 PT-BR">
            {label}
          </a>
        ) : (
          label
        )}
        {onInfoClick && (
          <span
            className="otto-info-icon"
            onClick={onInfoClick}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onInfoClick()}
            role="button"
            tabIndex={0}
            aria-label={`Ver referência: ${label}`}
          >
            ℹ️
          </span>
        )}
      </label>
      <select
        className="otto-select"
        value={currentValue}
        onChange={(event) => onChange(fieldKey, Number(event.target.value))}
      >
        {options.map((option) => (
          <option key={`${fieldKey}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
