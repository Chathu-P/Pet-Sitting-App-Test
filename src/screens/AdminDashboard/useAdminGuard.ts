/**
 * Simple client-side guard to verify the current user has the admin claim.
 * If missing, it triggers the provided navigateHome callback.
 */
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";

export function useAdminGuard(navigateHome: () => void) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAdmin = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          if (active) navigateHome();
          return;
        }

        // Updated guard: Check Firestore Role instead of Custom Claims
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);

        let validAdmin = false;
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.role === "admin") {
            validAdmin = true;
          }
        }

        if (!validAdmin && active) {
          navigateHome();
        }
        if (active) setIsAdmin(validAdmin);
      } catch (err) {
        console.error("Admin guard check failed", err);
        if (active) navigateHome();
      } finally {
        if (active) setChecking(false);
      }
    };

    checkAdmin();
    return () => {
      active = false;
    };
  }, [navigateHome]);

  return { checking, isAdmin };
}
