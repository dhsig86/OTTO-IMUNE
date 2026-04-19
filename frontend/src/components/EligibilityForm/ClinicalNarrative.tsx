"use client";

import { useState } from "react";

export default function ClinicalNarrative({ narrative }: { narrative: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        marginTop: "16px",
        border: "1px solid var(--otto-border)",
        borderRadius: "6px",
        overflow: "hidden"
      }}
    >
      <button
        type="button"
        style={{
          width: "100%",
          padding: "11px 16px",
          background: "var(--otto-bg)",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.9rem",
          color: "var(--otto-muted)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>Leitura clínica</span>
        <span style={{ fontSize: "0.75rem" }}>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: "14px 16px",
            backgroundColor: "var(--otto-surface)",
            color: "var(--otto-text)",
            fontSize: "0.92rem",
            lineHeight: 1.6,
            borderTop: "1px solid var(--otto-border)"
          }}
        >
          {narrative}
        </div>
      )}
    </div>
  );
}
