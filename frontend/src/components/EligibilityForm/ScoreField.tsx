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
        className="w-full px-3 py-2.5 border border-otto-border rounded-lg bg-otto-bg text-otto-text text-[0.95rem] focus:outline-none focus:border-otto-primary focus:ring-3 focus:ring-otto-primary/15 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%228%22%20viewBox=%220%200%2012%208%22%3E%3Cpath%20fill=%22%2356717a%22%20d=%22M1%201l5%205%205-5%22/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:12px_8px] cursor-pointer transition-all"
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
