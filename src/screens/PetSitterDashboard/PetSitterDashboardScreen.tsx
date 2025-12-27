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
  Modal,
  ActivityIndicator
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
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

interface RequestCard {
  id: string;
  petName: string;
  breed: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  awardedBadges?: string[];
}

const BADGES_DATA: { [key: string]: { name: string; icon: string; color?: string; description?: string } } = {
  "animal-lover": { name: "Animal Lover", icon: "🐾", color: "#FF6B9D", description: "Shows exceptional love and care for animals" },
  "puppy-pro": { name: "Puppy Pro", icon: "🐕", color: "#FFB347", description: "Expert at handling puppies and young dogs" },
  "cat-whisperer": { name: "Cat Whisperer", icon: "🐱", color: "#9B59B6", description: "Has a special connection with cats" },
  "reliable-care": { name: "Reliable Care", icon: "⭐", color: "#F39C12", description: "Consistently provides dependable care" },
  "great-communicator": { name: "Great Communicator", icon: "💬", color: "#3498DB", description: "Excellent at keeping owners updated" },
  "calm-patient": { name: "Calm & Patient", icon: "🧠", color: "#82C4E5", description: "Handles anxious or energetic pets gently" },
  "multi-pet-expert": { name: "Multi-Pet Expert", icon: "🐾", color: "#8E44AD", description: "Successfully cared for more than one pet at a time" },
  "young-pet-specialist": { name: "Young Pet Specialist", icon: "🍼", color: "#F8B739", description: "Great with puppies & kittens" },
  "senior-pet-friendly": { name: "Senior Pet Friendly", icon: "🧓", color: "#95A5A6", description: "Extra care for older pets (mobility, meds, comfort)" },
  "follows-routine": { name: "Follows Routine Perfectly", icon: "🎯", color: "#E74C3C", description: "Sticks closely to feeding, walking & sleep schedules" },
  "leash-walk-pro": { name: "Leash & Walk Pro", icon: "🐕‍🦺", color: "#27AE60", description: "Excellent at safe and enjoyable walks" },
  "clean-feeding": { name: "Clean Feeding Habits", icon: "🧺", color: "#16A085", description: "Maintains food/water areas hygienically" },
  "stress-free-care": { name: "Stress-Free Care", icon: "🐾", color: "#5DADE2", description: "Keeps pets relaxed while owner is away" },
  "above-beyond": { name: "Above & Beyond", icon: "💖", color: "#EC407A", description: "Did more than what was expected" },
  "home-aware": { name: "Home-Aware Caretaker", icon: "🏡", color: "#D35400", description: "Takes care of pet while being mindful of owner's home" },
};

const PetSitterDashboardScreen: React.FC = () => {
  const { wp, hp, isSmallDevice } = useResponsive();
  const navigation = useNavigation<any>();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  // State for user data
  const [sitterName, setSitterName] = useState("Sitter");
  const [sitterEmail, setSitterEmail] = useState("");
  const [sitterAddress, setSitterAddress] = useState("");
  const [sitterPhone, setSitterPhone] = useState("");
  
  const [activeTab, setActiveTab] = useState<"Home" | "Notifications">("Home");
  const [badges, setBadges] = useState<
    Array<{ name: string; count: number; icon: string }>
  >([]);
  const [requestType, setRequestType] = useState<"Accepted" | "Completed">("Accepted");
  const [availableRequests, setAvailableRequests] = useState<RequestCard[]>([]);
  const [activeJobs, setActiveJobs] = useState(0);

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
          // Fetch basic user info
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setSitterName(data?.fullName || "Sitter");
            setSitterEmail(data?.email || currentUser.email || "");
            setSitterAddress(data?.address || "");
            setSitterPhone(data?.phone || "");
          }

            // Removed badge fetching from here as it now aggregates from requests

        }
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    };
    fetchUserData();
  }, []);

  // Fetch badges from COMPLETED requests
  useEffect(() => {
    const fetchBadges = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Query ALL completed requests for this sitter
      const q = query(
        collection(db, "requests"),
        where("sitterId", "==", currentUser.uid),
        where("status", "==", "Completed")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const badgeCounts: { [key: string]: number } = {};

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.awardedBadges && Array.isArray(data.awardedBadges)) {
             data.awardedBadges.forEach((badgeId: string) => {
               badgeCounts[badgeId] = (badgeCounts[badgeId] || 0) + 1;
             });
          }
        });

        const badgeMap = BADGES_DATA;
        const formattedBadges = Object.entries(badgeCounts)
          .map(([key, count]) => ({
            name: badgeMap[key]?.name || key,
            count: count,
            icon: badgeMap[key]?.icon || "🏆",
          }))
          // Sort or filter if needed? User said "without duplicates", this map has unique keys
          .sort((a, b) => b.count - a.count); // Optional: sort by most frequent

        setBadges(formattedBadges);
      }, (error) => {
        console.error("Error fetching badges:", error);
      });

      return () => unsubscribe();
    };
    fetchBadges();
  }, []);

  // Fetch accepted pet sitting requests (Active Jobs)
  useEffect(() => {
    const fetchAcceptedRequests = async () => {
         const currentUser = auth.currentUser;
         if (!currentUser) return;

         const q = query(
           collection(db, "requests"),
           where("status", "==", requestType),
           where("sitterId", "==", currentUser.uid)
         );
     
         const unsubscribe = onSnapshot(q, (snapshot) => {
           const fetchedRequests = snapshot.docs.map(docSnap => {
             const data = docSnap.data();

             // Check for auto-completion (expired accepted requests)
             if (data.status === "Accepted" && data.endDate) {
                 const endDate = new Date(data.endDate); // Assuming string YYYY-MM-DD or comparable
                 const yesterday = new Date();
                 yesterday.setDate(yesterday.getDate() - 1); // Buffer or strict? Let's use strict today comparison or end of day logic. 
                 // Simple string compare is risky if formats vary, but if standard ISO YYYY-MM-DD:
                 // Better to compare timestamps. 
                 // If endDate is just a date string "2023-12-25", new Date("2023-12-25") is UTC 00:00.
                 // We want to complete it if TODAY is AFTER that date.
                 
                 const today = new Date();
                 today.setHours(0,0,0,0);
                 
                 // If endDate is in the past
                 if (endDate < today) {
                    // Update to Completed
                     updateDoc(doc(db, "requests", docSnap.id), {
                         status: "Completed"
                     }).catch(err => console.error("Auto-complete error", err));
                 }
             }

             return {
               id: docSnap.id,
               petName: data.petName || "Unknown Pet",
               breed: data.breed || data.petType || "Pet",
               startDate: data.startDate || "",
               endDate: data.endDate || "",
               location: data.location || data.city || "No location",
               status: data.status,
               awardedBadges: data.awardedBadges || []
             };
           });
           setAvailableRequests(fetchedRequests); 
         }, (error) => {
           console.error("Error fetching requests:", error);
         });
     
         return () => unsubscribe();
    }
    fetchAcceptedRequests();
  }, [requestType]);

  // Removed separate fetchActiveJobs since we are getting the list now, 
  // currently we can just use availableRequests.length for the count or keep separate if we want just a count,
  // but let's keep the separate count effect for now to minimize diff if it's used for the profile card number specifically 
  // (though it duplicates the read, efficient app would combine them). 
  // For this task, I will leave the separate count effect as is to ensure the "Active Jobs" number in the card works independently if needed, 
  // OR simpler: update Active Jobs count from this list. Let's leave the count effect alone or remove it if I replace the list logic completely.
  // Actually, line 166-188 fetches count. I can just use availableRequests.length if I want.
  // Let's keep the count effect for safety unless requested to optimize.
  
  // Fetch active jobs (Accepted requests for this sitter) - KEEPING AS IS for counter
  useEffect(() => {
    const fetchActiveJobs = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const q = query(
          collection(db, "requests"),
          where("sitterId", "==", currentUser.uid),
          where("status", "==", "Accepted")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          setActiveJobs(snapshot.size);
        });

        return () => unsubscribe();
      } catch (e) {
        console.error("Error fetching active jobs:", e);
      }
    };
    fetchActiveJobs();
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

  // --- MODAL STATE & HANDLERS ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleRequestPress = async (reqId: string) => {
    setLoadingDetails(true);
    setModalVisible(true);
    setSelectedRequest(null);
    setSelectedOwner(null);

    try {
      const docRef = doc(db, "requests", reqId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const reqData = { id: docSnap.id, ...docSnap.data() } as any;
        setSelectedRequest(reqData);

        if (reqData.ownerId) {
           const userRef = doc(db, "users", reqData.ownerId);
           const userSnap = await getDoc(userRef);
           if (userSnap.exists()) {
              setSelectedOwner(userSnap.data());
           }
        }
      }
    } catch (error) {
       console.error("Error fetching details:", error);
       Alert.alert("Error", "Could not fetch details");
    } finally {
       setLoadingDetails(false);
    }
  };

  const closeModal = () => {
     setModalVisible(false);
     setSelectedRequest(null);
     setSelectedOwner(null);
  };

  const formatDateVal = (dateVal: any) => {
      if (!dateVal) return "N/A";
      try {
        const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
        if (isNaN(date.getTime())) return "N/A";
        return date.toISOString().split("T")[0];
      } catch (e) {
        return "N/A";
      }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
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



            {/* Name and Email */}
            <Text
              style={[
              styles.sitterName,
              { fontSize: fonts.large, marginTop: spacing.nmd },
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


            <View style={styles.ratingContainer}>
              <Text style={[styles.activeJobsText, { fontSize: fonts.medium }]}>
                {activeJobs} Active Jobs
              </Text>
              
              {/* Contact Info */}
              <View style={{ marginTop: 8 }}>
                 {sitterAddress ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <MaterialIcons name="location-on" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={{ color: "rgba(255,255,255,0.9)", marginLeft: 6, fontSize: fonts.small }}>
                       {sitterAddress}
                    </Text>
                  </View>
                 ) : null}
                 
                 {sitterEmail ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <MaterialIcons name="email" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={{ color: "rgba(255,255,255,0.9)", marginLeft: 6, fontSize: fonts.small }}>
                       {sitterEmail}
                    </Text>
                  </View>
                 ) : null}

                 {sitterPhone ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="phone" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={{ color: "rgba(255,255,255,0.9)", marginLeft: 6, fontSize: fonts.small }}>
                       {sitterPhone}
                    </Text>
                  </View>
                 ) : null}
              </View>
            </View>
          </View>

          {/* Badges */}
          <View style={[
              styles.badgesContainer, 
              { 
                  marginTop: spacing.lg,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between'
              }
          ]}>
            {badges.length > 0 ? (
              badges.map((badge, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.badge,
                    { 
                        paddingHorizontal: wp(2), 
                        paddingVertical: hp(1),
                        width: '48%', // Ensure 2 per row
                        marginBottom: spacing.xs
                    },
                  ]}
                >
                  <Text style={{ fontSize: 14, marginRight: spacing.sm }}>
                    {badge.icon}
                  </Text>
                  <Text 
                    style={[styles.badgeText, { fontSize: fonts.small, flex: 1 }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
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
            { paddingHorizontal: wp(5), gap: spacing.nmd },
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

        {/* Accepted Requests Section */}
        <View
          style={[
            styles.requestsSection,
            { paddingHorizontal: wp(5), marginTop: hp(3), marginBottom: hp(3) },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
               <Pressable 
                  onPress={() => setRequestType("Accepted")}
                  style={{
                     paddingHorizontal: 16,
                     paddingVertical: 8,
                     backgroundColor: requestType === "Accepted" ? COLORS.primary : "#F3F4F6",
                     borderRadius: 20
                  }}
               >
                  <Text style={{ 
                     color: requestType === "Accepted" ? "#FFF" : "#666",
                     fontWeight: "600",
                     fontSize: fonts.medium
                  }}>Accepted</Text>
               </Pressable>

               <Pressable 
                  onPress={() => setRequestType("Completed")}
                  style={{
                     paddingHorizontal: 16,
                     paddingVertical: 8,
                     backgroundColor: requestType === "Completed" ? COLORS.primary : "#F3F4F6",
                     borderRadius: 20
                  }}
               >
                  <Text style={{ 
                     color: requestType === "Completed" ? "#FFF" : "#666",
                     fontWeight: "600",
                     fontSize: fonts.medium
                  }}>Completed</Text>
               </Pressable>
            </View>
          </View>

          {/* Request Cards */}
          <View
            style={[
              styles.requestCardsContainer,
              { marginTop: spacing.lg, gap: spacing.nmd },
            ]}
          >
            {availableRequests.map((request) => (
              <Pressable
                key={request.id}
                onPress={() => handleRequestPress(request.id)}
                style={[
                  styles.requestCard,
                  { padding: wp(4), marginBottom: spacing.nmd },
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
                      marginTop: spacing.nmd,
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

      {/* Tab Bar */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabPress={handleTabPress} />

      {/* DETAILS MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request Details</Text>
                <Pressable onPress={closeModal} style={styles.closeBtn}>
                   <MaterialIcons name="close" size={24} color="#333" />
                </Pressable>
            </View>
            
            {loadingDetails ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#7C3AED" />
                </View>
            ) : selectedRequest ? (
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                     {/* Header Status & Dates */}
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                        <View style={{ backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                           <Text style={{ color: '#0284C7', fontWeight: 'bold', fontSize: 12 }}>{selectedRequest.status}</Text>
                        </View>
                        <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                           Posted: {selectedRequest.createdAt ? formatDateVal(selectedRequest.createdAt) : 'N/A'}
                        </Text>
                     </View>

                     <Text style={styles.modalSectionTitle}>Start Date :  {formatDateVal(selectedRequest.startDate)}</Text>
                     <Text style={[styles.modalSectionTitle, {marginTop: 4}]}>End Date : {formatDateVal(selectedRequest.endDate)}</Text>
                     
                     <View style={styles.divider} />
                     
                     {/* Pet Details - Expanded */}
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                         <Text style={[styles.petName, { color: '#333', fontSize: 24 }]}>{selectedRequest.petName}</Text>
                         <View style={{ backgroundColor: '#F3E8FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                             <Text style={{ color: '#7C3AED', fontWeight: 'bold' }}>{selectedRequest.type || selectedRequest.petType}</Text>
                         </View>
                     </View>
                     <Text style={{ color: '#666', marginTop: 4 }}>
                        {selectedRequest.breed ? selectedRequest.breed : "Breed: N/A"} • {selectedRequest.age} years old
                     </Text>

                     <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        {selectedRequest.gender && (
                           <View style={styles.tag}><Text style={styles.tagText}>{selectedRequest.gender}</Text></View>
                        )}
                        {selectedRequest.size && (
                           <View style={styles.tag}><Text style={styles.tagText}>{selectedRequest.size}</Text></View>
                        )}
                        {selectedRequest.temperament && (
                           <View style={styles.tag}><Text style={styles.tagText}>{selectedRequest.temperament}</Text></View>
                        )}
                        {selectedRequest.walkRequirement && (
                           <View style={styles.tag}><Text style={styles.tagText}>Walks Required</Text></View>
                        )}
                     </View>
                     
                     <View style={styles.divider} />

                     {/* Care Requirements */}
                     <Text style={styles.modalSectionTitle}>Care & Feeding</Text>
                     <View style={{ backgroundColor: '#FFF7ED', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                        <Text style={{ color: '#C2410C', fontWeight: '600', marginBottom: 4 }}>Feeding Schedule</Text>
                        <Text style={{ color: '#431407' }}>{selectedRequest.feedingSchedule || "Not specified"}</Text>
                     </View>
                     
                     {selectedRequest.behaviorNotes && (
                        <View style={{ backgroundColor: '#FEF2F2', padding: 12, borderRadius: 8 }}>
                           <Text style={{ color: '#B91C1C', fontWeight: '600', marginBottom: 4 }}>Behavior Notes</Text>
                           <Text style={{ color: '#450A0A' }}>{selectedRequest.behaviorNotes}</Text>
                        </View>
                     )}

                     <View style={styles.divider} />

                     {/* Owner Details */}
                     <Text style={styles.modalSectionTitle}>Owner Information</Text>
                     <View style={styles.ownerCard}>
                         <View style={styles.infoRow}>
                             <MaterialIcons name="person" size={20} color="#555" />
                             <Text style={styles.infoText}>{selectedOwner ? selectedOwner.fullName : "Unknown Owner"}</Text>
                         </View>
                         {selectedOwner?.phone && (
                             <View style={styles.infoRow}>
                                 <MaterialIcons name="phone" size={20} color="#555" />
                                 <Text style={styles.infoText}>{selectedOwner.phone}</Text>
                             </View>
                         )}
                         {selectedOwner?.email && (
                             <View style={styles.infoRow}>
                                 <MaterialIcons name="email" size={20} color="#555" />
                                 <Text style={styles.infoText}>{selectedOwner.email}</Text>
                             </View>
                         )}
                         {selectedOwner?.address && (
                             <View style={styles.infoRow}>
                                 <MaterialIcons name="home" size={20} color="#555" />
                                 <Text style={styles.infoText}>{selectedOwner.address}</Text>
                             </View>
                         )}
                     </View>

                     {/* Emergency Contact */}
                     {(selectedRequest.emergencyContactName || selectedRequest.emergencyPhone) && (
                        <View style={[styles.ownerCard, { marginTop: 10, backgroundColor: '#FEFCE8' }]}>
                           <Text style={{ fontWeight: 'bold', color: '#854D0E', marginBottom: 8 }}>Emergency Contact</Text>
                           {selectedRequest.emergencyContactName && (
                              <View style={styles.infoRow}>
                                 <MaterialIcons name="contact-phone" size={20} color="#854D0E" />
                                 <Text style={[styles.infoText, { color: '#854D0E' }]}>{selectedRequest.emergencyContactName}</Text>
                              </View>
                           )}
                           {selectedRequest.emergencyPhone && (
                              <View style={styles.infoRow}>
                                 <MaterialIcons name="phone" size={20} color="#854D0E" />
                                 <Text style={[styles.infoText, { color: '#854D0E' }]}>{selectedRequest.emergencyPhone}</Text>
                              </View>
                           )}
                        </View>
                     )}

                     <View style={styles.divider} />

                     {/* Location */}
                     <Text style={styles.modalSectionTitle}>Location</Text>
                     <Text style={{ color: '#555', lineHeight: 20, marginBottom: 4 }}><Text style={{fontWeight:'bold'}}>Address:</Text> {selectedRequest.address || selectedRequest.location}</Text>
                     <Text style={{ color: '#555', lineHeight: 20, marginBottom: 4 }}><Text style={{fontWeight:'bold'}}>City:</Text> {selectedRequest.city}</Text>
                     {selectedRequest.neighborhood && (
                        <Text style={{ color: '#555', lineHeight: 20 }}><Text style={{fontWeight:'bold'}}>Neighborhood:</Text> {selectedRequest.neighborhood}</Text>
                     )}

                     <View style={styles.divider} />
                     
                     {/* Instructions */}
                     <Text style={styles.modalSectionTitle}>Instructions to Volunteers</Text>
                     <Text style={{ color: '#555', lineHeight: 22, fontStyle: 'italic' }}>
                        "{selectedRequest.messageToVolunteers || selectedRequest.instructions || "No extra instructions provided."}"
                     </Text>

                     
                     {/* Awarded Badges Section */}
                     {selectedRequest.awardedBadges && selectedRequest.awardedBadges.length > 0 && (
                       <>
                         <View style={styles.divider} />
                         <Text style={styles.modalSectionTitle}>Awarded Badges 🏆</Text>
                         <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                           {selectedRequest.awardedBadges.map((badgeId: string) => {
                             const badgeInfo = BADGES_DATA[badgeId];
                             if (!badgeInfo) return null;
                             return (
                               <View 
                                 key={badgeId} 
                                 style={{ 
                                   flexDirection: 'row', 
                                   alignItems: 'center', 
                                   backgroundColor: badgeInfo.color ? `${badgeInfo.color}15` : '#FFF0F5', 
                                   paddingHorizontal: 12, 
                                   paddingVertical: 8, 
                                   borderRadius: 20,
                                   borderWidth: 1,
                                   borderColor: badgeInfo.color ? `${badgeInfo.color}40` : '#FF6B9D40'
                                 }}
                               >
                                 <Text style={{ fontSize: 18, marginRight: 6 }}>{badgeInfo.icon}</Text>
                                 <View>
                                     <Text style={{ 
                                       fontSize: 12, 
                                       fontWeight: 'bold', 
                                       color: badgeInfo.color || '#333' 
                                     }}>
                                       {badgeInfo.name}
                                     </Text>
                                 </View>
                               </View>
                             );
                           })}
                         </View>
                       </>
                     )}

                     {/* Timestamps Footer */}
                     <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
                        <Text style={{ fontSize: 10, color: '#aaa', textAlign: 'center' }}>
                           Request ID: {selectedRequest.id}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#aaa', textAlign: 'center' }}>
                           Accepted: {selectedRequest.acceptedAt ? formatDateVal(selectedRequest.acceptedAt) : 'N/A'}
                        </Text>
                     </View>

                     <View style={{ height: 40 }} />
                </ScrollView>
            ) : (
                <Text style={{ padding: 20, textAlign: 'center' }}>Details not available.</Text>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#e17765ff",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    height: "80%",
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "#F8F5F2",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: "#3E2C22",
  },
  closeBtn: {
    padding: 5,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: "#7C3AED",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },
  ownerCard: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    color: "#4B5563",
    fontSize: 14,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PetSitterDashboardScreen;
