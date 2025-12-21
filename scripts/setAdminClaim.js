/**
 * Set or clear the admin custom claim for a user.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/setAdminClaim.js <uid> [--remove]
 *   FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json node scripts/setAdminClaim.js <uid> [--remove]
 *
 * Notes:
 * - Provide a service account key with permission to manage Firebase Auth.
 * - After running, the user must refresh their ID token (sign out/in or call getIdToken(true)).
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function getCredential() {
  const keyPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT;
  if (keyPath) {
    const resolved = path.resolve(keyPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Service account file not found at ${resolved}`);
    }
    // Service account JSON never belongs in version control; point to a local file.
    const serviceAccount = require(resolved);
    return admin.credential.cert(serviceAccount);
  }

  console.warn(
    "No service account path set; using application default credentials (ADC). " +
      "Make sure ADC is configured if you rely on it."
  );
  return admin.credential.applicationDefault();
}

admin.initializeApp({
  credential: getCredential(),
});

async function run() {
  const uid = process.argv[2];
  const remove = process.argv.includes("--remove");

  if (!uid) {
    console.error("Usage: node scripts/setAdminClaim.js <uid> [--remove]");
    process.exit(1);
  }

  const claims = remove ? {} : { admin: true };
  await admin.auth().setCustomUserClaims(uid, claims);
  const updated = await admin.auth().getUser(uid);

  console.log(`Updated claims for ${uid}:`, updated.customClaims);
  console.log(remove ? "Admin claim removed." : "Admin claim set to true.");
  console.log("Have the user sign out/in or call getIdToken(true) to refresh their token.");
}

run().catch((err) => {
  console.error("Failed to set custom claim:", err);
  process.exit(1);
});
