import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    setDoc,
    doc,
    arrayUnion,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useRoute } from "@react-navigation/native";
import { COLORS } from "../utils/constants";
import Header from "../components/Header";

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const route = useRoute<any>();
    const { chatId, chatName } = route.params || {};

    useEffect(() => {
        if (!chatId) return;
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
        });
        return unsubscribe;
    }, [chatId]);

    const sendMessage = async () => {
        if (newMessage.trim().length === 0) return;
        try {
            await addDoc(collection(db, "chats", chatId, "messages"), {
                text: newMessage,
                createdAt: serverTimestamp(),
                senderId: auth.currentUser?.uid,
                senderEmail: auth.currentUser?.email,
            });

            // Update parent chat doc
            await setDoc(doc(db, "chats", chatId), {
                lastMessage: newMessage,
                updatedAt: serverTimestamp(),
                participants: arrayUnion(auth.currentUser?.uid),
                name: chatName || "Chat"
            }, { merge: true });

            setNewMessage("");
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
        >
            <Header title={chatName || "Chat"} />
            <FlatList
                data={messages}
                inverted
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }) => {
                    const isMe = item.senderId === auth.currentUser?.uid;
                    return (
                        <View
                            style={[
                                styles.messageContainer,
                                isMe ? styles.myMessage : styles.theirMessage,
                            ]}
                        >
                            <Text style={isMe ? styles.myMessageText : styles.messageText}>{item.text}</Text>
                        </View>
                    );
                }}
                contentContainerStyle={{ padding: 10 }}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF9F0" },
    messageContainer: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: "80%",
    },
    myMessage: {
        backgroundColor: COLORS.primary,
        alignSelf: "flex-end",
    },
    theirMessage: {
        backgroundColor: "#E0E0E0",
        alignSelf: "flex-start",
    },
    messageText: { color: "#333" },
    myMessageText: { color: "#fff" },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderColor: "#E0E0E0",
        backgroundColor: "#fff",
        alignItems: "center",
    },
    input: {
        flex: 1,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 40,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: COLORS.secondary,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    sendButtonText: { color: "#fff", fontWeight: "bold" },
});

export default ChatScreen;
