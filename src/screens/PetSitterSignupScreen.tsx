import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const PetSitterSignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { wp, hp, isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const logoSize = getSafeDimensions(wp(30), 90, 140);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const isStrongPassword = (value: string) =>
    /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);

  const friendlyAuthError = (code: string, message: string) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please log in or use Forgot Password.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password is too weak. Use at least 6 characters.";
      default:
        return message || "Signup failed. Please try again.";
    }
  };

  const handleSignup = async () => {
    setError(null);
    if (!agreeToTerms) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }
    if (!email || !password || !confirmPassword) {
      setError("Please fill in email and password.");
      return;
    }
    if (!isValidEmail(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isStrongPassword(password)) {
      setError(
        "Password must be at least 8 characters and include a letter and a number."
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const uid = cred.user.uid;
      await setDoc(doc(db, "users", uid), {
        role: "sitter",
        fullName: fullName || "",
        email: email.trim(),
        phone: phone || "",
        address: address || "",
        createdAt: serverTimestamp(),
      });
      // Navigate to Pet Sitter Dashboard
      navigation.navigate("PetSitterDashboardScreen" as never);
    } catch (e: any) {
      const msg = friendlyAuthError(e?.code, e?.message);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/signup/petsitterSignup.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Header title="Sign Up" marginTop={hp(4)} />

          {/* Logo - centered */}
          <View
            style={[
              styles.centerContainer,
              {
                minHeight: hp(25),
                paddingBottom: hp(0.1),
              },
            ]}
          >
            <LogoCircle size={logoSize} />
          </View>

          {/* As a Pet Sitter Section */}
          <View
            style={[
              styles.sectionHeader,
              {
                paddingHorizontal: wp(5),
                paddingVertical: spacing.lg,
                paddingTop: spacing.xl,
                marginBottom: spacing.lg,
              },
            ]}
          >
            <Text
              style={[
                styles.quoteText,
                {
                  fontSize: fonts.medium,
                  lineHeight: fonts.medium * 1.4,
                  color: COLORS.secondary,
                },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
            >
              "Be the reason a pet feels comforted when their owner is away."
            </Text>
            <Text
              style={[
                styles.sectionHeaderText,
                {
                  fontSize: fonts.xlarge,
                  lineHeight: fonts.xlarge * 1.2,
                  marginTop: spacing.lg,
                  fontWeight: "700",
                },
              ]}
            >
              As a Pet Sitter
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.card,
              {
                borderTopLeftRadius: wp(12),
                borderTopRightRadius: wp(12),
                paddingHorizontal: wp(6),
                paddingTop: hp(3),
                paddingBottom: hp(4),
              },
            ]}
          >
            {/* Full Name */}
            <Text style={[styles.label, { fontSize: fonts.medium }]}>
              Full Name
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={"#8B7355"}
              style={[
                styles.input,
                {
                  height: isSmallDevice ? 44 : 48,
                  borderRadius: isSmallDevice ? 20 : 24,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  fontSize: fonts.medium,
                  marginBottom: spacing.md,
                },
              ]}
            />

            {/* Email Address */}
            <Text style={[styles.label, { fontSize: fonts.medium }]}>
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor={"#8B7355"}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  height: isSmallDevice ? 44 : 48,
                  borderRadius: isSmallDevice ? 20 : 24,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  fontSize: fonts.medium,
                  marginBottom: spacing.md,
                },
              ]}
            />

            {/* Address */}
            <Text style={[styles.label, { fontSize: fonts.medium }]}>
              Address
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your Address"
              placeholderTextColor={"#8B7355"}
              style={[
                styles.input,
                {
                  height: isSmallDevice ? 44 : 48,
                  borderRadius: isSmallDevice ? 20 : 24,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  fontSize: fonts.medium,
                  marginBottom: spacing.md,
                },
              ]}
            />

            {/* Contact Number */}
            <Text style={[styles.label, { fontSize: fonts.medium }]}>
              Contact Number
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your contact number"
              placeholderTextColor={"#8B7355"}
              keyboardType="phone-pad"
              style={[
                styles.input,
                {
                  height: isSmallDevice ? 44 : 48,
                  borderRadius: isSmallDevice ? 20 : 24,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  fontSize: fonts.medium,
                  marginBottom: spacing.md,
                },
              ]}
            />

            {/* Password */}
            <Text style={[styles.label, { fontSize: fonts.medium }]}>
              Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={"#8B7355"}
                secureTextEntry={!showPassword}
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    height: isSmallDevice ? 44 : 48,
                    borderRadius: isSmallDevice ? 20 : 24,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    fontSize: fonts.medium,
                    marginBottom: spacing.md,
                  },
                ]}
              />
              <TouchableOpacity
                style={[styles.eyeIcon, { top: isSmallDevice ? 10 : 12 }]}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIconText}>
                  {showPassword ? "◯" : "●"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={[styles.label, { fontSize: fonts.medium }]}>
              Confirm Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Retype your password"
                placeholderTextColor={"#8B7355"}
                secureTextEntry={!showConfirmPassword}
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    height: isSmallDevice ? 44 : 48,
                    borderRadius: isSmallDevice ? 20 : 24,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    fontSize: fonts.medium,
                    marginBottom: spacing.md,
                  },
                ]}
              />
              <TouchableOpacity
                style={[styles.eyeIcon, { top: isSmallDevice ? 10 : 12 }]}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeIconText}>
                  {showConfirmPassword ? "◯" : "●"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={[styles.termsContainer, { marginBottom: spacing.xl }]}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: agreeToTerms ? "#CFC7C1" : "transparent",
                  },
                ]}
              />
              <Text style={[styles.termsText, { fontSize: fonts.medium }]}>
                I Agree to All{" "}
                <Text style={styles.termsLink}>Terms and Conditions</Text>.
              </Text>
            </TouchableOpacity>

            {/* Login prompt */}
            <Text
              style={[
                styles.loginPrompt,
                { fontSize: fonts.medium, marginBottom: spacing.lg },
              ]}
            >
              Already have an account ?{" "}
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate("LoginScreen" as never)}
              >
                Login
              </Text>
            </Text>

            {/* Sign Up Button */}
            <Button
              title={loading ? "Creating account..." : "Sign Up"}
              onPress={handleSignup}
              variant="primary"
              fullWidth={true}
              style={{
                minHeight: isSmallDevice ? 50 : 56,
                borderRadius: isSmallDevice ? 24 : 28,
              }}
              textStyle={{ fontSize: fonts.large }}
            />
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
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  quoteText: {
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "600",
  },
  sectionHeader: {
    backgroundColor: "rgba(189, 175, 167, 0.7)",
    alignItems: "center",
  },
  sectionHeaderText: {
    color: COLORS.secondary,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(59, 42, 36, 0.9)",
  },
  label: {
    color: "#CFC7C1",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#E6E1DC",
    color: COLORS.secondary,
  },
  addLocationBtn: {
    backgroundColor: "#CFC7C1",
    alignItems: "center",
    alignSelf: "center",
  },
  addLocationText: {
    color: COLORS.secondary,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
  },
  eyeIconText: {
    fontSize: 20,
    color: "#808080",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "#CFC7C1",
    marginRight: 8,
  },
  termsText: {
    color: "#CFC7C1",
    flex: 1,
  },
  termsLink: {
    color: "#CFC7C1",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  loginPrompt: {
    textAlign: "center",
    color: "#CFC7C1",
  },
  loginLink: {
    color: COLORS.white,
    fontWeight: "700",
  },
});

export default PetSitterSignupScreen;
