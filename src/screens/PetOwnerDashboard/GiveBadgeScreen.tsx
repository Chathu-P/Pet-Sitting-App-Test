import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../services/firebase";

const BADGES = [
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

const GiveBadgeScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { sitterId, requestId } = (route.params as any) || {};

  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleBadge = (id: string) => {
    if (selectedBadges.includes(id)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== id));
    } else {
      setSelectedBadges([...selectedBadges, id]);
    }
  };

  const handleAwardBadges = async () => {
    // Immediate log to check if touch works
    console.log("Submit Clicked! Badges:", selectedBadges);

    if (selectedBadges.length === 0) {
      alert("Please select at least one badge!");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Update Request Status in Firestore
      if (requestId) {
        const requestRef = doc(db, "requests", requestId);
        await updateDoc(requestRef, {
          // status: "Completed", // Removed as per user request
          awardedBadges: selectedBadges,
        });
      }

      // 2. Add Badges to Sitter Profile
      if (sitterId && sitterId !== "N/A") {
        const sitterRef = doc(db, "users", sitterId);
        await updateDoc(sitterRef, {
          badges: arrayUnion(...selectedBadges),
        });
      }

      alert("Success! Badges awarded.");
      navigation.navigate("PetOwnerDashboardScreen"); //
    } catch (error: any) {
      console.error("Firebase Error:", error);
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.headerText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Award Badges</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {BADGES.map((badge) => {
            const isSelected = selectedBadges.includes(badge.id);
            return (
              <TouchableOpacity
                key={badge.id}
                onPress={() => toggleBadge(badge.id)}
                activeOpacity={0.7}
                style={[styles.badgeCard, isSelected && styles.selectedCard]}
              >
                <Text style={styles.icon}>{badge.icon}</Text>
                <Text
                  style={[styles.label, isSelected && styles.selectedLabel]}
                >
                  {badge.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FOOTER BUTTON - Using direct TouchableOpacity for web compatibility */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleAwardBadges}
          activeOpacity={0.7}
          disabled={isSubmitting}
          style={[styles.submitButton, isSubmitting && { opacity: 0.5 }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              Award {selectedBadges.length} Badges
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F5",
  },
  header: {
    backgroundColor: "#4A3A32",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 10,
    marginRight: 8,
  },
  headerText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  badgeCard: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 8,
    alignItems: "center",
    width: "48%",
    borderWidth: 2,
    borderColor: "#E8DDD8",
    cursor: "pointer",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    justifyContent: "center",
    minHeight: 140,
  },
  selectedCard: {
    backgroundColor: "#FF6B9D",
    borderColor: "#FF6B9D",
    elevation: 5,
    shadowColor: "#FF6B9D",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 40,
    marginBottom: 4,
  },
  label: {
    marginTop: 8,
    textAlign: "center",
    fontWeight: "700",
    color: "#4A3A32",
    fontSize: 13,
    lineHeight: 18,
  },
  selectedLabel: {
    color: "#FFF",
    fontWeight: "700",
  },
  footer: {
    padding: 20,
    paddingBottom: 24,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F0E5DD",
    zIndex: 100,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  submitButton: {
    backgroundColor: "#CD7F4A",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    cursor: "pointer",
    elevation: 3,
    shadowColor: "#CD7F4A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default GiveBadgeScreen;
