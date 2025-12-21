import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./src/navigation/RootNavigator";
import { logFirebaseHealth } from "./src/services/firebaseHealth";

export default function App() {
  useEffect(() => {
    // Log Firebase connectivity once on app start
    logFirebaseHealth();
  }, []);

  return (
    <>
      <RootNavigator />
      <StatusBar style="light" />
    </>
  );
}
