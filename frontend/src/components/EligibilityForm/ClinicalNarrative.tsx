"use client";

import { useState } from "react";

export default function ClinicalNarrative({ narrative }: { narrative: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 border border-otto-border rounded-md overflow-hidden">
      <button
        type="button"
        className="w-full py-3 px-4 bg-otto-bg border-none text-left cursor-pointer font-semibold text-[0.9rem] text-otto-muted flex justify-between items-center transition-colors hover:bg-otto-border"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>Leitura clínica</span>
        <span className="text-[0.75rem]">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="py-3.5 px-4 bg-otto-surface text-otto-text text-[0.92rem] leading-[1.6] border-t border-otto-border">
          {narrative}
        </div>
      )}
    </div>
  );
}
