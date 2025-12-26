import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
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

const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  const navigateHome = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
  }, [navigation]);

  const { checking } = useAdminGuard(navigateHome);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    active: 0,
    completed: 0,
  });

  useEffect(() => {
    let unsubUsers: (() => void) | undefined;
    let unsubRequests: (() => void) | undefined;
    // Dynamically import Firestore to avoid circular deps
    (async () => {
      const { collection, onSnapshot } = await import("firebase/firestore");
      const { db } = await import("../../services/firebase");
      // Users
      unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        setStats((prev) => ({ ...prev, totalUsers: snapshot.size }));
      });
      // Requests
      unsubRequests = onSnapshot(collection(db, "requests"), (snapshot) => {
        let active = 0;
        let completed = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === "completed") completed++;
          else if (data.status === "open" || data.status === "assigned")
            active++;
        });
        setStats((prev) => ({
          ...prev,
          totalRequests: snapshot.size,
          active,
          completed,
        }));
      });
    })();
    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubRequests) unsubRequests();
    };
  }, []);

  const [analytics, setAnalytics] = useState([
    { label: "Pet Owners", value: 0, max: 0, color: "#a855f7" },
    { label: "Pet Sitters", value: 0, max: 0, color: "#ec4899" },
    { label: "Open Requests", value: 0, max: 0, color: "#22c5b8" },
    { label: "Assigned Requests", value: 0, max: 0, color: "#9ca3af" },
    { label: "Completed", value: 0, max: 0, color: "#9ca3af" },
  ]);

  useEffect(() => {
    let unsubUsers: (() => void) | undefined;
    let unsubRequests: (() => void) | undefined;
    (async () => {
      const { collection, onSnapshot } = await import("firebase/firestore");
      const { db } = await import("../../services/firebase");
      // Users
      unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        let owners = 0;
        let sitters = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role === "owner") owners++;
          else if (data.role === "sitter") sitters++;
        });
        setAnalytics((prev) => {
          const updated = [...prev];
          updated[0].value = owners;
          updated[0].max = snapshot.size;
          updated[1].value = sitters;
          updated[1].max = snapshot.size;
          return updated;
        });
      });
      // Requests
      unsubRequests = onSnapshot(collection(db, "requests"), (snapshot) => {
        let open = 0;
        let assigned = 0;
        let completed = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === "open") open++;
          else if (data.status === "assigned") assigned++;
          else if (data.status === "completed") completed++;
        });
        setAnalytics((prev) => {
          const updated = [...prev];
          updated[2].value = open;
          updated[2].max = snapshot.size;
          updated[3].value = assigned;
          updated[3].max = snapshot.size;
          updated[4].value = completed;
          updated[4].max = snapshot.size;
          return updated;
        });
      });
    })();
    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubRequests) unsubRequests();
    };
  }, []);

  const ProgressRow = ({
    label,
    value,
    max,
    color,
  }: {
    label: string;
    value: number;
    max: number;
    color: string;
  }) => {
    const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
    return (
      <View style={{ marginTop: spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={[styles.progressLabel, { fontSize: fonts.small }]}>
            {label}
          </Text>
          <Text style={[styles.progressCount, { fontSize: fonts.small }]}>
            {value}
          </Text>
        </View>
        <View style={[styles.progressTrack, { height: 10 }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${pct}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

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
          contentContainerStyle={{ paddingTop: hp(4), paddingBottom: hp(4) }}
        >
          <AdminHeader subtitle="Admin User" />

          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            <View style={[styles.statsGrid]}>
              <View style={[styles.statCard, { padding: wp(4) }]}>
                <Text style={[styles.statValue, { fontSize: fonts.large }]}>
                  {stats.totalUsers}
                </Text>
                <Text style={[styles.statLabel, { fontSize: fonts.small }]}>
                  Total Users
                </Text>
              </View>
              <View style={[styles.statCard, { padding: wp(4) }]}>
                <Text style={[styles.statValue, { fontSize: fonts.large }]}>
                  {stats.totalRequests}
                </Text>
                <Text style={[styles.statLabel, { fontSize: fonts.small }]}>
                  Total Requests
                </Text>
              </View>
              <View style={[styles.statCard, { padding: wp(4) }]}>
                <Text style={[styles.statValue, { fontSize: fonts.large }]}>
                  {stats.active}
                </Text>
                <Text style={[styles.statLabel, { fontSize: fonts.small }]}>
                  Active
                </Text>
              </View>
              <View style={[styles.statCard, { padding: wp(4) }]}>
                <Text style={[styles.statValue, { fontSize: fonts.large }]}>
                  {stats.completed}
                </Text>
                <Text style={[styles.statLabel, { fontSize: fonts.small }]}>
                  Completed
                </Text>
              </View>
            </View>
          </View>

          <AdminTabs active="overview" />

          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.cardTitle, { fontSize: fonts.medium }]}>
                Analytics Overview
              </Text>
              {analytics.map((a) => (
                <ProgressRow
                  key={a.label}
                  label={a.label}
                  value={a.value}
                  max={a.max}
                  color={a.color}
                />
              ))}
            </View>
          </View>

          <View style={{ paddingHorizontal: wp(5), marginTop: hp(2) }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.cardTitle, { fontSize: fonts.medium }]}>
                Recent Activity
              </Text>
              <View style={{ alignItems: "center", marginTop: spacing.lg }}>
                <Text style={[styles.emptyText, { fontSize: fonts.regular }]}>
                  No recent activity to show
                </Text>
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

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#6B5344",
    borderRadius: BORDER_RADIUS.md,
  },
  statValue: { color: COLORS.white, fontWeight: "700" },
  statLabel: { color: "rgba(255,255,255,0.85)" },

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

  progressLabel: { color: COLORS.secondary },
  progressCount: { color: COLORS.secondary },
  progressTrack: {
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  emptyText: { color: "#9CA3AF" },
});

export default AdminDashboardScreen;
