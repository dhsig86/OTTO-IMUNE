import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@/lib/firebase-admin";

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

export async function getVerifiedUser(request: Request): Promise<DecodedIdToken | null> {
  const token = getBearerToken(request);
  const adminAuth = getAdminAuth();

  if (!token || !adminAuth) {
    return null;
  }

  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.warn("firebase token verification failed", error);
    return null;
  }
}
