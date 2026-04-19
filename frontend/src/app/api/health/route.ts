import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  const db = getAdminDb();

  return Response.json({
    status: "ok",
    service: "OTTO-IMUNE",
    date: "2026-04-19",
    firestoreConfigured: Boolean(db)
  });
}
