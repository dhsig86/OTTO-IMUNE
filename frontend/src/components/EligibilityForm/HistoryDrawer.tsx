"use client";

import { useEffect, useState } from "react";
import { type User } from "firebase/auth";

type HistoryItem = {
  id: string;
  createdAt?: string;
  totalScore?: number;
  result?: {
    label?: string;
    eligible?: boolean;
  };
};

type HistoryDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  internalPatientId: string | null;
  user: User | null;
  submissionId: string | null;
};

export default function HistoryDrawer({ isOpen, onClose, internalPatientId, user, submissionId }: HistoryDrawerProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !internalPatientId) return;

    const controller = new AbortController();
    setLoading(true);

    const fetchHistory = async () => {
      try {
        const token = user ? await user.getIdToken() : undefined;
        const res = await fetch(`/api/patients/${internalPatientId}/calculations`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Erro ao carregar histórico.");

        setItems(payload.items ?? []);
        setError(null);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    return () => controller.abort();
  }, [isOpen, internalPatientId, user, submissionId]);

  if (!isOpen) return null;

  return (
    <div className="otto-drawer-backdrop" onClick={onClose}>
      <div className="otto-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="otto-drawer-header">
          <h2 className="otto-section-title" style={{ margin: 0 }}>Histórico do Paciente</h2>
          <button type="button" className="otto-modal-close" onClick={onClose} style={{ position: "static" }}>&times;</button>
        </div>
        
        <div className="otto-drawer-content">
          {!internalPatientId ? (
            <p style={{ color: "var(--otto-muted)" }}>Nenhum paciente interno selecionado ou salvo.</p>
          ) : loading ? (
            <p style={{ color: "var(--otto-muted)" }}>Carregando histórico...</p>
          ) : error ? (
            <p style={{ color: "var(--otto-warn)" }}>{error}</p>
          ) : items.length === 0 ? (
            <p style={{ color: "var(--otto-muted)" }}>Nenhuma avaliação registrada ainda.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {items.map(item => (
                <li key={item.id} style={{ padding: "12px", border: "1px solid var(--otto-border)", backgroundColor: "var(--otto-surface)", marginBottom: "8px", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <strong style={{ color: item.result?.eligible ? "var(--otto-success)" : "var(--otto-warn)" }}>
                      {item.result?.label || "Avaliação"}
                    </strong>
                    <span style={{ fontWeight: "bold", fontSize: "1.2rem", color: "var(--otto-text)" }}>{item.totalScore}</span>
                  </div>
                  {item.createdAt && (
                     <small style={{ color: "var(--otto-muted)" }}>
                       {new Date(item.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                     </small>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
