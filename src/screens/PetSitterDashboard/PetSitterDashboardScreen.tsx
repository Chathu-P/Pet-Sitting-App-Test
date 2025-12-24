import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";
import { getSafeDimensions } from "../../utils/responsive";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import { auth, db } from "../../services/firebase";
import LogoCircle from "../../components/LogoCircle";
import TabBar from "../../components/TabBar";
import NotificationsView from "../../components/Chat-Diary-Notification/NotificationsView";

interface RequestCard {
  id: string;
  petName: string;
  breed: string;
  startDate: string;
  endDate: string;
  location: string;
}

const PetSitterDashboardScreen: React.FC = () => {
  const { wp, hp, isSmallDevice } = useResponsive();
  const navigation = useNavigation<any>();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  // State for user data
  const [sitterName, setSitterName] = useState("Sitter");
  const [sitterEmail, setSitterEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"Home" | "Notifications">("Home");
  const [badges, setBadges] = useState<
    Array<{ name: string; count: number; icon: string }>
  >([]);
  const rating = 4.8;
  const activeJobs = 0;

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
            setSitterName(data?.fullName || "Sitter");
            setSitterEmail(data?.email || currentUser.email || "");

            // Fetch badges
            const badgeData = data?.badges || {};
            const badgeMap: { [key: string]: { name: string; icon: string } } =
            {
              "animal-lover": { name: "Animal Lover", icon: "🐾" },
              "puppy-pro": { name: "Puppy Pro", icon: "🐕" },
              "cat-whisperer": { name: "Cat Whisperer", icon: "🐱" },
              "reliable-care": { name: "Reliable Care", icon: "⭐" },
              "great-communicator": {
                name: "Great Communicator",
                icon: "💬",
              },
              "calm-patient": { name: "Calm & Patient", icon: "🧠" },
              "multi-pet-expert": { name: "Multi-Pet Expert", icon: "🐾" },
              "young-pet-specialist": {
                name: "Young Pet Specialist",
                icon: "🍼",
              },
              "senior-pet-friendly": {
                name: "Senior Pet Friendly",
                icon: "🧓",
              },
              "follows-routine": {
                name: "Follows Routine Perfectly",
                icon: "🎯",
              },
              "leash-walk-pro": { name: "Leash & Walk Pro", icon: "🐕‍🦺" },
              "clean-feeding": { name: "Clean Feeding Habits", icon: "🧺" },
              "stress-free-care": { name: "Stress-Free Care", icon: "🐾" },
              "above-beyond": { name: "Above & Beyond", icon: "💖" },
              "home-aware": { name: "Home-Aware Caretaker", icon: "🏡" },
            };

            const formattedBadges = Object.entries(badgeData)
              .filter(([_, value]: [string, any]) => value?.count > 0)
              .map(([key, value]: [string, any]) => ({
                name: badgeMap[key]?.name || key,
                count: value.count,
                icon: badgeMap[key]?.icon || "🏆",
              }));

            setBadges(formattedBadges);
          }
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    };
    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Do you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
          } catch (err) {
            console.error("Sign out failed:", err);
          }
        },
      },
    ]);
  };

  const availableRequests: RequestCard[] = [
    {
      id: "1",
      petName: "Max",
      breed: "Golden Retriever",
      startDate: "2025-12-20",
      endDate: "2025-12-25",
      location: "Downtown",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {activeTab === "Home" ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingTop: hp(4) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Background Image */}
          <ImageBackground
            source={require("../../../assets/petsitter/petsitter.jpg")}
            style={styles.headerBackground}
            imageStyle={{
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
            }}
          >
            {/* Dark brown gradient overlay: bottom (opaque) -> top (transparent) */}
            <LinearGradient
              colors={["rgba(86, 40, 7, 0.56)", "rgba(205, 127, 74, 0.28)"]}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            {/* Top Header: Logo | Sign Out */}
            <View
              style={[
                styles.topHeaderBar,
                {
                  paddingHorizontal: wp(5),
                  paddingTop: hp(2),
                  paddingBottom: hp(1),
                },
              ]}
            >
              <LogoCircle size={60} />

              <Pressable
                onPress={handleSignOut}
                style={[
                  styles.signOutBtn,
                  { paddingHorizontal: wp(4), paddingVertical: hp(1) },
                ]}
              >
                <Text style={[styles.signOutText, { fontSize: fonts.small }]}>
                  Sign Out
                </Text>
              </Pressable>
            </View>

            {/* Welcome Back Section */}
            <View
              style={[
                styles.headerSection,
                {
                  paddingHorizontal: wp(5),
                  paddingTop: hp(1),
                  paddingBottom: hp(2),
                  alignItems: "center",
                },
              ]}
            >
              <Text style={[styles.greeting, { fontSize: fonts.xxlarge }]}>
                Welcome Back! 👋
              </Text>

              {/* Avatar */}
              <View
                style={[
                  styles.headerAvatar,
                  {
                    width: getSafeDimensions(wp(20), 60, 80),
                    height: getSafeDimensions(wp(20), 60, 80),
                    marginTop: hp(2),
                  },
                ]}
              >
                <MaterialIcons
                  name="person"
                  size={getSafeDimensions(wp(12), 36, 48)}
                  color={COLORS.white}
                />
              </View>

              {/* Name and Email */}
              <Text
                style={[
                  styles.sitterName,
                  { fontSize: fonts.large, marginTop: spacing.md },
                ]}
              >
                {sitterName}
              </Text>
              <Text
                style={[
                  styles.sitterEmail,
                  { fontSize: fonts.small, marginTop: spacing.xs },
                ]}
              >
                {sitterEmail}
              </Text>
            </View>
          </ImageBackground>

          {/* Profile Card */}
          <View
            style={[
              styles.profileCard,
              { marginHorizontal: wp(5), marginVertical: hp(2), padding: wp(5) },
            ]}
          >
            {/* Avatar + Rating */}
            <View style={styles.profileTop}>
              <View style={[styles.avatar, { width: 60, height: 60 }]}>
                <MaterialIcons name="person" size={36} color={COLORS.white} />
              </View>

              <View style={styles.ratingContainer}>
                <View style={styles.ratingRow}>
                  <FontAwesome name="star" size={20} color="#FFD700" />
                  <Text
                    style={[
                      styles.ratingText,
                      { fontSize: fonts.large, marginLeft: spacing.sm },
                    ]}
                  >
                    {rating}
                  </Text>
                </View>
                <Text style={[styles.activeJobsText, { fontSize: fonts.medium }]}>
                  {activeJobs} Active Jobs
                </Text>
              </View>
            </View>

            {/* Badges */}
            <View style={[styles.badgesContainer, { marginTop: spacing.lg }]}>
              {badges.length > 0 ? (
                badges.map((badge, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.badge,
                      { paddingHorizontal: wp(4), paddingVertical: hp(1.2) },
                    ]}
                  >
                    <Text style={{ fontSize: 14, marginRight: spacing.sm }}>
                      {badge.icon}
                    </Text>
                    <Text style={[styles.badgeText, { fontSize: fonts.small }]}>
                      {badge.name} ({badge.count})
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={[styles.noBadgesText, { fontSize: fonts.small }]}>
                  No badges yet
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View
            style={[
              styles.actionButtonsContainer,
              { paddingHorizontal: wp(5), gap: spacing.md },
            ]}
          >
            <Pressable
              style={[
                styles.browseButton,
                { paddingVertical: hp(1.8), paddingHorizontal: wp(5) },
              ]}
              onPress={() => navigation.navigate("BrowseRequestsScreen" as never)}
            >
              <MaterialIcons
                name="search"
                size={20}
                color={COLORS.white}
                style={{ marginRight: spacing.sm }}
              />
              <Text
                style={[styles.browseButtonText, { fontSize: fonts.regular }]}
              >
                Browse Requests
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.editButton,
                { paddingVertical: hp(1.8), paddingHorizontal: wp(5) },
              ]}
              onPress={() => navigation.navigate("SitterProfileScreen" as never)}
            >
              <MaterialIcons
                name="edit"
                size={20}
                color={COLORS.white}
                style={{ marginRight: spacing.sm }}
              />
              <Text style={[styles.editButtonText, { fontSize: fonts.regular }]}>
                Edit Profile
              </Text>
            </Pressable>
          </View>

          {/* Messages and Diary */}
          <View style={{ flexDirection: "row", gap: spacing.md, paddingHorizontal: wp(5), marginTop: spacing.md }}>
            <Pressable
              style={[
                styles.browseButton,
                { paddingVertical: hp(1.8), backgroundColor: COLORS.white, borderWidth: 1, borderColor: "#6B5344" },
              ]}
              onPress={() => navigation.navigate("ChatListScreen")}
            >
              <Text style={{ color: "#6B5344", fontWeight: "600" }}>💬 Messages</Text>
            </Pressable>
            <Pressable
              style={[
                styles.browseButton,
                { paddingVertical: hp(1.8), backgroundColor: COLORS.white, borderWidth: 1, borderColor: "#6B5344" },
              ]}
              onPress={() => navigation.navigate("DiaryScreen")}
            >
              <Text style={{ color: "#6B5344", fontWeight: "600" }}>📖 Diary</Text>
            </Pressable>
          </View>

          {/* Available Requests Section */}
          <View
            style={[
              styles.requestsSection,
              { paddingHorizontal: wp(5), marginTop: hp(3), marginBottom: hp(3) },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: fonts.large }]}>
                Available Requests
              </Text>
              <Pressable
                onPress={() =>
                  navigation.navigate("BrowseRequestsScreen" as never)
                }
              >
                <Text style={[styles.viewAllLink, { fontSize: fonts.regular }]}>
                  View All
                </Text>
              </Pressable>
            </View>

            {/* Request Cards */}
            <View
              style={[
                styles.requestCardsContainer,
                { marginTop: spacing.lg, gap: spacing.md },
              ]}
            >
              {availableRequests.map((request) => (
                <Pressable
                  key={request.id}
                  style={[
                    styles.requestCard,
                    { padding: wp(4), marginBottom: spacing.md },
                  ]}
                >
                  <Text style={[styles.petName, { fontSize: fonts.large }]}>
                    {request.petName}
                  </Text>
                  <Text
                    style={[
                      styles.breed,
                      { fontSize: fonts.regular, marginTop: spacing.xs },
                    ]}
                  >
                    {request.breed}
                  </Text>

                  {/* Date Section */}
                  <View
                    style={[
                      styles.requestDetail,
                      {
                        marginTop: spacing.md,
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="date-range"
                      size={18}
                      color={COLORS.secondary}
                    />
                    <Text
                      style={[
                        styles.detailText,
                        { fontSize: fonts.small, marginLeft: spacing.sm },
                      ]}
                    >
                      {request.startDate} to {request.endDate}
                    </Text>
                  </View>

                  {/* Location Section */}
                  <View
                    style={[
                      styles.requestDetail,
                      {
                        marginTop: spacing.sm,
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="location-on"
                      size={18}
                      color={COLORS.secondary}
                    />
                    <Text
                      style={[
                        styles.detailText,
                        { fontSize: fonts.small, marginLeft: spacing.sm },
                      ]}
                    >
                      {request.location}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <NotificationsView />
      )}

      {/* Tab Bar */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBackground: {
    width: "100%",
  },
  topHeaderBar: {
    backgroundColor: "rgba(74, 60, 53, 0.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  signOutBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  signOutText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  headerSection: {
    backgroundColor: "rgba(74, 60, 53, 0.6)",
  },
  greeting: {
    color: COLORS.white,
    fontWeight: "700",
  },
  headerAvatar: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  sitterName: {
    color: COLORS.white,
    fontWeight: "700",
  },
  sitterEmail: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  profileCard: {
    backgroundColor: "#8B6F47",
    borderRadius: BORDER_RADIUS.lg,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  ratingContainer: {
    marginLeft: 16,
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  activeJobsText: {
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  badge: {
    backgroundColor: "#D946EF",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  noBadgesText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontStyle: "italic",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  browseButton: {
    flex: 1,
    backgroundColor: "#6B5344",
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  browseButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  editButton: {
    flex: 1,
    backgroundColor: "#FF8C42",
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  requestsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: COLORS.secondary,
    fontWeight: "700",
  },
  viewAllLink: {
    color: "#D946EF",
    fontWeight: "600",
  },
  requestCardsContainer: {
    marginBottom: 8,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: "#E8E0D9",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  petName: {
    color: COLORS.secondary,
    fontWeight: "700",
  },
  breed: {
    color: "#999",
    fontWeight: "500",
  },
  requestDetail: {
    marginBottom: 8,
  },
  detailText: {
    color: COLORS.secondary,
  },
});

export default PetSitterDashboardScreen;
