export async function GET() {
  return Response.json({
    items: [
      {
        id: "eligibility-core",
        title: "Elegibilidade como núcleo do portal",
        body:
          "O OTTO-IMUNE nasce com a calculadora de elegibilidade como fluxo principal e base para histórico clínico, relatórios e futuras prescrições."
      },
      {
        id: "clinical-pillars",
        title: "Pilares clínicos atuais",
        body:
          "A estrutura atual mantém os quatro eixos já utilizados no projeto anterior: severidade dos sintomas, extensão da doença, comorbidades e biomarcadores."
      },
      {
        id: "integration-ready",
        title: "Integração com a OTTO PWA",
        body:
          "A nova base já considera modo embed, origem OTTO PWA e passagem futura de contexto clínico por parâmetros ou integração controlada."
      }
    ]
  });
}
