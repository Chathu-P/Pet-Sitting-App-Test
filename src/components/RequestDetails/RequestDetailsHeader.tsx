import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LogoCircle from "../LogoCircle";
import { COLORS } from "../../utils/constants";
import {
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";

interface RequestDetailsHeaderProps {
  title: string;
  onBack: () => void;
  logoSize?: number;
}

const RequestDetailsHeader: React.FC<RequestDetailsHeaderProps> = ({
  title,
  onBack,
  logoSize = 40,
}) => {
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  return (
    <View
      style={[
        styles.headerTop,
        {
          marginTop: spacing.xxl,
          marginBottom: spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onBack}
        style={[styles.backButton, { width: 40, height: 40 }]}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { fontSize: fonts.large }]}>
        {title}
      </Text>
      <LogoCircle size={logoSize} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2D1B0F",
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  headerTitle: {
    color: COLORS.white,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
});

export default RequestDetailsHeader;
