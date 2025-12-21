/**
 * Simple client-side guard to verify the current user has the admin claim.
 * If missing, it triggers the provided navigateHome callback.
 */
import { useEffect, useState } from "react";
import { getIdTokenResult } from "firebase/auth";
import { auth } from "../../services/firebase";

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
        const token = await getIdTokenResult(user, true);
        const admin = !!token.claims?.admin;
        if (!admin && active) navigateHome();
        if (active) setIsAdmin(admin);
      } catch (err) {
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
