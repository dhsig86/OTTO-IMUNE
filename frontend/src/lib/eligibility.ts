export const scoreFieldKeys = [
  "snot22",
  "vas",
  "olfactoryTest",
  "previousSurgeries",
  "corticosteroidUse",
  "polypSize",
  "sinusOpacification",
  "asthma",
  "nsaidIntolerance",
  "serumEosinophilia",
  "tissueEosinophilia"
] as const;

export type ScoreKey = (typeof scoreFieldKeys)[number];

export type EligibilityScores = Record<ScoreKey, number>;

export type EligibilityDecision = {
  eligible: boolean;
  label: string;
  message: string;
  threshold: number;
};

export type EligibilitySectionId =
  | "symptomSeverity"
  | "diseaseExtent"
  | "comorbidities"
  | "biomarkers";

type ScoreOption = {
  value: number;
  label: string;
};

type ScoreField = {
  key: ScoreKey;
  label: string;
  help?: string;
  options: ScoreOption[];
};

type ScoreSection = {
  id: EligibilitySectionId;
  title: string;
  description: string;
  fields: ScoreField[];
};

export type EligibilitySectionBreakdown = {
  id: EligibilitySectionId;
  title: string;
  score: number;
  maxScore: number;
  fields: Array<{
    key: ScoreKey;
    label: string;
    score: number;
  }>;
};

export const eligibilitySections: ScoreSection[] = [
  {
    id: "symptomSeverity",
    title: "Severidade dos sintomas",
    description: "Critérios relacionados à percepção clínica e funcional do paciente.",
    fields: [
      {
        key: "snot22",
        label: "SNOT-22",
        help: "Versão já utilizada na calculadora anterior.",
        options: [
          { value: 0, label: "< 20 (0 ponto)" },
          { value: 1, label: "20-50 (1 ponto)" },
          { value: 2, label: "> 50 (2 pontos)" }
        ]
      },
      {
        key: "vas",
        label: "EVA de obstrução nasal/rinorreia",
        options: [
          { value: 0, label: "< 3 (0 ponto)" },
          { value: 1, label: "3-7 (1 ponto)" },
          { value: 2, label: "> 7 (2 pontos)" }
        ]
      },
      {
        key: "olfactoryTest",
        label: "Teste de olfato",
        options: [
          { value: 0, label: "< 3, normosmia ou hiposmia leve (0 ponto)" },
          { value: 1, label: "3-7, hiposmia moderada (1 ponto)" },
          { value: 2, label: "> 7, hiposmia grave ou anosmia (2 pontos)" }
        ]
      }
    ]
  },
  {
    id: "diseaseExtent",
    title: "Extensão da doença",
    description: "Histórico terapêutico e carga anatômica da doença.",
    fields: [
      {
        key: "previousSurgeries",
        label: "Número de cirurgias anteriores",
        options: [
          { value: 0, label: "0 (0 ponto)" },
          { value: 1, label: "1 (1 ponto)" },
          { value: 2, label: "2 (2 pontos)" },
          { value: 3, label: ">= 3 ou contraindicação cirúrgica (3 pontos)" }
        ]
      },
      {
        key: "corticosteroidUse",
        label: "Uso de corticoides sistêmicos por ano",
        options: [
          { value: 0, label: "0 (0 ponto)" },
          { value: 1, label: "1 ou 2 (1 ponto)" },
          { value: 2, label: "> 2 (2 pontos)" }
        ]
      },
      {
        key: "polypSize",
        label: "Tamanho dos pólipos (Nasal Polyp Score bilateral)",
        options: [
          { value: 0, label: "0 (0 ponto)" },
          { value: 1, label: "1-2 (1 ponto)" },
          { value: 2, label: "3-4 (2 pontos)" },
          { value: 3, label: ">= 5 (3 pontos)" }
        ]
      },
      {
        key: "sinusOpacification",
        label: "Opacificação sinusal (Lund-Mackay bilateral)",
        options: [
          { value: 0, label: "0-4 (0 ponto)" },
          { value: 1, label: "5-8 (1 ponto)" },
          { value: 2, label: "9-16 (2 pontos)" },
          { value: 3, label: "> 16 (3 pontos)" }
        ]
      }
    ]
  },
  {
    id: "comorbidities",
    title: "Comorbidades",
    description: "Condições associadas com impacto terapêutico.",
    fields: [
      {
        key: "asthma",
        label: "Asma",
        options: [
          { value: 0, label: "Não (0 ponto)" },
          { value: 1, label: "Leve (1 ponto)" },
          { value: 2, label: "Moderada ou grave (2 pontos)" }
        ]
      },
      {
        key: "nsaidIntolerance",
        label: "Intolerância a AINEs",
        options: [
          { value: 0, label: "Não (0 ponto)" },
          { value: 2, label: "Sim (2 pontos)" }
        ]
      }
    ]
  },
  {
    id: "biomarkers",
    title: "Biomarcadores",
    description: "Marcadores laboratoriais já previstos no fluxo original.",
    fields: [
      {
        key: "serumEosinophilia",
        label: "Eosinofilia sérica",
        options: [
          { value: 0, label: "< 150 (0 ponto)" },
          { value: 1, label: "150-300 (1 ponto)" },
          { value: 2, label: "> 300 (2 pontos)" }
        ]
      },
      {
        key: "tissueEosinophilia",
        label: "Eosinofilia tecidual",
        options: [
          { value: 0, label: "< 10 (0 ponto)" },
          { value: 1, label: "10-43 (1 ponto)" },
          { value: 2, label: "> 43 (2 pontos)" }
        ]
      }
    ]
  }
];

export const eligibilityThreshold = 14;

export function createEmptyScores(): EligibilityScores {
  return {
    snot22: 0,
    vas: 0,
    olfactoryTest: 0,
    previousSurgeries: 0,
    corticosteroidUse: 0,
    polypSize: 0,
    sinusOpacification: 0,
    asthma: 0,
    nsaidIntolerance: 0,
    serumEosinophilia: 0,
    tissueEosinophilia: 0
  };
}

export function sumEligibilityScore(scores: EligibilityScores) {
  return scoreFieldKeys.reduce((total, key) => total + scores[key], 0);
}

export function getEligibilityDecision(totalScore: number): EligibilityDecision {
  if (totalScore >= eligibilityThreshold) {
    return {
      eligible: true,
      label: "Elegível",
      message: "Tem indicação para uso do imunobiológico conforme a regra de pontuação atual.",
      threshold: eligibilityThreshold
    };
  }

  return {
    eligible: false,
    label: "Acompanhar",
    message: "Imunobiológico não indicado no momento pela regra de pontuação atual.",
    threshold: eligibilityThreshold
  };
}

export function buildEligibilityBreakdown(
  scores: EligibilityScores
): EligibilitySectionBreakdown[] {
  return eligibilitySections.map((section) => ({
    id: section.id,
    title: section.title,
    score: section.fields.reduce((total, field) => total + scores[field.key], 0),
    maxScore: section.fields.reduce(
      (total, field) =>
        total + Math.max(...field.options.map((option) => option.value)),
      0
    ),
    fields: section.fields.map((field) => ({
      key: field.key,
      label: field.label,
      score: scores[field.key]
    }))
  }));
}

export function getEligibilityNarrative(
  totalScore: number,
  breakdown: EligibilitySectionBreakdown[]
) {
  const topSection = [...breakdown].sort((left, right) => right.score - left.score)[0];

  if (!topSection) {
    return "Sem dados suficientes para gerar narrativa clínica.";
  }

  if (totalScore >= eligibilityThreshold) {
    return `Pontuação total de ${totalScore} pontos, acima do limiar atual. O maior peso clínico concentrou-se em ${topSection.title.toLowerCase()}.`;
  }

  return `Pontuação total de ${totalScore} pontos, abaixo do limiar atual. O principal impacto veio de ${topSection.title.toLowerCase()}, mas a regra de elegibilidade ainda não foi atingida.`;
}

export function parseCid10Codes(value: unknown) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}
