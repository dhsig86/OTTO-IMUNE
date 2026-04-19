import type { EligibilityDecision, EligibilitySectionBreakdown } from "@/lib/eligibility";

type PatientSnapshot = {
  name?: string | null;
  birthDate?: string | null;
  age?: number | null;
  cid10Codes?: string[];
};

type CalculationSnapshot = {
  totalScore: number;
  result: EligibilityDecision;
  breakdown?: EligibilitySectionBreakdown[];
  narrative?: string | null;
  createdAt?: string | null;
};

export type DraftPayload = {
  title: string;
  summary: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

function formatPatientLine(patient: PatientSnapshot) {
  const parts = [patient.name || "Paciente sem nome"];

  if (patient.birthDate) {
    parts.push(`nasc. ${patient.birthDate}`);
  } else if (typeof patient.age === "number") {
    parts.push(`${patient.age} anos`);
  }

  if (patient.cid10Codes?.length) {
    parts.push(`CID-10: ${patient.cid10Codes.join(", ")}`);
  }

  return parts.join(" • ");
}

export function buildReportDraft(
  patient: PatientSnapshot,
  calculation: CalculationSnapshot
): DraftPayload {
  const breakdownText =
    calculation.breakdown?.map((item) => `${item.title}: ${item.score}/${item.maxScore}`).join(" | ") ||
    "Breakdown não disponível.";

  return {
    title: "Rascunho de relatório clínico",
    summary: `${formatPatientLine(patient)}. ${calculation.result.message}`,
    sections: [
      {
        title: "Identificação",
        body: formatPatientLine(patient)
      },
      {
        title: "Resultado da elegibilidade",
        body: `Pontuação total: ${calculation.totalScore}. Classificação atual: ${calculation.result.label}.`
      },
      {
        title: "Síntese clínica",
        body: calculation.narrative || "Narrativa clínica ainda não gerada."
      },
      {
        title: "Distribuição por eixos",
        body: breakdownText
      },
      {
        title: "Observação",
        body:
          "Este rascunho é uma base estruturada para revisão médica. Complementar com exame físico, endoscopia, imagem e decisão terapêutica final."
      }
    ]
  };
}

export function buildPrescriptionDraft(
  patient: PatientSnapshot,
  calculation: CalculationSnapshot
): DraftPayload {
  return {
    title: "Rascunho de prescrição assistida",
    summary: `${formatPatientLine(patient)}. Elegibilidade atual: ${calculation.result.label}.`,
    sections: [
      {
        title: "Paciente",
        body: formatPatientLine(patient)
      },
      {
        title: "Justificativa clínica",
        body:
          calculation.narrative ||
          `Pontuação total de ${calculation.totalScore} com status ${calculation.result.label}.`
      },
      {
        title: "Prescrição em aberto",
        body:
          "Medicamento imunobiológico, apresentação, dose, via, intervalo, duração e critérios de monitoramento devem ser preenchidos pelo médico responsável."
      },
      {
        title: "Checklist de revisão",
        body:
          "Confirmar indicação clínica, comorbidades relevantes, CID-10, exames de apoio, critérios administrativos e plano de seguimento."
      }
    ]
  };
}
