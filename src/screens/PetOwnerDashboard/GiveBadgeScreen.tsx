import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";

interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const AVAILABLE_BADGES: Badge[] = [
  {
    id: "animal-lover",
    name: "Animal Lover",
    icon: "🐾",
    color: "#FF6B9D",
    description: "Shows exceptional love and care for animals",
  },
  {
    id: "puppy-pro",
    name: "Puppy Pro",
    icon: "🐕",
    color: "#FFB347",
    description: "Expert at handling puppies and young dogs",
  },
  {
    id: "cat-whisperer",
    name: "Cat Whisperer",
    icon: "🐱",
    color: "#9B59B6",
    description: "Has a special connection with cats",
  },
  {
    id: "reliable-care",
    name: "Reliable Care",
    icon: "⭐",
    color: "#F39C12",
    description: "Consistently provides dependable care",
  },
  {
    id: "great-communicator",
    name: "Great Communicator",
    icon: "💬",
    color: "#3498DB",
    description: "Excellent at keeping owners updated",
  },
  {
    id: "calm-patient",
    name: "Calm & Patient",
    icon: "🧠",
    color: "#82C4E5",
    description: "Handles anxious or energetic pets gently",
  },
  {
    id: "multi-pet-expert",
    name: "Multi-Pet Expert",
    icon: "🐾",
    color: "#8E44AD",
    description: "Successfully cared for more than one pet at a time",
  },
  {
    id: "young-pet-specialist",
    name: "Young Pet Specialist",
    icon: "🍼",
    color: "#F8B739",
    description: "Great with puppies & kittens",
  },
  {
    id: "senior-pet-friendly",
    name: "Senior Pet Friendly",
    icon: "🧓",
    color: "#95A5A6",
    description: "Extra care for older pets (mobility, meds, comfort)",
  },
  {
    id: "follows-routine",
    name: "Follows Routine Perfectly",
    icon: "🎯",
    color: "#E74C3C",
    description: "Sticks closely to feeding, walking & sleep schedules",
  },
  {
    id: "leash-walk-pro",
    name: "Leash & Walk Pro",
    icon: "🐕‍🦺",
    color: "#27AE60",
    description: "Excellent at safe and enjoyable walks",
  },
  {
    id: "clean-feeding",
    name: "Clean Feeding Habits",
    icon: "🧺",
    color: "#16A085",
    description: "Maintains food/water areas hygienically",
  },
  {
    id: "stress-free-care",
    name: "Stress-Free Care",
    icon: "🐾",
    color: "#5DADE2",
    description: "Keeps pets relaxed while owner is away",
  },
  {
    id: "above-beyond",
    name: "Above & Beyond",
    icon: "💖",
    color: "#EC407A",
    description: "Did more than what was expected",
  },
  {
    id: "home-aware",
    name: "Home-Aware Caretaker",
    icon: "🏡",
    color: "#D35400",
    description: "Takes care of pet while being mindful of owner's home",
  },
];

const GiveBadgeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  const sitterId = route.params?.sitterId;
  const sitterName = route.params?.sitterName || "Sitter";

  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleBadge = (badgeId: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeId)
        ? prev.filter((id) => id !== badgeId)
        : [...prev, badgeId]
    );
  };

  const handleAwardBadges = async () => {
    if (selectedBadges.length === 0) {
      Alert.alert(
        "No Badges Selected",
        "Please select at least one badge to award."
      );
      return;
    }

    if (!sitterId) {
      Alert.alert("Error", "Sitter information is missing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to award badges.");
        return;
      }

      const sitterRef = doc(db, "users", sitterId);

      // Update each selected badge
      const badgeUpdates: any = {};
      selectedBadges.forEach((badgeId) => {
        badgeUpdates[`badges.${badgeId}.count`] = increment(1);
        badgeUpdates[`badges.${badgeId}.awardedBy`] = arrayUnion(
          currentUser.uid
        );
      });

      await updateDoc(sitterRef, badgeUpdates);

      Alert.alert(
        "Badges Awarded! 🎉",
        `You've successfully awarded ${selectedBadges.length} badge(s) to ${sitterName}.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Error awarding badges:", error);
      Alert.alert("Error", "Failed to award badges. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { marginTop: hp(4) }]}>
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
          Give Badge to {sitterName}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: hp(4) }}
      >
        {/* Instructions */}
        <View
          style={[
            styles.instructionsCard,
            {
              marginHorizontal: wp(5),
              marginTop: hp(2),
              padding: wp(4),
            },
          ]}
        >
          <Text style={[styles.instructionsTitle, { fontSize: fonts.regular }]}>
            Select badges to award
          </Text>
          <Text
            style={[
              styles.instructionsText,
              { fontSize: fonts.small, marginTop: spacing.xs },
            ]}
          >
            Choose one or more badges that best describe {sitterName}'s care.
            These will appear on their profile.
          </Text>
        </View>

        {/* Badge Grid */}
        <View
          style={[
            styles.badgeGrid,
            {
              paddingHorizontal: wp(5),
              marginTop: hp(3),
              gap: spacing.md,
            },
          ]}
        >
          {AVAILABLE_BADGES.map((badge) => {
            const isSelected = selectedBadges.includes(badge.id);
            return (
              <Pressable
                key={badge.id}
                onPress={() => toggleBadge(badge.id)}
                style={[
                  styles.badgeCard,
                  {
                    padding: wp(4),
                    backgroundColor: isSelected ? badge.color : COLORS.white,
                    borderColor: isSelected ? badge.color : "#E8E0D9",
                  },
                ]}
              >
                {isSelected && (
                  <View style={styles.checkMark}>
                    <MaterialIcons
                      name="check-circle"
                      size={24}
                      color={COLORS.white}
                    />
                  </View>
                )}
                <Text style={[styles.badgeIcon, { fontSize: 40 }]}>
                  {badge.icon}
                </Text>
                <Text
                  style={[
                    styles.badgeName,
                    {
                      fontSize: fonts.regular,
                      marginTop: spacing.sm,
                      color: isSelected ? COLORS.white : COLORS.secondary,
                    },
                  ]}
                >
                  {badge.name}
                </Text>
                <Text
                  style={[
                    styles.badgeDescription,
                    {
                      fontSize: fonts.small,
                      marginTop: spacing.xs,
                      color: isSelected
                        ? "rgba(255, 255, 255, 0.9)"
                        : "#7E7E7E",
                    },
                  ]}
                >
                  {badge.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Award Button */}
        <View
          style={{
            paddingHorizontal: wp(5),
            marginTop: hp(4),
          }}
        >
          <Pressable
            style={[
              styles.awardButton,
              {
                paddingVertical: hp(1.8),
                backgroundColor:
                  selectedBadges.length === 0 ? "#CCCCCC" : "#FF8C42",
              },
            ]}
            onPress={handleAwardBadges}
            disabled={selectedBadges.length === 0 || isSubmitting}
          >
            <Text style={[styles.awardButtonText, { fontSize: fonts.regular }]}>
              {isSubmitting
                ? "Awarding..."
                : `Award ${selectedBadges.length} Badge${
                    selectedBadges.length !== 1 ? "s" : ""
                  }`}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F4F2",
  },
  scroll: {
    flex: 1,
  },
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
  headerTitle: {
    color: COLORS.white,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  instructionsCard: {
    backgroundColor: "#FFF9E6",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  instructionsTitle: {
    color: COLORS.secondary,
    fontWeight: "700",
  },
  instructionsText: {
    color: "#7E7E7E",
    lineHeight: 20,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badgeCard: {
    width: "45%",
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1.5,
    alignItems: "center",
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    position: "relative",
  },
  checkMark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  badgeIcon: {
    marginTop: 4,
    fontSize: 32,
  },
  badgeName: {
    fontWeight: "700",
    textAlign: "center",
    fontSize: 13,
    marginTop: 2,
  },
  badgeDescription: {
    textAlign: "center",
    lineHeight: 15,
    fontSize: 11,
    marginTop: 1,
  },
  awardButton: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  awardButtonText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});

export default GiveBadgeScreen;
