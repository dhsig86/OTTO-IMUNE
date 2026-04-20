"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePatient } from "@/contexts/PatientContext";

export default function ReportGenerator() {
  const { patient } = usePatient();
  
  const [formData, setFormData] = useState({
    nome: "",
    idade: "",
    sexo: "M",
    cid: "",
    eosinofilia: "",
    lundMackay: "",
    snot22: "",
    tomografia: "",
    comorbidades: "",
    prescricao: "NUCALA 100mg VIA SC a cada 28 dias."
  });

  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Pre-fill with session data if available
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      nome: prev.nome || patient.name || "",
      idade: prev.idade || patient.age || "",
      cid: prev.cid || patient.cid10 || "",
      lundMackay: prev.lundMackay || (patient.lundMackayScore !== null ? String(patient.lundMackayScore) : ""),
      snot22: prev.snot22 || (patient.snot22Score !== null ? String(patient.snot22Score) : "")
    }));
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = () => {
    const { nome, idade, sexo, cid, eosinofilia, lundMackay, snot22, tomografia, comorbidades, prescricao } = formData;
    
    const sexoStr = sexo === "F" ? "feminino" : "masculino";
    const diagStr = cid ? `com diagnóstico base de ${cid}` : "com RSCcPN";
    const eosStr = eosinofilia ? `A contagem de eosinófilos periféricos foi de ${eosinofilia} células/µL.` : "";
    
    const lmNum = parseInt(lundMackay);
    const lmStr = lundMackay ? `A pontuação no escore tomográfico de Lund-Mackay foi de ${lundMackay}, indicando ${lmNum >= 18 ? 'opacificação severa' : 'opacificação moderada'}.` : "";
    
    const snotStr = snot22 ? `O índice SNOT-22 (refletindo impacto na qualidade de vida) foi de ${snot22}.` : "";
    const tomoStr = tomografia ? `Os achados tomográficos recentes revelaram: ${tomografia}.` : "";
    const comorbStr = comorbidades ? `Comorbidades associadas relevantes incluem: ${comorbidades}.` : "";

    const parts = [
      `RELATÓRIO MÉDICO`,
      `Paciente ${nome ? nome : "[Nome]"}, de ${idade ? idade : "[Idade]"} anos, sexo ${sexoStr}, ${diagStr}.`,
      `${tomoStr} ${lmStr}`,
      `${eosStr} ${snotStr}`,
      `${comorbStr}`,
      ``,
      `Diante da falha da terapia otimizada prévia e do quadro clínico apresentado, há indicação formal para início de terapia com imunobiológico.`,
      ``,
      `Prescrição sugerida:`,
      `${prescricao}`
    ].filter(p => p !== " ").join("\n");

    setGeneratedReport(parts);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-[800px] mx-auto my-8 p-5 md:p-8 bg-otto-surface rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] print:shadow-none print:m-0 print:max-w-full print:p-0">
      
      <div className="flex items-center justify-between mb-6 border-b border-otto-border pb-4 no-print">
        <h1 className="text-otto-primary-dk font-bold text-2xl m-0">Gerador de Relatório Médico</h1>
        <Link href="/" className="text-otto-primary font-semibold hover:underline">
          &larr; Voltar ao Hub
        </Link>
      </div>

      <div className="no-print">
        <p className="text-otto-muted text-[0.95rem] mb-6">
          Preencha os dados abaixo. Itens com valores salvos na sessão (como cálculos anteriores) já foram inseridos como sugestão.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-otto-text">Nome do Paciente</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="px-3 py-2 border border-otto-border rounded-lg bg-otto-bg focus:outline-none focus:border-otto-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-otto-text">Idade</label>
            <input type="text" name="idade" value={formData.idade} onChange={handleChange} className="px-3 py-2 border border-otto-border rounded-lg bg-otto-bg focus:outline-none focus:border-otto-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-otto-text">Sexo</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange} className="px-3 py-2 border border-otto-border rounded-lg bg-otto-bg focus:outline-none focus:border-otto-primary appearance-none">
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-otto-text">Diagnóstico (CID)</label>
            <input type="text" name="cid" value={formData.cid} onChange={handleChange} placeholder="Ex: J32.4" className="px-3 py-2 border border-otto-border rounded-lg bg-otto-bg focus:outline-none focus:border-otto-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-otto-text">Eosinofilia (células/µL)</label>
            <input type="number" name="eosinofilia" value={formData.eosinofilia} onChange={handleChange} className="px-3 py-2 border border-otto-border rounded-lg bg-otto-bg focus:outline-none focus:border-otto-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-otto-text">Pontuação Lund-Mackay</label>
            <input type="number" name="lundMackay" value={formData.lundMackay} onChange={handleChange} className="px-3 py-2 border border-otto-border rounded-lg bg-otto-bg focus:outline-none focus:border-otto-primary" />
            {patient.lundMackayScore !== null && <span className="text-[0.8rem] text-amber-600 font-medium">⚠ Sugerido pela sessão — confirme antes de gerar</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-otto-text">Pontuação SNOT-22</label>
            <input type="number" name="snot22" value={formData.snot22} onChange={handleChange} className="px-3 py-2 border border-otto-border rounded-lg bg-otto-bg focus:outline-none focus:border-otto-primary" />
            {patient.snot22Score !== null && <span className="text-[0.8rem] text-amber-600 font-medium">⚠ Sugerido pela sessão — confirme antes de gerar</span>}
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-otto-text">Descrição da Tomografia</label>
            <textarea name="tomografia" value={formData.tomografia} onChange={handleChange} rows={2} className="px-3 py-2 border border-otto-border rounded-lg bg-otto-bg focus:outline-none focus:border-otto-primary resize-y"></textarea>
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-otto-text">Comorbidades (Ex: Asma)</label>
            <textarea name="comorbidades" value={formData.comorbidades} onChange={handleChange} rows={2} className="px-3 py-2 border border-otto-border rounded-lg bg-otto-bg focus:outline-none focus:border-otto-primary resize-y"></textarea>
          </div>
          <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-otto-text">Prescrição</label>
            <input type="text" name="prescricao" value={formData.prescricao} onChange={handleChange} className="px-3 py-2 border border-otto-border rounded-lg bg-otto-bg focus:outline-none focus:border-otto-primary" />
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <button 
            type="button" 
            onClick={handleGenerate}
            className="bg-otto-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-otto-primary-dk transition-colors shadow-md text-lg"
          >
            Gerar Relatório
          </button>
        </div>
      </div>

      {generatedReport && (
        <div className="border border-otto-border rounded-lg p-6 bg-white relative print:border-none print:p-0">
          <div className="absolute top-4 right-4 no-print flex gap-2">
            <button 
              type="button" 
              onClick={() => {
                navigator.clipboard.writeText(generatedReport);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="bg-otto-bg text-otto-primary border border-otto-border font-semibold px-3 py-1.5 rounded hover:bg-otto-border transition-colors text-sm"
            >
              {copied ? "✓ Copiado!" : "Copiar"}
            </button>
            <button 
              type="button" 
              onClick={handlePrint}
              className="bg-amber-500 text-white font-semibold px-3 py-1.5 rounded hover:bg-amber-600 transition-colors text-sm"
            >
              Imprimir
            </button>
          </div>

          <pre className="whitespace-pre-wrap font-sans text-[1.05rem] text-otto-text leading-relaxed mt-8 print:mt-0">
            {generatedReport}
          </pre>
          
          <div className="mt-16 pt-8 border-t border-otto-border flex flex-col items-center">
             <div className="w-64 border-b border-otto-text mb-2"></div>
             <p className="text-sm text-otto-muted m-0">Assinatura do Médico Orientador</p>
          </div>
        </div>
      )}

    </div>
  );
}
