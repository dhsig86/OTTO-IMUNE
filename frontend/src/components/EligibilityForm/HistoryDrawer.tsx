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
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideInRight 0.22s ease-out forwards;
        }
      `}</style>
      <div className="fixed inset-0 bg-black/40 z-[100] flex justify-end no-print" onClick={onClose}>
        <div className="w-[min(400px,_92vw)] h-full bg-otto-surface flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.15)] animate-slide-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 pb-4 border-b border-otto-border shrink-0">
            <h2 className="text-otto-primary-dk font-semibold text-lg m-0">Histórico do Paciente</h2>
            <button type="button" className="bg-transparent border-none text-[1.5rem] leading-none text-otto-muted cursor-pointer px-2 py-1 rounded transition-colors hover:text-otto-text hover:bg-otto-bg" onClick={onClose}>&times;</button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {!internalPatientId ? (
              <p className="text-otto-muted">Nenhum paciente interno selecionado ou salvo.</p>
            ) : loading ? (
              <p className="text-otto-muted">Carregando histórico...</p>
            ) : error ? (
              <p className="text-otto-warn">{error}</p>
            ) : items.length === 0 ? (
              <p className="text-otto-muted">Nenhuma avaliação registrada ainda.</p>
            ) : (
              <ul className="list-none p-0 m-0">
                {items.map(item => (
                  <li key={item.id} className="p-3 border border-otto-border bg-otto-surface mb-2 rounded-md">
                    <div className="flex justify-between mb-1">
                      <strong className={item.result?.eligible ? "text-otto-success" : "text-otto-warn"}>
                        {item.result?.label || "Avaliação"}
                      </strong>
                      <span className="font-bold text-[1.2rem] text-otto-text">{item.totalScore}</span>
                    </div>
                    {item.createdAt && (
                       <small className="text-otto-muted">
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
    </>
  );
}
