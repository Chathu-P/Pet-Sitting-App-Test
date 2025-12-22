import React, { useState } from "react";
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

const mockRequests: MatchRequest[] = [
  {
    id: "1",
    petName: "Max",
    breed: "Golden Retriever",
    ageYears: 3,
    matchPct: 70,
    traits: ["Friendly", "Playful", "Energetic"],
    startDate: "2025-12-20",
    endDate: "2025-12-25",
    location: "Downtown Area",
    reasons: [
      "You can handle energetic dogs",
      "Location and availability match",
    ],
  },
  {
    id: "2",
    petName: "Luna",
    breed: "Persian Cat",
    ageYears: 2,
    matchPct: 80,
    traits: ["Shy", "Calm", "Affectionate"],
    startDate: "2025-12-18",
    endDate: "2025-12-22",
    location: "Westside",
    reasons: ["You can handle medical care", "Location and availability match"],
  },
];

const BrowseRequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  const [tab, setTab] = useState<"all" | "best">("all");

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
              { paddingHorizontal: wp(5), marginTop: hp(2), gap: spacing.md },
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
            {mockRequests.map((r) => (
              <View
                key={r.id}
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
                <View style={[styles.traitsRow, { marginTop: spacing.md }]}>
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
                <View style={[styles.row, { marginTop: spacing.md }]}>
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

                {/* Chat Button */}
                <Pressable
                  style={{
                    marginTop: spacing.lg,
                    backgroundColor: COLORS.secondary,
                    paddingVertical: 12,
                    borderRadius: BORDER_RADIUS.md,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() =>
                    navigation.navigate("ChatScreen" as never, {
                      chatId: "request_" + r.id,
                      chatName: r.petName + "'s Owner",
                    } as never)
                  }
                >
                  <MaterialIcons
                    name="chat"
                    size={20}
                    color={COLORS.white}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: COLORS.white, fontWeight: "600" }}>
                    Chat with Owner
                  </Text>
                </Pressable>
              </View>
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
