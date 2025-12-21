import React, { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { COLORS } from "../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../utils/responsive";

interface HeaderProps {
  title?: string;
  titleSecondary?: string;
  children?: ReactNode;
  minHeight?: number;
  marginTop?: number;
  style?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({
  title,
  titleSecondary,
  children,
  minHeight,
  marginTop,
  style,
}) => {
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const { hp } = useResponsive();

  return (
    <View
      style={[
        styles.container,
        {
          minHeight: minHeight,
          marginTop: marginTop,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
    >
      {children ? (
        children
      ) : (
        <Text
          style={[
            styles.title,
            {
              fontSize: fonts.huge,
              fontWeight: "700",
              lineHeight: titleSecondary ? fonts.huge * 1.2 : undefined,
            },
          ]}
          numberOfLines={titleSecondary ? 2 : 1}
          adjustsFontSizeToFit={true}
        >
          {title}
          {titleSecondary && (
            <>
              {"\n"}
              <Text style={styles.titleSecondary}>{titleSecondary}</Text>
            </>
          )}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    color: COLORS.secondary,
    textAlign: "center",
    includeFontPadding: false,
  },
  titleSecondary: {
    color: COLORS.secondary,
  },
});

export default Header;
