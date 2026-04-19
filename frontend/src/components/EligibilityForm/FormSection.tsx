import type { ReactNode } from "react";

export default function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="otto-section">
      <h2 className="otto-section-title">{title}</h2>
      {children}
    </div>
  );
}
