import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "../../utils/constants";
import {
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";

export interface StepItem {
  id: number;
  label: string;
  key: string;
}

interface StepProgressBarProps {
  steps: StepItem[];
  currentStep: number;
  onStepPress?: (stepId: number) => void;
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({
  steps,
  currentStep,
  onStepPress,
}) => {
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const textColor = isActive || isCompleted ? "#453232" : "#8B7355";

          return (
            <View key={step.id} style={styles.itemWrap}>
              <TouchableOpacity
                onPress={() => onStepPress?.(step.id)}
                style={[
                  styles.pill,
                  {
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.lg,
                    backgroundColor: isActive
                      ? COLORS.primary
                      : isCompleted
                        ? "#FFE5D6"
                        : "#F5F0E8",
                    borderColor: isActive ? COLORS.primary : "#E8DCCC",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.label,
                    { fontSize: fonts.small, color: textColor },
                  ]}
                >
                  {step.label}
                </Text>
              </TouchableOpacity>
              {index !== steps.length - 1 && (
                <Text
                  style={[
                    styles.arrow,
                    {
                      color: "#D4A894",
                      marginHorizontal: spacing.xs,
                    },
                  ]}
                >
                  →
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F6F2",
    borderBottomWidth: 1,
    borderBottomColor: "#E8DCCC",
  },
  itemWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
  },
  label: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  arrow: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export default StepProgressBar;
