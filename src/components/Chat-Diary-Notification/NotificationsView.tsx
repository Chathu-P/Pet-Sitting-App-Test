import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { COLORS, BORDER_RADIUS, SPACING } from "../../utils/constants";
import { MaterialIcons } from "@expo/vector-icons";

const NotificationsView = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifications(
                snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            );
        });
        return unsubscribe;
    }, [user]);

    const markAsRead = async (id: string, currentReadStatus: boolean) => {
        if (currentReadStatus) return;
        try {
            await updateDoc(doc(db, "notifications", id), { read: true });
        } catch (e) {
            console.error(e);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "message": return "chat";
            case "diary": return "book";
            default: return "notifications";
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: SPACING.md }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.item, !item.read && styles.unreadItem]}
                        onPress={() => markAsRead(item.id, item.read)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: item.type === 'message' ? '#E3F2FD' : '#F3E5F5' }]}>
                            <MaterialIcons name={getIcon(item.type) as any} size={24} color={COLORS.secondary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.body}>{item.body}</Text>
                            <Text style={styles.time}>{item.createdAt?.toDate().toLocaleString()}</Text>
                        </View>
                        {!item.read && <View style={styles.dot} />}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No notifications yet</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF9F0", marginTop: 50 },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLORS.secondary,
        padding: SPACING.lg,
        paddingBottom: 0,
    },
    item: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        alignItems: "center",
        gap: SPACING.md,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    unreadItem: {
        backgroundColor: "#fff",
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary
    },
    iconBox: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: "center", alignItems: "center"
    },
    title: { fontWeight: "bold", color: "#333", fontSize: 16 },
    body: { color: "#666", fontSize: 14, marginTop: 2 },
    time: { color: "#999", fontSize: 10, marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
    empty: { textAlign: "center", marginTop: 40, color: "#999" }
});

export default NotificationsView;
