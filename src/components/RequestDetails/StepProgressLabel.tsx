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
    backgroundColor: "#E8DCD0",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  text: {
    color: "#6B5D56",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default StepProgressLabel;
