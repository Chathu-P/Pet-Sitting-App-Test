import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../components/Button";
import Header from "../components/Header";
import LogoCircle from "../components/LogoCircle";
import { COLORS } from "../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
  getSafeDimensions,
} from "../utils/responsive";
import { auth, db } from "../services/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getIdTokenResult,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { wp, hp, isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const logoSize = getSafeDimensions(wp(35), 100, 160);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Animation states
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(50))[0];
  const logoScaleAnim = useState(new Animated.Value(0.8))[0];

  // Load saved email on component mount
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("rememberMeEmail");
        const wasRemembered = await AsyncStorage.getItem("rememberMeChecked");
        if (savedEmail) {
          setEmail(savedEmail);
          setRemember(wasRemembered === "true");
        }
      } catch (error) {
        // Silently handle error
      }
    };
    loadSavedEmail();
  }, []);

  // Animation effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoScaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideUpAnim, logoScaleAnim]);

  const handleLogin = async () => {
    setError(null);
    setResetMessage(null);
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    try {
      setLoading(true);
      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const uid = userCred.user.uid;

      // Fetch user role from Firestore
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData?.role;
        const isActive = userData?.isActive !== false; // Default to true if not set

        // Check if user is blocked
        if (!isActive) {
          //console.log("LoginScreen: User is BLOCKED - showing error and signing out");
          setLoading(false);
          setError(
            "Your account has been blocked by the administrator. Please contact support.",
          );
          // Sign out WITHOUT awaiting - this allows error to show first
          setTimeout(() => {
            auth.signOut();
          }, 100);
          return;
        }

        // console.log("LoginScreen: User is active, proceeding with navigation");

        // Save or clear email based on Remember Me checkbox
        if (remember) {
          await AsyncStorage.setItem("rememberMeEmail", email.trim());
          await AsyncStorage.setItem("rememberMeChecked", "true");
        } else {
          await AsyncStorage.removeItem("rememberMeEmail");
          await AsyncStorage.removeItem("rememberMeChecked");
        }

        Alert.alert("Success", "Login successful!");

        if (role === "admin") {
          navigation.reset({
            index: 0,
            routes: [{ name: "AdminDashboardScreen" as never }],
          });
        } else if (role === "owner") {
          navigation.reset({
            index: 0,
            routes: [{ name: "PetOwnerDashboardScreen" as never }],
          });
        } else if (role === "sitter") {
          navigation.reset({
            index: 0,
            routes: [{ name: "PetSitterDashboardScreen" as never }],
          });
        } else {
          // Default fallback
          navigation.reset({
            index: 0,
            routes: [{ name: "PetSitterDashboardScreen" as never }],
          });
        }
      } else {
        // Save or clear email based on Remember Me checkbox
        if (remember) {
          await AsyncStorage.setItem("rememberMeEmail", email.trim());
          await AsyncStorage.setItem("rememberMeChecked", "true");
        } else {
          await AsyncStorage.removeItem("rememberMeEmail");
          await AsyncStorage.removeItem("rememberMeChecked");
        }

        Alert.alert("Success", "Login successful!");
        navigation.reset({
          index: 0,
          routes: [{ name: "PetSitterDashboardScreen" as never }],
        });
      }
    } catch (e: any) {
      const code = e?.code;
      const friendly = {
        "auth/wrong-password": "Login failed. Incorrect username or password.",
        "auth/invalid-credential":
          "Login failed. Incorrect username or password.",
        "auth/user-not-found": "Login failed. Incorrect username or password.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests":
          "Too many attempts. Please wait and try again.",
        "auth/user-disabled":
          "This account has been disabled. Please contact support.",
        "auth/network-request-failed":
          "Network error. Please check your connection and try again.",
      } as const;

      const msg =
        (code && friendly[code as keyof typeof friendly]) ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setResetMessage(null);
    if (!email) {
      setError("Enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetMessage("Password reset email sent.");
    } catch (e: any) {
      const msg = e?.message || "Failed to send reset email";
      setError(msg);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/login/login.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            style={styles.mainScrollView}
            contentContainerStyle={styles.mainScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Login Header */}
            <Animated.View style={{ opacity: fadeAnim }}>
              <Header title="Login" marginTop={hp(4)} />
            </Animated.View>

            {/* Logo - centered in middle */}
            <Animated.View
              style={[
                styles.centerContainer,
                { paddingVertical: hp(4) },
                {
                  opacity: fadeAnim,
                  transform: [{ scale: logoScaleAnim }],
                },
              ]}
            >
              <LogoCircle size={logoSize} />
            </Animated.View>

            {/* Quote banner */}
            <Animated.View
              style={[
                styles.topQuote,
                {
                  marginTop: hp(8),
                  marginBottom: hp(4),
                  paddingHorizontal: wp(5),
                  paddingVertical: spacing.lg,
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                  borderRadius: wp(6),
                  marginHorizontal: wp(4),
                },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }],
                },
              ]}
            >
              <Text
                style={[
                  styles.topQuoteText,
                  { fontSize: fonts.medium, lineHeight: fonts.medium * 1.4 },
                ]}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
              >
                "Your pet's happiness, our priority."
              </Text>
            </Animated.View>
            {/* Card container */}
            <Animated.View
              style={[
                styles.card,
                {
                  marginHorizontal: 0,
                  marginBottom: 0,
                  borderTopLeftRadius: wp(12),
                  borderTopRightRadius: wp(12),
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  paddingHorizontal: wp(6),
                  paddingTop: hp(2),
                  paddingBottom: hp(6),
                },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }],
                },
              ]}
            >
              {/* Username */}
              <Text
                style={[
                  styles.label,
                  { fontSize: fonts.large, marginTop: spacing.lg },
                ]}
              >
                Username
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={"#8B7355"}
                style={[
                  styles.input,
                  {
                    height: isSmallDevice ? 40 : 44,
                    borderRadius: isSmallDevice ? 18 : 20,
                    paddingHorizontal: spacing.lg,
                    fontSize: fonts.regular,
                  },
                ]}
              />

              {/* Password */}
              <Text
                style={[
                  styles.label,
                  { fontSize: fonts.large, marginTop: spacing.sm },
                ]}
              >
                Password
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={"#8B7355"}
                  secureTextEntry={!showPassword}
                  style={[
                    styles.input,
                    {
                      height: isSmallDevice ? 40 : 44,
                      borderRadius: isSmallDevice ? 18 : 20,
                      paddingHorizontal: spacing.lg,
                      paddingRight: 50,
                      fontSize: fonts.regular,
                      marginBottom: spacing.sm,
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: spacing.lg,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center",
                    paddingHorizontal: 8,
                  }}
                >
                  <Text style={{ fontSize: 18, color: "#808080" }}>
                    {showPassword ? "◯" : "●"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Remember + Forgot */}
              <View
                style={[
                  styles.row,
                  {
                    marginTop: spacing.sm,
                    gap: spacing.sm,
                    paddingHorizontal: 2,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => setRemember((r) => !r)}
                  activeOpacity={0.8}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      borderColor: "#BDAFA7",
                      borderWidth: 1.5,
                      backgroundColor: remember ? "#BDAFA7" : "transparent",
                      marginRight: spacing.sm,
                    }}
                  />
                  <Text style={[styles.helpText, { fontSize: fonts.medium }]}>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("PasswordResetScreen" as never)
                  }
                  style={{ marginLeft: "auto" }}
                >
                  <Text style={[styles.helpText, { fontSize: fonts.medium }]}>
                    Forgot Password ?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Signup prompt */}
              <Text
                style={[
                  styles.signupPrompt,
                  { fontSize: fonts.medium, marginTop: spacing.lg },
                ]}
              >
                First time using the app?
                {"\n"}
                Create your account.{" "}
                <Text
                  style={styles.signupLink}
                  onPress={() => navigation.navigate("SignupScreen" as never)}
                >
                  SignUp
                </Text>
              </Text>

              {/* Login button */}
              <View style={{ marginTop: spacing.sm }}>
                <Button
                  title={loading ? "Logging in..." : "Login"}
                  onPress={handleLogin}
                  variant="primary"
                  fullWidth={true}
                  style={{
                    minHeight: isSmallDevice ? 50 : 56,
                    borderRadius: isSmallDevice ? 24 : 28,
                  }}
                  textStyle={{ fontSize: fonts.large }}
                />
                {!!resetMessage && (
                  <Text
                    style={{
                      color: "#D7FFD7",
                      textAlign: "center",
                      marginTop: spacing.xs,
                      fontSize: fonts.medium,
                    }}
                  >
                    {resetMessage}
                  </Text>
                )}
                {!!error && (
                  <Text
                    style={{
                      color: "#FFDDDD",
                      textAlign: "center",
                      marginTop: spacing.sm,
                      fontSize: fonts.medium,
                    }}
                  >
                    {error}
                  </Text>
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safe: {
    flex: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  topQuote: {
    alignItems: "center",
  },
  topQuoteText: {
    color: COLORS.secondary,
    textAlign: "center",
    fontWeight: "600",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#3B2A24",
    flexGrow: 1,
  },
  label: {
    color: COLORS.white,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#E6E1DC",
    color: COLORS.secondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpText: {
    color: "#BDAFA7",
  },
  signupPrompt: {
    textAlign: "center",
    color: "#BDAFA7",
  },
  signupLink: {
    color: COLORS.white,
    fontWeight: "700",
  },
});

export default LoginScreen;
