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
import NotificationsView from "../../components/Chat-Diary-Notification/NotificationsView";

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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedRequests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(fetchedRequests);
      },
      (error) => {
        // Ignore permission errors that happen during signout
        if (error.code === "permission-denied") {
          console.log("Permission denied (likely due to sign out).");
          return;
        }
        console.error("Snapshot error:", error);
      }
    );

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

  const renderSkills = (skills: any) => {
    if (!skills) return null;
    const activeSkills = Object.keys(skills).filter((key) => skills[key]);
    if (activeSkills.length === 0) return <Text style={styles.detailText}>No skills listed.</Text>;
    
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {activeSkills.map((skill) => (
          <View key={skill} style={styles.skillBadge}>
             <Text style={styles.skillText}>
               {skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
             </Text>
          </View>
        ))}
      </View>
    );
  };

  const handleSignOut = () => {
    const performSignOut = () => {
      signOut(auth)
        .then(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "HomeScreen" }],
          });
        })
        .catch((error) => console.error("Sign out error:", error));
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to sign out?")) {
        performSignOut();
      }
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: performSignOut,
        },
      ]);
    }
  };

  const renderHomeContent = () => (
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
              onPress={handleSignOut}
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

          {/* Messages and Diary Buttons */}
          <View style={{ flexDirection: "row", gap: spacing.nmd, marginTop: spacing.nmd }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#605044f0",
                paddingVertical: hp(1.8),
                borderRadius: BORDER_RADIUS.md,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => navigation.navigate("ChatListScreen")}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>💬</Text>
              <Text style={{ color: COLORS.white, fontWeight: "600", fontSize: fonts.regular }}>
                Messages
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#605044f0",
                paddingVertical: hp(1.8),
                borderRadius: BORDER_RADIUS.md,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => navigation.navigate("DiaryScreen")}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>📖</Text>
              <Text style={{ color: COLORS.white, fontWeight: "600", fontSize: fonts.regular }}>
                Diary
              </Text>
            </TouchableOpacity>
          </View>

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
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <View style={{ flex: 1 }}>
        {activeTab === "Home" ? renderHomeContent() : <NotificationsView />}
      </View>

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
                      <Text style={{ fontWeight: '700' }}>Name:</Text> {selectedRequest.petName}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Type:</Text> {selectedRequest.petType}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Breed:</Text> {selectedRequest.breed}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Age:</Text> {selectedRequest.age}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Gender:</Text> {selectedRequest.gender}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Size:</Text> {selectedRequest.size}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Temperament:</Text> {selectedRequest.temperament}
                    </Text>
                  </View>

                  <Text style={styles.sectionHeader}>Care Instructions</Text>
                  <View style={styles.infoBox}>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Feeding:</Text> {selectedRequest.feedingSchedule}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Walks Required:</Text> {selectedRequest.walkRequirement ? 'Yes' : 'No'}
                    </Text>
                    {selectedRequest.behaviorNotes ? (
                        <Text style={[styles.detailText, { marginTop: 4 }]}>
                          <Text style={{ fontWeight: '700' }}>Behavior Notes:</Text> {selectedRequest.behaviorNotes}
                        </Text>
                    ) : null}
                    {selectedRequest.messageToVolunteers ? (
                        <Text style={[styles.detailText, { marginTop: 4 }]}>
                          <Text style={{ fontWeight: '700' }}>Message:</Text> {selectedRequest.messageToVolunteers}
                        </Text>
                    ) : null}
                  </View>

                  <Text style={styles.sectionHeader}>Location & Emergency</Text>
                  <View style={styles.infoBox}>
                     <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Address:</Text> {selectedRequest.address}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>City:</Text> {selectedRequest.city}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Neighborhood:</Text> {selectedRequest.neighborhood}
                    </Text>
                    <View style={styles.divider} />
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Emergency Contact:</Text> {selectedRequest.emergencyContactName}
                    </Text>
                     <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Emergency Phone:</Text> {selectedRequest.emergencyPhone}
                    </Text>
                  </View>

                  <Text style={styles.sectionHeader}>Schedule</Text>
                  <View style={styles.infoBox}>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>Start:</Text>{" "}
                      {new Date(selectedRequest.startDate).toLocaleDateString()} {new Date(selectedRequest.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={{ fontWeight: '700' }}>End:</Text>{" "}
                      {new Date(selectedRequest.endDate).toLocaleDateString()} {new Date(selectedRequest.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <Text style={styles.sectionHeader}>Status</Text>
                  <View style={[styles.infoBox, { alignItems: 'flex-start' }]}>
                      <View style={[styles.statusBadge, { alignSelf: 'flex-start' }]}>
                          <Text style={styles.statusText}>{selectedRequest.status}</Text>
                      </View>
                  </View>

                  {/* SHOW BADGES AWARDED FOR THIS REQUEST IF ANY */}
                   {selectedRequest.awardedBadges && selectedRequest.awardedBadges.length > 0 && (
                      <>
                        <Text style={styles.sectionHeader}>Badges Awarded</Text>
                        <View style={styles.infoBox}>
                           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                             {selectedRequest.awardedBadges.map((badge: string) => (
                               <View key={badge} style={[styles.skillBadge, {backgroundColor: '#FEF3C7'}]}>
                                 <Text style={[styles.skillText, {color:'#D97706'}]}>
                                   {badge.replace(/-/g, ' ').replace(/^./, str => str.toUpperCase())}
                                 </Text>
                               </View>
                             ))}
                          </View>
                        </View>
                      </>
                   )}


                  {sitterDetails && (
                    <>
                      <Text style={styles.sectionHeader}>Sitter Profile</Text>
                      <View
                        style={[
                          styles.infoBox,
                          { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" },
                        ]}
                      >
                         <View style={{borderBottomWidth:1, borderBottomColor: '#E0F2FE', paddingBottom: 8, marginBottom: 8}}>
                             <Text style={[styles.detailText, {fontWeight: '700', color: COLORS.secondary}]}>
                               {sitterDetails.fullName || sitterDetails.name}
                             </Text>
                             <Text style={styles.detailText}>
                               📧 {sitterDetails.email}
                             </Text>
                             <Text style={styles.detailText}>
                               📞 {sitterDetails.phone || "No phone"}
                             </Text>
                         </View>

                         {/* Availability */}
                         {sitterDetails.availability && sitterDetails.availability.schedule ? (
                             <View style={{marginBottom: 8}}>
                                <Text style={[styles.detailText, {fontWeight:'600'}]}>Availability:</Text>
                                <Text style={[styles.detailText, {color: '#555', fontSize: 13}]}>{sitterDetails.availability.schedule}</Text>
                             </View>
                         ) : null}

                         {/* About Me */}
                         {sitterDetails.aboutMe ? (
                             <View style={{marginBottom: 8}}>
                                <Text style={[styles.detailText, {fontWeight:'600'}]}>About:</Text>
                                <Text style={[styles.detailText, {color: '#555', fontSize: 13}]}>{sitterDetails.aboutMe}</Text>
                             </View>
                         ) : null}

                         {/* Experience */}
                         {sitterDetails.experience && (
                            <View style={{marginBottom: 8}}>
                               {sitterDetails.experience.yearsOfExperience !== undefined && (
                                   <Text style={[styles.detailText, {fontWeight:'600'}]}>
                                     Exp: {sitterDetails.experience.yearsOfExperience} Year(s)
                                   </Text>
                               )}
                               {sitterDetails.experience.description ? (
                                   <Text style={[styles.detailText, {color: '#555', fontSize: 13}]}>
                                       {sitterDetails.experience.description}
                                   </Text>
                               ) : null}
                            </View>
                         )}

                         {/* Skills */}
                         {sitterDetails.skills && (
                            <View>
                               <Text style={[styles.detailText, {fontWeight:'600', marginBottom: 4}]}>Skills:</Text>
                               {renderSkills(sitterDetails.skills)}
                            </View>
                         )}
                      </View>
                    </>
                  )}

                  <TouchableOpacity
                    style={[
                        styles.editBtn, 
                        { 
                            marginTop: 20, 
                            backgroundColor: selectedRequest.status === 'Completed' ? '#9CA3AF' : COLORS.primary,
                            opacity: selectedRequest.status === 'Completed' ? 0.7 : 1
                        }
                    ]}
                    disabled={selectedRequest.status === 'Completed'}
                    onPress={() => {
                        closeModal();
                        navigation.navigate("PetRequestDetails", { requestId: selectedRequest.id, isEditing: true });
                    }}
                  >
                    <Text style={styles.editBtnText}>
                        {selectedRequest.status === 'Completed' ? 'Request Completed' : 'Edit Request'}
                    </Text>
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
  },
  skillBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillText: {
    color: '#3730A3',
    fontSize: 12,
    fontWeight: '600'
  }
});

export default PetOwnerDashboardScreen;