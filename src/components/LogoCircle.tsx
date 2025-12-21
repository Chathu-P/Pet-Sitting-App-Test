import React from "react";
import { View, Image, StyleSheet, ViewStyle } from "react-native";

interface LogoCircleProps {
  size: number;
  style?: ViewStyle;
  borderWidth?: number;
  borderColor?: string;
  shadowEnabled?: boolean;
}

const LogoCircle: React.FC<LogoCircleProps> = ({
  size,
  style,
  borderWidth = 0,
  borderColor = "#F5C47A",
  shadowEnabled = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      {/* White circular backdrop */}
      <View
        style={[
          styles.backdrop,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor,
            ...(shadowEnabled && styles.shadow),
          },
        ]}
      />

      {/* Logo image */}
      <Image
        source={require("../../assets/logo.png")}
        style={{
          width: size * 0.82,
          height: size * 0.82,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  backdrop: {
    position: "absolute",
    backgroundColor: "rgb(255, 255, 255)",
    zIndex: 0,
  },
  shadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default LogoCircle;
