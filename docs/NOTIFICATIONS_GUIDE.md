# Notifications System Guide

This guide explains how the notification system works in the Pet Sitting App, covering both In-App notifications (Firestore) and Push Notifications (Expo).

## Overview

The system uses a dual-channel approach:
1.  **In-App History**: Notifications are saved to the `notifications` collection in Firestore. This is displayed in the user's "Notifications" tab.
2.  **Push Notifications**: Secure push notifications are sent using Expo's Push API (`expo-notifications`) to the user's physical device.

## Usage for Developers

The core function is `sendNotification`, exported from `src/services/notifications.ts`.

### Function Signature

```typescript
export const sendNotification = async (
    toUserId: string,
    title: string,
    body: string,
    type: "message" | "diary" | "system",
    relatedId?: string
) => Promise<void>
```

### Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `toUserId` | `string` | The Firestore `uid` of the recipient. |
| `title` | `string` | The header text of the notification (e.g., "New Message"). |
| `body` | `string` | The main content text (e.g., "John sent you a message"). |
| `type` | `"message" \| "diary" \| "system"` | Category for icon/coloring logic. |
| `relatedId` | `string` (Optional) | ID of the relevant resource (e.g., `chatId` for messages) to allow navigation when clicked. |

### Example Usage

```typescript
import { sendNotification } from "../services/notifications";

// Inside an async function
await sendNotification(
  recipientUserId,
  "New Diary Entry",
  "The sitter posted a new photo of Max!",
  "diary",
  chatId
);
```

## How It Works

1.  **Registration**:
    *   On app launch (in `RootNavigator.tsx`), `registerForPushNotificationsAsync()` is called.
    *   This requests permission and generates an **Expo Push Token**.
    *   The token is saved to the user's profile in Firestore (`users/{uid}.pushToken`).

2.  **Sending**:
    *   When you call `sendNotification()`:
        1.  It creates a document in `notifications` (Firestore) for the in-app history.
        2.  It looks up the recipient's `pushToken` from their user profile.
        3.  If a token exists, it sends an HTTP request to Expo's Push API to trigger the device alert.

## Testing Strategy

Since Android Push Notifications are restricted in the standard Expo Go client (SDK 53+), follow this 2-phase testing approach:

### Phase 1: Test Logic in Expo Go (In-App Only)
Rely on the "Notifications" tab in the app to verify logic.
1.  **Login** as User A on your phone/simulator.
2.  **Login** as User B on a different device (or use a different browser profile if testing Web logic).
3.  Perform an action (e.g., User A sends a message to User B).
4.  Check User B's **"Notifications" Tab**.
    *   *Success*: The notification appears in the list. This confirms the Firestore backend logic works.
    *   *Note*: You will **NOT** get a system-tray popup on Android. This is expected.

### Phase 2: Test Real Push (Development Build)
To see the actual popup on your Android status bar, you must build a custom **Development Client**.

1.  **Install EAS CLI**: `npm install -g eas-cli`
2.  **Login**: `eas login`
3.  **Configure**: `eas build:configure` (Select defaults)
4.  **Create Build**: 
    ```bash
    # For Android Device
    eas build --profile development --platform android
    
    # For iOS Device (Requires Apple Developer Account)
    eas build --profile development --platform ios
    ```
5.  **Install**: Scan the QR code generated to install your specific "Pet App (Dev)" on your device.
6.  **Run**: Start your bundler with `npx expo start --dev-client`.
7.  **Test**: Now, when you trigger a notification, you will receive the **System Tray Popup**.

### Debugging Push Tokens
If you are unsure if tokens are being generated:
1.  Check the Console Logs during App Login.
2.  Look for `"Push Token: ExponentPushToken[...]"`
3.  If you see `"Failed to get push token"`, ensure:
    *   You are on a **Physical Device**.
    *   You are using a **Development Build** (not generic Expo Go).
    *   You have logged into your Expo account in the CLI.
