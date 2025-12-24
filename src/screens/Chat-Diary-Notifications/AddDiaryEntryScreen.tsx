import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../../utils/constants";
import Header from "../../components/Header";
import { sendNotification } from "../../services/notifications";
import * as ImagePicker from 'expo-image-picker';

const AddDiaryEntryScreen = () => {
    const [note, setNote] = useState("");
    const [mood, setMood] = useState("Happy");
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { chatId } = route.params || {};

    const moods = ["Happy", "Playful", "Sleepy", "Grumpy", "Hungry"];

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission needs", "Please allow access to your photos to add a picture.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.2, // Low quality to fit in Firestore (1MB limit limit hack)
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            if (asset.base64) {
                // Store as Data URI
                setPhotoUrl(`data:image/jpeg;base64,${asset.base64}`);
            } else {
                setPhotoUrl(asset.uri);
            }
        }
    };

    const handleSubmit = async () => {
        if (!note && !photoUrl) {
            Alert.alert("Error", "Please add a note or photo");
            return;
        }
        if (!chatId) {
            // In real app we might allow adding general entries, but for now enforcing chat context
            Alert.alert("Error", "No chat context found. Please add entry from a Chat.");
            return;
        }
        setLoading(true);
        try {
            const user = auth.currentUser;
            let relatedUsers = [user?.uid];

            if (chatId) {
                // Fetch chat participants to share this entry with them
                try {
                    const chatSnap = await getDoc(doc(db, "chats", chatId));
                    if (chatSnap.exists()) {
                        const chatData = chatSnap.data();
                        if (chatData.participants) {
                            relatedUsers = chatData.participants;
                        }
                    }
                } catch (fetchErr) {
                    console.error("Error fetching chat participants", fetchErr);
                    // Fallback to just user
                }
            }

            await addDoc(collection(db, "diary_entries"), {
                note,
                mood,
                photoUrl,
                createdAt: serverTimestamp(),
                createdBy: user?.uid,
                relatedUsers: relatedUsers,
                chatId: chatId
            });

            // Send Notification to other participants
            const recipients = relatedUsers.filter(uid => uid !== user?.uid);
            for (const recipientId of recipients) {
                if (!recipientId) continue;
                await sendNotification(
                    recipientId,
                    "New Diary Entry",
                    `${user?.displayName || 'Sitter'} added a diary entry!`,
                    "diary",
                    chatId
                );
            }

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
