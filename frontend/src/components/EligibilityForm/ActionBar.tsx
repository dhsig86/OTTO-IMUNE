type ActionBarProps = {
  onCalculate: () => void;
  isPending: boolean;
  onPrint: () => void;
  onReset: () => void;
  onHelp: () => void;
  onHistory: () => void;
};

const btnBase = "font-semibold px-5 py-2.5 rounded-lg transition-colors min-w-[100px] text-center disabled:opacity-55 disabled:cursor-not-allowed";
const btnPrimary = `${btnBase} bg-otto-primary text-white hover:bg-otto-primary-dk`;
const btnSecondary = `${btnBase} bg-otto-bg text-otto-primary-dk border border-otto-border hover:bg-otto-border`;
const btnWarning = `${btnBase} bg-amber-500 text-white hover:bg-amber-600`;
const btnDanger = `${btnBase} bg-red-600 text-white hover:bg-red-700`;

export default function ActionBar({ onCalculate, isPending, onPrint, onReset, onHelp, onHistory }: ActionBarProps) {
  return (
    <div className="flex flex-wrap gap-2.5 justify-center mt-7 mb-4 no-print">
      <button type="button" className={btnPrimary} onClick={onCalculate}>
        Calcular
      </button>
      <button type="submit" className={btnPrimary} disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar"}
      </button>
      <button type="button" className={btnSecondary} onClick={onHistory}>
        Histórico
      </button>
      <button type="button" className={btnWarning} onClick={onPrint}>
        Imprimir
      </button>
      <button type="button" className={btnDanger} onClick={onReset}>
        Resetar
      </button>
      <button type="button" className={btnSecondary} onClick={onHelp}>
        Ajuda
      </button>
    </div>
  );
}
