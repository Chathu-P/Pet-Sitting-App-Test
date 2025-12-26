// Calculates best match percentage using trait overlap and weighted scoring
export function calculateMatchPercentage(
  sitter: {
    traits?: string[];
    petType?: string;
    location?: string;
    experience?: number;
  },
  request: {
    traits?: string[];
    petType?: string;
    location?: string;
    requiredExperience?: number;
  }
): number {
  // 1. Trait Overlap
  const traitMatches = (sitter.traits || []).filter((t: string) =>
    (request.traits || []).includes(t)
  ).length;
  const traitScore =
    request.traits && request.traits.length > 0
      ? (traitMatches / request.traits.length) * 100
      : 0;

  // 2. Weighted Scoring
  let weightedScore = 0;
  let totalWeight = 0;

  // Example weights
  const weights = {
    petType: 0.3,
    location: 0.2,
    experience: 0.2,
    traits: 0.3,
  };

  // Pet type match
  if (sitter.petType && request.petType && sitter.petType === request.petType)
    weightedScore += weights.petType * 100;
  totalWeight += weights.petType;

  // Location match
  if (
    sitter.location &&
    request.location &&
    sitter.location === request.location
  )
    weightedScore += weights.location * 100;
  totalWeight += weights.location;

  // Experience match (example: years >= required)
  if ((sitter.experience || 0) >= (request.requiredExperience || 0))
    weightedScore += weights.experience * 100;
  totalWeight += weights.experience;

  // Trait score (from above)
  weightedScore += weights.traits * traitScore;
  totalWeight += weights.traits;

  // Final percentage
  return Math.round(weightedScore / totalWeight);
}
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";

interface MatchRequest {
  id: string;
  petName: string;
  breed: string;
  age: string;
  gender?: string;
  petType?: string;
  traits?: string[];
  startDate: string;
  endDate: string;
  location: string;
  reasons?: string[];
  status?: string;
  feedingSchedule?: string;
  walkRequirement?: boolean;
}

// Remove mockRequests, use state for requests

const BrowseRequestsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  const [tab, setTab] = useState<"all" | "best">("all");
  const [requests, setRequests] = useState<
    (MatchRequest & { matchPct?: number })[]
  >([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const snapshot = await getDocs(collection(db, "requests"));
        // Example sitter profile (replace with real sitter data)
        const sitter = {
          traits: ["Friendly", "Playful", "Energetic"],
          petType: "dog",
          location: "Downtown Area",
          experience: 2,
        };
        const fetched = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const status = data.status || "Open";
            
            // Only include requests with status "Pending" or "Open"
            if (status !== "Pending" && status !== "Open") {
              return null;
            }
            
            const requestObj: MatchRequest = {
              id: doc.id,
              petName: data.petName || "Unnamed Pet",
              breed: data.breed || data.petType || "Pet",
              age: data.age || "",
              gender: data.gender || "",
              petType: data.petType || "",
              traits: data.traits || [],
              startDate: data.startDate
                ? new Date(data.startDate).toLocaleDateString()
                : "",
              endDate: data.endDate
                ? new Date(data.endDate).toLocaleDateString()
                : "",
              location: data.location || data.city || "No location",
              reasons: [], // You can add logic for reasons if needed
              status: status,
              feedingSchedule: data.feedingSchedule || "",
              walkRequirement: data.walkRequirement !== undefined ? data.walkRequirement : true,
            };
            return {
              ...requestObj,
              matchPct: calculateMatchPercentage(sitter, requestObj),
            };
          })
          .filter((request) => request !== null) as (MatchRequest & { matchPct?: number })[];
        setRequests(fetched);
      } catch (e) {
        console.error("Error fetching requests:", e);
      }
    };
    fetchRequests();
  }, []);

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
              { paddingHorizontal: wp(5), marginTop: hp(2), gap: spacing.lg },
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
            {(tab === "best"
              ? [...requests]
                  .sort((a, b) => (b.matchPct || 0) - (a.matchPct || 0))
                  .slice(0, 3)
              : requests
            ).map((r) => (
              <Pressable
                key={r.id}
                onPress={() =>
                  (navigation as any).navigate("RequestDetailsScreen", {
                    requestId: r.id,
                  })
                }
              >
                <View
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
                      {r.breed}
                      {r.age ? `, ${r.age} years old` : ""}
                      {r.gender ? `, ${r.gender}` : ""}
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
                      {typeof r.matchPct === "number"
                        ? `${r.matchPct}% Match`
                        : "Match"}
                    </Text>
                  </View>
                </View>

                {/* Traits */}
                <View style={[styles.traitsRow, { marginTop: spacing.lg }]}>
                  {(r.traits || []).map((t, i) => (
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
                <View style={[styles.row, { marginTop: spacing.lg }]}>
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

                {/* Care Requirements */}
                <View style={{ marginTop: spacing.lg }}>
                  <Text style={[styles.whyTitle, { fontSize: fonts.small }]}>
                    Care Requirements:
                  </Text>
                  {r.feedingSchedule && (
                    <View style={[styles.row, { marginTop: 6 }]}>
                      <MaterialIcons name="schedule" size={16} color="#7C3AED" />
                      <Text
                        style={[
                          styles.reasonText,
                          { fontSize: fonts.small, marginLeft: 6 },
                        ]}
                      >
                        Feeding: {r.feedingSchedule}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.row, { marginTop: 6 }]}>
                    <MaterialIcons name="directions-walk" size={16} color="#7C3AED" />
                    <Text
                      style={[
                        styles.reasonText,
                        { fontSize: fonts.small, marginLeft: 6 },
                      ]}
                    >
                      {r.walkRequirement ? "Walks required" : "No walks required"}
                    </Text>
                  </View>
                </View>
                </View>
              </Pressable>
            ))}
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
