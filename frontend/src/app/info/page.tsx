import Link from "next/link";

export default function InfoPage() {
  return (
    <div className="max-w-[800px] mx-auto my-8 p-5 md:p-8 bg-otto-surface rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-8 border-b border-otto-border pb-4">
        <h1 className="text-otto-primary-dk font-bold text-2xl m-0">Informações Clínicas (RSCcPN)</h1>
        <Link href="/" className="text-otto-primary font-semibold hover:underline">
          &larr; Voltar ao Hub
        </Link>
      </div>

      <div className="space-y-6">
        
        <div className="bg-white p-6 rounded-lg border border-otto-border shadow-sm">
          <h2 className="text-xl font-bold text-otto-primary-dk mb-4">Critérios para Acesso ao Mepolizumabe</h2>
          <p className="font-semibold text-otto-text mb-2">Condições de Acesso:</p>
          <ul className="list-disc pl-5 mb-4 space-y-2 text-otto-text">
            <li>Asma não controlada apesar do uso de ICS/LABA.</li>
            <li>Contagem de eosinófilos &ge; 300 células/µL - Hemograma simples realizado no último ano.</li>
            <li><strong>ANS:</strong> Histórico de 3 exacerbações no último ano ou uso contínuo de corticosteroides orais nos últimos 6 meses, idade &ge; 6 anos.</li>
            <li><strong>SUS:</strong> Histórico de 1 exacerbação no último ano, idade &ge; 18 anos.</li>
          </ul>
          <p className="text-sm text-otto-muted bg-otto-bg p-3 rounded">
            <strong>Exacerbação:</strong> Caracterizada pela necessidade de uso de curso de corticosteroides ou hospitalização/emergência.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-otto-border shadow-sm">
          <h2 className="text-xl font-bold text-otto-primary-dk mb-4">Classificação EPOS 2020 das RSCs em Adultos</h2>
          <p className="text-otto-text mb-3">
            A rinossinusite crônica (com ou sem pólipos nasais) em adultos é definida pela presença de dois ou mais sintomas por &ge; 12 semanas:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2 text-otto-text">
            <li>Bloqueio/obstrução/congestão nasal <strong>OU</strong> Rinorreia anterior/posterior.</li>
            <li>Associado a: Dor/pressão facial <strong>E/OU</strong> Redução ou perda de olfato.</li>
          </ul>
          <p className="text-sm text-otto-muted bg-otto-bg p-3 rounded">
            <strong>Polipose nasal:</strong> Subtipo da RSC, massas inflamatórias que surgem na mucosa do nariz e seios paranasais, comuns em pacientes com perda de olfato.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-otto-border shadow-sm">
          <h2 className="text-xl font-bold text-otto-primary-dk mb-4">Indicação de Biológicos para RSC</h2>
          <p className="text-otto-text mb-3">
            Critérios para indicação de biológicos em pacientes com RSC com polipose nasal e contraindicação ou inadequação cirúrgica:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2 text-otto-text">
            <li><strong>Gravidade dos sintomas:</strong> SNOT-22, EVA obstrução/rinorreia, teste de olfato, cirurgia anterior, uso de corticosteroides.</li>
            <li><strong>Extensão da doença:</strong> Escore de pólipos nasais, opacificação sinusal (Lund-Mackay).</li>
            <li><strong>Comorbidades:</strong> Asma, intolerância a AINEs (DREA).</li>
            <li><strong>Biomarcadores:</strong> Eosinofilia sérica e tecidual.</li>
          </ul>
          <p className="text-sm text-otto-success font-semibold bg-green-50 p-3 rounded border border-green-200">
            Total: O questionário de elegibilidade soma 25 pontos, e pacientes com pontuação &ge; 14 estão indicados para uso de biológicos.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-otto-border shadow-sm">
          <h2 className="text-xl font-bold text-otto-primary-dk mb-4">Indicações para Tratamento com Biológicos (RSCcPN)</h2>
          <p className="text-otto-text mb-3">
            Pacientes com pólipos bilaterais submetidos à ESS (Endoscopic Sinus Surgery) e com três dos critérios abaixo são indicados para tratamento com biológicos:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-otto-text">
            <li>Eosinófilos teciduais &ge; 10/hpf <strong>OU</strong> Eosinófilos séricos &ge; 150 células/µL <strong>OU</strong> IgE total &ge; 100.</li>
            <li>Necessidade de uso contínuo de corticosteroides sistêmicos.</li>
            <li>Diminuição significativa na qualidade de vida (SNOT-22 &ge; 40).</li>
            <li>Anosmia no teste de olfato.</li>
            <li>Asma concomitante necessitando uso regular de corticosteroides inalatórios.</li>
          </ul>
        </div>
      </div>

      <footer className="mt-12 pt-6 border-t border-otto-border">
        <h5 className="font-bold text-otto-primary-dk mb-3">Referências:</h5>
        <ul className="list-decimal pl-5 space-y-2 text-xs text-otto-muted mb-8">
          <li>Fokkens WJ, et al. European Position Paper on Rhinosinusitis and Nasal Polyps 2020. Rhinology. 2020;58(Suppl S29):1-464.</li>
          <li>Anselmo-Lima WT, et al. Brazilian guideline for the use of immunobiologicals in chronic rhinosinusitis with nasal polyps. Braz J Otorhinolaryngol. 2024;90(3):101394.</li>
          <li>Stevens WW, et al. Chronic Rhinosinusitis with Nasal Polyps. J Allergy Clin Immunol Pract. 2016;4(4):565-572.</li>
        </ul>
        <div className="text-center text-sm text-otto-muted">
          <p>&copy; 2024-2026 Portal Imunobiológicos | Criado por Dr. Dario Hart Signorini</p>
        </div>
      </footer>
    </div>
  );
}
