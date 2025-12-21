import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { COLORS, BORDER_RADIUS } from "../utils/constants";
import {
  useResponsiveButton,
  useResponsiveFonts,
  getResponsiveShadow,
} from "../utils/responsive";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const buttonSizes = useResponsiveButton();
  const fonts = useResponsiveFonts();

  const buttonStyle = [
    styles.button,
    {
      minHeight: buttonSizes.height,
      paddingHorizontal: buttonSizes.paddingHorizontal,
      paddingVertical: buttonSizes.paddingVertical,
      borderRadius: BORDER_RADIUS.xl,
    },
    fullWidth && ({ alignSelf: "stretch" } as ViewStyle),
    variant === "primary" && styles.primaryButton,
    variant === "secondary" && styles.secondaryButton,
    variant === "outline" && styles.outlineButton,
    (disabled || loading) && styles.disabledButton,
    variant !== "outline" && getResponsiveShadow(3),
    style,
  ];

  const textStyleCombined = [
    styles.buttonText,
    { fontSize: fonts.medium },
    variant === "primary" && styles.primaryButtonText,
    variant === "secondary" && styles.secondaryButtonText,
    variant === "outline" && styles.outlineButtonText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? COLORS.primary : COLORS.white}
        />
      ) : (
        <Text
          style={textStyleCombined}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "600",
  },
  primaryButtonText: {
    color: COLORS.secondary,
  },
  secondaryButtonText: {
    color: COLORS.white,
  },
  outlineButtonText: {
    color: COLORS.primary,
  },
});

export default Button;
