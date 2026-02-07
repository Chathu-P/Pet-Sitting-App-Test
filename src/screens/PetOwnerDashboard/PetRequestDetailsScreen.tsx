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
  Animated,
  Easing,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import LogoCircle from "../../components/LogoCircle";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../services/firebase";

// Components & Utils
import Button from "../../components/Button";
import StepProgressBar from "../../components/RequestDetails/StepProgressBar";
import StepProgressLabel from "../../components/RequestDetails/StepProgressLabel";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";

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

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const buttonPressAnim = React.useRef(new Animated.Value(1)).current;
  const contentOpacity = React.useRef(new Animated.Value(0)).current;
  const petTypeSelectorAnim = React.useRef(new Animated.Value(1)).current;
  const sizeSelectorAnim = React.useRef(new Animated.Value(1)).current;

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
        } catch (error) {
          console.error("Load error:", error);
        }
      };
      loadData();
    }
  }, [requestId, isEditing]);

  // Initial animation on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Step transition animation
  useEffect(() => {
    contentOpacity.setValue(0);
    petTypeSelectorAnim.setValue(1);
    sizeSelectorAnim.setValue(1);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  // Button press animation handler
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonPressAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonPressAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Selector button press animation
  const animateSelectorPress = (animRef: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animRef, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animRef, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const submitRequest = async () => {
    setIsSubmitting(true);
    try {
      const requestData = {
        ownerId: auth.currentUser?.uid,
        petName,
        petType,
        breed,
        age,
        gender,
        size,
        temperament,
        behaviorNotes,
        feedingSchedule,
        walkRequirement,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        city,
        neighborhood,
        address,
        emergencyContactName,
        emergencyPhone,
        messageToVolunteers,
        location: neighborhood || city,
        status: "Open",
        updatedAt: serverTimestamp(),
      };

      if (isEditing && requestId) {
        await setDoc(doc(db, "requests", requestId), requestData, {
          merge: true,
        });
        Alert.alert("Success", "Changes updated!");
      } else {
        await addDoc(collection(db, "requests"), {
          ...requestData,
          createdAt: serverTimestamp(),
        });
        Alert.alert("Success", "Request posted!");
      }
      navigation.navigate("PetOwnerDashboardScreen");
    } catch (error) {
      Alert.alert("Error", "Could not save details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            {/* Pet Type Selector */}
            <Text style={styles.label}>Pet Type</Text>
            <View style={[styles.row, { marginBottom: 20 }]}>
              {["dog", "cat", "other"].map((t) => (
                <Animated.View
                  key={t}
                  style={{
                    flex: 1,
                    transform: [{ scale: petTypeSelectorAnim }],
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      petType === t && styles.selectorBtnActive,
                    ]}
                    onPress={() => {
                      animateSelectorPress(petTypeSelectorAnim);
                      setPetType(t);
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorBtnText,
                        petType === t && { color: "#FFF" },
                      ]}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <Text style={styles.label}>Pet's Name</Text>
            <TextInput
              style={styles.input}
              value={petName}
              onChangeText={setPetName}
              placeholder="e.g. Max"
              placeholderTextColor="#B8A89B"
            />

            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholder="e.g. Golden Retriever"
              placeholderTextColor="#B8A89B"
            />

            {/* Size Selector */}
            <Text style={styles.label}>Size</Text>
            <View style={[styles.row, { marginBottom: 20 }]}>
              {["small", "medium", "large"].map((s) => (
                <Animated.View
                  key={s}
                  style={{
                    flex: 1,
                    transform: [{ scale: sizeSelectorAnim }],
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      size === s && styles.selectorBtnActive,
                    ]}
                    onPress={() => {
                      animateSelectorPress(sizeSelectorAnim);
                      setSize(s);
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorBtnText,
                        size === s && { color: "#FFF" },
                      ]}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#B8A89B"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Gender</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => {
                    animateButtonPress();
                    setGender(gender === "male" ? "female" : "male");
                  }}
                >
                  <Text style={{ color: "#2C2C2C", textAlign: "center" }}>
                    {gender.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.label}>Temperament</Text>
            <TextInput
              style={styles.input}
              value={temperament}
              onChangeText={setTemperament}
              placeholder="Friendly, Shy, etc."
              placeholderTextColor="#B8A89B"
            />
            <Text style={[styles.label, { marginTop: 15 }]}>
              Behavior Notes
            </Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={behaviorNotes}
              onChangeText={setBehaviorNotes}
              placeholder="Any quirks?"
              placeholderTextColor="#B8A89B"
            />
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.label}>Feeding Schedule</Text>
            <TextInput
              style={styles.input}
              value={feedingSchedule}
              onChangeText={setFeedingSchedule}
              placeholder="Twice a day..."
              placeholderTextColor="#B8A89B"
            />
            <TouchableOpacity
              style={[
                styles.input,
                {
                  marginTop: 20,
                  backgroundColor: walkRequirement ? COLORS.primary : "#F5F0E8",
                },
              ]}
              onPress={() => {
                animateButtonPress();
                setWalkRequirement(!walkRequirement);
              }}
            >
              <Text
                style={{
                  color: walkRequirement ? "#FFF" : "#8B7355",
                  textAlign: "center",
                }}
              >
                {walkRequirement ? "✓ Walks Required" : "No Walks Required"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={[styles.formTitle, { fontSize: fonts.xlarge }]}>
              When?
            </Text>
            <Text style={[styles.label, { marginTop: spacing.nmd }]}>
              Start Date
            </Text>
            <View style={styles.dateDisplayBox}>
              {Platform.OS === "web" && (
                <input
                  type="date"
                  style={styles.webInput}
                  value={startDate.toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                />
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowStartPicker(true)}
                style={styles.dateInner}
              >
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
            {Platform.OS !== "web" && showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(e, d) => {
                  setShowStartPicker(false);
                  if (d) setStartDate(d);
                }}
              />
            )}

            <Text style={[styles.label, { marginTop: spacing.nmd }]}>
              End Date
            </Text>
            <View style={styles.dateDisplayBox}>
              {Platform.OS === "web" && (
                <input
                  type="date"
                  style={styles.webInput}
                  value={endDate.toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                />
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowEndPicker(true)}
                style={styles.dateInner}
              >
                <Text style={styles.dateText}>
                  {endDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
            </View>
            {Platform.OS !== "web" && showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                minimumDate={startDate}
                onChange={(e, d) => {
                  setShowEndPicker(false);
                  if (d) setEndDate(d);
                }}
              />
            )}
          </View>
        );
      case 5:
        return (
          <View>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. New York"
              placeholderTextColor="#B8A89B"
            />
            <Text style={[styles.label, { marginTop: 15 }]}>Neighborhood</Text>
            <TextInput
              style={styles.input}
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="e.g. Brooklyn"
              placeholderTextColor="#B8A89B"
            />
            <Text style={[styles.label, { marginTop: 15 }]}>Full Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Street Address"
              placeholderTextColor="#B8A89B"
            />
          </View>
        );
      case 6:
        return (
          <View>
            <Text style={styles.label}>Emergency Contact Name</Text>
            <TextInput
              style={styles.input}
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
              placeholder="Name"
              placeholderTextColor="#B8A89B"
            />
            <Text style={[styles.label, { marginTop: 15 }]}>
              Emergency Phone
            </Text>
            <TextInput
              style={styles.input}
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              keyboardType="phone-pad"
              placeholder="Phone number"
              placeholderTextColor="#B8A89B"
            />
          </View>
        );
      case 7:
        return (
          <View>
            <Text style={styles.label}>Message to Volunteers</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              multiline
              value={messageToVolunteers}
              onChangeText={setMessageToVolunteers}
              placeholder="Anything else they should know?"
              placeholderTextColor="#B8A89B"
            />
          </View>
        );
      case 8:
        return (
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.label, { fontSize: 20 }]}>Final Review</Text>
            <View style={{ marginTop: 20, width: "100%" }}>
              <Animated.View
                style={{
                  opacity: contentOpacity,
                  transform: [{ translateX: slideAnim }],
                }}
              >
                <Text style={styles.reviewText}>🐶 Pet: {petName}</Text>
              </Animated.View>
              <Animated.View
                style={{
                  opacity: contentOpacity,
                  transform: [{ translateX: slideAnim }],
                  marginTop: 8,
                }}
              >
                <Text style={styles.reviewText}>
                  📅 Dates: {startDate.toLocaleDateString()} -{" "}
                  {endDate.toLocaleDateString()}
                </Text>
              </Animated.View>
              <Animated.View
                style={{
                  opacity: contentOpacity,
                  transform: [{ translateX: slideAnim }],
                  marginTop: 8,
                }}
              >
                <Text style={styles.reviewText}>
                  📍 Location: {neighborhood}, {city}
                </Text>
              </Animated.View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../../assets/petowner/Group 88.png")}
        style={styles.backgroundImage}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
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
                onPress={() => {
                  animateButtonPress();
                  navigation.goBack();
                }}
                style={[styles.headerBackBtn, { width: 36, height: 36 }]}
              >
                <MaterialIcons
                  name="arrow-back"
                  color={COLORS.white}
                  size={20}
                />
              </Pressable>
              <Text style={[styles.headerTitle, { fontSize: fonts.large }]}>
                {isEditing ? "Edit Request" : "New Request"}
              </Text>
              <LogoCircle size={36} />
            </View>
          </Animated.View>
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <StepProgressLabel
              currentStep={currentStep}
              totalSteps={8}
              currentStepLabel={STEPS[currentStep - 1].label}
            />
            <StepProgressBar
              steps={STEPS}
              currentStep={currentStep}
              onStepPress={(id) => setCurrentStep(id)}
            />
          </Animated.View>
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient colors={["#FAF8F3", "#F5F0E8"]} style={styles.card}>
              <Animated.View style={{ opacity: contentOpacity }}>
                {renderStepContent()}
              </Animated.View>
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={() => {
                    animateButtonPress();
                    setCurrentStep(Math.max(1, currentStep - 1));
                  }}
                  disabled={currentStep === 1}
                  style={[
                    styles.backBtn,
                    currentStep === 1 && { opacity: 0.3 },
                  ]}
                >
                  <Text style={{ color: "#6B5D56" }}>← Back</Text>
                </TouchableOpacity>
                <Animated.View
                  style={{
                    transform: [{ scale: buttonPressAnim }],
                  }}
                >
                  <Button
                    title={
                      currentStep === 8
                        ? isEditing
                          ? "Submit Changes"
                          : "Submit"
                        : "Next"
                    }
                    onPress={() => {
                      animateButtonPress();
                      currentStep === 8
                        ? submitRequest()
                        : setCurrentStep(currentStep + 1);
                    }}
                    variant="secondary"
                  />
                </Animated.View>
              </View>
            </LinearGradient>
          </Animated.View>
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
    padding: 22,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E8DCCC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    color: "#6B5D56",
    marginBottom: 8,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    color: "#2C2C2C",
    marginBottom: 16,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: "#E8DCCC",
  },
  row: { flexDirection: "row", gap: 15 },
  dateInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    alignItems: "center",
  },
  dateText: {
    color: "#2C2C2C",
    fontSize: 14,
    fontWeight: "600",
  },
  calendarIcon: {
    fontSize: 22,
    opacity: 0.7,
  },
  reviewText: {
    color: "#3C3C3C",
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: "#F9F6F2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8DCCC",
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
    color: "#6B5D56",
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  header: {
    backgroundColor: "#E8DCD0",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
    backgroundColor: "rgba(205, 127, 74, 0.15)",
    borderRadius: 12,
  },
  headerTitle: {
    color: "#6B5D56",
    fontWeight: "700",
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#F5F0E8",
    borderWidth: 1.5,
    borderColor: "#E8DCCC",
    alignItems: "center",
  },
  selectorBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectorBtnText: {
    color: "#8B7355",
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#F5F0E8",
    borderWidth: 1,
    borderColor: "#E8DCCC",
  },
  dateDisplayBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E8DCCC",
    position: "relative",
    marginBottom: 6,
  },
});

export default PetRequestDetailsScreen;
