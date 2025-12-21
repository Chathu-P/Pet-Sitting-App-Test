import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Pressable,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";

const SitterProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Big Dogs",
    "Puppies",
    "Medical Care",
  ]);

  const allSkills = [
    "Big Dogs",
    "Small Dogs",
    "Puppies",
    "Cats",
    "Kittens",
    "Medical Care",
    "Training",
    "Grooming",
    "Multiple Pets",
    "Senior Pets",
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
        source={require("../../../assets/petsitter/Group 87.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingTop: hp(4), paddingBottom: hp(4) }}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                paddingHorizontal: wp(5),
                paddingTop: hp(2),
                paddingBottom: hp(2),
              },
            ]}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.backBtn, { width: 36, height: 36 }]}
            >
              <MaterialIcons name="arrow-back" color={COLORS.white} size={20} />
            </Pressable>
            <Text style={[styles.headerTitle, { fontSize: fonts.large }]}>
              Sitter Profile
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Profile Summary Card */}
          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={[styles.name, { fontSize: fonts.medium }]}>
                    Sarah Johnson
                  </Text>
                  <Text style={[styles.subtitle, { fontSize: fonts.small }]}>
                    Pet Sitter
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <FontAwesome name="star" size={18} color="#FFD700" />
                  <Text
                    style={[
                      styles.rating,
                      { fontSize: fonts.medium, marginLeft: 6 },
                    ]}
                  >
                    4.8
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons
                    name="workspace-premium"
                    size={16}
                    color="#7C3AED"
                  />
                  <Text
                    style={[
                      styles.badgesTitle,
                      { fontSize: fonts.small, marginLeft: 6 },
                    ]}
                  >
                    Your Badges
                  </Text>
                </View>
                <View style={[styles.badgesRow, { marginTop: 8 }]}>
                  <View style={[styles.badge, styles.badgeAccent]}>
                    <MaterialIcons
                      name="favorite"
                      size={14}
                      color={COLORS.white}
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        { fontSize: fonts.small, marginLeft: 6 },
                      ]}
                    >
                      Animal Lover
                    </Text>
                  </View>
                  <View style={[styles.badge, styles.badgeAccent]}>
                    <MaterialIcons name="pets" size={14} color={COLORS.white} />
                    <Text
                      style={[
                        styles.badgeText,
                        { fontSize: fonts.small, marginLeft: 6 },
                      ]}
                    >
                      Puppy Pro
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Experience */}
          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fonts.medium }]}>
                Experience
              </Text>
              <Text
                style={[
                  styles.bodyText,
                  { fontSize: fonts.regular, marginTop: 8 },
                ]}
              >
                5 years of pet sitting
              </Text>
            </View>
          </View>

          {/* Skills & Specialties */}
          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons name="bolt" size={18} color="#7C3AED" />
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontSize: fonts.medium, marginLeft: 6 },
                  ]}
                >
                  Skills & Specialties
                </Text>
              </View>
              <Text
                style={[
                  styles.helperText,
                  { fontSize: fonts.small, marginTop: 6 },
                ]}
              >
                Select your areas of expertise:
              </Text>
              <View style={[styles.skillsWrap, { marginTop: 10 }]}>
                {allSkills.map((s) => {
                  const active = selectedSkills.includes(s);
                  return (
                    <Pressable
                      key={s}
                      onPress={() => toggleSkill(s)}
                      style={[
                        styles.skillChip,
                        active
                          ? styles.skillChipActive
                          : styles.skillChipInactive,
                      ]}
                    >
                      <Text
                        style={[
                          active ? styles.skillTextActive : styles.skillText,
                          { fontSize: fonts.small },
                        ]}
                      >
                        {s}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Availability */}
          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fonts.medium }]}>
                Availability
              </Text>
              <Text
                style={[
                  styles.bodyText,
                  { fontSize: fonts.regular, marginTop: 8 },
                ]}
              >
                Weekends & Evenings
              </Text>
            </View>
          </View>

          {/* About Me */}
          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fonts.medium }]}>
                About Me
              </Text>
              <Text
                style={[
                  styles.bodyText,
                  { fontSize: fonts.regular, marginTop: 8 },
                ]}
              >
                Passionate about animals with extensive experience
              </Text>
            </View>
          </View>

          {/* Save Profile */}
          <View
            style={{
              paddingHorizontal: wp(5),
              marginTop: hp(2),
              marginBottom: hp(4),
            }}
          >
            <Pressable
              style={[styles.saveBtn, { paddingVertical: hp(1.8) }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.saveText, { fontSize: fonts.regular }]}>
                Save Profile
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scroll: { flex: 1 },
  header: {
    backgroundColor: "#4A3C35",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.white, fontWeight: "700" },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: "#E8E0D9",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  name: { color: COLORS.secondary, fontWeight: "700" },
  subtitle: { color: "#7E7E7E" },
  rating: { color: COLORS.secondary, fontWeight: "700" },

  badgesTitle: { color: COLORS.secondary, fontWeight: "700" },
  badgesRow: { flexDirection: "row", gap: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeAccent: { backgroundColor: "#D946EF" },
  badgeText: { color: COLORS.white, fontWeight: "700" },

  sectionTitle: { color: COLORS.secondary, fontWeight: "700" },
  helperText: { color: "#7E7E7E" },
  bodyText: { color: COLORS.secondary },

  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  skillChip: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  skillChipActive: { backgroundColor: "#F4EAFF" },
  skillChipInactive: { backgroundColor: "#EEE7E1" },
  skillText: { color: COLORS.secondary, fontWeight: "600" },
  skillTextActive: { color: "#7C3AED", fontWeight: "700" },

  saveBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: COLORS.white, fontWeight: "700" },
});

export default SitterProfileScreen;
