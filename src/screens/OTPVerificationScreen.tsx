import React, { useState, useRef } from "react";
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

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { wp, hp, isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const logoSize = getSafeDimensions(wp(35), 100, 160);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpBackspace = (index: number) => {
    if (!otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      // TODO: Implement actual OTP verification with Firebase
      // For now, just show a success message
      setMessage("OTP verified successfully!");

      // Navigate to password reset screen
      setTimeout(() => {
        (navigation as any).navigate("ResetPasswordScreen", {
          email: (route.params as any)?.email,
        });
      }, 2000);
    } catch (e: any) {
      setError(e?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      setError(null);
      setMessage(null);

      // TODO: Implement actual resend code logic with Firebase
      // For now, just show a success message
      setMessage("New OTP code sent to your email!");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
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
          {/* OTP Verification Header */}
          <Header title="Verify OTP" marginTop={hp(4)} />

          {/* Subtitle Quote (below header) */}
          <View style={styles.subtitleQuote}>
            <Text
              style={[
                styles.subtitleQuoteText,
                { fontSize: fonts.medium, color: COLORS.white },
              ]}
            >
              "Almost there! Verify your OTP."
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
            {/* OTP Code Label */}
            <Text
              style={[
                styles.label,
                { fontSize: fonts.large, marginBottom: spacing.lg },
              ]}
            >
              OTP Code
            </Text>

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref: any) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Backspace") {
                      handleOtpBackspace(index);
                    }
                  }}
                  maxLength={1}
                  keyboardType="number-pad"
                  editable={!loading}
                  style={[
                    styles.otpInput,
                    {
                      width: isSmallDevice ? 45 : 50,
                      height: isSmallDevice ? 45 : 50,
                      borderRadius: isSmallDevice ? 12 : 14,
                    },
                  ]}
                  placeholder="-"
                  placeholderTextColor="#CCCCCC"
                />
              ))}
            </View>

            {/* Error Message */}
            {error && (
              <Text
                style={[
                  styles.errorText,
                  { fontSize: fonts.medium, marginTop: spacing.md },
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
                  { fontSize: fonts.medium, marginTop: spacing.md },
                ]}
              >
                {message}
              </Text>
            )}

            {/* Verify Button */}
            <View style={{ marginTop: spacing.lg }}>
              <Button
                title={loading ? "Verifying..." : "Verify"}
                onPress={handleVerify}
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

            {/* Resend Code Link */}
            <View
              style={{
                marginTop: spacing.lg,
                alignItems: "center",
                gap: spacing.xs,
              }}
            >
              <Text style={[styles.resendText, { fontSize: fonts.regular }]}>
                Didn't receive a code?
              </Text>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendLoading}
              >
                <Text
                  style={[
                    styles.resendLink,
                    {
                      fontSize: fonts.regular,
                      opacity: resendLoading ? 0.6 : 1,
                    },
                  ]}
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </Text>
              </TouchableOpacity>
            </View>
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
  label: {
    color: COLORS.white,
    fontWeight: "500",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: "#D3D3D3",
    color: "#333",
    fontWeight: "600",
    fontSize: 24,
    textAlign: "center",
    borderRadius: 14,
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
  resendText: {
    color: "#B8A89F",
    textAlign: "center",
  },
  resendLink: {
    color: "#C9946F",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default OTPVerificationScreen;
