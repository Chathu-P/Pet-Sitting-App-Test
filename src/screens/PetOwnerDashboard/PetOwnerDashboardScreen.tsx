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
  deleteDoc 
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
  const { wp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  
  // State
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [activeTab, setActiveTab] = useState<"Home" | "Notifications">("Home");
  const [requests, setRequests] = useState<any[]>([]);

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
      const fetchedRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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

    if (Platform.OS === 'web') {
      if (window.confirm("Remove this pet request?")) performDelete();
    } else {
      Alert.alert("Delete", "Remove this request?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: performDelete },
      ]);
    }
  };

  // Helper to format the date sentence
  const formatDateSentence = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return "Dates not set yet";
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return `From ${start.toLocaleDateString('en-US', options)} to ${end.toLocaleDateString('en-US', options)}`;
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
          style={[styles.headerCard, { marginTop: spacing.xxl, paddingVertical: spacing.xl, paddingHorizontal: wp(5) }]}
        >
          <LinearGradient colors={["rgba(24, 11, 2, 1)", "rgba(205, 127, 74, 0.28)"]} style={StyleSheet.absoluteFillObject} />
          
          <View style={styles.headerRow}>
            <LogoCircle size={50} />
            <TouchableOpacity onPress={() => signOut(auth).then(() => navigation.navigate("HomeScreen"))} style={styles.signOutBtn}>
              <Text style={{ color: COLORS.white }}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileWrap}>
            <Text style={[styles.nameText, { fontSize: fonts.large, marginTop: spacing.xl }]}>{userName}</Text>
            <Text style={styles.emailText}>{userEmail}</Text>
          </View>
        </ImageBackground>

        <View style={{ paddingHorizontal: wp(5), marginTop: spacing.xl }}>
          <Button title="+ Find a Pet Sitter" variant="secondary" fullWidth onPress={() => navigation.navigate("PetRequestDetails")} />
          
          <Text style={[styles.sectionTitle, { fontSize: fonts.large, marginTop: spacing.xl, marginBottom: spacing.sm }]}>My Requests</Text>
          
          {requests.map((r) => (
            <View key={r.id} style={[styles.requestCard, { borderRadius: BORDER_RADIUS.lg, padding: spacing.lg, marginTop: spacing.nmd }]}>
              <View style={styles.requestHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.petName, { fontSize: fonts.large }]}>{r.petName || "Unnamed Pet"}</Text>
                  <Text style={[styles.breedText, { fontSize: fonts.regular, textTransform: 'capitalize' }]}>
                    {r.petType || "Pet"}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.statusBadge} 
                  onPress={() => navigation.navigate("PetRequestDetails", { requestId: r.id, isEditing: true })}
                >
                  <Text style={styles.statusText}>{r.status || "Open"}</Text>
                </TouchableOpacity>
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
                  onPress={() => navigation.navigate("GiveBadgeScreen", { 
                    requestId: r.id, 
                    sitterId: r.assignedSitterId || "N/A", 
                    sitterName: "Sitter" 
                  })}
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
            </View>
          ))}
        </View>
      </ScrollView>
      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={(k) => setActiveTab(k as any)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  headerCard: { overflow: "hidden", borderRadius: BORDER_RADIUS.md },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  signOutBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20 },
  profileWrap: { alignItems: "center" },
  nameText: { color: COLORS.white, fontWeight: "700" },
  emailText: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  sectionTitle: { color: COLORS.text, fontWeight: "700" },
  requestCard: { backgroundColor: COLORS.white, borderLeftWidth: 5, borderLeftColor: COLORS.primary, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  requestHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: 'center' },
  petName: { color: COLORS.text, fontWeight: "700" },
  breedText: { color: COLORS.textLight, marginTop: 2 },
  statusBadge: { backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: COLORS.white, fontWeight: "700", fontSize: 12 },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoIcon: { fontSize: 14, marginRight: 8 },
  infoText: { color: COLORS.textLight, fontSize: 13 },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12, gap: 10, alignItems: 'center' },
  badgeBtn: { borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeBtnText: { color: COLORS.primary, fontWeight: "600", fontSize: 12 },
  deleteBtn: { backgroundColor: "#FFE8E8", padding: 8, borderRadius: 8 },
  deleteBtnText: { color: "#FF6B6B", fontSize: 16 }
});

export default PetOwnerDashboardScreen;