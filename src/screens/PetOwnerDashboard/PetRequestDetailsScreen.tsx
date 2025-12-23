import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { collection, addDoc, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"; 
import { db, auth } from "../../services/firebase";

// Components & Utils
import Button from "../../components/Button";
import RequestDetailsHeader from "../../components/RequestDetails/RequestDetailsHeader";
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
          <Text style={styles.label}>Pet's Name</Text>
          <TextInput style={styles.input} value={petName} onChangeText={setPetName} placeholder="e.g. Max" placeholderTextColor="#888" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Age</Text>
              <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="0" placeholderTextColor="#888" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity style={styles.input} onPress={() => setGender(gender === 'male' ? 'female' : 'male')}>
                <Text style={{ color: '#FFF' }}>{gender.toUpperCase()}</Text>
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
          <Text style={[styles.label, { marginTop: spacing.md }]}>Start Date</Text>
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

          <Text style={[styles.label, { marginTop: spacing.md }]}>End Date</Text>
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
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <RequestDetailsHeader title={isEditing ? "Edit Request" : "New Request"} onBack={() => navigation.goBack()} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#000" },
  card: { padding: 25, borderRadius: 20, marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  label: { color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: '600', fontSize: 14 },
  input: { backgroundColor: "rgba(255,255,255,0.08)", padding: 18, borderRadius: 12, color: "#FFF", marginBottom: 15, fontSize: 16 },
  row: { flexDirection: 'row', gap: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, alignItems: 'center' },
  backBtn: { padding: 15 },
  dateDisplayBox: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, height: 60, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', position: 'relative' },
  dateInner: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, alignItems: 'center' },
  dateText: { color: '#FFF', fontSize: 16 },
  calendarIcon: { fontSize: 18, opacity: 0.6 },
  reviewText: { color: '#CCC', fontSize: 16, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 10 },
  webInput: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 },
  formTitle: { color: "#FFF", fontWeight: '700' }
});

export default PetRequestDetailsScreen;