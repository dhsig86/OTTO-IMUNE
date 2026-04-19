"use client";

import { useState } from "react";
import Link from "next/link";
import { usePatient } from "@/contexts/PatientContext";

const SNOT_QUESTIONS = [
  "Necessidade de assoar o nariz",
  "Espirros",
  "Coriza ou secreção escorrendo",
  "Tosse",
  "Secreção que escorre pela garganta",
  "Secreção nasal espessa",
  "Dor/Sensação de peso ouvido",
  "Ouvido entupido",
  "Diminuição do olfato ou paladar",
  "Tontura",
  "Dor no rosto/sensação de peso",
  "Dor de cabeça",
  "Dificuldade em adormecer",
  "Acordar no meio da noite",
  "Falta de um sono descansado",
  "Acordar cansado",
  "Fadiga durante o dia",
  "Redução na produtividade",
  "Diminuição da concentração",
  "Frustração/Inquietação/Irritabilidade",
  "Tristeza",
  "Constrangimento"
];

export default function Snot22Calc() {
  const { setPatientData } = usePatient();
  const [scores, setScores] = useState<number[]>(Array(22).fill(0));

  const totalScore = scores.reduce((a, b) => a + b, 0);

  function getScoreColor(total: number) {
    if (total <= 20) return "bg-green-100 text-green-800 border-green-300";
    if (total <= 40) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (total <= 60) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-red-100 text-red-800 border-red-300";
  }

  function handleSave() {
    setPatientData({ snot22Score: totalScore });
    alert(`Escore de ${totalScore} salvo na sessão ativa para o Relatório!`);
  }

  function reset() {
    setScores(Array(22).fill(0));
  }

  return (
    <div className="max-w-[700px] mx-auto my-8 p-5 md:p-8 bg-otto-surface rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-6 border-b border-otto-border pb-4">
        <h1 className="text-otto-primary-dk font-bold text-2xl m-0">Questionário SNOT-22</h1>
        <Link href="/hub" className="text-otto-primary font-semibold hover:underline">
          &larr; Voltar ao Hub
        </Link>
      </div>

      <p className="text-otto-muted text-[0.95rem] mb-6">
        Considerando os últimos 14 dias, quão ruim foi o problema? <br />
        <span className="text-xs">0 = Sem problema | 1 = Muito leve | 2 = Leve/Moderado | 3 = Moderado | 4 = Severo | 5 = O pior possível</span>
      </p>

      <div className="space-y-4">
        {SNOT_QUESTIONS.map((question, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-otto-bg rounded-lg border border-otto-border gap-4">
            <span className="font-medium text-otto-text flex-1">
              {index + 1}. {question}
            </span>
            <div className="flex bg-otto-surface rounded border border-otto-border overflow-hidden self-start sm:self-auto shrink-0">
              {[0, 1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`w-10 h-10 flex items-center justify-center font-semibold text-[0.95rem] border-none cursor-pointer transition-colors
                    ${scores[index] === val ? 'bg-otto-primary text-white' : 'bg-transparent text-otto-text hover:bg-otto-border'}
                    ${val !== 5 ? 'border-r border-otto-border' : ''}
                  `}
                  onClick={() => {
                    const newScores = [...scores];
                    newScores[index] = val;
                    setScores(newScores);
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center border-t border-otto-border pt-8">
        <h2 className="text-otto-muted font-semibold m-0 mb-3">Escore Total SNOT-22</h2>
        <div className={`text-4xl font-black px-6 py-3 rounded-xl border-2 ${getScoreColor(totalScore)} transition-colors`}>
          {totalScore} <span className="text-lg font-normal opacity-70">/ 110</span>
        </div>
        
        <div className="flex gap-4 mt-8">
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
