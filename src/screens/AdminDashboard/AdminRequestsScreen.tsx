import React, { useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, BORDER_RADIUS } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";
import { useAdminGuard } from "./useAdminGuard";
import AdminTabs from "./AdminTabs";
import AdminHeader from "./AdminHeader";

interface SittingRequest {
  id: string;
  petName: string;
  breed: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  status: "open" | "assigned" | "completed";
}

const mockRequests: SittingRequest[] = [
  {
    id: "r1",
    petName: "Max",
    breed: "Golden Retriever",
    ownerName: "John Doe",
    startDate: "2025-12-20",
    endDate: "2025-12-25",
    status: "open",
  },
  {
    id: "r2",
    petName: "Luna",
    breed: "Persian Cat",
    ownerName: "Emily Smith",
    startDate: "2025-12-18",
    endDate: "2025-12-22",
    status: "open",
  },
];

const AdminRequestsScreen: React.FC = () => {
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const navigation = useNavigation<any>();

  const navigateHome = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
  }, [navigation]);

  const { checking } = useAdminGuard(navigateHome);

  if (checking) {
    return (
      <SafeAreaView style={styles.safe}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#91521B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/admin/adminbg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingTop: hp(4), paddingBottom: 24 }}
        >
          <AdminHeader subtitle="Admin User" />

          <AdminTabs active="requests" />

          {/* All Sitting Requests */}
          <View style={{ paddingHorizontal: wp(5), marginTop: 16 }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.cardTitle, { fontSize: fonts.medium }]}>
                All Sitting Requests
              </Text>

              <View style={{ marginTop: spacing.md }}>
                {mockRequests.map((r) => (
                  <View
                    key={r.id}
                    style={[styles.requestRow, { padding: wp(3) }]}
                  >
                    {/* Top line: pet name - breed and status pill */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={[styles.petTitle, { fontSize: fonts.regular }]}
                      >
                        {r.petName} <Text style={styles.bullet}>-</Text>{" "}
                        <Text style={styles.breed}>{r.breed}</Text>
                      </Text>
                      <View
                        style={[
                          styles.statusPill,
                          { paddingHorizontal: 10, paddingVertical: 6 },
                        ]}
                      >
                        <Text
                          style={[styles.statusText, { fontSize: fonts.small }]}
                        >
                          {r.status}
                        </Text>
                      </View>
                    </View>

                    {/* Owner */}
                    <Text
                      style={[
                        styles.metaText,
                        { fontSize: fonts.small, marginTop: 6 },
                      ]}
                    >
                      Owner: {r.ownerName}
                    </Text>
                    {/* Dates */}
                    <Text
                      style={[
                        styles.metaText,
                        { fontSize: fonts.small, marginTop: 4 },
                      ]}
                    >
                      {r.startDate} to {r.endDate}
                    </Text>

                    {/* Actions */}
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        marginTop: spacing.md,
                      }}
                    >
                      <Pressable
                        style={[
                          styles.viewBtn,
                          { paddingHorizontal: 16, paddingVertical: 10 },
                        ]}
                      >
                        <MaterialIcons
                          name="remove-red-eye"
                          size={18}
                          color={COLORS.white}
                        />
                        <Text
                          style={[
                            styles.viewText,
                            { fontSize: fonts.regular, marginLeft: 8 },
                          ]}
                        >
                          View Details
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.removeBtn,
                          { paddingHorizontal: 16, paddingVertical: 10 },
                        ]}
                      >
                        <MaterialIcons
                          name="delete"
                          size={18}
                          color={COLORS.white}
                        />
                        <Text
                          style={[
                            styles.removeText,
                            { fontSize: fonts.regular, marginLeft: 8 },
                          ]}
                        >
                          Remove
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
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
  safe: { flex: 1, backgroundColor: "transparent" },
  scroll: { flex: 1 },
  header: {
    backgroundColor: "#4A3C35",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.white, fontWeight: "700" },
  headerSubtitle: { color: "rgba(255,255,255,0.8)" },

  tabBar: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#EEE7E1",
  },
  tabItemActive: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#E8DFD6",
  },
  tabText: { color: "#6B7280", fontWeight: "600" },
  tabTextActive: { color: "#4B5563", fontWeight: "700" },

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
  cardTitle: { color: COLORS.secondary, fontWeight: "700" },

  requestRow: {
    backgroundColor: "#F8F7F6",
    borderRadius: 16,
    marginBottom: 12,
  },
  petTitle: { color: COLORS.secondary, fontWeight: "700" },
  bullet: { color: COLORS.secondary },
  breed: { color: "#6B7280", fontWeight: "600" },
  metaText: { color: COLORS.secondary },

  statusPill: {
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
  },
  statusText: { color: "#374151", fontWeight: "700" },

  viewBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  viewText: { color: COLORS.white, fontWeight: "700" },

  removeBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  removeText: { color: COLORS.white, fontWeight: "700" },
});

export default AdminRequestsScreen;
