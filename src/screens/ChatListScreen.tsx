import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../utils/constants";
import Header from "../components/Header";

const ChatListScreen = () => {
    const [chats, setChats] = useState([]);
    const navigation = useNavigation();
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", user.uid)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setChats(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
        });
        return unsubscribe;
    }, [user]);

    return (
        <View style={styles.container}>
            <Header title="Messages" />
            <FlatList
                data={chats}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() => navigation.navigate("ChatScreen", { chatId: item.id, chatName: item.name || "Chat" })}
                    >
                        <Text style={styles.chatName}>{item.name || "Chat"}</Text>
                        <Text style={styles.lastMessage}>
                            {item.lastMessage || "No messages yet"}
                        </Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No active chats found.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF9F0" },
    chatItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
    },
    chatName: { fontSize: 18, fontWeight: "bold", color: COLORS.secondary },
    lastMessage: { color: "gray", marginTop: 5 },
    emptyText: { textAlign: "center", marginTop: 20, color: "gray" },
});

export default ChatListScreen;
