import { auth } from "./firebase";
import { fetchSignInMethodsForEmail } from "firebase/auth";

export type FirebaseHealth = {
  ok: boolean;
  stage: "init" | "auth" | "error";
  message?: string;
};

// Performs a lightweight network call to Firebase Auth to verify connectivity.
export async function checkFirebaseConnectivity(): Promise<FirebaseHealth> {
  try {
    // init stage: ensure auth is available
    if (!auth || !auth.app) {
      return { ok: false, stage: "init", message: "Auth not initialized" };
    }

    // auth stage: triggers a backend call using API key
    // Using a dummy email — returns [] when no providers, which is fine.
    const methods = await fetchSignInMethodsForEmail(
      auth,
      "healthcheck@example.com"
    );
    return {
      ok: true,
      stage: "auth",
      message: `Auth reachable. Providers for dummy email: ${methods.length}`,
    };
  } catch (err: any) {
    return {
      ok: false,
      stage: "error",
      message: err?.message || String(err),
    };
  }
}

export async function logFirebaseHealth(): Promise<void> {
  const result = await checkFirebaseConnectivity();
  // eslint-disable-next-line no-console
  console.log("[Firebase Health]", result);
}
