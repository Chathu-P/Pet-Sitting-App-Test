import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Button from "../components/Button";
import LogoCircle from "../components/LogoCircle";
import TabBar from "../components/TabBar";
import { COLORS } from "../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
  getSafeDimensions,
} from "../utils/responsive";

type HomeScreenProps = {
  onGetStarted?: () => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ onGetStarted }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"Home" | "Explore">("Home");
  const { wp, hp, isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  const handleGetStarted = () => {
    onGetStarted?.();
    navigation.navigate("HomeScreen2" as never);
  };

  // Animated values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const taglineTranslate = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(0.95)).current;

  // Responsive sizing
  const logoSize = getSafeDimensions(wp(35), 100, 160);

  // Tab configuration
  const tabs = [
    { key: "Home", label: "Home", icon: "⌂" },
    { key: "Explore", label: "Explore", icon: "◎" },
  ];

  const handleTabPress = (tabKey: string) => {
    if (tabKey === "Explore") {
      navigation.navigate("HomeScreen2" as never);
    } else {
      setActiveTab(tabKey as "Home" | "Explore");
    }
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          speed: 10,
          bounciness: 12,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslate, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          speed: 12,
          bounciness: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const renderHomeContent = () => (
    <>
      <View style={styles.overlay} />

      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.content,
            {
              paddingHorizontal: wp(5),
              paddingTop: hp(5),
              paddingBottom: hp(3),
            },
          ]}
        >
          {/* Welcome Title */}
          <View style={styles.headerSection}>
            <Animated.View
              style={[
                styles.welcomeBackdrop,
                {
                  opacity: titleOpacity,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                },
              ]}
            >
              <Text
                style={[
                  styles.welcomeText,
                  {
                    fontSize: fonts.xxxlarge,
                    textShadowRadius: 4,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                Welcome !
              </Text>
            </Animated.View>
          </View>

          {/* Logo and Tagline Section */}
          <View style={[styles.bottomSection, { paddingBottom: spacing.xl }]}>
            {/* Logo */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  marginBottom: spacing.lg,
                  transform: [{ scale: logoScaleAnim }],
                },
              ]}
            >
              <LogoCircle size={logoSize} />
            </Animated.View>

            {/* Tagline */}
            <Animated.Text
              style={[
                styles.tagline,
                {
                  fontSize: fonts.medium,
                  lineHeight: fonts.medium * 1.6,
                  marginBottom: spacing.xl,
                  paddingHorizontal: wp(5),
                  transform: [{ translateY: taglineTranslate }],
                },
              ]}
              numberOfLines={3}
              adjustsFontSizeToFit={true}
            >
              {
                "Because every pet deserves\na comforting home, even when\nyou're away."
              }
            </Animated.Text>

            {/* Get Started Button */}
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              <Button
                title="Get Started"
                onPress={handleGetStarted}
                variant="primary"
                style={{
                  width: wp(80),
                  maxWidth: 360,
                  paddingVertical: isSmallDevice ? spacing.md : spacing.lg,
                }}
              />
            </Animated.View>
          </View>
        </View>

        {/* Root Tab Bar */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </>
  );

  const renderExploreContent = () => (
    <>
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.exploreContainer,
            { paddingHorizontal: wp(5), paddingTop: hp(6) },
          ]}
        >
          <Text style={[styles.exploreTitle, { fontSize: fonts.xlarge }]}>
            Explore
          </Text>
          <Text
            style={[
              styles.exploreSubtitle,
              { fontSize: fonts.medium, marginTop: 12 },
            ]}
          >
            Find pet sitters and browse offers near you.
          </Text>

          <View style={{ marginTop: 20 }}>
            <Button
              title="Search Sitters"
              onPress={() => navigation.navigate("HomeScreen2" as never)}
            />
          </View>
        </View>

        {/* Root Tab Bar */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </>
  );

  return (
    <ImageBackground
      source={require("../../assets/Home/Home Screen.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {activeTab === "Home" ? renderHomeContent() : renderExploreContent()}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerSection: {
    alignItems: "center",
    width: "100%",
  },
  welcomeBackdrop: {
    backgroundColor: "rgba(145, 82, 23, 0.35)",
    alignItems: "center",
    width: "100%",
  },
  welcomeText: {
    fontWeight: "bold",
    color: COLORS.white,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
  },
  bottomSection: {
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  logoContainer: {
    alignItems: "center",
    zIndex: 1,
  },
  tagline: {
    color: COLORS.white,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    zIndex: 1,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  exploreContainer: {
    flex: 1,
  },
  exploreTitle: {
    color: COLORS.white,
    fontWeight: "700",
  },
  exploreSubtitle: {
    color: COLORS.white,
  },
});

export default HomeScreen;
