import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

// Services & Components
import { auth, db } from "../../services/firebase";
import Button from "../../components/Button";
import LogoCircle from "../../components/LogoCircle";
import TabBar from "../../components/TabBar";

// Utils
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
  getResponsiveShadow,
} from "../../utils/responsive";

const PetOwnerDashboardScreen: React.FC = ({ navigation }: any) => {
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  // State
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [activeTab, setActiveTab] = useState<"Home" | "Notifications">("Home");
  const [requests, setRequests] = useState<any[]>([]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [sitterDetails, setSitterDetails] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const tabs = [
    { key: "Home", label: "Home", icon: "⌂" },
    { key: "Notifications", label: "Notifications", icon: "◈" },
  ];

  // 1. DATA LISTENER
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserName(data?.fullName || "User");
          setUserEmail(data?.email || currentUser.email || "user@example.com");
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    };
    fetchUserData();

    const q = query(
      collection(db, "requests"),
      where("ownerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(fetchedRequests);
    });

    return () => unsubscribe();
  }, []);

  // 2. HANDLERS
  const handleDeleteRequest = async (requestId: string) => {
    const performDelete = async () => {
      try {
        await deleteDoc(doc(db, "requests", requestId));
      } catch (e) {
        console.error("Delete error:", e);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Remove this pet request?")) performDelete();
    } else {
      Alert.alert("Delete", "Remove this request?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: performDelete },
      ]);
    }
  };

  const fetchSitterDetails = async (sitterId: string) => {
    try {
      const docSnap = await getDoc(doc(db, "users", sitterId));
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (e) {
      console.error("Error fetching sitter:", e);
    }
    return null;
  };

  const handleRequestClick = async (req: any) => {
    setSelectedRequest(req);
    setModalVisible(true);
    setModalLoading(true);
    setSitterDetails(null);

    // If accepted or completed, fetch sitter details
    // Note: The field might be 'sitterId' or 'assignedSitterId' depending on schema usage
    const sId = req.sitterId || req.assignedSitterId;
    if (
      sId &&
      (req.status === "Accepted" ||
        req.status === "Completed" ||
        req.status === "Assigned")
    ) {
      const sitter = await fetchSitterDetails(sId);
      setSitterDetails(sitter);
    }

    setModalLoading(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  // Helper to format the date sentence
  const formatDateSentence = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "Dates not set yet";

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
      };
      return `From ${start.toLocaleDateString(
        "en-US",
        options
      )} to ${end.toLocaleDateString("en-US", options)}`;
    } catch (e) {
      return "Invalid dates";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <ImageBackground
          source={require("../../../assets/petowner/ownerbg.jpg")}
          style={[
            styles.headerCard,
            {
              marginTop: spacing.xxl,
              paddingVertical: spacing.xl,
              paddingHorizontal: wp(5),
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(24, 11, 2, 1)", "rgba(205, 127, 74, 0.28)"]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.headerRow}>
            <LogoCircle size={50} />
            <TouchableOpacity
              onPress={() =>
                signOut(auth).then(() => navigation.navigate("HomeScreen"))
              }
              style={styles.signOutBtn}
            >
              <Text style={{ color: COLORS.white }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.greeting, { fontSize: fonts.xxlarge }]}>
            Welcome Back! 👋
          </Text>
          <View style={styles.profileWrap}>
            <Text
              style={[
                styles.nameText,
                { fontSize: fonts.large, marginTop: spacing.xl },
              ]}
            >
              {userName}
            </Text>
            <Text style={styles.emailText}>{userEmail}</Text>
          </View>
        </ImageBackground>

        <View style={{ paddingHorizontal: wp(5), marginTop: spacing.xl }}>
          <Button
            title="+ Find a Pet Sitter"
            variant="secondary"
            fullWidth
            onPress={() => navigation.navigate("PetRequestDetails")}
          />

          <Text
            style={[
              styles.sectionTitle,
              {
                fontSize: fonts.large,
                marginTop: spacing.xl,
                marginBottom: spacing.sm,
              },
            ]}
          >
            My Requests
          </Text>

          {requests.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[
                styles.requestCard,
                {
                  borderRadius: BORDER_RADIUS.lg,
                  padding: spacing.lg,
                  marginTop: spacing.nmd,
                },
              ]}
              onPress={() => handleRequestClick(r)}
            >
              <View style={styles.requestHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.petName, { fontSize: fonts.large }]}>
                    {r.petName || "Unnamed Pet"}
                  </Text>
                  <Text
                    style={[
                      styles.breedText,
                      { fontSize: fonts.regular, textTransform: "capitalize" },
                    ]}
                  >
                    {r.petType || "Pet"}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{r.status || "Open"}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* PROFESSIONAL DATE SENTENCE */}
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🗓️</Text>
                <Text style={styles.infoText}>
                  {formatDateSentence(r.startDate, r.endDate)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>
                  {r.location || "No location set"}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.badgeBtn}
                  onPress={() =>
                    navigation.navigate("GiveBadgeScreen", {
                      requestId: r.id,
                      sitterId: r.assignedSitterId || r.sitterId || "N/A",
                      sitterName: "Sitter",
                    })
                  }
                >
                  <Text style={styles.badgeBtnText}>🏅 Badge</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteRequest(r.id)}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* DETAILS MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { width: wp(90), maxHeight: hp(80) }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontSize: fonts.large }]}>
                Request Details
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={{ fontSize: 24, color: "#666" }}>✕</Text>
              </TouchableOpacity>
            </View>

            {modalLoading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ marginVertical: 20 }}
              />
            ) : (
              selectedRequest && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.sectionHeader}>Pet Information</Text>
                  <View style={styles.infoBox}>
                    <Text style={styles.detailText}>
                      Name: {selectedRequest.petName}
                    </Text>
                    <Text style={styles.detailText}>
                      Breed: {selectedRequest.breed}
                    </Text>
                    <Text style={styles.detailText}>
                      Age: {selectedRequest.age}
                    </Text>
                    <Text style={styles.detailText}>
                      Gender: {selectedRequest.gender}
                    </Text>
                  </View>

                  <Text style={styles.sectionHeader}>Schedule & Location</Text>
                  <View style={styles.infoBox}>
                    <Text style={styles.detailText}>
                      Start:{" "}
                      {new Date(selectedRequest.startDate).toLocaleDateString()}
                    </Text>
                    <Text style={styles.detailText}>
                      End:{" "}
                      {new Date(selectedRequest.endDate).toLocaleDateString()}
                    </Text>
                    <Text style={styles.detailText}>
                      Location: {selectedRequest.location}
                    </Text>
                  </View>

                  <Text style={styles.sectionHeader}>Status</Text>
                  <View style={[styles.infoBox, { alignItems: 'flex-start' }]}>
                      <View style={[styles.statusBadge, { alignSelf: 'flex-start' }]}>
                          <Text style={styles.statusText}>{selectedRequest.status}</Text>
                      </View>
                  </View>

                  {sitterDetails && (
                    <>
                      <Text style={styles.sectionHeader}>Sitter Details</Text>
                      <View
                        style={[
                          styles.infoBox,
                          { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" },
                        ]}
                      >
                        <Text style={styles.detailText}>
                          Name: {sitterDetails.fullName || sitterDetails.name}
                        </Text>
                        <Text style={styles.detailText}>
                          Email: {sitterDetails.email}
                        </Text>
                        <Text style={styles.detailText}>
                          Phone: {sitterDetails.phone}
                        </Text>
                      </View>
                    </>
                  )}

                  <TouchableOpacity
                    style={[styles.editBtn, { marginTop: 20 }]}
                    onPress={() => {
                        closeModal();
                        navigation.navigate("PetRequestDetails", { requestId: selectedRequest.id, isEditing: true });
                    }}
                  >
                    <Text style={styles.editBtnText}>Edit Request</Text>
                  </TouchableOpacity>
                </ScrollView>
              )
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={(k) => setActiveTab(k as any)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  greeting: {
    color: COLORS.white,
    fontWeight: "700",
    textAlign: "center",
  },
  container: { flex: 1 },
  headerCard: { overflow: "hidden", borderRadius: BORDER_RADIUS.md },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  profileWrap: { alignItems: "center" },
  nameText: { color: COLORS.white, fontWeight: "700" },
  emailText: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  sectionTitle: { color: COLORS.text, fontWeight: "700" },
  requestCard: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petName: { color: COLORS.text, fontWeight: "700" },
  breedText: { color: COLORS.textLight, marginTop: 2 },
  statusBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { color: COLORS.white, fontWeight: "700", fontSize: 12 },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoIcon: { fontSize: 14, marginRight: 8 },
  infoText: { color: COLORS.textLight, fontSize: 13 },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 10,
    alignItems: "center",
  },
  badgeBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeBtnText: { color: COLORS.primary, fontWeight: "600", fontSize: 12 },
  deleteBtn: { backgroundColor: "#FFE8E8", padding: 8, borderRadius: 8 },
  deleteBtnText: { color: "#FF6B6B", fontSize: 16 },

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
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 10,
  },
  modalTitle: {
    fontWeight: "700",
    color: COLORS.secondary,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#888",
    marginTop: 10,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  detailText: {
    color: "#374151",
    fontSize: 14,
    marginBottom: 4,
  },
  closeBtn: {
    marginTop: 15,
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
  editBtn: {
      backgroundColor: COLORS.primary,
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: "center",
  },
  editBtnText: {
      color: COLORS.white,
      fontWeight: '700',
      fontSize: 16
  }
});

export default PetOwnerDashboardScreen;