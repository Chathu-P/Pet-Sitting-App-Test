import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const getConsistentChatId = (uid1: string, uid2: string) => {
    // Sort uids to ensure same Chat ID regardless of who initiates
    return [uid1, uid2].sort().join("_");
};

// --- Push Notification Setup ---

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Platform.OS === 'web') {
        console.log('Push notifications not fully supported on Web without VAPID keys.');
        return;
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        try {
            token = (await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            })).data;
            console.log("Push Token:", token);
        } catch (error: any) {
            console.log("Error fetching push token:", error);
            if (error.code === 'ERR_NGROK_TUNNEL' || error.message.includes('Expo Go')) {
                console.log("NOTE: Push Notifications require a Development Build (EAS Build) on Android SDK 53+.");
            }
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
};

// Send actual push via Expo
const sendExpoPushNotification = async (expoPushToken: string, title: string, body: string) => {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
};

/**
 * Trigger a notification to a specific user.
 * 1. Saves to Firestore (for In-App Tab).
 * 2. Fetches User's Push Token.
 * 3. Sends Push Notification (if token exists).
 */
export const sendNotification = async (
    toUserId: string,
    title: string,
    body: string,
    type: "message" | "diary" | "system",
    relatedId?: string // chatId or diaryEntryId
) => {
    if (!toUserId) return;
    try {
        // 1. Save to Firestore (In-App History)
        await addDoc(collection(db, "notifications"), {
            userId: toUserId,
            title,
            body,
            type,
            relatedId,
            read: false,
            createdAt: serverTimestamp(),
        });

        // 2. Fetch User's Push Token from Firestore
        const userSnap = await getDoc(doc(db, "users", toUserId));
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const pushToken = userData?.pushToken;

            if (pushToken) {
                // 3. Send Push
                await sendExpoPushNotification(pushToken, title, body);
            }
        }
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
};

