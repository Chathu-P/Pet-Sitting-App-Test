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
    ImageBackground,
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
    getDoc,
    arrayUnion,
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useRoute } from "@react-navigation/native";
import { COLORS } from "../../utils/constants";
import Header from "../../components/Header";

import { sendNotification } from "../../services/notifications";
import { useNavigation } from "@react-navigation/native";

const ChatScreen = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { chatId, chatName } = route.params || {};

    useEffect(() => {
        if (!chatId) return;
        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log(`ChatScreen: Received ${snapshot.docs.length} messages`); // Debug log
            setMessages(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
        }, (error) => {
            console.error("ChatScreen snapshot error:", error);
            alert("Error loading messages: " + error.message);
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

            // Send Notification to other participants
            try {
                // Fetch fresh chat data to get current participants
                const chatSnap = await getDoc(doc(db, "chats", chatId));
                if (chatSnap.exists()) {
                    const data = chatSnap.data();
                    const participants = data.participants || [];
                    const recipients = participants.filter((uid: string) => uid !== auth.currentUser?.uid);

                    for (const recipientId of recipients) {
                        await sendNotification(
                            recipientId,
                            "New Message",
                            `${auth.currentUser?.displayName || 'User'} sent you a message`,
                            "message",
                            chatId
                        );
                    }
                }
            } catch (err) {
                console.error("Error sending message notification:", err);
            }

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
            <ImageBackground source={require("../../../assets/petowner/Group 88.png")} style={{flex: 1}}>
            <Header title={chatName || "Chat"} />

            {/* Unified Diary Link */}
            <TouchableOpacity
                style={styles.diaryLink}
                onPress={() => navigation.navigate("DiaryScreen", { chatId })}
            >
                <Text style={styles.diaryLinkText}>📖 View Diary for this Chat</Text>
            </TouchableOpacity>

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
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF9F0", marginTop: 50 },
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
    diaryLink: {
        backgroundColor: COLORS.white,
        padding: 10,
        margin: 10,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    diaryLinkText: {
        color: COLORS.secondary,
        fontWeight: "bold",
    },
});

export default ChatScreen;
