type ActionBarProps = {
  onCalculate: () => void;
  isPending: boolean;
  onPrint: () => void;
  onReset: () => void;
  onHelp: () => void;
  onHistory: () => void;
};

export default function ActionBar({ onCalculate, isPending, onPrint, onReset, onHelp, onHistory }: ActionBarProps) {
  return (
    <div className="otto-action-bar">
      <button type="button" className="otto-btn otto-btn-primary" onClick={onCalculate}>
        Calcular
      </button>
      <button type="submit" className="otto-btn otto-btn-primary" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar"}
      </button>
      <button type="button" className="otto-btn otto-btn-secondary" onClick={onHistory}>
        Histórico
      </button>
      <button type="button" className="otto-btn otto-btn-warning" onClick={onPrint}>
        Imprimir
      </button>
      <button type="button" className="otto-btn otto-btn-danger" onClick={onReset}>
        Resetar
      </button>
      <button type="button" className="otto-btn otto-btn-secondary" onClick={onHelp}>
        Ajuda
      </button>
    </div>
  );
}
