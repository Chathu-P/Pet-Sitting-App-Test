import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ImageBackground,
} from "react-native";
import Button from "../../components/Button";
import LogoCircle from "../../components/LogoCircle";
import TabBar from "../../components/TabBar";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
  getResponsiveShadow,
} from "../../utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

const PetOwnerDashboardScreen: React.FC = ({ navigation }: any) => {
  const { wp, hp, isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [activeTab, setActiveTab] = useState<"Home" | "Notifications">("Home");

  const profileSize = isSmallDevice ? 72 : 88;

  // Tab configuration
  const tabs = [
    { key: "Home", label: "Home", icon: "⌂" },
    { key: "Notifications", label: "Notifications", icon: "◈" },
  ];

  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey as "Home" | "Notifications");
  };

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserName(data?.fullName || "User");
            setUserEmail(
              data?.email || currentUser.email || "user@example.com"
            );
          }
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    };
    fetchUserData();
  }, []);

  const stats = [
    { label: "Active", value: 1 },
    { label: "Assigned", value: 0 },
    { label: "Complete", value: 0 },
  ];

  const requests = [
    {
      id: "req-1",
      petName: "Max",
      breed: "Golden Retriever",
      status: "Open",
      dateRange: "2025-12-20 to 2025-12-25",
      location: "Downtown Area",
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate("HomeScreen");
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card with background image */}
        <ImageBackground
          source={require("../../../assets/petowner/ownerbg.jpg")}
          style={[
            styles.headerCard,
            {
              marginTop: spacing.xxl,
              marginHorizontal: 0,
              paddingVertical: spacing.xl,
              paddingHorizontal: wp(5),
              borderRadius: BORDER_RADIUS.md,
            },
            getResponsiveShadow(8),
          ]}
          imageStyle={{ borderRadius: BORDER_RADIUS.md }}
          resizeMode="cover"
        >
          {/* Dark brown gradient overlay: bottom (opaque) -> top (transparent) */}
          <LinearGradient
            colors={["rgba(24, 11, 2, 1)", "rgba(205, 127, 74, 0.28)"]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
          {/* Top Icons Row */}
          <View style={styles.headerRow}>
            <LogoCircle size={60} />
            <TouchableOpacity
              onPress={handleSignOut}
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.sm,
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: BORDER_RADIUS.full,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: "600" }}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.welcomeText,
              { fontSize: fonts.xxxlarge, marginTop: spacing.md },
            ]}
          >
            Welcome Back! 👋
          </Text>

          {/* Profile Section */}
          <View style={styles.profileWrap}>
            <View
              style={[
                styles.profileCircle,
                {
                  width: profileSize,
                  height: profileSize,
                  borderRadius: profileSize / 2,
                  borderWidth: 4,
                  borderColor: "rgba(255, 255, 255, 0.4)",
                },
              ]}
            />
            <Text
              style={[
                styles.nameText,
                { fontSize: fonts.large, marginTop: spacing.md },
              ]}
            >
              {userName}
            </Text>
            <Text style={[styles.emailText, { fontSize: fonts.regular }]}>
              {userEmail}
            </Text>
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { marginTop: spacing.xl }]}>
            {stats.map((s) => (
              <Pressable
                key={s.label}
                onPress={() => {}}
                style={{ flex: 1, minWidth: 0 }}
              >
                <View
                  style={[
                    styles.statCard,
                    {
                      borderRadius: BORDER_RADIUS.lg,
                      paddingVertical: spacing.lg,
                      paddingHorizontal: spacing.lg,
                      minHeight: isSmallDevice ? 88 : 100,
                    },
                  ]}
                >
                  <Text style={[styles.statValue, { fontSize: fonts.xlarge }]}>
                    {s.value}
                  </Text>
                  <Text style={[styles.statLabel, { fontSize: fonts.small }]}>
                    {s.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ImageBackground>

        {/* Find a Pet Sitter button */}
        <View style={{ paddingHorizontal: wp(5), marginTop: spacing.xl }}>
          <Button
            title="+ Find a Pet Sitter"
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate("PetRequestDetails")}
            style={{
              borderRadius: BORDER_RADIUS.lg,
              minHeight: isSmallDevice ? 48 : 56,
            }}
            textStyle={{ fontSize: fonts.medium, fontWeight: "600" }}
          />
        </View>

        {/* My Requests section */}
        <View style={{ paddingHorizontal: wp(5), marginTop: spacing.xl }}>
          <Text
            style={[
              styles.sectionTitle,
              { fontSize: fonts.large, marginBottom: spacing.md },
            ]}
          >
            My Requests
          </Text>

          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { fontSize: fonts.large }]}>
                🐕
              </Text>
              <Text style={[styles.emptyTitle, { fontSize: fonts.medium }]}>
                No requests yet
              </Text>
              <Text style={[styles.emptySubtitle, { fontSize: fonts.regular }]}>
                Post a sitting request to get started
              </Text>
            </View>
          ) : (
            requests.map((r, index) => (
              <Pressable
                key={r.id}
                onPress={() =>
                  setExpandedRequest(expandedRequest === r.id ? null : r.id)
                }
              >
                <View
                  style={[
                    styles.requestCard,
                    getResponsiveShadow(4),
                    {
                      borderRadius: BORDER_RADIUS.lg,
                      padding: spacing.lg,
                      marginTop: spacing.md,
                      borderLeftWidth: 4,
                      borderLeftColor: COLORS.primary,
                      backgroundColor: COLORS.white,
                    },
                    expandedRequest === r.id && styles.requestCardExpanded,
                  ]}
                >
                  <View style={styles.requestHeader}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.petName,
                          { fontSize: fonts.large, marginBottom: spacing.xs },
                        ]}
                      >
                        {r.petName}
                      </Text>
                      <Text
                        style={[styles.breedText, { fontSize: fonts.regular }]}
                      >
                        {r.breed}
                      </Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusDot}>●</Text>
                      <Text
                        style={[styles.statusText, { fontSize: fonts.small }]}
                      >
                        {r.status}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      marginTop: spacing.md,
                      borderTopWidth: 1,
                      borderTopColor: "#E8E8E8",
                      paddingTop: spacing.md,
                    }}
                  >
                    <View style={styles.infoRow}>
                      <Text style={styles.infoIcon}>📅</Text>
                      <Text
                        style={[styles.infoText, { fontSize: fonts.regular }]}
                      >
                        {r.dateRange}
                      </Text>
                    </View>
                    <View style={[styles.infoRow, { marginTop: spacing.md }]}>
                      <Text style={styles.infoIcon}>📍</Text>
                      <Text
                        style={[styles.infoText, { fontSize: fonts.regular }]}
                      >
                        {r.location}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.cardActions,
                      {
                        marginTop: spacing.lg,
                        paddingTop: spacing.md,
                        borderTopWidth: 1,
                        borderTopColor: "#E8E8E8",
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate("GiveBadgeScreen", {
                          sitterId: "SITTER_ID_HERE",
                          sitterName: "Sitter Name",
                        })
                      }
                    >
                      <Text
                        style={[styles.actionText, { fontSize: fonts.small }]}
                      >
                        🏅 Give Badge
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text
                        style={[styles.actionText, { fontSize: fonts.small }]}
                      >
                        ✏️
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                    >
                      <Text
                        style={[styles.deleteText, { fontSize: fonts.small }]}
                      >
                        🗑️
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* Tab Bar */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: "#2D1B0F",
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.md,
  },
  iconCircle: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    color: COLORS.white,
    fontSize: 18,
  },
  welcomeText: {
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 28,
  },
  profileWrap: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  profileCircle: {
    backgroundColor: "#D9D9D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nameText: {
    color: COLORS.white,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  emailText: {
    color: "rgba(255,255,255,0.8)",
    textDecorationLine: "underline",
    marginTop: SPACING.xs,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statValue: {
    color: COLORS.white,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255,255,255,0.85)",
    opacity: 0.9,
    marginTop: SPACING.xs,
    fontWeight: "500",
  },
  sectionTitle: {
    color: COLORS.text,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
  },
  requestCardExpanded: {
    backgroundColor: "rgba(255, 140, 66, 0.02)",
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  petName: {
    color: COLORS.text,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  breedText: {
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  statusBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  statusDot: {
    color: COLORS.primary,
    fontSize: 12,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  infoIcon: {
    fontSize: 16,
    width: 24,
  },
  infoText: {
    color: COLORS.textLight,
    flex: 1,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.md,
  },
  actionButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FFE8E8",
    borderColor: "#FF6B6B",
  },
  deleteText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    borderStyle: "dashed",
  },
  emptyText: {
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    color: COLORS.textLight,
  },
});

export default PetOwnerDashboardScreen;
