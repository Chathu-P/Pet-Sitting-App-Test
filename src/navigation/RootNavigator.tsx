import React, { useEffect, useState, useRef } from "react";
import {
  NavigationContainer,
  NavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, Linking } from "react-native";
import type { LinkingOptions } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import HomeScreen2 from "../screens/HomeScreen2";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import PetOwnerSignupScreen from "../screens/PetOwnerSignupScreen";
import PetSitterSignupScreen from "../screens/PetSitterSignupScreen";
import PetOwnerDashboardScreen from "../screens/PetOwnerDashboard";
import {
  PetSitterDashboardScreen,
  BrowseRequestsScreen,
  SitterProfileScreen,
  RequestDetailsScreen,
} from "../screens/PetSitterDashboard";
import {
  AdminDashboardScreen,
  AdminUsersScreen,
  AdminRequestsScreen,
} from "../screens/AdminDashboard";
import PetDetailsScreen from "../screens/PetDetailsScreen";
import PasswordResetScreen from "../screens/PasswordResetScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import {
  PetRequestDetailsScreen,
  GiveBadgeScreen,
} from "../screens/PetOwnerDashboard";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export type RootStackParamList = {
  HomeScreen: undefined;
  HomeScreen2: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
  PetOwnerSignupScreen: undefined;
  PetSitterSignupScreen: undefined;
  PetOwnerDashboardScreen: undefined;
  PetSitterDashboardScreen: undefined;
  BrowseRequestsScreen: undefined;
  SitterProfileScreen: undefined;
  RequestDetailsScreen: { requestId: string };
  AdminDashboardScreen: undefined;
  AdminUsersScreen: undefined;
  AdminRequestsScreen: undefined;
  PetDetailsScreen: { petId?: string };
  PetRequestDetails: undefined;
  GiveBadgeScreen: { sitterId: string; sitterName: string };
  PasswordResetScreen: undefined;
  ResetPasswordScreen: { email?: string; oobCode?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [role, setRole] = useState<"owner" | "sitter" | "admin" | null>(null);
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ["https://pet-sitting-app-cc7e7.firebaseapp.com"],
    config: {
      screens: {
        ResetPasswordScreen: "reset-password",
      },
    },
  };

  useEffect(() => {
    const handleDeepLink = (url: string | null) => {
      if (!url) return;
      try {
        const parsed = new URL(url);
        const path = parsed.pathname.replace(/^\/+/, "");
        const oobCode = parsed.searchParams.get("oobCode") || undefined;

        if (path.startsWith("reset-password")) {
          navigationRef.current?.navigate("ResetPasswordScreen", { oobCode });
        }
      } catch (err) {
        console.warn("Failed to handle deep link", err);
      }
    };

    const initUrl = async () => {
      const initial = await Linking.getInitialURL();
      handleDeepLink(initial);
    };

    initUrl();
    const sub = Linking.addEventListener("url", ({ url }) =>
      handleDeepLink(url)
    );

    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log("onAuthStateChanged user:", u ? u.uid : null);
      if (!u) {
        setCurrentUser(null);
        setRole(null);
        setInitializing(false);
        console.log("No user, navigating to HomeScreen");
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "HomeScreen" }],
        });
        return;
      }
      setCurrentUser(u);
      try {
        // Use Firestore role for admin and all users
        const snap = await getDoc(doc(db, "users", u.uid));
        console.log("USER DOC EXISTS:", snap.exists());
        console.log("USER DOC DATA:", snap.data());
        const data = snap.exists() ? (snap.data() as any) : null;
        const userRole =
          (data?.role as "owner" | "sitter" | "admin" | undefined) ?? null;
        console.log("ROLE:", userRole);
        setRole(userRole);

        if (userRole === "admin") {
          console.log("Navigating to AdminDashboardScreen");
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: "AdminDashboardScreen" }],
          });
        } else if (userRole === "owner") {
          console.log("Navigating to PetOwnerDashboardScreen");
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: "PetOwnerDashboardScreen" }],
          });
        } else if (userRole === "sitter") {
          console.log("Navigating to PetSitterDashboardScreen");
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: "PetSitterDashboardScreen" }],
          });
        } else {
          console.log("Unknown role, navigating to HomeScreen");
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: "HomeScreen" }],
          });
        }
      } catch (error) {
        console.error("ROLE FETCH ERROR:", error);
        setRole(null);
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "LoginScreen" }],
        });
      } finally {
        setInitializing(false);
      }
    });
    return () => {
      unsub();
      sub.remove();
    };
  }, []);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF9F0",
        }}
      >
        <ActivityIndicator size="large" color="#91521B" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{ headerShown: false }}
      >
        {/* Unauthenticated stack */}
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="HomeScreen2" component={HomeScreen2} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen
          name="PetOwnerSignupScreen"
          component={PetOwnerSignupScreen}
        />
        <Stack.Screen
          name="PetSitterSignupScreen"
          component={PetSitterSignupScreen}
        />
        <Stack.Screen
          name="PasswordResetScreen"
          component={PasswordResetScreen}
        />
        <Stack.Screen
          name="ResetPasswordScreen"
          component={ResetPasswordScreen}
        />

        {/* Authenticated stack */}
        <Stack.Screen
          name="PetOwnerDashboardScreen"
          component={PetOwnerDashboardScreen}
        />
        <Stack.Screen
          name="PetSitterDashboardScreen"
          component={PetSitterDashboardScreen}
        />
        <Stack.Screen
          name="BrowseRequestsScreen"
          component={BrowseRequestsScreen}
        />
        <Stack.Screen
          name="SitterProfileScreen"
          component={SitterProfileScreen}
        />
        <Stack.Screen
          name="RequestDetailsScreen"
          component={RequestDetailsScreen}
        />
        <Stack.Screen
          name="PetRequestDetails"
          component={PetRequestDetailsScreen}
        />
        <Stack.Screen name="GiveBadgeScreen" component={GiveBadgeScreen} />
        <Stack.Screen name="PetDetailsScreen" component={PetDetailsScreen} />

        {/* Admin stack */}
        <Stack.Screen
          name="AdminDashboardScreen"
          component={AdminDashboardScreen}
        />
        <Stack.Screen name="AdminUsersScreen" component={AdminUsersScreen} />
        <Stack.Screen
          name="AdminRequestsScreen"
          component={AdminRequestsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
