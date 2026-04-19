import { getAdminDb } from "@/lib/firebase-admin";
import {
  authContextFromToken,
  createCalculationRecord,
  serializeDocument,
  upsertPatientRecord
} from "@/lib/firestore-store";
import { getVerifiedUser } from "@/lib/server-auth";
import {
  buildEligibilityBreakdown,
  createEmptyScores,
  getEligibilityDecision,
  getEligibilityNarrative,
  parseCid10Codes,
  scoreFieldKeys,
  sumEligibilityScore,
  type EligibilityScores,
  type ScoreKey
} from "@/lib/eligibility";

type RawPayload = {
  patientId?: unknown;
  sourcePatientId?: unknown;
  source?: unknown;
  embedMode?: unknown;
  patient?: {
    name?: unknown;
    birthDate?: unknown;
    age?: unknown;
    cid10?: unknown;
  };
  scores?: Partial<Record<ScoreKey, unknown>>;
};

function sanitizeScores(rawScores: RawPayload["scores"]): EligibilityScores {
  const scores = createEmptyScores();

  for (const key of scoreFieldKeys) {
    const incoming = rawScores?.[key];
    const numeric = typeof incoming === "number" ? incoming : Number(incoming ?? 0);
    scores[key] = Number.isFinite(numeric) ? Math.min(3, Math.max(0, numeric)) : 0;
  }

  return scores;
}

function sanitizeAge(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }

  return Math.round(numeric);
}

export async function POST(request: Request) {
  try {
    const verifiedUser = await getVerifiedUser(request);
    const body = (await request.json()) as RawPayload;
    const patientName = typeof body.patient?.name === "string" ? body.patient.name.trim() : "";
    const birthDate =
      typeof body.patient?.birthDate === "string" ? body.patient.birthDate.trim() : "";
    const age = sanitizeAge(body.patient?.age);
    const cid10Codes = parseCid10Codes(body.patient?.cid10);
    const scores = sanitizeScores(body.scores);
    const totalScore = sumEligibilityScore(scores);
    const decision = getEligibilityDecision(totalScore);
    const breakdown = buildEligibilityBreakdown(scores);
    const narrative = getEligibilityNarrative(totalScore, breakdown);

    const db = getAdminDb();
    const auth = authContextFromToken(verifiedUser);

    // Validações de dados do paciente só são obrigatórias quando há persistência
    // configurada. Em modo standalone (sem Firebase), o cálculo é feito e retornado
    // diretamente sem gravar no Firestore.
    if (db) {
      if (!patientName) {
        return Response.json({ error: "Informe o nome do paciente." }, { status: 400 });
      }

      if (!birthDate && age === null) {
        return Response.json(
          { error: "Informe a data de nascimento ou a idade do paciente." },
          { status: 400 }
        );
      }

      if (cid10Codes.length === 0) {
        return Response.json({ error: "Informe pelo menos um CID-10." }, { status: 400 });
      }
    }

    const payload = {
      calculatorKey: "eligibility-immunobiologics",
      patientId: typeof body.patientId === "string" ? body.patientId.trim() || null : null,
      patient: {
        name: patientName,
        birthDate: birthDate || null,
        age,
        cid10Codes
      },
      scores,
      totalScore,
      result: decision,
      breakdown,
      narrative,
      source:
        typeof body.source === "string" ? body.source.trim() || "otto-imune-web" : "otto-imune-web",
      embedMode: body.embedMode === true,
      createdAt: new Date().toISOString()
    };

    if (!db) {
      return Response.json({
        id: null,
        patientId: typeof body.patientId === "string" ? body.patientId.trim() || null : null,
        persisted: false,
        result: payload.result,
        totalScore,
        breakdown,
        narrative,
        message:
          "Cálculo concluído. A persistência em Firestore será habilitada assim que as credenciais server-side forem configuradas."
      });
    }

    const { patientId, patientRecord } = await upsertPatientRecord(
      db,
      {
        patientId: typeof body.patientId === "string" ? body.patientId.trim() || null : null,
        sourcePatientId:
          typeof body.sourcePatientId === "string" ? body.sourcePatientId.trim() || null : null,
        name: patientName,
        birthDate: birthDate || null,
        age,
        cid10Codes,
        source: payload.source,
        embedMode: payload.embedMode
      },
      auth
    );

    const calculationId = await createCalculationRecord(db, {
      patientId,
      patient: {
        patientId,
        sourcePatientId:
          typeof body.sourcePatientId === "string" ? body.sourcePatientId.trim() || null : null,
        name: patientName,
        birthDate: birthDate || null,
        age,
        cid10Codes,
        source: payload.source,
        embedMode: payload.embedMode
      },
      scores,
      totalScore,
      result: decision,
      breakdown,
      narrative,
      source: payload.source,
      embedMode: payload.embedMode,
      auth
    });

    return Response.json({
      id: calculationId,
      patientId,
      persisted: true,
      result: payload.result,
      totalScore,
      breakdown,
      narrative,
      message: "Avaliação registrada com sucesso no Firestore.",
      patient: serializeDocument(patientId, patientRecord)
    });
  } catch (error) {
    console.error("eligibility POST error", error);

    return Response.json(
      { error: "Não foi possível processar a avaliação de elegibilidade." },
      { status: 500 }
    );
  }
}
