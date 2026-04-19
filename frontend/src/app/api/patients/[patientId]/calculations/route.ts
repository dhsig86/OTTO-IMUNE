import { getAdminDb } from "@/lib/firebase-admin";
import { serializeDocument } from "@/lib/firestore-store";
import { getVerifiedUser } from "@/lib/server-auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ patientId: string }> }
) {
  const { patientId } = await context.params;
  const db = getAdminDb();
  const verifiedUser = await getVerifiedUser(request);

  if (!db) {
    return Response.json(
      { error: "Persistência ainda não configurada no servidor." },
      { status: 503 }
    );
  }

  const patientSnapshot = await db.collection("patients").doc(patientId).get();

  if (!patientSnapshot.exists) {
    return Response.json({ error: "Paciente não encontrado." }, { status: 404 });
  }

  const patientData = patientSnapshot.data();

  if (patientData?.ownerUid && !verifiedUser) {
    return Response.json({ error: "Sessão OTTO necessária para consultar o histórico." }, { status: 401 });
  }

  if (patientData?.ownerUid && verifiedUser?.uid !== patientData.ownerUid) {
    return Response.json({ error: "Acesso não autorizado para este histórico." }, { status: 403 });
  }

  const snapshot = await db
    .collection("calculator_runs")
    .where("patientId", "==", patientId)
    .get();

  const items = snapshot.docs
    .map((doc) => serializeDocument(doc.id, doc.data()) as { id: string; createdAt?: string })
    .sort((left, right) => {
      const leftDate = typeof left.createdAt === "string" ? left.createdAt : "";
      const rightDate = typeof right.createdAt === "string" ? right.createdAt : "";
      return rightDate.localeCompare(leftDate);
    });

  return Response.json({
    patient: serializeDocument(patientSnapshot.id, patientData),
    items
  });
}
