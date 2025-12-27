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
  Alert,
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
import { collection, onSnapshot, query, doc, getDoc, deleteDoc } from "firebase/firestore";
import { useAdminGuard } from "./useAdminGuard";
import AdminTabs from "./AdminTabs";
import AdminHeader from "./AdminHeader";

interface SittingRequest {
  id: string;
  petName: string;
  petType: string;
  breed: string;
  ownerId: string;
  sitterId?: string;
  ownerName: string; // Placeholder for list view, might be blank initially
  startDate: string;
  endDate: string;
  status: string;
  location: string;
  city: string;
  address: string;
  behaviorNotes: string;
  medicalNeeds: string; // implied from messageToVolunteers or other fields
  messageToVolunteers: string;
  emergencyContactName: string;
  emergencyPhone: string;
  createdAt: any;
}

interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

const AdminRequestsScreen: React.FC = () => {
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const navigation = useNavigation<any>();

  const [requests, setRequests] = useState<SittingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SittingRequest | null>(
    null
  );
  const [ownerDetails, setOwnerDetails] = useState<UserDetails | null>(null);
  const [sitterDetails, setSitterDetails] = useState<UserDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const navigateHome = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
  }, [navigation]);

  const { checking } = useAdminGuard(navigateHome);

  // Helper to safe format dates
  const formatDate = (dateVal: any) => {
    if (!dateVal) return "N/A";
    try {
      const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(date.getTime())) return "N/A";
      return date.toISOString().split("T")[0];
    } catch (e) {
      return "N/A";
    }
  };

  useEffect(() => {
    const q = query(collection(db, "requests"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: SittingRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          petName: data.petName || "Unknown Pet",
          petType: data.petType || "Unknown Type",
          breed: data.breed || data.petType || "Unknown Breed",
          ownerId: data.ownerId,
          sitterId: data.sitterId,
          ownerName: "Loading...", // We don't have this in the request doc usually
          startDate: formatDate(data.startDate),
          endDate: formatDate(data.endDate),
          status: data.status || "Unknown",
          location: data.location || data.city || "Unknown Location",
          city: data.city || "",
          address: data.address || "",
          behaviorNotes: data.behaviorNotes || "",
          medicalNeeds: "",
          messageToVolunteers: data.messageToVolunteers || "",
          emergencyContactName: data.emergencyContactName || "",
          emergencyPhone: data.emergencyPhone || "",
          createdAt: data.createdAt,
        });
      });
      setRequests(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserDetails = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          fullName: data.fullName || data.name || "Unknown",
          email: data.email || "N/A",
          phone: data.phone || "N/A",
          address: data.address || "N/A",
          role: data.role || "unknown",
        } as UserDetails;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
    return null;
  };

  const handleViewDetails = async (req: SittingRequest) => {
    setSelectedRequest(req);
    setModalVisible(true);
    setModalLoading(true);
    setOwnerDetails(null);
    setSitterDetails(null);

    // Fetch Owner
    if (req.ownerId) {
      const owner = await fetchUserDetails(req.ownerId);
      setOwnerDetails(owner);
    }

    // Fetch Sitter if assigned/completed
    if (req.sitterId && (req.status === "Accepted" || req.status === "Completed" || req.status === "Assigned")) {
      const sitter = await fetchUserDetails(req.sitterId);
      setSitterDetails(sitter);
    }

    setModalLoading(false);
  };

  const handleDeleteRequest = async (id: string) => {
    Alert.alert(
      "Delete Request",
      "Are you sure you want to delete this request permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "requests", id));
              Alert.alert("Success", "Request deleted successfully");
            } catch (error) {
              console.error("Error deleting request:", error);
              Alert.alert("Error", "Failed to delete request");
            }
          },
        },
      ]
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
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
          <AdminTabs active="requests" />

          <View style={{ paddingHorizontal: wp(5), marginTop: 16 }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.cardTitle, { fontSize: fonts.medium }]}>
                All Sitting Requests
              </Text>

              <View style={{ marginTop: spacing.lg }}>
                {requests.length === 0 ? (
                  <Text style={{ color: "#666", fontStyle: "italic" }}>
                    No requests found.
                  </Text>
                ) : (
                  requests.map((r) => (
                    <View
                      key={r.id}
                      style={[styles.requestRow, { padding: wp(3) }]}
                    >
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
                            style={[
                              styles.statusText,
                              { fontSize: fonts.small },
                            ]}
                          >
                            {r.status}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.metaText,
                          { fontSize: fonts.small, marginTop: 6 },
                        ]}
                      >
                        Location: {r.location}
                      </Text>
                      <Text
                        style={[
                          styles.metaText,
                          { fontSize: fonts.small, marginTop: 4 },
                        ]}
                      >
                        {r.startDate} to {r.endDate}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          gap: 12,
                          marginTop: spacing.lg,
                        }}
                      >
                        <Pressable
                          style={[
                            styles.viewBtn,
                            { paddingHorizontal: 16, paddingVertical: 10 },
                          ]}
                          onPress={() => handleViewDetails(r)}
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
                          onPress={() => handleDeleteRequest(r.id)}
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
                  ))
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* DETAILS MODAL */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { width: wp(90), height: hp(80) }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontSize: fonts.large }]}>
                  Request Details
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {modalLoading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                   <ActivityIndicator size="large" color="#2563EB" />
                   <Text style={{ marginTop: 10, color: "#666" }}>Loading details...</Text>
                </View>
              ) : (
                selectedRequest && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    
                    {/* SECTION: REQUEST INFO */}
                    <Text style={styles.sectionHeader}>Pet & Request Info</Text>
                    <View style={styles.infoBox}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Pet Name</Text>
                        <Text style={styles.detailValue}>{selectedRequest.petName}</Text>
                      </View>
                      <View style={styles.detailRow}>
                         <Text style={styles.detailLabel}>Type/Breed</Text>
                         <Text style={styles.detailValue}>{selectedRequest.petType} / {selectedRequest.breed}</Text>
                      </View>
                       <View style={styles.detailRow}>
                         <Text style={styles.detailLabel}>Dates</Text>
                         <Text style={styles.detailValue}>{selectedRequest.startDate} to {selectedRequest.endDate}</Text>
                      </View>
                      <View style={styles.detailRow}>
                         <Text style={styles.detailLabel}>Location</Text>
                         <Text style={styles.detailValue}>{selectedRequest.location}</Text>
                      </View>
                       <View style={styles.detailRow}>
                         <Text style={styles.detailLabel}>Status</Text>
                         <Text style={[styles.detailValue, {fontWeight: 'bold', color: '#2563EB'}]}>{selectedRequest.status}</Text>
                      </View>
                      <View style={[styles.detailRow, { borderBottomWidth: 0, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }]}>
                         <Text style={styles.detailLabel}>Notes</Text>
                         <Text style={[styles.detailValue, {textAlign: 'left', maxWidth: '100%'}]}>
                            {selectedRequest.behaviorNotes || selectedRequest.messageToVolunteers || "No notes provided."}
                         </Text>
                      </View>
                    </View>

                    {/* SECTION: OWNER INFO */}
                    <Text style={styles.sectionHeader}>Owner Details</Text>
                    <View style={[styles.infoBox, { backgroundColor: '#FFF5EB' }]}>
                      {ownerDetails ? (
                         <>
                           <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Name</Text>
                              <Text style={styles.detailValue}>{ownerDetails.fullName}</Text>
                           </View>
                           <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Email</Text>
                              <Text style={styles.detailValue}>{ownerDetails.email}</Text>
                           </View>
                           <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Phone</Text>
                              <Text style={styles.detailValue}>{ownerDetails.phone}</Text>
                           </View>
                           <View style={[styles.detailRow, {borderBottomWidth:0}]}>
                              <Text style={styles.detailLabel}>Address</Text>
                              <Text style={styles.detailValue}>{ownerDetails.address}</Text>
                           </View>
                         </>
                      ) : (
                        <Text style={{ color: '#999', padding: 10 }}>Owner information not available.</Text>
                      )}
                    </View>

                    {/* SECTION: SITTER INFO (If Accepted/Completed) */}
                    {(selectedRequest.status === "Accepted" || selectedRequest.status === "Completed" ||  selectedRequest.status === "Assigned") && (
                      <>
                        <Text style={styles.sectionHeader}>Sitter Details</Text>
                        <View style={[styles.infoBox, { backgroundColor: '#F0F9FF', marginBottom: 20 }]}>
                          {sitterDetails ? (
                            <>
                              <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Name</Text>
                                  <Text style={styles.detailValue}>{sitterDetails.fullName}</Text>
                              </View>
                              <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Email</Text>
                                  <Text style={styles.detailValue}>{sitterDetails.email}</Text>
                              </View>
                              <View style={[styles.detailRow, {borderBottomWidth:0}]}>
                                  <Text style={styles.detailLabel}>Phone</Text>
                                  <Text style={styles.detailValue}>{sitterDetails.phone}</Text>
                              </View>
                            </>
                          ) : (
                            <Text style={{ color: '#999', padding: 10 }}>Sitter information not found.</Text>
                          )}
                        </View>
                      </>
                    )}

                  </ScrollView>
                )
              )}

              <Pressable style={styles.closeBtn} onPress={closeModal}>
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

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

  // Modal Styles
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: "700",
    color: COLORS.secondary,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
    maxWidth: "65%",
    textAlign: "right",
  },
  closeBtn: {
    marginTop: 16,
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

export default AdminRequestsScreen;
