import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../components/Button";
import RequestDetailsHeader from "../../components/RequestDetails/RequestDetailsHeader";
import StepProgressBar from "../../components/RequestDetails/StepProgressBar";
import StepProgressLabel from "../../components/RequestDetails/StepProgressLabel";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
  getResponsiveShadow,
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

interface PetRequestDetailsScreenProps {
  navigation?: any;
}

const PetRequestDetailsScreen: React.FC<PetRequestDetailsScreenProps> = ({
  navigation,
}) => {
  const { wp, hp, isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const [currentStep, setCurrentStep] = useState(1);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [size, setSize] = useState("medium");

  // Personality state
  const [temperament, setTemperament] = useState("friendly");
  const [goodWithChildren, setGoodWithChildren] = useState(true);
  const [goodWithPets, setGoodWithPets] = useState(true);
  const [houseTrained, setHouseTrained] = useState(true);
  const [behaviorNotes, setBehaviorNotes] = useState("");

  // Care state
  const [feedingSchedule, setFeedingSchedule] = useState("");
  const [dietType, setDietType] = useState("dry food");
  const [walkRequirement, setWalkRequirement] = useState(true);
  const [medicationNeeded, setMedicationNeeded] = useState(false);

  // Duration state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationType, setDurationType] = useState("short-term");

  // Location state
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [dropOffType, setDropOffType] = useState("volunteer-home");
  const [address, setAddress] = useState("");

  // Emergency state
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [preferredVet, setPreferredVet] = useState("");
  const [isVaccinated, setIsVaccinated] = useState(true);

  // Preferences state
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [volunteerWithPets, setVolunteerWithPets] = useState(true);
  const [genderPreference, setGenderPreference] = useState("no-preference");
  const [backupVolunteer, setBackupVolunteer] = useState(true);
  const [messageToVolunteers, setMessageToVolunteers] = useState("");

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      if (navigation?.navigate) {
        navigation.navigate("PetOwnerDashboardScreen");
      }
    }
  };

  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPetBasicDetails();
      case 2:
        return renderPersonality();
      case 3:
        return renderCare();
      case 4:
        return renderDuration();
      case 5:
        return renderLocation();
      case 6:
        return renderEmergency();
      case 7:
        return renderPreferences();
      case 8:
        return renderReview();
      default:
        return renderPetBasicDetails();
    }
  };

  const renderPetBasicDetails = () => (
    <View>
      <Text
        style={[
          styles.formTitle,
          { fontSize: fonts.xlarge, marginBottom: spacing.sm },
        ]}
      >
        Pet Basic Details
      </Text>
      <Text
        style={[
          styles.formSubtitle,
          { fontSize: fonts.regular, marginBottom: spacing.lg },
        ]}
      >
        Helps volunteers quickly identify the pet.
      </Text>

      {/* Pet Name */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={[styles.label, { fontSize: fonts.regular }]}>
          Pet's Name
        </Text>
        <TextInput
          style={[styles.input, { marginTop: spacing.sm }]}
          placeholder="e.g. Max"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={petName}
          onChangeText={setPetName}
        />
      </View>

      {/* Pet Type */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={[styles.label, { fontSize: fonts.regular }]}>
          Pet Type
        </Text>
        <View style={[styles.buttonGroup, { marginTop: spacing.sm }]}>
          {["Dog", "Cat", "Other"].map((type, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setPetType(type.toLowerCase())}
              style={[
                styles.buttonGroupItem,
                petType === type.toLowerCase() && styles.buttonGroupItemActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  petType === type.toLowerCase() &&
                    styles.buttonGroupTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Breed */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={[styles.label, { fontSize: fonts.regular }]}>
          Breed (Optional)
        </Text>
        <TextInput
          style={[styles.input, { marginTop: spacing.sm }]}
          placeholder="e.g. Golden Retriever"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={breed}
          onChangeText={setBreed}
        />
      </View>

      {/* Age and Gender */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { fontSize: fonts.regular }]}>
            Age (Years)
          </Text>
          <TextInput
            style={[styles.input, { marginTop: spacing.sm }]}
            placeholder="e.g. 3"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { fontSize: fonts.regular }]}>
            Gender
          </Text>
          <View
            style={[
              styles.dropdown,
              {
                marginTop: spacing.sm,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <Text style={styles.dropdownText}>{gender}</Text>
          </View>
        </View>
      </View>

      {/* Size */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={[styles.label, { fontSize: fonts.regular }]}>Size</Text>
        <View style={[styles.buttonGroup, { marginTop: spacing.sm }]}>
          {["Small", "Medium", "Large"].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSize(s.toLowerCase())}
              style={[
                styles.buttonGroupItem,
                size === s.toLowerCase() && styles.buttonGroupItemActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  size === s.toLowerCase() && styles.buttonGroupTextActive,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pet Photos */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={[styles.label, { fontSize: fonts.regular }]}>
          Pet Photo{" "}
        </Text>
        <TouchableOpacity
          style={[styles.uploadBox, { marginTop: spacing.sm, height: hp(12) }]}
        >
          <Text style={{ fontSize: 40, color: "rgba(255,255,255,0.4)" }}>
            +
          </Text>
          <Text style={[styles.uploadText, { fontSize: fonts.regular }]}>
            Upload Photo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPersonality = () => (
    <View>
      <Text
        style={[
          styles.formTitle,
          { fontSize: fonts.xlarge, marginBottom: spacing.sm },
        ]}
      >
        Personality & Behavior
      </Text>
      <Text
        style={[
          styles.formSubtitle,
          { fontSize: fonts.regular, marginBottom: spacing.lg },
        ]}
      >
        Help volunteers understand your pet's character.
      </Text>

      {/* Temperament */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Temperament
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.sm }}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {["Friendly", "Shy", "Aggressive", "Calm"].map((temp) => (
            <TouchableOpacity
              key={temp}
              onPress={() => setTemperament(temp.toLowerCase())}
              style={[
                styles.temperamentButton,
                temperament === temp.toLowerCase() &&
                  styles.buttonGroupItemActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  temperament === temp.toLowerCase() &&
                    styles.buttonGroupTextActive,
                ]}
              >
                {temp}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Good with children and pets - Two columns */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        {/* Good with children */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { fontSize: fonts.regular, marginBottom: spacing.sm },
            ]}
          >
            Good with children?
          </Text>
          <View style={[styles.yesNoGroup, { marginTop: spacing.sm }]}>
            <TouchableOpacity
              onPress={() => setGoodWithChildren(true)}
              style={[
                styles.yesNoButton,
                goodWithChildren && styles.yesNoButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  goodWithChildren && styles.buttonGroupTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGoodWithChildren(false)}
              style={[
                styles.yesNoButton,
                !goodWithChildren && styles.yesNoButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  !goodWithChildren && styles.buttonGroupTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Good with other pets */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { fontSize: fonts.regular, marginBottom: spacing.sm },
            ]}
          >
            Good with other pets?
          </Text>
          <View style={[styles.yesNoGroup, { marginTop: spacing.sm }]}>
            <TouchableOpacity
              onPress={() => setGoodWithPets(true)}
              style={[
                styles.yesNoButton,
                goodWithPets && styles.yesNoButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  goodWithPets && styles.buttonGroupTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGoodWithPets(false)}
              style={[
                styles.yesNoButton,
                !goodWithPets && styles.yesNoButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  !goodWithPets && styles.buttonGroupTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* House-trained */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          House-trained?
        </Text>
        <View style={[styles.yesNoGroup, { marginTop: spacing.sm }]}>
          <TouchableOpacity
            onPress={() => setHouseTrained(true)}
            style={[
              styles.yesNoButton,
              houseTrained && styles.yesNoButtonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                houseTrained && styles.buttonGroupTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setHouseTrained(false)}
            style={[
              styles.yesNoButton,
              !houseTrained && styles.yesNoButtonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                !houseTrained && styles.buttonGroupTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Special Behavior Notes */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Special Behavior Notes
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { marginTop: spacing.sm, height: hp(12) },
          ]}
          placeholder="e.g. Afraid of loud noises, pulls leash, separation anxiety..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={behaviorNotes}
          onChangeText={setBehaviorNotes}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderCare = () => (
    <View>
      <Text
        style={[
          styles.formTitle,
          { fontSize: fonts.xlarge, marginBottom: spacing.sm },
        ]}
      >
        Care Requirements
      </Text>
      <Text
        style={[
          styles.formSubtitle,
          { fontSize: fonts.regular, marginBottom: spacing.lg },
        ]}
      >
        Daily routines and medical needs.
      </Text>

      {/* Feeding Schedule */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Feeding Schedule
        </Text>
        <TextInput
          style={[styles.input, { marginTop: spacing.sm }]}
          placeholder="e.g. 8:00 AM and 6:00 PM"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={feedingSchedule}
          onChangeText={setFeedingSchedule}
        />
      </View>

      {/* Diet Type */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Diet Type
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.sm }}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {["Dry Food", "Home Food", "Special Diet"].map((diet) => (
            <TouchableOpacity
              key={diet}
              onPress={() => setDietType(diet.toLowerCase())}
              style={[
                styles.temperamentButton,
                dietType === diet.toLowerCase() && styles.buttonGroupItemActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  dietType === diet.toLowerCase() &&
                    styles.buttonGroupTextActive,
                ]}
              >
                {diet}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Walk Requirement */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Walk Requirement
        </Text>
        <View style={[styles.yesNoGroup, { marginTop: spacing.sm }]}>
          <TouchableOpacity
            onPress={() => setWalkRequirement(true)}
            style={[
              styles.yesNoButton,
              walkRequirement && styles.yesNoButtonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                walkRequirement && styles.buttonGroupTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setWalkRequirement(false)}
            style={[
              styles.yesNoButton,
              !walkRequirement && styles.yesNoButtonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                !walkRequirement && styles.buttonGroupTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Medication Needed */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Medication Needed?
        </Text>
        <View style={[styles.yesNoGroup, { marginTop: spacing.sm }]}>
          <TouchableOpacity
            onPress={() => setMedicationNeeded(true)}
            style={[
              styles.yesNoButton,
              medicationNeeded && styles.yesNoButtonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                medicationNeeded && styles.buttonGroupTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMedicationNeeded(false)}
            style={[
              styles.yesNoButton,
              !medicationNeeded && styles.yesNoButtonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                !medicationNeeded && styles.buttonGroupTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderDuration = () => (
    <View>
      <Text
        style={[
          styles.formTitle,
          { fontSize: fonts.xlarge, marginBottom: spacing.sm },
        ]}
      >
        Duration & Availability
      </Text>
      <Text
        style={[
          styles.formSubtitle,
          { fontSize: fonts.regular, marginBottom: spacing.lg },
        ]}
      >
        When do you need a sitter?
      </Text>

      {/* Start Date and End Date - Two columns */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        {/* Start Date */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { fontSize: fonts.regular, marginBottom: spacing.sm },
            ]}
          >
            Start Date
          </Text>
          <TextInput
            style={[styles.input, { marginTop: spacing.sm }]}
            placeholder="mm/dd/yyyy"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={startDate}
            onChangeText={setStartDate}
          />
        </View>

        {/* End Date */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { fontSize: fonts.regular, marginBottom: spacing.sm },
            ]}
          >
            End Date
          </Text>
          <TextInput
            style={[styles.input, { marginTop: spacing.sm }]}
            placeholder="mm/dd/yyyy"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>
      </View>

      {/* Duration Type */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Duration Type
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.sm }}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {[
            { key: "short-term", label: "Short-term (1-3 days)" },
            { key: "medium", label: "Medium (1-2 weeks)" },
            { key: "long-term", label: "Long-term (1+ month)" },
          ].map((duration) => (
            <TouchableOpacity
              key={duration.key}
              onPress={() => setDurationType(duration.key)}
              style={[
                styles.durationTypeButton,
                durationType === duration.key && styles.buttonGroupItemActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  durationType === duration.key && styles.buttonGroupTextActive,
                ]}
              >
                {duration.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderLocation = () => (
    <View>
      <Text
        style={[
          styles.formTitle,
          { fontSize: fonts.xlarge, marginBottom: spacing.sm },
        ]}
      >
        Location Details
      </Text>
      <Text
        style={[
          styles.formSubtitle,
          { fontSize: fonts.regular, marginBottom: spacing.lg },
        ]}
      >
        Where will the care take place?
      </Text>

      {/* City and Neighborhood - Two columns */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        {/* City */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { fontSize: fonts.regular, marginBottom: spacing.sm },
            ]}
          >
            City
          </Text>
          <TextInput
            style={[styles.input, { marginTop: spacing.sm }]}
            placeholder="e.g. New York"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Area / Neighborhood */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { fontSize: fonts.regular, marginBottom: spacing.sm },
            ]}
          >
            Area / Neighborhood
          </Text>
          <TextInput
            style={[styles.input, { marginTop: spacing.sm }]}
            placeholder="e.g. Brooklyn Heights"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={neighborhood}
            onChangeText={setNeighborhood}
          />
        </View>
      </View>

      {/* Drop-off Type */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Drop-off Type
        </Text>
        <View
          style={[
            styles.buttonGroup,
            { marginTop: spacing.sm, flexWrap: "wrap" },
          ]}
        >
          <TouchableOpacity
            onPress={() => setDropOffType("volunteer-home")}
            style={[
              styles.dropOffButton,
              dropOffType === "volunteer-home" && styles.buttonGroupItemActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                dropOffType === "volunteer-home" &&
                  styles.buttonGroupTextActive,
              ]}
            >
              Pet stays at volunteer's home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDropOffType("owner-home")}
            style={[
              styles.dropOffButton,
              dropOffType === "owner-home" && styles.buttonGroupItemActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                dropOffType === "owner-home" && styles.buttonGroupTextActive,
              ]}
            >
              Volunteer visits owner's home
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Address / Additional Details */}
      <View style={{ marginBottom: spacing.xl }}>
        <TextInput
          style={[
            styles.addressInput,
            { height: hp(8), paddingHorizontal: spacing.lg },
          ]}
          placeholder="Enter full address or additional location details..."
          placeholderTextColor="rgba(90, 74, 66, 0.5)"
          value={address}
          onChangeText={setAddress}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderEmergency = () => (
    <View>
      <Text
        style={[
          styles.formTitle,
          { fontSize: fonts.xlarge, marginBottom: spacing.sm },
        ]}
      >
        Emergency & Safety
      </Text>
      <Text
        style={[
          styles.formSubtitle,
          { fontSize: fonts.regular, marginBottom: spacing.lg },
        ]}
      >
        Important contacts for peace of mind.
      </Text>

      {/* Emergency Contact Name and Phone - Two columns */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        {/* Emergency Contact Name */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { fontSize: fonts.regular, marginBottom: spacing.sm },
            ]}
          >
            Emergency Contact Name
          </Text>
          <TextInput
            style={[styles.input, { marginTop: spacing.sm }]}
            placeholder="e.g. John Doe"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
          />
        </View>

        {/* Emergency Phone */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { fontSize: fonts.regular, marginBottom: spacing.sm },
            ]}
          >
            Emergency Phone
          </Text>
          <TextInput
            style={[styles.input, { marginTop: spacing.sm }]}
            placeholder="e.g. +1 234 567 8900"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Preferred Vet / Clinic */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Preferred Vet / Clinic
        </Text>
        <TextInput
          style={[styles.input, { marginTop: spacing.sm }]}
          placeholder="e.g. City Paws Clinic (Optional)"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={preferredVet}
          onChangeText={setPreferredVet}
        />
      </View>

      {/* Vaccinated? */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Vaccinated?
        </Text>
        <View style={[styles.yesNoGroup, { marginTop: spacing.sm }]}>
          <TouchableOpacity
            onPress={() => setIsVaccinated(true)}
            style={[
              styles.yesNoButton,
              isVaccinated && styles.yesNoButtonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                isVaccinated && styles.buttonGroupTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsVaccinated(false)}
            style={[
              styles.yesNoButton,
              !isVaccinated && styles.yesNoButtonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                !isVaccinated && styles.buttonGroupTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPreferences = () => (
    <View>
      <Text
        style={[
          styles.formTitle,
          { fontSize: fonts.xlarge, marginBottom: spacing.sm },
        ]}
      >
        Volunteer Preferences
      </Text>
      <Text
        style={[
          styles.formSubtitle,
          { fontSize: fonts.regular, marginBottom: spacing.lg },
        ]}
      >
        Find the perfect match for your pet.
      </Text>

      {/* Preferred Experience Level */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Preferred Experience Level
        </Text>
        <View style={[styles.buttonGroup, { marginTop: spacing.sm }]}>
          <TouchableOpacity
            onPress={() => setExperienceLevel("beginner")}
            style={[
              styles.buttonGroupItem,
              experienceLevel === "beginner" && styles.buttonGroupItemActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                experienceLevel === "beginner" && styles.buttonGroupTextActive,
              ]}
            >
              Beginner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setExperienceLevel("experienced")}
            style={[
              styles.buttonGroupItem,
              experienceLevel === "experienced" && styles.buttonGroupItemActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                experienceLevel === "experienced" &&
                  styles.buttonGroupTextActive,
              ]}
            >
              Experienced
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Volunteer with pets before and Gender Preference - Two columns */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        {/* Volunteer with pets before */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { fontSize: fonts.regular, marginBottom: spacing.sm },
            ]}
          >
            Volunteer with pets before?
          </Text>
          <View style={[styles.yesNoGroup, { marginTop: spacing.sm }]}>
            <TouchableOpacity
              onPress={() => setVolunteerWithPets(true)}
              style={[
                styles.yesNoButton,
                volunteerWithPets && styles.yesNoButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  volunteerWithPets && styles.buttonGroupTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setVolunteerWithPets(false)}
              style={[
                styles.yesNoButton,
                !volunteerWithPets && styles.yesNoButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.buttonGroupText,
                  !volunteerWithPets && styles.buttonGroupTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gender Preference */}
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.label,
              { fontSize: fonts.regular, marginBottom: spacing.sm },
            ]}
          >
            Gender Preference
          </Text>
          <View
            style={[
              styles.dropdown,
              {
                marginTop: spacing.sm,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <Text style={styles.dropdownText}>
              {genderPreference === "no-preference"
                ? "No Preference"
                : genderPreference === "male"
                ? "Male"
                : "Female"}
            </Text>
          </View>
        </View>
      </View>

      {/* Backup Volunteer allowed */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Backup Volunteer allowed?
        </Text>
        <View style={[styles.yesNoGroup, { marginTop: spacing.sm }]}>
          <TouchableOpacity
            onPress={() => setBackupVolunteer(true)}
            style={[
              styles.yesNoButton,
              backupVolunteer && styles.yesNoButtonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                backupVolunteer && styles.buttonGroupTextActive,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setBackupVolunteer(false)}
            style={[
              styles.yesNoButton,
              !backupVolunteer && styles.yesNoButtonActive,
            ]}
          >
            <Text
              style={[
                styles.buttonGroupText,
                !backupVolunteer && styles.buttonGroupTextActive,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Message to Volunteers */}
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={[
            styles.label,
            { fontSize: fonts.regular, marginBottom: spacing.sm },
          ]}
        >
          Message to Volunteers
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { marginTop: spacing.sm, height: hp(12) },
          ]}
          placeholder="e.g. He loves evening walks and belly rubs 😊"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={messageToVolunteers}
          onChangeText={setMessageToVolunteers}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderReview = () => (
    <View>
      <Text
        style={[
          styles.formTitle,
          { fontSize: fonts.xlarge, marginBottom: spacing.sm },
        ]}
      >
        Review Request
      </Text>
      <Text
        style={[
          styles.formSubtitle,
          { fontSize: fonts.regular, marginBottom: spacing.lg },
        ]}
      >
        Please review all details before submitting.
      </Text>

      {/* Pet Details Card */}
      <View style={[styles.reviewCard, { marginBottom: spacing.md }]}>
        <View style={styles.reviewCardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.reviewCardTitle}>Pet Details</Text>
          </View>
          <TouchableOpacity onPress={() => setCurrentStep(1)}>
            <Text style={styles.editButton}>✎ Edit</Text>
          </TouchableOpacity>
        </View>
        {petType && (
          <View style={styles.reviewCardContent}>
            <Text style={styles.reviewLabel}>Type</Text>
            <Text style={styles.reviewValue}>{petType}</Text>
          </View>
        )}
      </View>

      {/* Personality Card */}
      <View style={[styles.reviewCard, { marginBottom: spacing.md }]}>
        <View style={styles.reviewCardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.reviewCardTitle}>Personality</Text>
          </View>
          <TouchableOpacity onPress={() => setCurrentStep(2)}>
            <Text style={styles.editButton}>✎ Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Care Requirements Card */}
      <View style={[styles.reviewCard, { marginBottom: spacing.md }]}>
        <View style={styles.reviewCardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.reviewCardTitle}>Care Requirements</Text>
          </View>
          <TouchableOpacity onPress={() => setCurrentStep(3)}>
            <Text style={styles.editButton}>✎ Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.reviewCardContent}>
          <Text style={styles.reviewLabel}>Walks</Text>
          <Text style={styles.reviewValue}>
            {walkRequirement ? "Yes" : "No"}
          </Text>
        </View>
      </View>

      {/* Duration Card */}
      <View style={[styles.reviewCard, { marginBottom: spacing.md }]}>
        <View style={styles.reviewCardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.reviewCardTitle}>Duration</Text>
          </View>
          <TouchableOpacity onPress={() => setCurrentStep(4)}>
            <Text style={styles.editButton}>✎ Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Card */}
      <View style={[styles.reviewCard, { marginBottom: spacing.md }]}>
        <View style={styles.reviewCardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.reviewCardTitle}>Location</Text>
          </View>
          <TouchableOpacity onPress={() => setCurrentStep(5)}>
            <Text style={styles.editButton}>✎ Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Card */}
      <View style={[styles.reviewCard, { marginBottom: spacing.md }]}>
        <View style={styles.reviewCardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.reviewCardTitle}>Emergency</Text>
          </View>
          <TouchableOpacity onPress={() => setCurrentStep(6)}>
            <Text style={styles.editButton}>✎ Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preferences Card */}
      <View style={[styles.reviewCard, { marginBottom: spacing.xl }]}>
        <View style={styles.reviewCardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.reviewCardTitle}>Preferences</Text>
          </View>
          <TouchableOpacity onPress={() => setCurrentStep(7)}>
            <Text style={styles.editButton}>✎ Edit</Text>
          </TouchableOpacity>
        </View>
        {genderPreference && (
          <View style={styles.reviewCardContent}>
            <Text style={styles.reviewLabel}>Gender Pref</Text>
            <Text style={styles.reviewValue}>{genderPreference}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <RequestDetailsHeader title="Request Details" onBack={handleBack} />

        <StepProgressLabel
          currentStep={currentStep}
          totalSteps={STEPS.length}
          currentStepLabel={STEPS[currentStep - 1].label}
        />

        <StepProgressBar
          steps={STEPS}
          currentStep={currentStep}
          onStepPress={(id) => setCurrentStep(id)}
        />

        {/* Main Content Card */}
        <LinearGradient
          colors={["rgba(30, 18, 12, 0.95)", "rgba(15, 8, 4, 0.98)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.mainCard,
            {
              marginHorizontal: wp(3),
              marginTop: spacing.lg,
              paddingVertical: spacing.xl,
              paddingHorizontal: spacing.lg,
              borderRadius: BORDER_RADIUS.md,
            },
            getResponsiveShadow(8),
          ]}
        >
          {/* Form Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <View
            style={[
              styles.buttonContainer,
              { marginTop: spacing.xl, gap: spacing.md },
            ]}
          >
            <TouchableOpacity
              onPress={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              style={[styles.prevButton, currentStep === 1 && { opacity: 0.5 }]}
            >
              <Text style={[styles.prevButtonText, { fontSize: fonts.medium }]}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Button
              title={currentStep === STEPS.length ? "Submit" : "Next "}
              variant="secondary"
              onPress={handleNext}
              style={{ flex: 1, borderRadius: BORDER_RADIUS.lg }}
              textStyle={{ fontSize: fonts.medium, fontWeight: "600" }}
            />
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  mainCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  formTitle: {
    color: COLORS.white,
    fontWeight: "700",
  },
  formSubtitle: {
    color: "rgba(255,255,255,0.7)",
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.white,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  buttonGroupItem: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
  },
  buttonGroupItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonGroupText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  buttonGroupTextActive: {
    color: COLORS.white,
  },
  dropdown: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
  },
  dropdownText: {
    color: COLORS.white,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  uploadBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    borderStyle: "dashed",
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  uploadText: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    marginTop: SPACING.sm,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  prevButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  prevButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  yesNoGroup: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  yesNoButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  yesNoButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  temperamentButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
    minHeight: 48,
  },
  textArea: {
    paddingTop: SPACING.md,
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  calendarIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  dateInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
  },
  durationTypeButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  dropOffButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  addressInput: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.md,
    color: "#5A4A42",
    fontSize: 14,
  },
  reviewCard: {
    backgroundColor: "#4A3A32",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  reviewCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkIcon: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: SPACING.sm,
  },
  reviewCardTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    color: "#FF6B9D",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewCardContent: {
    marginTop: SPACING.md,
  },
  reviewLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  reviewValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});

export default PetRequestDetailsScreen;
