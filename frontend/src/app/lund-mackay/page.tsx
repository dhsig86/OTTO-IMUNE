"use client";

import { useState } from "react";
import Link from "next/link";
import { usePatient } from "@/contexts/PatientContext";

const SINUSES = [
  { id: "frontal", name: "Seio Frontal" },
  { id: "maxilar", name: "Seio Maxilar" },
  { id: "etmoidal-ant", name: "Etmoidais Anteriores" },
  { id: "etmoidal-post", name: "Etmoidais Posteriores" },
  { id: "esfenoidal", name: "Seio Esfenoidal" },
  { id: "ostiomeatal", name: "Complexo Óstio-Meatal" }
];

export default function LundMackayCalc() {
  const { setPatientData } = usePatient();
  const [scores, setScores] = useState<Record<string, { left: number; right: number }>>(() => {
    const initial: Record<string, { left: number; right: number }> = {};
    SINUSES.forEach(s => { initial[s.id] = { left: 0, right: 0 }; });
    return initial;
  });
  const [saved, setSaved] = useState(false);

  const totalScore = SINUSES.reduce((acc, s) => acc + scores[s.id].left + scores[s.id].right, 0);

  function getScoreColor(total: number) {
    if (total <= 4) return "bg-green-100 text-green-800 border-green-300";
    if (total <= 8) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (total <= 16) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-red-100 text-red-800 border-red-300";
  }

  function handleSave() {
    setPatientData({ lundMackayScore: totalScore });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function reset() {
    const initial: Record<string, { left: number; right: number }> = {};
    SINUSES.forEach(s => { initial[s.id] = { left: 0, right: 0 }; });
    setScores(initial);
  }

  return (
    <div className="max-w-[700px] mx-auto my-8 p-5 md:p-8 bg-otto-surface rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-6 border-b border-otto-border pb-4">
        <h1 className="text-otto-primary-dk font-bold text-2xl m-0">Lund-Mackay</h1>
        <Link href="/hub" className="text-otto-primary font-semibold hover:underline">
          &larr; Voltar ao Hub
        </Link>
      </div>

      <p className="text-otto-muted text-[0.95rem] mb-6">
        0 = Sem opacificação | 1 = Opacificação parcial | 2 = Opacificação total
      </p>

      <div className="space-y-6">
        {SINUSES.map((sinus) => (
          <div key={sinus.id} className="p-4 bg-otto-bg rounded-lg border border-otto-border">
            <h3 className="font-semibold text-otto-primary-dk mb-4 mt-0">{sinus.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-[0.9rem] font-semibold text-otto-text">Esquerdo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0" max="2" step="1"
                    className="flex-1 accent-otto-primary cursor-pointer"
                    value={scores[sinus.id].left}
                    onChange={(e) => setScores(s => ({ ...s, [sinus.id]: { ...s[sinus.id], left: parseInt(e.target.value) } }))}
                  />
                  <span className="font-bold text-lg w-6 text-center">{scores[sinus.id].left}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                   <label className="text-[0.9rem] font-semibold text-otto-text">Direito</label>
                   <button 
                     type="button" 
                     className="text-[0.75rem] text-otto-primary hover:underline bg-transparent border-none cursor-pointer p-0"
                     onClick={() => setScores(s => ({ ...s, [sinus.id]: { ...s[sinus.id], right: s[sinus.id].left } }))}
                   >
                     Copiar Esq.
                   </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0" max="2" step="1"
                    className="flex-1 accent-otto-primary cursor-pointer"
                    value={scores[sinus.id].right}
                    onChange={(e) => setScores(s => ({ ...s, [sinus.id]: { ...s[sinus.id], right: parseInt(e.target.value) } }))}
                  />
                  <span className="font-bold text-lg w-6 text-center">{scores[sinus.id].right}</span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center border-t border-otto-border pt-8">
        <h2 className="text-otto-muted font-semibold m-0 mb-3">Escore Total Lund-Mackay</h2>
        <div className={`text-4xl font-black px-6 py-3 rounded-xl border-2 ${getScoreColor(totalScore)} transition-colors`}>
          {totalScore}
        </div>
        
        {saved && (
          <p className="mt-4 text-otto-success font-semibold text-sm animate-pulse">
            ✓ Escore {totalScore} salvo na sessão — disponível no Relatório
          </p>
        )}
        <div className="flex gap-4 mt-4">
          <button type="button" onClick={handleSave} className="bg-otto-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-otto-primary-dk transition-colors">
            Salvar na Sessão (Relatório)
          </button>
          <button type="button" onClick={reset} className="bg-otto-bg text-otto-primary-dk border border-otto-border font-semibold px-6 py-3 rounded-lg hover:bg-otto-border transition-colors">
            Resetar
          </button>
        </div>
      </div>
    </div>
  );
}
