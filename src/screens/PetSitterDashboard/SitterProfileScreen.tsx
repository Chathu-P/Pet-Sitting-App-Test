import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Pressable,
  ImageBackground,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sitterName, setSitterName] = useState("Sitter");
  const [rating, setRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [experienceDescription, setExperienceDescription] = useState("");
  const [availability, setAvailability] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [badges, setBadges] = useState<Array<{ name: string; icon: string }>>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

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

  // Fetch sitter profile data from separate collection
  useEffect(() => {
    const fetchSitterProfile = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch basic user info
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSitterName(userData?.fullName || "Sitter");
        }

        // Fetch sitter profile from separate collection
        const profileDoc = await getDoc(doc(db, "sitterProfiles", userId));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          
          // Set profile data
          setRating(profileData?.profile?.rating || 0);
          setTotalReviews(profileData?.profile?.totalReviews || 0);
          setYearsOfExperience(profileData?.experience?.yearsOfExperience || 0);
          setExperienceDescription(profileData?.experience?.description || "");
          setAvailability(profileData?.availability?.schedule || "");
          setAboutMe(profileData?.aboutMe || "");

          // Parse badges
          const badgeData = profileData?.badges || {};
          const badgeMap: { [key: string]: { name: string; icon: string } } = {
            "animal-lover": { name: "Animal Lover", icon: "favorite" },
            "puppy-pro": { name: "Puppy Pro", icon: "pets" },
          };

          const formattedBadges = Object.entries(badgeData)
            .filter(([_, value]: [string, any]) => value?.count > 0)
            .map(([key, _]: [string, any]) => ({
              name: badgeMap[key]?.name || key,
              icon: badgeMap[key]?.icon || "workspace-premium",
            }));
          setBadges(formattedBadges);

          // Parse skills
          const skills = profileData?.skills || {};
          const activeSkills: string[] = [];
          if (skills.bigDogs) activeSkills.push("Big Dogs");
          if (skills.smallDogs) activeSkills.push("Small Dogs");
          if (skills.puppies) activeSkills.push("Puppies");
          if (skills.cats) activeSkills.push("Cats");
          if (skills.kittens) activeSkills.push("Kittens");
          if (skills.medicalCare) activeSkills.push("Medical Care");
          if (skills.training) activeSkills.push("Training");
          if (skills.grooming) activeSkills.push("Grooming");
          if (skills.multiplePets) activeSkills.push("Multiple Pets");
          if (skills.seniorPets) activeSkills.push("Senior Pets");
          setSelectedSkills(activeSkills);
        }
      } catch (error) {
        console.error("Error fetching sitter profile:", error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchSitterProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      // Convert selected skills to object
      const skillsObject = {
        bigDogs: selectedSkills.includes("Big Dogs"),
        smallDogs: selectedSkills.includes("Small Dogs"),
        puppies: selectedSkills.includes("Puppies"),
        cats: selectedSkills.includes("Cats"),
        kittens: selectedSkills.includes("Kittens"),
        medicalCare: selectedSkills.includes("Medical Care"),
        training: selectedSkills.includes("Training"),
        grooming: selectedSkills.includes("Grooming"),
        multiplePets: selectedSkills.includes("Multiple Pets"),
        seniorPets: selectedSkills.includes("Senior Pets"),
      };

      // Save to sitterProfiles collection
      await setDoc(
        doc(db, "sitterProfiles", userId),
        {
          userId: userId,
          experience: {
            yearsOfExperience: yearsOfExperience,
            description: experienceDescription,
          },
          skills: skillsObject,
          availability: {
            schedule: availability,
          },
          aboutMe: aboutMe,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ImageBackground
          source={require("../../../assets/petsitter/Group 87.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={{ marginTop: 10, color: COLORS.secondary }}>Loading profile...</Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

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
                    {sitterName}
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
                    {rating > 0 ? rating.toFixed(1) : "N/A"}
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
                {badges.length > 0 ? (
                  <View style={[styles.badgesRow, { marginTop: 8 }]}>
                    {badges.slice(0, 2).map((badge, index) => (
                      <View key={index} style={[styles.badge, styles.badgeAccent]}>
                        <MaterialIcons
                          name={badge.icon as any}
                          size={14}
                          color={COLORS.white}
                        />
                        <Text
                          style={[
                            styles.badgeText,
                            { fontSize: fonts.small, marginLeft: 6 },
                          ]}
                        >
                          {badge.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.helperText, { fontSize: fonts.small, marginTop: 8 }]}>
                    No badges earned yet
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Experience */}
          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fonts.medium }]}>
                Experience
              </Text>
              <Text style={[styles.helperText, { fontSize: fonts.small, marginTop: 6 }]}>
                Years of Experience
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { fontSize: fonts.regular, marginTop: 8 },
                ]}
                placeholder="e.g., 5"
                placeholderTextColor="#999"
                value={yearsOfExperience > 0 ? yearsOfExperience.toString() : ""}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setYearsOfExperience(num);
                }}
                keyboardType="numeric"
              />
              <Text style={[styles.helperText, { fontSize: fonts.small, marginTop: 12 }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { fontSize: fonts.regular, marginTop: 8 },
                ]}
                placeholder="Describe your pet sitting experience"
                placeholderTextColor="#999"
                value={experienceDescription}
                onChangeText={setExperienceDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
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
              <TextInput
                style={[
                  styles.input,
                  { fontSize: fonts.regular, marginTop: 8 },
                ]}
                placeholder="e.g., Weekends & Evenings"
                placeholderTextColor="#999"
                value={availability}
                onChangeText={setAvailability}
              />
            </View>
          </View>

          {/* About Me */}
          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fonts.medium }]}>
                About Me
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { fontSize: fonts.regular, marginTop: 8 },
                ]}
                placeholder="Tell us about yourself and your love for pets"
                placeholderTextColor="#999"
                value={aboutMe}
                onChangeText={setAboutMe}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
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
              style={[
                styles.saveBtn,
                { paddingVertical: hp(1.8), opacity: saving ? 0.6 : 1 },
              ]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={[styles.saveText, { fontSize: fonts.regular }]}>
                  Save Profile
                </Text>
              )}
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

  input: {
    color: COLORS.secondary,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E0D9",
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
  },

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
