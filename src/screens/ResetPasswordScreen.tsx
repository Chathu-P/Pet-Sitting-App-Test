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
import { useNavigation, useRoute } from "@react-navigation/native";
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
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../services/firebase";

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { wp, hp, isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const logoSize = getSafeDimensions(wp(35), 100, 160);
  const { oobCode } = route.params ?? {};

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleResetPassword = async () => {
    setError(null);
    setMessage(null);

    // Validate inputs
    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!oobCode) {
      setError("Reset link is invalid or expired. Please request a new link.");
      return;
    }

    try {
      setLoading(true);

      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Password reset successfully!");

      (navigation as any).navigate("LoginScreen");
    } catch (e: any) {
      setError(e?.message || "Failed to reset password. Please try again.");
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
          {/* Reset Password Header */}
          <Header title="Reset Password" marginTop={hp(4)} />

          {/* Subtitle Quote (below header) */}
          <View style={styles.subtitleQuote}>
            <Text
              style={[
                styles.subtitleQuoteText,
                { fontSize: fonts.medium, color: COLORS.white },
              ]}
            >
              "Set a strong password to secure your account."
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
                marginTop: hp(4),
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
            {/* Form Title */}
            <Text
              style={[
                styles.formTitle,
                { fontSize: fonts.xlarge, marginBottom: spacing.md },
              ]}
            >
              Set New Password
            </Text>

            {/* New Password Label */}
            <Text
              style={[
                styles.label,
                { fontSize: fonts.large, marginBottom: spacing.sm },
              ]}
            >
              New Password
            </Text>

            {/* New Password Input */}
            <View style={{ marginBottom: spacing.lg, position: "relative" }}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter your new password"
                placeholderTextColor={"#8B7355"}
                secureTextEntry={!showNewPassword}
                editable={!loading}
                style={[
                  styles.input,
                  {
                    height: isSmallDevice ? 40 : 44,
                    borderRadius: isSmallDevice ? 18 : 20,
                    paddingHorizontal: spacing.lg,
                    paddingRight: 50,
                    fontSize: fonts.regular,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: "absolute",
                  right: spacing.lg,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                  paddingHorizontal: 8,
                }}
              >
                <Text style={{ fontSize: 18, color: "#8B7355" }}>
                  {showNewPassword ? "◯" : "●"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Confirm Password Label */}
            <Text
              style={[
                styles.label,
                { fontSize: fonts.large, marginBottom: spacing.sm },
              ]}
            >
              Confirm New Password
            </Text>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: spacing.lg, position: "relative" }}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Retype your new password"
                placeholderTextColor={"#8B7355"}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
                style={[
                  styles.input,
                  {
                    height: isSmallDevice ? 40 : 44,
                    borderRadius: isSmallDevice ? 18 : 20,
                    paddingHorizontal: spacing.lg,
                    paddingRight: 50,
                    fontSize: fonts.regular,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: spacing.lg,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                  paddingHorizontal: 8,
                }}
              >
                <Text style={{ fontSize: 18, color: "#8B7355" }}>
                  {showConfirmPassword ? "◯" : "●"}
                </Text>
              </TouchableOpacity>
            </View>

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

            {/* Reset & Continue Button */}
            <Button
              title={loading ? "Resetting..." : "Reset & Continue"}
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
  formTitle: {
    color: COLORS.white,
    fontWeight: "700",
    textAlign: "center",
    marginTop: SPACING.sm,
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
});

export default ResetPasswordScreen;
