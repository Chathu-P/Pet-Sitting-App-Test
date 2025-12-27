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

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "sitter";
  active: boolean;
}

const mockUsers: AdminUser[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@example.com",
    role: "owner",
    active: true,
  },
  {
    id: "u2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "sitter",
    active: true,
  },
];

const AdminUsersScreen: React.FC = () => {
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

          <AdminTabs active="users" />

          {/* Manage Users Card */}
          <View style={{ paddingHorizontal: wp(5), marginTop: 16 }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.cardTitle, { fontSize: fonts.medium }]}>
                Manage Users
              </Text>

              <View style={{ marginTop: spacing.lg }}>
                {mockUsers.map((u) => (
                  <View key={u.id} style={[styles.userRow, { padding: wp(3) }]}>
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

                      {/* Role pill */}
                      <View
                        style={[
                          styles.rolePill,
                          u.role === "owner"
                            ? styles.roleOwner
                            : styles.roleSitter,
                          { marginTop: 8 },
                        ]}
                      >
                        <Text
                          style={[styles.roleText, { fontSize: fonts.small }]}
                        >
                          {u.role}
                        </Text>
                      </View>
                    </View>

                    {/* Block Button */}
                    <Pressable
                      style={[
                        styles.blockBtn,
                        { paddingHorizontal: 14, paddingVertical: 10 },
                      ]}
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

  blockBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  blockText: { color: COLORS.white, fontWeight: "700" },
});

export default AdminUsersScreen;
