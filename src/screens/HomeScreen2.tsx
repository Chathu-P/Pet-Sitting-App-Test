import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Button from "../components/Button";
import Header from "../components/Header";
import LogoCircle from "../components/LogoCircle";
import { COLORS, FONTS } from "../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
  getSafeDimensions,
  getResponsiveShadow,
} from "../utils/responsive";

const HomeScreen2: React.FC = () => {
  const navigation = useNavigation();
  const { width, height, wp, hp, isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  // Responsive sizing
  const logoSize = getSafeDimensions(wp(35), 100, 160);
  const buttonWidth = getSafeDimensions(wp(80), 280, 340);
  const buttonHeight = isSmallDevice ? 50 : 56;

  // Decorative arcs removed

  return (
    <ImageBackground
      source={require("../../assets/Home/home2.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Banner */}
        <Header
          title="Good Hearts"
          titleSecondary="Happy Pets"
          minHeight={hp(15)}
          marginTop={hp(4)}
        />

        {/* Main Content */}
        <View style={[styles.main, { paddingHorizontal: wp(5) }]}>
          <View
            style={[
              styles.arcWrap,
              {
                height: hp(55),
                minHeight: 300,
              },
            ]}
          >
            {/* Logo positioned above arcs */}
            <View
              style={[
                styles.logoShadow,
                {
                  position: "absolute",
                  top: -logoSize * 0.3,
                  marginTop: hp(8),
                  zIndex: 10,
                },
              ]}
            >
              <LogoCircle
                size={logoSize}
                borderWidth={getSafeDimensions(wp(1), 3, 5)}
                borderColor="#F5C47A"
                shadowEnabled={true}
              />
            </View>

            {/* Content overlay on arcs */}
            <View
              style={[
                styles.arcContent,
                {
                  bottom: hp(5),
                  paddingHorizontal: wp(5),
                },
              ]}
            >
              {/* Top Tagline */}
              <Text
                style={[
                  styles.tagline,
                  {
                    fontSize: fonts.medium,
                    lineHeight: fonts.medium * 1.5,
                    marginTop: spacing.lg,
                    marginBottom: spacing.lg,
                  },
                ]}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
              >
                "Trust, care, and cuddles{"\n"}right at your pet's doorstep."
              </Text>

              {/* Buttons */}
              <View style={[styles.ctaColumn, { gap: spacing.lg }]}>
                <Button
                  title="Login"
                  onPress={() => navigation.navigate("LoginScreen" as never)}
                  variant="primary"
                  style={[
                    styles.pillButton,
                    {
                      width: buttonWidth,
                      minHeight: buttonHeight,
                      paddingHorizontal: spacing.xl,
                      borderRadius: buttonHeight / 2,
                    },
                    getResponsiveShadow(5),
                  ]}
                  textStyle={[styles.pillText, { fontSize: fonts.large }]}
                />
                <Button
                  title="Sign Up"
                  onPress={() => navigation.navigate("SignupScreen" as never)}
                  variant="primary"
                  style={[
                    styles.pillButton,
                    {
                      width: buttonWidth,
                      minHeight: buttonHeight,
                      paddingHorizontal: spacing.xl,
                      borderRadius: buttonHeight / 2,
                    },
                    getResponsiveShadow(5),
                  ]}
                  textStyle={[styles.pillText, { fontSize: fonts.large }]}
                />
              </View>

              {/* Bottom Tagline */}
              <Text
                style={[
                  styles.tagline,
                  {
                    fontSize: fonts.regular,
                    lineHeight: fonts.regular * 1.4,
                    marginTop: spacing.lg,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                "Your pets, our passion!"
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safe: {
    flex: 1,
  },
  main: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  logoShadow: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    backgroundColor: COLORS.white,
    borderColor: "#F5C47A",
    alignItems: "center",
    justifyContent: "center",
  },
  arcWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    overflow: "hidden",
  },
  /* Arc styles removed */
  arcContent: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
  },
  tagline: {
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "600",
  },
  ctaColumn: {
    width: "100%",
    alignItems: "center",
  },
  pillButton: {
    backgroundColor: "#E6E1DC",
  },
  pillText: {
    color: COLORS.secondary,
    fontWeight: "700",
  },
});

export default HomeScreen2;
