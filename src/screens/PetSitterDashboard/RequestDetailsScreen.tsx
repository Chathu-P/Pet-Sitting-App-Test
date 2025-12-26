import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../services/firebase";

interface RequestData {
  petName?: string;
  breed?: string;
  age?: string;
  gender?: string;
  petType?: string;
  size?: string;
  temperament?: string;
  behaviorNotes?: string;
  feedingSchedule?: string;
  walkRequirement?: boolean;
  startDate?: string;
  endDate?: string;
  location?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyPhone?: string;
  messageToVolunteers?: string;
  ownerId?: string;
  ownerName?: string;
  ownerContact?: string;
  traits?: string[];
  status?: string;
  createdAt?: any;
  updatedAt?: any;
  assignedSitterId?: string;
}

const RequestDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { requestId } = (route.params as { requestId: string }) || {};
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();

  const [request, setRequest] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});

  // Check if dates have passed
  const hasDatesPassed = (endDateStr?: string): boolean => {
    if (!endDateStr) return false;
    try {
      const endDate = new Date(endDateStr);
      const now = new Date();
      return endDate < now;
    } catch {
      return false;
    }
  };


  useEffect(() => {
    const loadRequest = async () => {
      if (!requestId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const requestDoc = await getDoc(doc(db, "requests", requestId));
        
        if (requestDoc.exists()) {
          let data = requestDoc.data() as RequestData;
          const currentStatus = data.status || "Open";
          const currentUser = auth.currentUser;
          
          // Allow access if:
          // 1. Status is "Pending" or "Open" (anyone can view)
          // 2. Status is "Accepted" AND current user is the assigned sitter
          const isAssignedSitter = currentUser && data.assignedSitterId === currentUser.uid;
          const canAccess = 
            currentStatus === "Pending" || 
            currentStatus === "Open" || 
            (currentStatus === "Accepted" && isAssignedSitter);
          
          if (!canAccess) {
            setAccessDenied(true);
            Alert.alert(
              "Access Denied",
              "This request is no longer available. It may have been accepted, declined, or completed.",
              [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]
            );
            setLoading(false);
            return;
          }
          
          // If status is not set or is "Open", set it to "Pending"
          if (!data.status || data.status === "Open") {
            // Update in database
            try {
              await updateDoc(doc(db, "requests", requestId), {
                status: "Pending",
                updatedAt: serverTimestamp(),
              });
              data = { ...data, status: "Pending" };
            } catch (error) {
              console.error("Error setting status to Pending:", error);
              // Still update local state even if DB update fails
              data = { ...data, status: "Pending" };
            }
          }
          
          // Don't check for Completed status since we only allow Pending/Open requests
          setRequest(data);

          // Fetch owner information if ownerId exists
          if (data.ownerId) {
            try {
              const ownerDoc = await getDoc(doc(db, "users", data.ownerId));
              if (ownerDoc.exists()) {
                const ownerData = ownerDoc.data();
                setOwnerInfo({
                  name: ownerData.fullName || data.ownerName || "",
                  phone: ownerData.phone || data.emergencyPhone || "",
                  email: ownerData.email || "",
                });
              }
            } catch (err) {
              console.error("Error fetching owner info:", err);
              // Fallback to request data
              setOwnerInfo({
                name: data.ownerName || "",
                phone: data.emergencyPhone || "",
                email: "",
              });
            }
          } else {
            // Use fallback data from request
            setOwnerInfo({
              name: data.ownerName || "",
              phone: data.emergencyPhone || "",
              email: "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading request:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [requestId]);

  // Handler for Accept button
  const handleAccept = async () => {
    if (!requestId) {
      Alert.alert("Error", "Request ID not found");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to accept a request");
      return;
    }

    // Check if dates have passed
    if (hasDatesPassed(request?.endDate)) {
      Alert.alert("Error", "Cannot accept request. The end date has already passed.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateDoc(doc(db, "requests", requestId), {
        status: "Accepted",
        assignedSitterId: currentUser.uid,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      setRequest((prev) => prev ? { ...prev, status: "Accepted" } : null);
      
      Alert.alert("Success", "Request accepted successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", error.message || "Failed to accept request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for Decline button
  const handleDecline = async () => {
    if (!requestId) {
      Alert.alert("Error", "Request ID not found");
      return;
    }

    Alert.alert(
      "Decline Request",
      "Are you sure you want to decline this request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await updateDoc(doc(db, "requests", requestId), {
                status: "Declined",
                updatedAt: serverTimestamp(),
              });
              
              // Update local state
              setRequest((prev) => prev ? { ...prev, status: "Declined" } : null);
              
              Alert.alert("Success", "Request declined", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              console.error("Error declining request:", error);
              Alert.alert("Error", error.message || "Failed to decline request");
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#FFF9F0",
          }}
        >
          <ActivityIndicator size="large" color="#91521B" />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#FFF9F0",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 16, color: "#4A3C35" }}>
            Request not found
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              marginTop: 20,
              padding: 12,
              backgroundColor: "#7C3AED",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Format dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not specified";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // Calculate days between dates
  const calculateDays = (start?: string, end?: string) => {
    if (!start || !end) return 0;
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  const startDate = formatDate(request.startDate);
  const endDate = formatDate(request.endDate);
  const days = calculateDays(request.startDate, request.endDate);
  const location = request.location || request.neighborhood || request.city || "Not specified";
  
  // Handle traits - could be from temperament or a traits array
  const traits = request.traits || 
    (request.temperament ? [request.temperament] : []);

  const feeding = request.feedingSchedule || "Not specified";
  const walks = request.walkRequirement 
    ? "Walks required" 
    : "No walks required";
  const instructions = request.messageToVolunteers || request.behaviorNotes || "No special instructions provided.";

  // Format timestamp
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return null;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../../assets/petsitter/Group 87.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={{ padding: wp(5), paddingBottom: hp(2) }}
        >
          {/* Header */}
          <View style={styles.headerCard}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" color={COLORS.white} size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Request Details</Text>
          </View>

          {/* Request Details & Pet's Personality */}
          <View style={styles.petInfoCard}>
            <Text style={styles.headerTitle}>
              Request Details & Pet's Personality
            </Text>
            <Text style={styles.petName}>
              {request.petName || "Unnamed Pet"}
            </Text>
            <Text style={styles.petSubTitle}>
              {request.breed || request.petType || "Pet"}
              {request.age ? `, ${request.age} years old` : ""}
              {request.gender ? `, ${request.gender}` : ""}
              {request.size ? `, ${request.size}` : ""}
            </Text>
            <Text style={styles.sectionText}>
              Needs a sitter from {startDate} to {endDate}
              {days > 0 ? ` (${days} day${days !== 1 ? "s" : ""})` : ""} in{" "}
              {location}.
            </Text>
            <Text style={[styles.sectionText, { marginTop: 8 }]}>Traits:</Text>
            <View style={styles.traitsRow}>
              {traits && traits.length > 0 ? (
                traits.map((t, i) => (
                  <View key={i} style={styles.traitChip}>
                    <Text style={styles.traitText}>{t}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.traitText}>No specific traits listed.</Text>
              )}
            </View>
          </View>

          {/* Schedule & Location */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Schedule & Location</Text>
            <View style={styles.sectionRow}>
              <MaterialIcons name="date-range" size={18} color="#7C3AED" />
              <Text style={styles.sectionText}>
                {startDate} to {endDate}
                {days > 0 ? ` (${days} day${days !== 1 ? "s" : ""})` : ""}
              </Text>
            </View>
            <View style={styles.sectionRow}>
              <MaterialIcons name="location-on" size={18} color="#7C3AED" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionText}>
                  {request.neighborhood || request.city || location}
                </Text>
                {request.city && request.neighborhood && (
                  <Text
                    style={[styles.sectionText, { fontSize: 12, marginTop: 2 }]}
                  >
                    {request.city}
                  </Text>
                )}
                {request.address && (
                  <Text
                    style={[styles.sectionText, { fontSize: 12, marginTop: 2 }]}
                  >
                    {request.address}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Owner Information */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Owner Information</Text>
            {ownerInfo.name ? (
              <View style={styles.sectionRow}>
                <FontAwesome name="user" size={18} color="#7C3AED" />
                <Text style={styles.sectionText}>{ownerInfo.name}</Text>
              </View>
            ) : null}
            {ownerInfo.phone ? (
              <View style={styles.sectionRow}>
                <FontAwesome name="phone" size={18} color="#7C3AED" />
                <Text style={styles.sectionText}>{ownerInfo.phone}</Text>
              </View>
            ) : null}
            {ownerInfo.email ? (
              <View style={styles.sectionRow}>
                <FontAwesome name="envelope" size={18} color="#7C3AED" />
                <Text style={styles.sectionText}>{ownerInfo.email}</Text>
              </View>
            ) : null}
            {!ownerInfo.name && !ownerInfo.phone && !ownerInfo.email && (
              <Text style={styles.sectionText}>Owner information not available</Text>
            )}
            {request.emergencyContactName && (
              <View style={[styles.sectionRow, { marginTop: 8 }]}>
                <MaterialIcons name="emergency" size={18} color="#7C3AED" />
                <Text style={styles.sectionText}>
                  Emergency: {request.emergencyContactName}
                  {request.emergencyPhone ? ` - ${request.emergencyPhone}` : ""}
                </Text>
              </View>
            )}
          </View>

          {/* Pet Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pet Details</Text>
            {request.petType && (
              <View style={styles.sectionRow}>
                <MaterialIcons name="pets" size={18} color="#7C3AED" />
                <Text style={styles.sectionText}>
                  Type: {request.petType.charAt(0).toUpperCase() + request.petType.slice(1)}
                </Text>
              </View>
            )}
            {request.size && (
              <View style={styles.sectionRow}>
                <MaterialIcons name="straighten" size={18} color="#7C3AED" />
                <Text style={styles.sectionText}>
                  Size: {request.size.charAt(0).toUpperCase() + request.size.slice(1)}
                </Text>
              </View>
            )}
            {request.temperament && (
              <View style={styles.sectionRow}>
                <MaterialIcons name="mood" size={18} color="#7C3AED" />
                <Text style={styles.sectionText}>
                  Temperament: {request.temperament.charAt(0).toUpperCase() + request.temperament.slice(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Care Requirements */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Care Requirements</Text>
            <View style={styles.sectionRow}>
              <MaterialIcons name="schedule" size={18} color="#7C3AED" />
              <Text style={styles.sectionText}>
                Feeding Schedule: {feeding}
              </Text>
            </View>
            <View style={styles.sectionRow}>
              <MaterialIcons name="directions-walk" size={18} color="#7C3AED" />
              <Text style={styles.sectionText}>{walks}</Text>
            </View>
          </View>

          {/* Behavior Notes */}
          {request.behaviorNotes && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Behavior & Notes</Text>
              <Text style={styles.sectionText}>{request.behaviorNotes}</Text>
            </View>
          )}

          {/* Message to Volunteers / Special Instructions */}
          {request.messageToVolunteers && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Message to Sitters</Text>
              <Text style={styles.sectionText}>{request.messageToVolunteers}</Text>
            </View>
          )}

          {/* Fallback: If neither behaviorNotes nor messageToVolunteers exist, show instructions */}
          {!request.behaviorNotes && !request.messageToVolunteers && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Special Instructions</Text>
              <Text style={styles.sectionText}>
                {instructions}
              </Text>
            </View>
          )}

          {/* Request Metadata */}
          {(request.createdAt || request.updatedAt) && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Request Information</Text>
              {request.createdAt && formatTimestamp(request.createdAt) && (
                <View style={styles.sectionRow}>
                  <MaterialIcons name="schedule" size={18} color="#7C3AED" />
                  <Text style={[styles.sectionText, { fontSize: 12 }]}>
                    Created: {formatTimestamp(request.createdAt)}
                  </Text>
                </View>
              )}
              {request.updatedAt && formatTimestamp(request.updatedAt) && (
                <View style={styles.sectionRow}>
                  <MaterialIcons name="update" size={18} color="#7C3AED" />
                  <Text style={[styles.sectionText, { fontSize: 12 }]}>
                    Last updated: {formatTimestamp(request.updatedAt)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Footer Buttons - Only show for Pending or Open status */}
          {(request.status === "Pending" || request.status === "Open") && (
            <View style={styles.footerRow}>
              <TouchableOpacity 
                style={[
                  styles.declineBtn,
                  isSubmitting && { opacity: 0.6 }
                ]}
                onPress={handleDecline}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#4A3C35" />
                ) : (
                  <Text style={styles.declineText}>Decline</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.acceptBtn,
                  isSubmitting && { opacity: 0.6 }
                ]}
                onPress={handleAccept}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <Text style={styles.acceptText}>Accept Request</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A3C35",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    marginRight: 12,
  },
  headerTitle: { color: COLORS.white, fontWeight: "700", fontSize: 20 },
  petInfoCard: {
    backgroundColor: "#6B5344",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  petName: { color: COLORS.white, fontWeight: "700", fontSize: 22 },
  petSubTitle: { color: "#E8DFD6", fontSize: 15, marginTop: 2 },
  matchPill: {
    backgroundColor: "#FFD700",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  matchText: { color: "#4A3C35", fontWeight: "700", fontSize: 16 },
  traitsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  traitChip: {
    backgroundColor: "#EEE7E1",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  traitText: { color: "#4A3C35", fontWeight: "600" },
  matchReasonsCard: {
    backgroundColor: "#F4EAFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  matchReasonsTitle: {
    color: "#7C3AED",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  matchReasonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  matchReasonText: { color: "#7C3AED", fontSize: 14, marginLeft: 8 },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    color: "#4A3C35",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 8,
  },
  sectionRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sectionText: { color: "#4A3C35", fontSize: 14 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 18,
  },
  declineBtn: {
    backgroundColor: "#EEE7E1",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  declineText: { color: "#4A3C35", fontWeight: "700", fontSize: 16 },
  acceptBtn: {
    backgroundColor: "#F4EAFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  acceptText: { color: "#7C3AED", fontWeight: "700", fontSize: 16 },
  statusBadge: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RequestDetailsScreen;
