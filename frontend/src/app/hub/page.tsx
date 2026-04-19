import Link from "next/link";
import { 
  CalculatorIcon, 
  DocumentTextIcon, 
  InformationCircleIcon,
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon
} from "@heroicons/react/24/outline";

export default function HubPage() {
  return (
    <div className="max-w-[800px] mx-auto my-8 p-8 bg-otto-surface rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <div className="text-center mb-10 border-b border-otto-border pb-6">
        <h1 className="text-otto-primary-dk font-bold text-3xl m-0">Portal de Imunobiológicos</h1>
        <h3 className="text-otto-primary font-medium mt-2">para Sinusite Crônica com Polipose</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <Link href="/" className="flex items-start gap-4 p-5 rounded-xl border border-otto-border bg-otto-bg hover:border-otto-primary hover:shadow-md transition-all group">
          <div className="bg-otto-surface p-3 rounded-lg border border-otto-border group-hover:bg-otto-primary group-hover:text-white transition-colors text-otto-primary">
            <ClipboardDocumentListIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-otto-primary-dk mb-1">Elegibilidade Oficial</h2>
            <p className="text-sm text-otto-muted leading-relaxed">Calculadora de critérios para uso de Nucala (Mepolizumabe).</p>
          </div>
        </Link>
        
        <Link href="/report" className="flex items-start gap-4 p-5 rounded-xl border border-otto-border bg-otto-bg hover:border-otto-primary hover:shadow-md transition-all group">
          <div className="bg-otto-surface p-3 rounded-lg border border-otto-border group-hover:bg-otto-primary group-hover:text-white transition-colors text-otto-primary">
            <DocumentTextIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-otto-primary-dk mb-1">Gerador de Relatório</h2>
            <p className="text-sm text-otto-muted leading-relaxed">Gere relatórios médicos formatados e prontos para impressão.</p>
          </div>
        </Link>

        <Link href="/lund-mackay" className="flex items-start gap-4 p-5 rounded-xl border border-otto-border bg-otto-bg hover:border-otto-primary hover:shadow-md transition-all group">
          <div className="bg-otto-surface p-3 rounded-lg border border-otto-border group-hover:bg-otto-primary group-hover:text-white transition-colors text-otto-primary">
            <CalculatorIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-otto-primary-dk mb-1">Lund-Mackay</h2>
            <p className="text-sm text-otto-muted leading-relaxed">Calculadora de opacificação sinusal baseada em tomografia.</p>
          </div>
        </Link>

        <Link href="/snot-22" className="flex items-start gap-4 p-5 rounded-xl border border-otto-border bg-otto-bg hover:border-otto-primary hover:shadow-md transition-all group">
          <div className="bg-otto-surface p-3 rounded-lg border border-otto-border group-hover:bg-otto-primary group-hover:text-white transition-colors text-otto-primary">
            <ClipboardDocumentListIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-otto-primary-dk mb-1">SNOT-22</h2>
            <p className="text-sm text-otto-muted leading-relaxed">Questionário de impacto na qualidade de vida.</p>
          </div>
        </Link>

        <Link href="/info" className="flex items-start gap-4 p-5 rounded-xl border border-otto-border bg-otto-bg hover:border-otto-primary hover:shadow-md transition-all group">
          <div className="bg-otto-surface p-3 rounded-lg border border-otto-border group-hover:bg-otto-primary group-hover:text-white transition-colors text-otto-primary">
            <InformationCircleIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-otto-primary-dk mb-1">Informações Clínicas</h2>
            <p className="text-sm text-otto-muted leading-relaxed">Protocolos e guidelines EPOS2020 para prescrição.</p>
          </div>
        </Link>

        <a href="/lme/LME_Outubro_2022.pdf" download className="flex items-start gap-4 p-5 rounded-xl border border-otto-border bg-otto-bg hover:border-otto-primary hover:shadow-md transition-all group">
          <div className="bg-otto-surface p-3 rounded-lg border border-otto-border group-hover:bg-otto-primary group-hover:text-white transition-colors text-otto-primary">
            <DocumentArrowDownIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-otto-primary-dk mb-1">Formulário LME</h2>
            <p className="text-sm text-otto-muted leading-relaxed">Baixar o Laudo de Medicamentos Excepcionais padrão vigente.</p>
          </div>
        </a>

      </div>
    </div>
  );
}
