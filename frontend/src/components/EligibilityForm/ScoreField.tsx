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
    <div className="flex flex-col mb-5">
      <label className="flex items-center gap-1.5 font-semibold text-[0.95rem] text-otto-text mb-1.5">
        {isSnot ? (
          <a href="https://dhsig86.github.io/Snot22score/" target="_blank" rel="noopener noreferrer" title="Abrir SNOT-22 PT-BR" className="text-otto-primary font-semibold hover:underline">
            {label}
          </a>
        ) : (
          label
        )}
        {onInfoClick && (
          <span
            className="cursor-pointer text-base leading-none opacity-70 hover:opacity-100 transition-opacity no-print"
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
        className="w-full px-3 py-2.5 border border-otto-border rounded-lg bg-otto-bg text-otto-text text-[0.95rem] focus:outline-none focus:border-otto-primary transition-colors"
        value={currentValue}
        onChange={(e) => onChange(fieldKey, parseInt(e.target.value))}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
