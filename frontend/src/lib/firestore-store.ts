import { FieldValue, Timestamp, type DocumentData, type Firestore } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";
import type {
  EligibilityDecision,
  EligibilityScores,
  EligibilitySectionBreakdown
} from "@/lib/eligibility";

export type AuthContext = {
  uid: string;
  email: string | null;
  name: string | null;
};

export type PatientInput = {
  patientId: string | null;
  sourcePatientId: string | null;
  name: string;
  birthDate: string | null;
  age: number | null;
  cid10Codes: string[];
  source: string;
  embedMode: boolean;
};

export type CalculationRecordInput = {
  patientId: string;
  patient: PatientInput;
  scores: EligibilityScores;
  totalScore: number;
  result: EligibilityDecision;
  breakdown: EligibilitySectionBreakdown[];
  narrative: string;
  source: string;
  embedMode: boolean;
  auth: AuthContext | null;
};

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        serializeValue(nestedValue)
      ])
    );
  }

  return value;
}

export function serializeDocument(id: string, data: DocumentData | undefined) {
  return {
    id,
    ...(serializeValue(data ?? {}) as Record<string, unknown>)
  };
}

export async function upsertPatientRecord(
  db: Firestore,
  input: PatientInput,
  auth: AuthContext | null
) {
  const docRef = input.patientId
    ? db.collection("patients").doc(input.patientId)
    : db.collection("patients").doc();

  const now = Timestamp.now();
  const existing = await docRef.get();

  const payload = {
    name: input.name,
    normalizedName: normalizeName(input.name),
    birthDate: input.birthDate,
    age: input.age,
    cid10Codes: input.cid10Codes,
    sourcePatientId: input.sourcePatientId,
    source: input.source,
    embedMode: input.embedMode,
    ownerUid: auth?.uid ?? existing.data()?.ownerUid ?? null,
    ownerEmail: auth?.email ?? existing.data()?.ownerEmail ?? null,
    ownerName: auth?.name ?? existing.data()?.ownerName ?? null,
    lastSeenAt: now,
    updatedAt: now,
    createdAt: existing.exists ? existing.data()?.createdAt ?? now : now
  };

  await docRef.set(payload, { merge: true });

  return {
    patientId: docRef.id,
    patientRecord: payload
  };
}

export async function createCalculationRecord(db: Firestore, input: CalculationRecordInput) {
  const docRef = db.collection("calculator_runs").doc();
  const now = Timestamp.now();

  await docRef.set({
    calculatorKey: "eligibility-immunobiologics",
    patientId: input.patientId,
    sourcePatientId: input.patient.sourcePatientId,
    patient: {
      name: input.patient.name,
      birthDate: input.patient.birthDate,
      age: input.patient.age,
      cid10Codes: input.patient.cid10Codes
    },
    scores: input.scores,
    totalScore: input.totalScore,
    result: input.result,
    breakdown: input.breakdown,
    narrative: input.narrative,
    source: input.source,
    embedMode: input.embedMode,
    auth: input.auth,
    createdAt: now,
    updatedAt: now
  });

  await db.collection("patients").doc(input.patientId).set(
    {
      lastEligibilityRunId: docRef.id,
      lastEligibilityScore: input.totalScore,
      lastEligibilityResult: input.result,
      lastEligibilityAt: now,
      totalRuns: FieldValue.increment(1)
    },
    { merge: true }
  );

  return docRef.id;
}

export function authContextFromToken(token: DecodedIdToken | null): AuthContext | null {
  if (!token) {
    return null;
  }

  return {
    uid: token.uid,
    email: token.email ?? null,
    name: token.name ?? null
  };
}
