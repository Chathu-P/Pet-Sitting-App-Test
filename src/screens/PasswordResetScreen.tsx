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
import LogoCircle from "../components/LogoCircle";
import Button from "../components/Button";
import Header from "../components/Header";
import { COLORS, BORDER_RADIUS, SPACING } from "../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
  getSafeDimensions,
} from "../utils/responsive";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";

const PasswordResetScreen: React.FC = () => {
  const navigation = useNavigation();
  const { wp, hp, isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const logoSize = getSafeDimensions(wp(35), 100, 160);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const actionCodeSettings = {
        url: "https://pet-sitting-app-cc7e7.firebaseapp.com/reset-password",
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
      setMessage("Reset link sent! Check your email.");

      // Send them back to login after a short pause
      setTimeout(() => {
        (navigation as any).navigate("LoginScreen");
      }, 1800);
    } catch (e: any) {
      const code = e?.code;
      let msg = e?.message || "Failed to send reset email";
      if (code === "auth/user-not-found") {
        msg = "No account found with this email.";
      } else if (code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/login/Group 74.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Forgot Password Header */}
          <Header title="Forgot Password" marginTop={hp(4)} />

          {/* Subtitle Quote (below header) */}
          <View style={styles.subtitleQuote}>
            <Text
              style={[
                styles.subtitleQuoteText,
                { fontSize: fonts.medium, color: COLORS.white },
              ]}
            >
              "Oops! Let's get you back on track."
            </Text>
          </View>

          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <LogoCircle size={logoSize} />
          </View>

          {/* Quote Section */}
          <View style={styles.quoteSection}>
            <Text
              style={[
                styles.quoteText,
                { fontSize: fonts.medium, color: COLORS.white },
              ]}
            >
              "Because your pet deserves trusted care."
            </Text>
          </View>

          {/* Card container */}
          <View
            style={[
              styles.card,
              {
                marginHorizontal: 0,
                marginTop: hp(10),
                borderTopLeftRadius: wp(12),
                borderTopRightRadius: wp(12),
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                paddingHorizontal: wp(6),
                paddingTop: hp(4),
                paddingBottom: hp(6),
              },
            ]}
          >
            {/* Email Label */}
            <Text
              style={[
                styles.label,
                { fontSize: fonts.large, marginBottom: spacing.sm },
              ]}
            >
              Email Address
            </Text>

            {/* Email Input */}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor={"#8B7355"}
              keyboardType="email-address"
              editable={!loading}
              style={[
                styles.input,
                {
                  height: isSmallDevice ? 40 : 44,
                  borderRadius: isSmallDevice ? 18 : 20,
                  paddingHorizontal: spacing.lg,
                  fontSize: fonts.regular,
                  marginBottom: spacing.lg,
                },
              ]}
            />

            {/* Error Message */}
            {error && (
              <Text
                style={[
                  styles.errorText,
                  { fontSize: fonts.medium, marginBottom: spacing.md },
                ]}
              >
                {error}
              </Text>
            )}

            {/* Success Message */}
            {message && (
              <Text
                style={[
                  styles.successText,
                  { fontSize: fonts.medium, marginBottom: spacing.md },
                ]}
              >
                {message}
              </Text>
            )}

            {/* Submit Button */}
            <Button
              title={loading ? "Sending..." : "Submit"}
              onPress={handleResetPassword}
              variant="primary"
              fullWidth={true}
              disabled={loading}
              style={{
                minHeight: isSmallDevice ? 50 : 56,
                borderRadius: isSmallDevice ? 24 : 28,
                opacity: loading ? 0.6 : 1,
              }}
              textStyle={{ fontSize: fonts.large }}
            />

            {/* Back to Login Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen" as never)}
              style={{ marginTop: spacing.lg, alignItems: "center" }}
            >
              <Text style={[styles.backLink, { fontSize: fonts.medium }]}>
                Suddenly remembered your password?
                <Text style={{ fontWeight: "600", color: "#C9946F" }}>
                  Back to Login
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-end",
  },
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  quoteSection: {
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    marginVertical: SPACING.md,
  },
  quoteText: {
    fontStyle: "italic",
    fontWeight: "500",
    textAlign: "center",
  },
  subtitleQuote: {
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  subtitleQuoteText: {
    fontStyle: "italic",
    fontWeight: "500",
    textAlign: "center",
  },
  card: {
    backgroundColor: "transparent",
    borderRadius: 24,
  },
  title: {
    color: COLORS.white,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#B8A89F",
    lineHeight: 20,
  },
  label: {
    color: COLORS.white,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#D3D3D3",
    color: "#333",
    fontWeight: "500",
    borderWidth: 0,
  },
  errorText: {
    color: "#E74C3C",
    fontWeight: "500",
  },
  successText: {
    color: "#27AE60",
    fontWeight: "500",
  },
  backLink: {
    color: "#B8A89F",
    textAlign: "center",
  },
});

export default PasswordResetScreen;
