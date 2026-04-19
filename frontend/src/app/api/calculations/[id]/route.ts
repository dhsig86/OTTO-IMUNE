import { getAdminDb } from "@/lib/firebase-admin";
import { serializeDocument } from "@/lib/firestore-store";
import { getVerifiedUser } from "@/lib/server-auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const db = getAdminDb();
  const verifiedUser = await getVerifiedUser(request);

  if (!db) {
    return Response.json(
      { error: "Persistência ainda não configurada no servidor." },
      { status: 503 }
    );
  }

  const snapshot = await db.collection("calculator_runs").doc(id).get();

  if (!snapshot.exists) {
    return Response.json({ error: "Avaliação não encontrada." }, { status: 404 });
  }

  const data = snapshot.data();

  if (data?.auth?.uid && verifiedUser?.uid !== data.auth.uid) {
    return Response.json({ error: "Acesso não autorizado para esta avaliação." }, { status: 403 });
  }

  if (data?.auth?.uid && !verifiedUser) {
    return Response.json({ error: "Sessão OTTO necessária para acessar esta avaliação." }, { status: 401 });
  }

  return Response.json(serializeDocument(snapshot.id, data));
}
