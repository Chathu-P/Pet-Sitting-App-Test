import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../utils/constants";
import { useResponsiveFonts } from "../../utils/responsive";

interface StepProgressLabelProps {
  currentStep: number;
  totalSteps: number;
  currentStepLabel: string;
}

const StepProgressLabel: React.FC<StepProgressLabelProps> = ({
  currentStep,
  totalSteps,
  currentStepLabel,
}) => {
  const fonts = useResponsiveFonts();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize: fonts.medium }]}>
        Step {currentStep} of {totalSteps}: {currentStepLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#5A4A42",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  text: {
    color: COLORS.white,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default StepProgressLabel;
