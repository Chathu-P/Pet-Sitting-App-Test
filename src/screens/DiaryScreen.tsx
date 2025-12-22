import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../utils/constants";
import Header from "../components/Header";

const DiaryScreen = () => {
    const [entries, setEntries] = useState([]);
    const navigation = useNavigation();
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;
        // Simple query: all entries where user is owner or sitter (requires complex query or multiple queries or denormalization)
        // For simplicity: fetch all and filter client side, or just fetch all 'diary_entries' (University project style)
        // Better: where("relatedUsers", "array-contains", user.uid)
        const q = query(
            collection(db, "diary_entries"),
            where("relatedUsers", "array-contains", user.uid),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEntries(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
        });
        return unsubscribe;
    }, [user]);

    return (
        <View style={styles.container}>
            <Header title="Pet Daily Diary" />
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

            {/* FAB for Sitter to add entry */}
            {/* In a real app we'd check role. Here we just show it or check auth.currentUser role if available */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("AddDiaryEntryScreen")}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF9F0" },
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
