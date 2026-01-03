import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ImageBackground } from "react-native";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../utils/constants";
import Header from "../../components/Header";

import { useRoute } from "@react-navigation/native";

const DiaryScreen = () => {
    const [entries, setEntries] = useState<any[]>([]);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const user = auth.currentUser;
    const { chatId } = route.params || {};

    const [role, setRole] = useState<"owner" | "sitter" | null>(null);

    useEffect(() => {
        if (!user) return;

        // Fetch user role
        const fetchRole = async () => {
            const importFirestore = await import("firebase/firestore");
            const userDoc = await importFirestore.getDoc(importFirestore.doc(db, "users", user.uid));
            if (userDoc.exists()) {
                setRole(userDoc.data().role);
            }
        };
        fetchRole();

        let q;
        if (chatId) {
            // Specific Chat Diary
            q = query(
                collection(db, "diary_entries"),
                where("chatId", "==", chatId),
                where("relatedUsers", "array-contains", user.uid),
                orderBy("createdAt", "desc")
            );
        } else {
            // All user's diary entries
            q = query(
                collection(db, "diary_entries"),
                where("relatedUsers", "array-contains", user.uid),
                orderBy("createdAt", "desc")
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEntries(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
        }, (error: any) => { // Type as any for now to avoid unused var issues with precise types
            console.error("Diary snapshot error:", error);
        });
        return unsubscribe;
    }, [user, chatId]);

    return (
        <ImageBackground source={require("../../../assets/petowner/Group 88.png")} style={styles.container}>
            <Header title={chatId ? "Chat Diary" : "All Diaries"} />
            <FlatList
                data={entries}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.headerRow}>
                            <Text style={styles.date}>
                                {item.createdAt?.toDate().toLocaleString()}
                            </Text>
                            <Text style={styles.mood}>{item.mood}</Text>
                        </View>
                        {item.photoUrl ? (
                            <Image source={{ uri: item.photoUrl }} style={styles.image} />
                        ) : null}
                        <Text style={styles.note}>{item.note}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No diary entries yet.</Text>
                }
            />

            {/* FAB for Sitter ONLY */}
            {role === "sitter" && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        if (!chatId) {
                            alert("Please select a chat to add a diary entry.");
                            navigation.navigate("ChatListScreen");
                            return;
                        }
                        navigation.navigate("AddDiaryEntryScreen", { chatId });
                    }}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF9F0", marginTop: 50 },
    card: {
        backgroundColor: "#fff",
        margin: 10,
        borderRadius: 10,
        padding: 15,
        elevation: 3,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    date: { color: "gray", fontSize: 12 },
    mood: { fontSize: 16 },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
    note: { fontSize: 16, color: COLORS.secondary },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 20,
        backgroundColor: COLORS.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
    fabText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
    emptyText: { textAlign: "center", marginTop: 40, color: "gray" },
});

export default DiaryScreen;
