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
  Modal,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, BORDER_RADIUS } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";
import { db } from "../../services/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useAdminGuard } from "./useAdminGuard";
import AdminTabs from "./AdminTabs";
import AdminHeader from "./AdminHeader";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "sitter";
  active: boolean;
  phone?: string;
  address?: string;
  createdAt?: any;
}

const AdminUsersScreen: React.FC = () => {
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const navigation = useNavigation<any>();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<"owner" | "sitter">("owner");

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const navigateHome = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
  }, [navigation]);

  const { checking } = useAdminGuard(navigateHome);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers: AdminUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "owner" || data.role === "sitter") {
          fetchedUsers.push({
            id: doc.id,
            name: data.fullName || data.name || "Unknown Name",
            email: data.email || "No Email",
            role: data.role as "owner" | "sitter",
            active: data.isActive !== false,
            phone: data.phone || "N/A",
            address: data.address || "N/A",
            createdAt: data.createdAt,
          });
        }
      });
      setUsers(fetchedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((u) => u.role === activeRole);

  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    return new Date(timestamp).toLocaleDateString();
  };

  if (checking || loading) {
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
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={[styles.cardTitle, { fontSize: fonts.medium }]}>
                  Manage Users
                </Text>
              </View>

              {/* Toggle Buttons */}
              <View style={[styles.toggleContainer, { marginTop: spacing.nmd }]}>
                <Pressable
                  style={[
                    styles.toggleBtn,
                    activeRole === "owner" && styles.toggleBtnActive,
                  ]}
                  onPress={() => setActiveRole("owner")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      activeRole === "owner" && styles.toggleTextActive,
                    ]}
                  >
                    Pet Owners
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.toggleBtn,
                    activeRole === "sitter" && styles.toggleBtnActive,
                  ]}
                  onPress={() => setActiveRole("sitter")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      activeRole === "sitter" && styles.toggleTextActive,
                    ]}
                  >
                    Pet Sitters
                  </Text>
                </Pressable>
              </View>

              <View style={{ marginTop: spacing.lg }}>
                {filteredUsers.length === 0 ? (
                  <Text style={{ color: "#666", fontStyle: "italic" }}>
                    No {activeRole === "owner" ? "Pet Owners" : "Pet Sitters"}{" "}
                    found.
                  </Text>
                ) : (
                  filteredUsers.map((u) => (
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

                      {/* Action Buttons */}
                      <View style={{ gap: 8 }}>
                           {/* View Button */}
                        <Pressable
                          onPress={() => handleViewDetails(u)}
                          style={[
                            styles.viewBtn,
                            { paddingHorizontal: 14, paddingVertical: 8 },
                          ]}
                        >
                          <MaterialIcons
                            name="visibility"
                            size={18}
                            color={COLORS.white}
                          />
                          <Text
                            style={[
                              styles.blockText,
                              { fontSize: fonts.small, marginLeft: 6 },
                            ]}
                          >
                            View
                          </Text>
                        </Pressable>
                        
                        {/* Block Button */}
                        <Pressable
                          style={[
                            styles.blockBtn,
                            { paddingHorizontal: 14, paddingVertical: 8 },
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
                              { fontSize: fonts.small, marginLeft: 6 },
                            ]}
                          >
                            Block
                          </Text>
                        </Pressable>
                    
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* User Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: wp(85) }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: fonts.large }]}>
                User Details
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView contentContainerStyle={{ paddingTop: 16 }}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Full Name</Text>
                  <Text style={styles.detailValue}>{selectedUser.name}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{selectedUser.email}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Role</Text>
                  <Text style={styles.detailValue}>
                    {selectedUser.role === "owner" ? "Pet Owner" : "Pet Sitter"}
                  </Text>
                </View>

                 <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                </View>

                 <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{selectedUser.address}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Joined Date</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedUser.createdAt)}</Text>
                </View>
                
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      selectedUser.active ? styles.statusActive : styles.statusInactive,
                    ]}
                  >
                     <Text style={[styles.statusText, {fontSize: 12}]}>
                        {selectedUser.active ? "Active" : "Inactive"}
                     </Text>
                  </View>
                </View>

              </ScrollView>
            )}
            
            <Pressable style={styles.closeBtn} onPress={closeModal}>
                <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleTextActive: {
    color: "#111827",
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

  blockBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  blockText: { color: COLORS.white, fontWeight: "700" },

  viewBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontWeight: "700",
    color: COLORS.secondary,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailLabel: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  detailValue: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#DEF7EC",
  },
  statusInactive: {
    backgroundColor: "#FDE8E8",
  },
  statusText: {
    fontWeight: "700",
    color: "#6B7280",
  },
  closeBtn: {
    marginTop: 24,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default AdminUsersScreen;
