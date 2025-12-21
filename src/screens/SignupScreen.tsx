import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/Header";
import LogoCircle from "../components/LogoCircle";
import { COLORS } from "../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
  getSafeDimensions,
} from "../utils/responsive";

const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { wp, hp, isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const logoSize = getSafeDimensions(wp(30), 90, 140);

  return (
    <ImageBackground
      source={require("../../assets/signup/signup.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Signup Header */}
        <Header title="Sign Up" marginTop={hp(4)} />

        {/* Logo - positioned to overlap */}
        <View
          style={[
            styles.centerContainer,
            {
              paddingBottom: hp(0.1),
            },
          ]}
        >
          <LogoCircle size={logoSize} />
        </View>

        {/* Who You Are Section */}
        <View
          style={[
            styles.sectionHeader,
            {
              paddingHorizontal: wp(5),
              paddingVertical: spacing.lg,
              paddingTop: spacing.md,
              marginBottom: spacing.lg,
            },
          ]}
        >
          <Text
            style={[
              styles.taglineText,
              {
                fontSize: fonts.medium,
                lineHeight: fonts.medium * 1.4,
                color: COLORS.secondary,
              },
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit={true}
          >
            "Connecting pet owners with passionate animal lovers."
          </Text>
          <Text
            style={[
              styles.sectionHeaderText,
              {
                fontSize: fonts.huge,
                lineHeight: fonts.huge * 1.2,
                marginTop: spacing.lg,
              },
            ]}
          >
            Who You Are ?
          </Text>
        </View>

        {/* Selection Cards */}
        <View
          style={[
            styles.cardsContainer,
            {
              paddingHorizontal: wp(4),
              gap: wp(3),
              marginBottom: spacing.lg,
            },
          ]}
        >
          {/* Pet Owner Card */}
          <TouchableOpacity
            style={[
              styles.card,
              {
                borderRadius: wp(6),
                padding: spacing.md,
              },
            ]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("PetOwnerSignupScreen" as never)}
          >
            <View style={[styles.cardImageContainer, { borderRadius: wp(4) }]}>
              <Image
                source={require("../../assets/signup/petowner.jpg")}
                style={styles.cardImage}
                resizeMode="cover"
              />
            </View>
            <Text
              style={[
                styles.cardTitle,
                { fontSize: fonts.large, marginTop: spacing.sm },
              ]}
            >
              Pet Owner
            </Text>
            <Text
              style={[
                styles.cardDescription,
                {
                  fontSize: fonts.small,
                  lineHeight: fonts.small * 1.4,
                  marginTop: spacing.xs,
                },
              ]}
            >
              "Join the community that cares for your pets like family."
            </Text>
          </TouchableOpacity>

          {/* Pet Sitter Card */}
          <TouchableOpacity
            style={[
              styles.card,
              {
                borderRadius: wp(6),
                padding: spacing.md,
              },
            ]}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("PetSitterSignupScreen" as never)
            }
          >
            <View style={[styles.cardImageContainer, { borderRadius: wp(4) }]}>
              <Image
                source={require("../../assets/signup/petsitter.jpg")}
                style={styles.cardImage}
                resizeMode="cover"
              />
            </View>
            <Text
              style={[
                styles.cardTitle,
                { fontSize: fonts.large, marginTop: spacing.sm },
              ]}
            >
              Pet Sitter
            </Text>
            <Text
              style={[
                styles.cardDescription,
                {
                  fontSize: fonts.small,
                  lineHeight: fonts.small * 1.4,
                  marginTop: spacing.xs,
                },
              ]}
            >
              "Be the reason a pet feels comforted when their owner is away."
            </Text>
          </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  taglineContainer: {
    alignItems: "center",
  },
  taglineText: {
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "600",
  },
  sectionHeader: {
    backgroundColor: "rgba(189, 175, 167, 0.7)",
    alignItems: "center",
  },
  sectionHeaderText: {
    color: COLORS.secondary,
    textAlign: "center",
    fontWeight: "700",
  },
  cardsContainer: {
    flexDirection: "row",
  },
  card: {
    flex: 1,
    backgroundColor: "#3B2A24",
    alignItems: "center",
  },
  cardImageContainer: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    backgroundColor: "#E6E1DC",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardTitle: {
    color: COLORS.white,
    fontWeight: "700",
    textAlign: "center",
  },
  cardDescription: {
    color: "#BDAFA7",
    textAlign: "center",
    fontWeight: "400",
  },
});

export default SignupScreen;
