import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../utils/constants";
import Header from "../components/Header";
// import * as ImagePicker from 'expo-image-picker'; // Commented out to avoid dep issues

const AddDiaryEntryScreen = () => {
    const [note, setNote] = useState("");
    const [mood, setMood] = useState("Happy");
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const moods = ["Happy", "Playful", "Sleepy", "Grumpy", "Hungry"];

    const handlePickImage = () => {
        // Simulating image pick for simplicity and robustness
        setPhotoUrl("https://placedog.net/500/280?random=" + Math.random());
    };

    const handleSubmit = async () => {
        if (!note && !photoUrl) {
            Alert.alert("Error", "Please add a note or photo");
            return;
        }
        setLoading(true);
        try {
            const user = auth.currentUser;
            await addDoc(collection(db, "diary_entries"), {
                note,
                mood,
                photoUrl,
                createdAt: serverTimestamp(),
                createdBy: user?.uid,
                relatedUsers: [user?.uid] // Add logic to include Owner ID here in real app
            });
            Alert.alert("Success", "Diary entry added!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Failed to add entry");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Add Entry" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Mood</Text>
                <View style={styles.moodsContainer}>
                    {moods.map(m => (
                        <TouchableOpacity
                            key={m}
                            style={[styles.moodWrap, mood === m && styles.activeMood]}
                            onPress={() => setMood(m)}
                        >
                            <Text style={[styles.moodText, mood === m && styles.activeMoodText]}>{m}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Note</Text>
                <TextInput
                    style={styles.input}
                    multiline
                    numberOfLines={4}
                    value={note}
                    onChangeText={setNote}
                    placeholder="How was the pet today?"
                />

                <Text style={styles.label}>Photo</Text>
                {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.preview} />
                ) : null}
                <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                    <Text style={styles.photoText}>{photoUrl ? "Change Photo" : "Add Photo"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitText}>{loading ? "Saving..." : "Save Entry"}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF9F0" },
    content: { padding: 20 },
    label: { fontSize: 16, fontWeight: "bold", color: COLORS.secondary, marginTop: 15, marginBottom: 5 },
    moodsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    moodWrap: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "#e0e0e0",
    },
    activeMood: { backgroundColor: COLORS.primary },
    moodText: { color: "#333" },
    activeMoodText: { color: "#fff", fontWeight: "bold" },
    input: {
        backgroundColor: "#fff",
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        height: 100,
        textAlignVertical: "top",
    },
    photoButton: {
        marginTop: 10,
        backgroundColor: "#ddd",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    photoText: { color: "#333", fontWeight: "600" },
    preview: { width: "100%", height: 200, marginTop: 10, borderRadius: 10 },
    submitButton: {
        marginTop: 30,
        backgroundColor: COLORS.secondary, // Brown
        padding: 18,
        borderRadius: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default AddDiaryEntryScreen;
