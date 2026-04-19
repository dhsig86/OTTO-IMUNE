import type { ReactNode } from "react";

export default function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-8 print-section">
      <h2 className="text-otto-primary-dk font-semibold text-lg mb-4 pb-2 border-b border-otto-border">{title}</h2>
      {children}
    </div>
  );
}
