import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../services/firebase";

const BADGES = [
  { id: "senior", label: "Senior Pet Friendly", icon: "👵" },
  { id: "routine", label: "Follows Routine Perfectly", icon: "🎯" },
  { id: "walk", label: "Leash & Walk Pro", icon: "🐕‍🦺" },
  { id: "feeding", label: "Clean Feeding Habits", icon: "🧺" },
  { id: "stress", label: "Stress-Free Care", icon: "🐾" },
  { id: "beyond", label: "Above & Beyond", icon: "💖" },
  { id: "home", label: "Home-Aware Caretaker", icon: "🏠" },
];

const GiveBadgeScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { sitterId, requestId } = (route.params as any) || {};
  
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleBadge = (id: string) => {
    if (selectedBadges.includes(id)) {
      setSelectedBadges(selectedBadges.filter(b => b !== id));
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
          status: "Completed",
          awardedBadges: selectedBadges
        });
      }

      // 2. Add Badges to Sitter Profile
      if (sitterId && sitterId !== "N/A") {
        const sitterRef = doc(db, "users", sitterId);
        await updateDoc(sitterRef, {
          badges: arrayUnion(...selectedBadges)
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
                style={[
                  styles.badgeCard,
                  isSelected && styles.selectedCard
                ]}
              >
                <Text style={styles.icon}>{badge.icon}</Text>
                <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                  {badge.label}
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
          style={[
            styles.submitButton,
            isSubmitting && { opacity: 0.5 }
          ]}
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
  container: { flex: 1, backgroundColor: "#F9F6F2" },
  header: { 
    backgroundColor: "#4A3A32", 
    padding: 20, 
    flexDirection: "row", 
    alignItems: "center",
    zIndex: 10 // Ensures header doesn't block clicks
  },
  backButton: { padding: 10 },
  headerText: { color: "#FFF", fontSize: 16 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginLeft: 20 },
  scrollContent: { padding: 20 },
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between" 
  },
  badgeCard: { 
    backgroundColor: "#FFF", 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15, 
    alignItems: "center",
    width: '48%', // Flexible width for grid
    borderWidth: 1,
    borderColor: "#EEE",
    cursor: 'pointer' // Force pointer cursor for web
  },
  selectedCard: { 
    backgroundColor: "#FF6B9D", 
    borderColor: "#FF6B9D" 
  },
  icon: { fontSize: 32 },
  label: { marginTop: 8, textAlign: "center", fontWeight: "600", color: "#4A3A32" },
  selectedLabel: { color: "#FFF" },
  footer: { 
    padding: 20, 
    backgroundColor: "#FFF", 
    borderTopWidth: 1, 
    borderTopColor: "#EEE",
    zIndex: 100 // Force footer to the front for touch events
  },
  submitButton: { 
    backgroundColor: "#CD7F4A", 
    padding: 18, 
    borderRadius: 12, 
    alignItems: "center",
    cursor: 'pointer' // Force pointer cursor for web
  },
  submitButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 }
});

export default GiveBadgeScreen;