import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";

const RequestDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  const { requestId } = route.params || {};
  const [request, setRequest] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    const fetchRequest = async () => {
      try {
        const docRef = doc(db, "requests", requestId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const reqData: any = { id: docSnap.id, ...docSnap.data() };
          setRequest(reqData);

          // Fetch owner details
          if (reqData.ownerId) {
            try {
              const userRef = doc(db, "users", reqData.ownerId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                setOwner(userSnap.data());
              }
            } catch (err) {
              console.error("Error fetching owner:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching request details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId]);

  const handleAccept = async () => {
    try {
      setProcessing(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await updateDoc(doc(db, "requests", requestId), {
        status: "Accepted",
        sitterId: currentUser.uid,
        acceptedAt: new Date(),
      });
      Alert.alert("Success", "You have accepted this request!");
      navigation.goBack();
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept request");
    } finally {
      setProcessing(false);
    }
  };



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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Request not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: fonts.large }]}>
          Request Details
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Main Card */}
        <View style={[styles.mainCard, { padding: wp(5) }]}>
          <View style={styles.petHeader}>
            <View style={styles.heartIcon}>
              <MaterialIcons name="favorite-border" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={[styles.petName, { fontSize: fonts.xxlarge }]}>
                  {request.petName}
                </Text>
                {request.matchPct && (
                  <View style={styles.matchBadge}>
                    <MaterialIcons name="bolt" size={16} color="#FFD700" />
                    <Text style={styles.matchText}> {request.matchPct}%</Text>
                  </View>
                )}
              </View>
              <Text style={styles.petSubtitle}>
                {request.breed || request.petType} • {request.age} years old
              </Text>
              <Text style={[styles.petSubtitle, { marginTop: 2 }]}>
                 {request.gender} • {request.size}
              </Text>
            </View>
          </View>

          <View style={styles.tagsRow}>
            {request.temperament && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{request.temperament}</Text>
              </View>
            )}
            {request.awardedBadges && Array.isArray(request.awardedBadges) && request.awardedBadges.map((badge: string, idx: number) => (
               <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{badge}</Text>
               </View>
            ))}
          </View>
        </View>

        {/* Why this is a great match */}
        <View style={[styles.sectionCard, styles.purpleCard, { marginHorizontal: wp(5), marginTop: 20 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <MaterialIcons name="auto-awesome" size={20} color="#9333EA" />
            <Text style={[styles.purpleTitle, { fontSize: fonts.medium }]}>
              Why this is a great match
            </Text>
          </View>
          <View style={styles.checkItem}>
            <MaterialIcons name="check" size={18} color="#16A34A" />
            <Text style={styles.checkText}>Your availability matches perfectly</Text>
          </View>
          <View style={styles.checkItem}>
            <MaterialIcons name="check" size={18} color="#16A34A" />
            <Text style={styles.checkText}>Location is convenient for you</Text>
          </View>
          {request.walkRequirement && (
             <View style={styles.checkItem}>
             <MaterialIcons name="check" size={18} color="#16A34A" />
             <Text style={styles.checkText}>You can handle walk requirements</Text>
           </View>
          )}
        </View>

        {/* Schedule & Location */}
        <View style={[styles.sectionCard, { marginHorizontal: wp(5), marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { fontSize: fonts.medium }]}>
            Schedule & Location
          </Text>
          
          <View style={styles.infoRow}>
             <View style={styles.iconBox}>
                <MaterialIcons name="date-range" size={20} color="#9333EA" />
             </View>
             <View>
                <Text style={styles.infoLabel}>
                   {formatDate(request.startDate)} to {formatDate(request.endDate)}
                </Text>
                {/* Calculate duration if needed */}
             </View>
          </View>

          <View style={styles.infoRow}>
             <View style={styles.iconBox}>
                <MaterialIcons name="location-on" size={20} color="#9333EA" />
             </View>
             <View>
                <Text style={styles.infoLabel}>{request.city || request.location}</Text>
                <Text style={styles.infoSub}>{request.address}</Text>
                {request.neighborhood && (
                   <Text style={[styles.infoSub, { fontStyle: 'italic', marginTop: 2 }]}>
                      Neighborhood: {request.neighborhood}
                   </Text>
                )}
             </View>
          </View>
        </View>

        {/* Owner Information */}
        <View style={[styles.sectionCard, { marginHorizontal: wp(5), marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { fontSize: fonts.medium }]}>
            Owner Information
          </Text>
          <View style={styles.infoRow}>
             <MaterialIcons name="person" size={22} color="#9333EA" />
             <View style={{ marginLeft: 10 }}>
                <Text style={styles.infoLabel}>{owner ? owner.fullName : "Pet Owner"}</Text>
                {owner?.email && <Text style={styles.infoSub}>{owner.email}</Text>}
             </View>
          </View>

          {owner?.phone && (
             <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={22} color="#9333EA" />
                <Text style={[styles.infoLabel, { marginLeft: 10 }]}>{owner.phone}</Text>
             </View>
          )}

           {owner?.address && (
              <View style={styles.infoRow}>
                 <MaterialIcons name="home" size={22} color="#9333EA" />
                 <Text style={[styles.infoLabel, { marginLeft: 10 }]}>{owner.address}</Text>
              </View>
           )}

           {/* Emergency Contact */}
           <View style={[styles.divider, { marginVertical: 10, height: 1, backgroundColor: '#eee' }]} />
           <Text style={[styles.sectionTitle, { fontSize: fonts.small, marginBottom: 10, color: '#666' }]}>
               Emergency Contact
           </Text>

           {request.emergencyContactName && (
             <View style={styles.infoRow}>
                <MaterialIcons name="contact-phone" size={22} color="#EF4444" />
                <View style={{ marginLeft: 10 }}>
                   <Text style={styles.infoLabel}>{request.emergencyContactName}</Text>
                   <Text style={styles.infoSub}>{request.emergencyPhone}</Text>
                </View>
             </View>
           )}
        </View>

        {/* Care Requirements */}
        <View style={[styles.sectionCard, { marginHorizontal: wp(5), marginTop: 20 }]}>
           <Text style={[styles.sectionTitle, { fontSize: fonts.medium }]}>
            Care Requirements
          </Text>
          
          <View style={styles.careItem}>
             <MaterialIcons name="schedule" size={20} color="#9333EA" />
             <View style={{ marginLeft: 10 }}>
                <Text style={styles.careTitle}>Feeding Schedule</Text>
                <Text style={styles.careDesc}>{request.feedingSchedule}</Text>
             </View>
          </View>

          <View style={styles.careItem}>
             <MaterialIcons name="pets" size={20} color="#9333EA" />
             <View style={{ marginLeft: 10 }}>
                <Text style={styles.careTitle}>Diet Type</Text>
                <Text style={styles.careDesc}>See details</Text>
             </View>
          </View>

          {request.walkRequirement && (
             <View style={styles.careItem}>
                <MaterialIcons name="directions-walk" size={20} color="#9333EA" />
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.careTitle}>Walks</Text>
                    <Text style={styles.careDesc}>Walks required</Text>
                </View>
             </View>
          )}
        </View>

        {/* Special Instructions */}
        <View style={[styles.sectionCard, { marginHorizontal: wp(5), marginTop: 20 }]}>
           <Text style={[styles.sectionTitle, { fontSize: fonts.medium }]}>
            Special Instructions
          </Text>
          <Text style={styles.descText}>
             {request.behaviorNotes || request.messageToVolunteers || "No special instructions provided."}
          </Text>
        </View>

      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
         <Pressable style={styles.acceptBtn} onPress={handleAccept} disabled={processing}>
             {processing ? (
                <ActivityIndicator color="#fff" />
             ) : (
                <>
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <Text style={styles.acceptText}>Accept Request</Text>
                </>
             )}
         </Pressable>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F5F2", marginTop: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#4A3C35", // Dark brown header
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
  },
  backBtn: {
     padding: 5,
  },
  mainCard: {
     backgroundColor: "#3E2C22", // Dark card background
     margin: 20,
     borderRadius: 20,
     marginTop: 20,
  },
  petHeader: {
     flexDirection: "row",
  },
  heartIcon: {
     width: 50, height: 50,
     borderRadius: 25,
     borderWidth: 1,
     borderColor: "rgba(255,255,255,0.3)",
     justifyContent: "center",
     alignItems: "center",
  },
  petName: {
     color: "#fff",
     fontWeight: "bold",
  },
  petSubtitle: {
     color: "rgba(255,255,255,0.7)",
     marginTop: 4,
  },
  matchBadge: {
     backgroundColor: "#5D4E44",
     borderRadius: 12,
     flexDirection: "row",
     alignItems: "center",
     paddingHorizontal: 8,
     paddingVertical: 4,
  },
  matchText: {
     color: "#fff",
     fontWeight: "bold",
     fontSize: 12,
  },
  tagsRow: {
     flexDirection: "row",
     marginTop: 15,
     gap: 10,
  },
  tag: {
     backgroundColor: "rgba(255,255,255,0.15)",
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 15,
  },
  tagText: {
     color: "#fff",
     fontSize: 12,
  },
  sectionCard: {
     backgroundColor: "#fff",
     borderRadius: 16,
     padding: 20,
     marginBottom: 0,
  },
  purpleCard: {
      backgroundColor: "#FBF5FF",
  },
  purpleTitle: {
      color: "#9333EA",
      fontWeight: "700",
      marginLeft: 8,
  },
  checkItem: {
      flexDirection: "row",
      marginTop: 8,
      alignItems: "center",
  },
  checkText: {
      color: "#9333EA",
      marginLeft: 8,
      fontSize: 13,
  },
  sectionTitle: {
      color: "#1F2937", // Gray 900
      fontWeight: "700",
      marginBottom: 15,
  },
  infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
  },
  iconBox: {
      width: 36, height: 36,
      backgroundColor: "#F3E8FF",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
  },
  infoLabel: {
      color: "#374151",
      fontWeight: "600",
      fontSize: 14,
  },
  infoSub: {
      color: "#6B7280",
      fontSize: 12,
      marginTop: 2,
  },
  careItem: {
      flexDirection: "row",
      marginBottom: 15,
  },
  careTitle: {
      color: "#374151",
      fontWeight: "600",
      fontSize: 14,
  },
  careDesc: {
      color: "#6B7280",
      fontSize: 12,
      marginTop: 2,
  },
  descText: {
     color: "#4B5563",
     lineHeight: 20,
  },
  bottomBar: {
     position: "absolute",
     bottom: 0,
     left: 0,
     right: 0,
     backgroundColor: "#fff",
     padding: 20,
     flexDirection: "row",
     justifyContent: "center",
     borderTopLeftRadius: 20,
     borderTopRightRadius: 20,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: -2 },
     shadowOpacity: 0.1,
     shadowRadius: 10,
     elevation: 5,
  },
  acceptBtn: {
     flex: 1,
     backgroundColor: "#F4EAFF", // Purple accent
     borderRadius: 12,
     height: 50,
     justifyContent: "center",
     alignItems: "center",
     flexDirection: "row",
  },
  acceptText: {
     color: "#9333EA",
     fontWeight: "600",
     marginLeft: 8,
  },
  divider: {
       width: '100%',
  },
});

export default RequestDetailsScreen;
