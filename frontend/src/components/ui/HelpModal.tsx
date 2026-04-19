"use client";

import { useEffect, useRef } from "react";

export default function HelpModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="otto-modal"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="otto-modal-content" style={{ maxWidth: "500px" }}>
        <button type="button" className="otto-modal-close" onClick={onClose}>
          &times;
        </button>
        <h3 className="otto-section-title" style={{ marginTop: 0 }}>
          Passo a passo
        </h3>
        <ol style={{ lineHeight: "1.8", color: "var(--otto-text)", paddingLeft: "20px", margin: 0 }}>
          <li>Preencha todos os campos do formulário nas 4 seções clínicas.</li>
          <li>
            Clique em <strong>Calcular</strong> para obter a pontuação total e o resultado de
            elegibilidade.
          </li>
          <li>
            Clique em <strong>Enviar</strong> para registrar a avaliação no histórico do paciente
            (requer integração OTTO PWA).
          </li>
          <li>
            Use <strong>Imprimir</strong> para gerar um relatório impresso ou PDF.
          </li>
          <li>
            Use <strong>Resetar</strong> para limpar todos os campos e iniciar nova avaliação.
          </li>
          <li>
            Clique no título <strong>SNOT-22</strong> para acessar a calculadora validada em
            Português Brasileiro.
          </li>
          <li>
            Clique nos ícones <strong>ℹ️</strong> ao lado de EVA, Escore de Pólipo e Lund-Mackay
            para visualizar as escalas e tabelas de referência.
          </li>
          <li>
            Use <strong>Histórico</strong> para consultar avaliações anteriores do mesmo paciente.
          </li>
        </ol>
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--otto-muted)",
            marginTop: "16px",
            borderTop: "1px solid var(--otto-border)",
            paddingTop: "12px"
          }}
        >
          Elegibilidade: pontuação ≥ 14 indica uso de imunobiológico conforme guideline CRSWNP
          2024.
        </p>
      </div>
    </dialog>
  );
}
