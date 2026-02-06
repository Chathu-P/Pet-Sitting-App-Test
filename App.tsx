import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./src/navigation/RootNavigator";
import { logFirebaseHealth } from "./src/services/firebaseHealth";
import { NotificationProvider } from "./src/context/NotificationContext";

export default function App() {
  useEffect(() => {
    // Log Firebase connectivity once on app start
    logFirebaseHealth();
  }, []);

  return (
    <NotificationProvider>
      <>
        <RootNavigator />
        <StatusBar style="light" />
      </>
    </NotificationProvider>
  );
}
