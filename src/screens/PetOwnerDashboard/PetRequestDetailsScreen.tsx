import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  ImageBackground,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import LogoCircle from "../../components/LogoCircle";
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { collection, addDoc, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"; 
import { db, auth } from "../../services/firebase";

// Components & Utils
import Button from "../../components/Button";
import StepProgressBar from "../../components/RequestDetails/StepProgressBar";
import StepProgressLabel from "../../components/RequestDetails/StepProgressLabel";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import { useResponsive, useResponsiveSpacing, useResponsiveFonts } from "../../utils/responsive";

const STEPS = [
  { id: 1, label: "Pet", key: "pet" },
  { id: 2, label: "Personality", key: "personality" },
  { id: 3, label: "Care", key: "care" },
  { id: 4, label: "Duration", key: "duration" },
  { id: 5, label: "Location", key: "location" },
  { id: 6, label: "Emergency", key: "emergency" },
  { id: 7, label: "Prefs", key: "prefs" },
  { id: 8, label: "Review", key: "review" },
];

const PetRequestDetailsScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { requestId, isEditing } = (route.params as any) || {};
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORM STATES ---
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [size, setSize] = useState("medium");
  const [temperament, setTemperament] = useState("friendly");
  const [behaviorNotes, setBehaviorNotes] = useState("");
  const [feedingSchedule, setFeedingSchedule] = useState("");
  const [walkRequirement, setWalkRequirement] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [messageToVolunteers, setMessageToVolunteers] = useState("");

  useEffect(() => {
    if (isEditing && requestId) {
      const loadData = async () => {
        try {
          const docSnap = await getDoc(doc(db, "requests", requestId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPetName(data.petName || "");
            setPetType(data.petType || "dog");
            setBreed(data.breed || "");
            setAge(data.age || "");
            setGender(data.gender || "male");
            setTemperament(data.temperament || "friendly");
            setBehaviorNotes(data.behaviorNotes || "");
            setFeedingSchedule(data.feedingSchedule || "");
            setCity(data.city || "");
            setNeighborhood(data.neighborhood || "");
            setAddress(data.address || "");
            setEmergencyContactName(data.emergencyContactName || "");
            setEmergencyPhone(data.emergencyPhone || "");
            setMessageToVolunteers(data.messageToVolunteers || "");
            if (data.startDate) setStartDate(new Date(data.startDate));
            if (data.endDate) setEndDate(new Date(data.endDate));
          }
        } catch (error) { console.error("Load error:", error); }
      };
      loadData();
    }
  }, [requestId, isEditing]);

  const submitRequest = async () => {
    setIsSubmitting(true);
    try {
      const requestData = {
        ownerId: auth.currentUser?.uid,
        petName, petType, breed, age, gender, size,
        temperament, behaviorNotes, feedingSchedule, walkRequirement,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        city, neighborhood, address,
        emergencyContactName, emergencyPhone,
        messageToVolunteers,
        location: neighborhood || city,
        status: "Open",
        updatedAt: serverTimestamp(),
      };

      if (isEditing && requestId) {
        await setDoc(doc(db, "requests", requestId), requestData, { merge: true });
        Alert.alert("Success", "Changes updated!");
      } else {
        await addDoc(collection(db, "requests"), { ...requestData, createdAt: serverTimestamp() });
        Alert.alert("Success", "Request posted!");
      }
      navigation.navigate("PetOwnerDashboardScreen");
    } catch (error) { Alert.alert("Error", "Could not save details."); }
    finally { setIsSubmitting(false); }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return (
        <View>
          {/* Pet Type Selector */}
          <Text style={styles.label}>Pet Type</Text>
          <View style={[styles.row, { marginBottom: 20 }]}>
            {['dog', 'cat', 'other'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.selectorBtn,
                  petType === t && styles.selectorBtnActive
                ]}
                onPress={() => setPetType(t)}
              >
                <Text style={[styles.selectorBtnText, petType === t && { color: '#FFF' }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Pet's Name</Text>
          <TextInput style={styles.input} value={petName} onChangeText={setPetName} placeholder="e.g. Max" placeholderTextColor="#888" />

          <Text style={styles.label}>Breed</Text>
          <TextInput style={styles.input} value={breed} onChangeText={setBreed} placeholder="e.g. Golden Retriever" placeholderTextColor="#888" />

          {/* Size Selector */}
          <Text style={styles.label}>Size</Text>
          <View style={[styles.row, { marginBottom: 20 }]}>
            {['small', 'medium', 'large'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.selectorBtn,
                  size === s && styles.selectorBtnActive
                ]}
                onPress={() => setSize(s)}
              >
                <Text style={[styles.selectorBtnText, size === s && { color: '#FFF' }]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Age</Text>
              <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="0" placeholderTextColor="#888" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity style={styles.input} onPress={() => setGender(gender === 'male' ? 'female' : 'male')}>
                <Text style={{ color: '#FFF', textAlign: 'center' }}>{gender.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
      case 2: return (
        <View>
          <Text style={styles.label}>Temperament</Text>
          <TextInput style={styles.input} value={temperament} onChangeText={setTemperament} placeholder="Friendly, Shy, etc." placeholderTextColor="#888" />
          <Text style={[styles.label, { marginTop: 15 }]}>Behavior Notes</Text>
          <TextInput style={[styles.input, { height: 100 }]} multiline value={behaviorNotes} onChangeText={setBehaviorNotes} placeholder="Any quirks?" placeholderTextColor="#888" />
        </View>
      );
      case 3: return (
        <View>
          <Text style={styles.label}>Feeding Schedule</Text>
          <TextInput style={styles.input} value={feedingSchedule} onChangeText={setFeedingSchedule} placeholder="Twice a day..." placeholderTextColor="#888" />
          <TouchableOpacity 
            style={[styles.input, { marginTop: 20, backgroundColor: walkRequirement ? COLORS.primary : 'rgba(255,255,255,0.1)' }]} 
            onPress={() => setWalkRequirement(!walkRequirement)}
          >
            <Text style={{ color: '#FFF', textAlign: 'center' }}>{walkRequirement ? "✓ Walks Required" : "No Walks Required"}</Text>
          </TouchableOpacity>
        </View>
      );
      case 4: return (
        <View>
          <Text style={[styles.formTitle, { fontSize: fonts.xlarge }]}>When?</Text>
          <Text style={[styles.label, { marginTop: spacing.nmd }]}>Start Date</Text>
          <View style={styles.dateDisplayBox}>
            {Platform.OS === 'web' && (
              <input type="date" style={styles.webInput} value={startDate.toISOString().split('T')[0]} onChange={(e) => setStartDate(new Date(e.target.value))} />
            )}
            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowStartPicker(true)} style={styles.dateInner}>
              <Text style={styles.dateText}>{startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>
          {Platform.OS !== 'web' && showStartPicker && (
            <DateTimePicker value={startDate} mode="date" display="default" minimumDate={new Date()} onChange={(e, d) => { setShowStartPicker(false); if(d) setStartDate(d); }} />
          )}

          <Text style={[styles.label, { marginTop: spacing.nmd }]}>End Date</Text>
          <View style={styles.dateDisplayBox}>
            {Platform.OS === 'web' && (
              <input type="date" style={styles.webInput} value={endDate.toISOString().split('T')[0]} onChange={(e) => setEndDate(new Date(e.target.value))} />
            )}
            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowEndPicker(true)} style={styles.dateInner}>
              <Text style={styles.dateText}>{endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>
          {Platform.OS !== 'web' && showEndPicker && (
            <DateTimePicker value={endDate} mode="date" display="default" minimumDate={startDate} onChange={(e, d) => { setShowEndPicker(false); if(d) setEndDate(d); }} />
          )}
        </View>
      );
      case 5: return (
        <View>
          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="e.g. New York" placeholderTextColor="#888" />
          <Text style={[styles.label, { marginTop: 15 }]}>Neighborhood</Text>
          <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholder="e.g. Brooklyn" placeholderTextColor="#888" />
          <Text style={[styles.label, { marginTop: 15 }]}>Full Address</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Street Address" placeholderTextColor="#888" />
        </View>
      );
      case 6: return (
        <View>
          <Text style={styles.label}>Emergency Contact Name</Text>
          <TextInput style={styles.input} value={emergencyContactName} onChangeText={setEmergencyContactName} placeholder="Name" placeholderTextColor="#888" />
          <Text style={[styles.label, { marginTop: 15 }]}>Emergency Phone</Text>
          <TextInput style={styles.input} value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" placeholder="Phone number" placeholderTextColor="#888" />
        </View>
      );
      case 7: return (
        <View>
          <Text style={styles.label}>Message to Volunteers</Text>
          <TextInput style={[styles.input, { height: 120 }]} multiline value={messageToVolunteers} onChangeText={setMessageToVolunteers} placeholder="Anything else they should know?" placeholderTextColor="#888" />
        </View>
      );
      case 8: return (
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.label, { fontSize: 20 }]}>Final Review</Text>
          <View style={{ marginTop: 20, width: '100%' }}>
            <Text style={styles.reviewText}>🐶 Pet: {petName}</Text>
            <Text style={styles.reviewText}>📅 Dates: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</Text>
            <Text style={styles.reviewText}>📍 Location: {neighborhood}, {city}</Text>
          </View>
        </View>
      );
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../../assets/petowner/Group 88.png")}
        style={styles.backgroundImage}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View
            style={[
              styles.header,
              {
                paddingHorizontal: wp(5),
                paddingTop: hp(2),
                paddingBottom: hp(2),
              },
            ]}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.headerBackBtn, { width: 36, height: 36 }]}
            >
              <MaterialIcons name="arrow-back" color={COLORS.white} size={20} />
            </Pressable>
            <Text style={[styles.headerTitle, { fontSize: fonts.large }]}>
              {isEditing ? "Edit Request" : "New Request"}
            </Text>
            <LogoCircle size={36} />
          </View>
          <StepProgressLabel currentStep={currentStep} totalSteps={8} currentStepLabel={STEPS[currentStep-1].label} />
          <StepProgressBar steps={STEPS} currentStep={currentStep} onStepPress={(id) => setCurrentStep(id)} />
          <LinearGradient colors={["#1E120C", "#0F0804"]} style={styles.card}>
            {renderStepContent()}
            <View style={styles.footer}>
              <TouchableOpacity onPress={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} style={[styles.backBtn, currentStep === 1 && { opacity: 0.3 }]}>
                <Text style={{ color: '#FFF' }}>← Back</Text>
              </TouchableOpacity>
              <Button 
                title={currentStep === 8 ? (isEditing ? "Submit Changes" : "Submit") : "Next"} 
                onPress={() => currentStep === 8 ? submitRequest() : setCurrentStep(currentStep + 1)} 
                variant="secondary"
              />
            </View>
          </LinearGradient>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#000" },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  card: {
    padding: 24,
    borderRadius: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  label: {
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 18,
    borderRadius: 16,
    color: "#FFF",
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  row: { flexDirection: "row", gap: 15 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 35,
    alignItems: "center",
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  dateDisplayBox: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    height: 64,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
    marginBottom: 5,
  },
  dateInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  dateText: { color: "#FFF", fontSize: 17, fontWeight: "500" },
  calendarIcon: { fontSize: 20, opacity: 0.8 },
  reviewText: {
    color: "#E5E7EB",
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  webInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
    zIndex: 10,
  },
  formTitle: {
    color: "#FFF",
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  header: {
    backgroundColor: "#4A3C35",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 20,
    marginHorizontal: -20, 
  },
  headerBackBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
  },
  headerTitle: {
    color: "#FFF",
    fontWeight: "700",
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  selectorBtnActive: {
    backgroundColor: COLORS.primary, // Using constant, or fallback to orange
    borderColor: COLORS.primary,
  },
  selectorBtnText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PetRequestDetailsScreen;