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
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";

interface SittingRequest {
  id: string;
  petName: string;
  breed: string;
  ownerName: string;
  ownerId?: string;
  startDate: string;
  endDate: string;
  status: string;
  address?: string;
  age?: string;
  awardedBadges?: string[];
  behaviorNotes?: string;
  city?: string;
  createdAt?: any;
  emergencyContactName?: string;
  emergencyPhone?: string;
  feedingSchedule?: string;
  gender?: string;
  location?: string;
  messageToVolunteers?: string;
  neighborhood?: string;
  petType?: string;
  size?: string;
  temperament?: string;
  updatedAt?: any;
  walkRequirement?: boolean;
}

const AdminRequestsScreen: React.FC = () => {
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const navigation = useNavigation<any>();

  const [requests, setRequests] = useState<SittingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SittingRequest | null>(
    null
  );
  const [ownerDetails, setOwnerDetails] = useState<any>(null);

  const navigateHome = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
  }, [navigation]);

  const { checking } = useAdminGuard(navigateHome);

  const handleViewDetails = async (request: SittingRequest) => {
    setSelectedRequest(request);
    setOwnerDetails(null);
    if (request.ownerId) {
      try {
        const ownerDoc = await getDoc(doc(db, "users", request.ownerId));
        if (ownerDoc.exists()) {
          setOwnerDetails(ownerDoc.data());
        }
      } catch (e) {
        setOwnerDetails(null);
      }
    }
    setModalVisible(true);
  };

  const handleRemoveRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, "requests", requestId));
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (e) {
      console.error("Error removing request:", e);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "requests"));
        const reqs: SittingRequest[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            petName: data.petName || "",
            breed: data.breed || data.petType || "",
            ownerName: data.ownerName || data.ownerFullName || "",
            ownerId: data.ownerId || "",
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            status: data.status || "",
            address: data.address || "",
            age: data.age || "",
            awardedBadges: data.awardedBadges || [],
            behaviorNotes: data.behaviorNotes || "",
            city: data.city || "",
            createdAt: data.createdAt || null,
            emergencyContactName: data.emergencyContactName || "",
            emergencyPhone: data.emergencyPhone || "",
            feedingSchedule: data.feedingSchedule || "",
            gender: data.gender || "",
            location: data.location || "",
            messageToVolunteers: data.messageToVolunteers || "",
            neighborhood: data.neighborhood || "",
            petType: data.petType || "",
            size: data.size || "",
            temperament: data.temperament || "",
            updatedAt: data.updatedAt || null,
            walkRequirement: data.walkRequirement || false,
          };
        });
        setRequests(reqs);
      } catch (e) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    if (!checking) fetchRequests();
  }, [checking]);

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

          {/* All Sitting Requests */}
          <View style={{ paddingHorizontal: wp(5), marginTop: 16 }}>
            <View style={[styles.card, { padding: wp(4) }]}>
              <Text style={[styles.cardTitle, { fontSize: fonts.medium }]}>
                All Sitting Requests
              </Text>

              <View style={{ marginTop: spacing.lg }}>
                {requests.length === 0 ? (
                  <Text
                    style={{ color: COLORS.secondary, textAlign: "center" }}
                  >
                    No requests found.
                  </Text>
                ) : (
                  requests.map((r) => (
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
                            style={[
                              styles.statusText,
                              { fontSize: fonts.small },
                            ]}
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
                          onPress={() => handleRemoveRequest(r.id)}
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

        {/* Modal for request details */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Request Details</Text>
              {selectedRequest && (
                <ScrollView style={{ maxHeight: 400 }}>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Pet Name:</Text>{" "}
                    {selectedRequest.petName}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Pet Type:</Text>{" "}
                    {selectedRequest.petType}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Breed:</Text>{" "}
                    {selectedRequest.breed}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Age:</Text>{" "}
                    {selectedRequest.age}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Gender:</Text>{" "}
                    {selectedRequest.gender}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Size:</Text>{" "}
                    {selectedRequest.size}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Temperament:</Text>{" "}
                    {selectedRequest.temperament}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Behavior Notes:</Text>{" "}
                    {selectedRequest.behaviorNotes}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Feeding Schedule:</Text>{" "}
                    {selectedRequest.feedingSchedule}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Walk Requirement:</Text>{" "}
                    {selectedRequest.walkRequirement ? "Yes" : "No"}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Awarded Badges:</Text>{" "}
                    {selectedRequest.awardedBadges &&
                    selectedRequest.awardedBadges.length > 0
                      ? selectedRequest.awardedBadges.join(", ")
                      : "None"}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>
                      Message to Volunteers:
                    </Text>{" "}
                    {selectedRequest.messageToVolunteers}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Address:</Text>{" "}
                    {selectedRequest.address}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>City:</Text>{" "}
                    {selectedRequest.city}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Neighborhood:</Text>{" "}
                    {selectedRequest.neighborhood}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Location:</Text>{" "}
                    {selectedRequest.location}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Start Date:</Text>{" "}
                    {selectedRequest.startDate}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>End Date:</Text>{" "}
                    {selectedRequest.endDate}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Status:</Text>{" "}
                    {selectedRequest.status}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Created At:</Text>{" "}
                    {selectedRequest.createdAt
                      ? selectedRequest.createdAt.toDate
                        ? selectedRequest.createdAt.toDate().toLocaleString()
                        : String(selectedRequest.createdAt)
                      : ""}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Updated At:</Text>{" "}
                    {selectedRequest.updatedAt
                      ? selectedRequest.updatedAt.toDate
                        ? selectedRequest.updatedAt.toDate().toLocaleString()
                        : String(selectedRequest.updatedAt)
                      : ""}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>
                      Emergency Contact Name:
                    </Text>{" "}
                    {selectedRequest.emergencyContactName}
                  </Text>
                  <Text style={styles.modalText}>
                    <Text style={styles.modalLabel}>Emergency Phone:</Text>{" "}
                    {selectedRequest.emergencyPhone}
                  </Text>

                  {/* Owner details */}
                  <Text style={styles.ownerSectionTitle}>Owner Details</Text>
                  {ownerDetails ? (
                    <View>
                      <Text style={styles.modalText}>
                        <Text style={styles.modalLabel}>Name:</Text>{" "}
                        {ownerDetails.fullName || ownerDetails.name || ""}
                      </Text>
                      <Text style={styles.modalText}>
                        <Text style={styles.modalLabel}>Email:</Text>{" "}
                        {ownerDetails.email || ""}
                      </Text>
                      <Text style={styles.modalText}>
                        <Text style={styles.modalLabel}>Phone:</Text>{" "}
                        {ownerDetails.phone || ""}
                      </Text>
                      <Text style={styles.modalText}>
                        <Text style={styles.modalLabel}>Address:</Text>{" "}
                        {ownerDetails.address || ""}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.modalText}>
                      Loading owner details...
                    </Text>
                  )}
                </ScrollView>
              )}
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    minWidth: 300,
    maxWidth: "90%",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: COLORS.secondary,
  },
  modalText: {
    marginBottom: 6,
  },
  modalLabel: {
    fontWeight: "bold",
  },
  ownerSectionTitle: {
    marginTop: 12,
    fontWeight: "bold",
    fontSize: 16,
    color: COLORS.secondary,
  },
  modalCloseBtn: {
    marginTop: 18,
    alignSelf: "flex-end",
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  modalCloseBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AdminRequestsScreen;
