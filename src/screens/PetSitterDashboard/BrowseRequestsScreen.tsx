import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";

interface MatchRequest {
  id: string;
  petName: string;
  breed: string;
  ageYears: number;
  matchPct: number; // 0-100
  traits: string[]; // tags
  startDate: string;
  endDate: string;
  location: string;
  reasons: string[];
}

const BrowseRequestsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  const [tab, setTab] = useState<"all" | "best">("all");
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitterProfile, setSitterProfile] = useState<any>(null); // To store sitter's address, skills, etc.

  // Fetch Sitter Profile for Matching
  React.useEffect(() => {
    const fetchSitterData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const profileDoc = await getDoc(doc(db, "sitterProfiles", user.uid));
        
        const userData = userDoc.exists() ? userDoc.data() : {};
        const profileData = profileDoc.exists() ? profileDoc.data() : {};

        setSitterProfile({
           address: userData.address || "",
           city: userData.address ? userData.address.split(',')[0].trim() : "", // Simple city extraction
           skills: profileData.skills || {},
           yearsOfExperience: profileData.experience?.yearsOfExperience || 0,
           badges: profileData.badges || {}
        });
      } catch (e) {
        console.error("Error fetching sitter for matching:", e);
      }
    };
    fetchSitterData();
  }, []);

  // Calculate Best Match Score
  const calculateMatchScore = (req: any, sitter: any) => {
      if (!sitter) return { score: 70, reasons: [] }; // Default random baseline if no sitter data

      let score = 0;
      const reasons: string[] = [];

      // 1. Location Match (40%)
      const reqCity = (req.city || req.location || "").toLowerCase();
      const sitterCity = (sitter.city || "").toLowerCase();
      const sitterAddress = (sitter.address || "").toLowerCase();
      
      if (reqCity && (sitterCity.includes(reqCity) || sitterAddress.includes(reqCity))) {
          score += 40;
          reasons.push("Location is convenient for you");
      }

      // 2. Pet Type Match (30%)
      const type = (req.petType || "").toLowerCase(); // dog, cat
      const skills = sitter.skills || {};
      
      let hasPetSkill = false;
      if (type === "dog" && (skills.bigDogs || skills.smallDogs || skills.puppies)) hasPetSkill = true;
      else if (type === "cat" && (skills.cats || skills.kittens)) hasPetSkill = true;
      // Default to true if unspecified or generic match needed
      
      if (hasPetSkill) {
          score += 30;
          reasons.push(`You have experience with ${type}s`);
      }

      // 3. Special Needs / Skills (20%)
      const needs = (req.behaviorNotes || "").toLowerCase() + (req.messageToVolunteers || "").toLowerCase();
      let specialSkillNeeded = false;
      let hasSpecialSkill = false;

      if (needs.includes("medical") || needs.includes("medication")) {
          specialSkillNeeded = true;
          if (skills.medicalCare) hasSpecialSkill = true;
      }
      
      if (specialSkillNeeded) {
         if (hasSpecialSkill) {
             score += 20;
             reasons.push("You have the required medical skills");
         }
      } else {
         // Free points if no special needs
         score += 20;
      }

      // 4. Experience & Badges (10%)
      if (sitter.yearsOfExperience >= 2 || Object.keys(sitter.badges || {}).length > 0) {
          score += 10;
          reasons.push("Your experience matches");
      }

      return { score, reasons };
  };

  // Helper to safely format dates
  const formatDate = (dateVal: any) => {
    if (!dateVal) return "N/A";
    try {
      // Handle Firestore Timestamp if applicable
      const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(date.getTime())) return "N/A";
      return date.toISOString().split('T')[0];
    } catch (e) {
      return "N/A";
    }
  };

  // Fetch requests from Firestore
  React.useEffect(() => {
    const q = query(
      collection(db, "requests"),
      where("status", "in", ["Open", "Pending"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests: MatchRequest[] = [];
      
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        
        // CHECK IF EXPIRED
        if (data.endDate) {
           const endDate = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
           
           // Normalize comparison to prevent premature expiry of "today's" requests
           const today = new Date();
           today.setHours(0, 0, 0, 0); // Start of today

           const checkDate = new Date(endDate);
           checkDate.setHours(0, 0, 0, 0); // Start of end date

           if (!isNaN(checkDate.getTime()) && checkDate < today) {
               // Expired (End date is yesterday or earlier)
               // We do this silently in background
               updateDoc(doc(db, "requests", docSnap.id), {
                   status: "Completed",
                   completedAt: new Date()
               }).catch(err => console.error("Error auto-completing request:", err));
               return; // Don't add to list
           }
        }

        const { score, reasons } = calculateMatchScore(data, sitterProfile);
        
        fetchedRequests.push({
          id: docSnap.id,
          petName: data.petName || "Unknown Pet",
          breed: data.breed || data.petType || "Unknown Breed",
          ageYears: parseInt(data.age) || 0,
          matchPct: score > 0 ? score : 50, // Minimum 50 to look decent
          traits: data.temperament ? [data.temperament] : ["Friendly"],
          startDate: formatDate(data.startDate),
          endDate: formatDate(data.endDate),
          location: data.location || data.city || data.address || "Unknown Location",
          reasons: reasons.length > 0 ? reasons : ["General profile match"]
        });
      });
      
      setRequests(fetchedRequests);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sitterProfile]); // Re-run when sitterProfile loads to update scores

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
              Browse Requests
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Tabs */}
          <View
            style={[
              styles.tabs,
              { paddingHorizontal: wp(5), marginTop: hp(2), gap: spacing.nmd },
            ]}
          >
            <Pressable
              onPress={() => setTab("all")}
              style={[
                styles.tabBtn,
                tab === "all" ? styles.tabActive : styles.tabInactive,
              ]}
            >
              <Text style={[styles.tabText, { fontSize: fonts.regular }]}>
                All Requests
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTab("best")}
              style={[
                styles.tabBtn,
                tab === "best" ? styles.tabActiveAccent : styles.tabInactive,
              ]}
            >
              <MaterialIcons
                name="bolt"
                size={16}
                color="#7C3AED"
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabTextAccent, { fontSize: fonts.regular }]}>
                Best Match
              </Text>
            </Pressable>
          </View>

          {/* Cards */}
          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            {loading ? (
              <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 20 }} />
            ) : requests.length === 0 ? (
              <Text style={{ textAlign: "center", color: COLORS.secondary, marginTop: 20 }}>
                No open requests found.
              </Text>
            ) : (
              // Filter and Sort based on Tab
              requests
                // .filter(r => tab === "all" || r.matchPct >= 70) // Removed threshold as requested
                .sort((a, b) => tab === "best" ? b.matchPct - a.matchPct : 0) // Sort by match for 'best'
                .slice(0, tab === "best" ? 3 : undefined) // Top 3 for best match
                .map((r) => (
              <Pressable
                key={r.id}
                onPress={() => (navigation as any).navigate("RequestDetailsScreen", { requestId: r.id })}
                style={[styles.card, { padding: wp(4), marginBottom: hp(2) }]}
              >
                {/* Top row */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text style={[styles.petName, { fontSize: fonts.large }]}>
                      {r.petName}
                    </Text>
                    <Text style={[styles.subTitle, { fontSize: fonts.small }]}>
                      {r.breed} , {r.ageYears} years old
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.matchPill,
                      { paddingHorizontal: wp(3), paddingVertical: hp(0.6) },
                    ]}
                  >
                    <MaterialIcons name="bolt" size={14} color="#7C3AED" />
                    <Text style={[styles.matchText, { fontSize: fonts.small }]}>
                      {" "}
                      {r.matchPct}% Match
                    </Text>
                  </View>
                </View>

                {/* Traits */}
                <View style={[styles.traitsRow, { marginTop: spacing.nmd }]}>
                  {r.traits.map((t, i) => (
                    <View
                      key={`${r.id}-t-${i}`}
                      style={[
                        styles.traitChip,
                        { paddingHorizontal: wp(3), paddingVertical: hp(0.8) },
                      ]}
                    >
                      <Text
                        style={[styles.traitText, { fontSize: fonts.small }]}
                      >
                        {t}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Dates */}
                <View style={[styles.row, { marginTop: spacing.nmd }]}>
                  <MaterialIcons name="date-range" size={18} color="#7C3AED" />
                  <Text
                    style={[
                      styles.metaText,
                      { fontSize: fonts.small, marginLeft: 8 },
                    ]}
                  >
                    {r.startDate} to {r.endDate}
                  </Text>
                </View>

                {/* Location */}
                <View style={[styles.row, { marginTop: spacing.sm }]}>
                  <MaterialIcons name="location-on" size={18} color="#7C3AED" />
                  <Text
                    style={[
                      styles.metaText,
                      { fontSize: fonts.small, marginLeft: 8 },
                    ]}
                  >
                    {r.location}
                  </Text>
                </View>

                {/* Why great match */}
                <View style={{ marginTop: spacing.lg }}>
                  <Text style={[styles.whyTitle, { fontSize: fonts.small }]}>
                    Why this is a great match:
                  </Text>
                  {r.reasons.map((rsn, i) => (
                    <View
                      key={`${r.id}-rsn-${i}`}
                      style={[styles.row, { marginTop: 6 }]}
                    >
                      <MaterialIcons
                        name="check-circle"
                        size={18}
                        color="#16a34a"
                      />
                      <Text
                        style={[
                          styles.reasonText,
                          { fontSize: fonts.small, marginLeft: 8 },
                        ]}
                      >
                        {rsn}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
              ))
            )}
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

  tabs: { flexDirection: "row" },
  tabBtn: {
    backgroundColor: "#EEE7E1",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tabInactive: { opacity: 0.85 },
  tabActive: { backgroundColor: "#E8DFD6" },
  tabActiveAccent: { backgroundColor: "#F4EAFF" },
  tabText: { color: COLORS.secondary, fontWeight: "600" },
  tabTextAccent: { color: "#7C3AED", fontWeight: "600" },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: "#E8E0D9",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  petName: { color: COLORS.secondary, fontWeight: "700" },
  subTitle: { color: "#7E7E7E" },
  matchPill: {
    backgroundColor: "#F4EAFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  matchText: { color: "#7C3AED", fontWeight: "700" },

  traitsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  traitChip: {
    backgroundColor: "#EEE7E1",
    borderRadius: 16,
  },
  traitText: { color: COLORS.secondary, fontWeight: "600" },

  row: { flexDirection: "row", alignItems: "center" },
  metaText: { color: COLORS.secondary },
  whyTitle: { color: "#7C3AED", fontWeight: "700" },
  reasonText: { color: COLORS.secondary },
});

export default BrowseRequestsScreen;
