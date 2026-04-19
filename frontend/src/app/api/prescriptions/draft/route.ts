import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { buildPrescriptionDraft } from "@/lib/drafts";
import { authContextFromToken, serializeDocument } from "@/lib/firestore-store";
import { getVerifiedUser } from "@/lib/server-auth";

type DraftRequest = {
  calculationId?: unknown;
  patientId?: unknown;
};

export async function POST(request: Request) {
  const db = getAdminDb();
  const verifiedUser = await getVerifiedUser(request);
  const auth = authContextFromToken(verifiedUser);

  if (!db) {
    return Response.json(
      { error: "Persistência ainda não configurada no servidor." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as DraftRequest;
  const calculationId =
    typeof body.calculationId === "string" ? body.calculationId.trim() : "";
  const patientId = typeof body.patientId === "string" ? body.patientId.trim() : "";

  if (!calculationId || !patientId) {
    return Response.json(
      { error: "Informe os identificadores do paciente e da avaliação." },
      { status: 400 }
    );
  }

  const [patientSnapshot, calculationSnapshot] = await Promise.all([
    db.collection("patients").doc(patientId).get(),
    db.collection("calculator_runs").doc(calculationId).get()
  ]);

  if (!patientSnapshot.exists || !calculationSnapshot.exists) {
    return Response.json({ error: "Paciente ou avaliação não encontrados." }, { status: 404 });
  }

  const patient = patientSnapshot.data();
  const calculation = calculationSnapshot.data();

  if (patient?.ownerUid && !verifiedUser) {
    return Response.json({ error: "Sessão OTTO necessária para gerar rascunhos." }, { status: 401 });
  }

  if (patient?.ownerUid && patient.ownerUid !== verifiedUser?.uid) {
    return Response.json({ error: "Acesso não autorizado para este paciente." }, { status: 403 });
  }

  const draft = buildPrescriptionDraft(patient ?? {}, {
    totalScore: calculation?.totalScore ?? 0,
    result: calculation?.result,
    breakdown: calculation?.breakdown,
    narrative: calculation?.narrative ?? null,
    createdAt:
      calculation?.createdAt instanceof Timestamp
        ? calculation.createdAt.toDate().toISOString()
        : null
  });

  const draftRef = db.collection("prescription_drafts").doc();
  const createdAt = Timestamp.now();

  await draftRef.set({
    kind: "prescription",
    status: "draft",
    patientId,
    calculationId,
    draft,
    createdAt,
    createdBy: auth,
    updatedAt: createdAt
  });

  return Response.json({
    id: draftRef.id,
    draft: serializeDocument(draftRef.id, {
      kind: "prescription",
      status: "draft",
      patientId,
      calculationId,
      draft,
      createdAt,
      createdBy: auth,
      updatedAt: createdAt
    })
  });
}
