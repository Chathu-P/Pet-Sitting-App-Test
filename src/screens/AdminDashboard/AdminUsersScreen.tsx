import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { doc, updateDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { COLORS, BORDER_RADIUS } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";
import { useAdminGuard } from "./useAdminGuard";
import AdminTabs from "./AdminTabs";
import AdminHeader from "./AdminHeader";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "sitter";
  status: "active" | "blocked";
}

const AdminUsersScreen: React.FC = () => {
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const navigation = useNavigation<any>();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "sitter">(
    "all"
  );

  const navigateHome = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
  }, [navigation]);

  const { checking } = useAdminGuard(navigateHome);

  // Block user
  const handleBlockUser = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { status: "blocked" });
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "blocked" } : u))
      );
      Alert.alert("Success", "User has been blocked successfully");
    } catch (error) {
      console.error("Failed to block user:", error);
      Alert.alert("Error", "Failed to block user. Please try again.");
    }
  };

  // Unblock user
  const handleUnblockUser = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { status: "active" });
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "active" } : u))
      );
      Alert.alert("Success", "User has been unblocked successfully");
    } catch (error) {
      console.error("Failed to unblock user:", error);
      Alert.alert("Error", "Failed to unblock user. Please try again.");
    }
  };

  useEffect(() => {
    if (checking) return;

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const userList: AdminUser[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          userList.push({
            id: doc.id,
            name: data.fullName || data.name || "(No Name)",
            email: data.email || "",
            role: data.role === "owner" ? "owner" : "sitter",
            status: data.status || "active",
          });
        });
        userList.sort((a, b) => a.name.localeCompare(b.name));
        setUsers(userList);
        setLoadingUsers(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoadingUsers(false);
      }
    );

    return () => unsubscribe();
  }, [checking]);

  if (checking || loadingUsers) {
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

  const filteredUsers = users.filter(
    (u) => roleFilter === "all" || u.role === roleFilter
  );

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

          <AdminTabs active="users" />

          {/* Manage Users Card */}
          <View style={{ paddingHorizontal: wp(5), marginTop: 16 }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.cardTitle, { fontSize: fonts.medium }]}>
                Manage Users
              </Text>

              {/* Filter Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: spacing.lg,
                }}
              >
                <Pressable
                  style={[
                    styles.filterBtn,
                    roleFilter === "all" && styles.filterBtnActive,
                  ]}
                  onPress={() => setRoleFilter("all")}
                >
                  <Text
                    style={[
                      styles.filterBtnText,
                      roleFilter === "all" && styles.filterBtnTextActive,
                    ]}
                  >
                    All
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterBtn,
                    roleFilter === "owner" && styles.filterBtnActive,
                  ]}
                  onPress={() => setRoleFilter("owner")}
                >
                  <Text
                    style={[
                      styles.filterBtnText,
                      roleFilter === "owner" && styles.filterBtnTextActive,
                    ]}
                  >
                    Owners
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterBtn,
                    roleFilter === "sitter" && styles.filterBtnActive,
                  ]}
                  onPress={() => setRoleFilter("sitter")}
                >
                  <Text
                    style={[
                      styles.filterBtnText,
                      roleFilter === "sitter" && styles.filterBtnTextActive,
                    ]}
                  >
                    Sitters
                  </Text>
                </Pressable>
              </View>

              <View style={{ marginTop: spacing.lg }}>
                {filteredUsers.length === 0 ? (
                  <Text
                    style={{
                      color: COLORS.secondary,
                      textAlign: "center",
                      marginTop: 20,
                    }}
                  >
                    No users found.
                  </Text>
                ) : (
                  filteredUsers.map((u) => (
                    <View
                      key={u.id}
                      style={[styles.userRow, { padding: wp(3) }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.userName, { fontSize: fonts.regular }]}
                        >
                          {u.name}
                        </Text>
                        <Text
                          style={[
                            styles.userEmail,
                            { fontSize: fonts.small, marginTop: 4 },
                          ]}
                        >
                          {u.email}
                        </Text>

                        {/* Role and Status Pills */}
                        <View
                          style={{ flexDirection: "row", gap: 8, marginTop: 8 }}
                        >
                          <View
                            style={[
                              styles.rolePill,
                              u.role === "owner"
                                ? styles.roleOwner
                                : styles.roleSitter,
                            ]}
                          >
                            <Text
                              style={[
                                styles.roleText,
                                { fontSize: fonts.small },
                              ]}
                            >
                              {u.role}
                            </Text>
                          </View>

                          {u.status === "blocked" && (
                            <View style={styles.blockedPill}>
                              <Text
                                style={[
                                  styles.blockedText,
                                  { fontSize: fonts.small },
                                ]}
                              >
                                Blocked
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Block/Unblock Button */}
                      {u.status !== "blocked" ? (
                        <Pressable
                          style={[
                            styles.blockBtn,
                            { paddingHorizontal: 14, paddingVertical: 10 },
                          ]}
                          onPress={() => handleBlockUser(u.id)}
                        >
                          <MaterialIcons
                            name="block"
                            size={18}
                            color={COLORS.white}
                          />
                          <Text
                            style={[
                              styles.blockText,
                              { fontSize: fonts.regular, marginLeft: 8 },
                            ]}
                          >
                            Block
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          style={[
                            styles.unblockBtn,
                            { paddingHorizontal: 14, paddingVertical: 10 },
                          ]}
                          onPress={() => handleUnblockUser(u.id)}
                        >
                          <MaterialIcons
                            name="lock-open"
                            size={18}
                            color={COLORS.white}
                          />
                          <Text
                            style={[
                              styles.blockText,
                              { fontSize: fonts.regular, marginLeft: 8 },
                            ]}
                          >
                            Unblock
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  ))
                )}
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

  filterBtn: {
    backgroundColor: "#EEE7E1",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 0,
  },
  filterBtnActive: {
    backgroundColor: "#E8DFD6",
  },
  filterBtnText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  filterBtnTextActive: {
    color: "#4B5563",
    fontWeight: "700",
  },

  userRow: {
    backgroundColor: "#F8F7F6",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: { color: COLORS.secondary, fontWeight: "700" },
  userEmail: { color: "#7E7E7E" },

  rolePill: {
    alignSelf: "flex-start",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleOwner: { backgroundColor: "#FFEAD1" },
  roleSitter: { backgroundColor: "#F4EAFF" },
  roleText: { color: COLORS.secondary, fontWeight: "700" },

  blockedPill: {
    alignSelf: "flex-start",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FEE2E2",
  },
  blockedText: { color: "#DC2626", fontWeight: "700" },

  blockBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  unblockBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  blockText: { color: COLORS.white, fontWeight: "700" },
});

export default AdminUsersScreen;
