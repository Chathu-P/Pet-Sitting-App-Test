# ComfBud Pet-Sitting App
**A volunteer-driven mobile application connecting pet owners with trusted pet sitters**

## 📱 Project Overview

ComfBud solves a critical problem: pet owners struggle to find trustworthy, affordable care for their pets, and compassionate pet sitters lack a reliable platform to showcase their skills and help pets in their community.

Our app connects pet owners with verified volunteer sitters in real-time, enabling seamless booking, secure communication, and performance-based badge recognition that builds trust and reputation.

---

## 🎯 Key Features

✅ **Seamless Booking** - Pet owners can submit detailed pet sitting requests  
✅ **Real-time Messaging** - Direct communication between owners and sitters  
✅ **Instant Notifications** - Real-time updates for bookings and messages  
✅ **Pet Care Diaries** - Sitters document daily activities and pet updates  
✅ **Performance Badges** - Earn recognition for exceptional care  
✅ **Smart Matching Algorithm** - Requests matched by location, pet type, and skills  
✅ **User Roles** - Pet Owner, Pet Sitter, and Admin Dashboard  

---

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo (Cross-platform mobile app)
- **Backend**: Firebase (Real-time database, authentication, cloud storage)
- **Database**: Firestore (Real-time NoSQL database)
- **Authentication**: Firebase Authentication
- **Notifications**: Firebase Cloud Messaging
- **State Management**: React Context API
- **Animations**: React Native Animated API
- **UI**: React Native StyleSheet + Custom Components

---

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v16+) and npm installed
- Expo CLI: `npm install -g expo-cli`
- A Firebase project created
- Xcode (for iOS) or Android Studio (for Android) - optional for testing

---

## 🚀 Installation & Setup

### **Step 1: Clone & Install Dependencies**

```bash
cd Pet-Sitting-App-Test
npm install
```

### **Step 2: Firebase Configuration**

#### **Get Your serviceAccountKey.json**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **⚙️ Project Settings** (top left gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key** button
6. Download the JSON file
7. Rename it to `serviceAccountKey.json`
8. Place it in: `Pet-Sitting-App-Test/credentials/serviceAccountKey.json`

**⚠️ IMPORTANT: Keep this file private!** Never commit to GitHub.

#### **Firebase Web Configuration**

Create/update `services/firebase.ts` with your Firebase config:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

Get these values from Firebase Console → Project Settings → Your Apps

### **Step 3: Create Firestore Collections**

In [Firebase Console](https://console.firebase.google.com/), create these collections:

```
Firestore Database:
├── users/ (user profiles: pet owners, sitters, admins)
├── requests/ (pet sitting requests)
├── chats/ (direct messaging between users)
│   └── {chatId}/messages/ (individual messages)
├── diary_entries/ (sitter pet care documentation)
└── notifications/ (user notifications)
```

### **Step 4: Add Sample Data**

See **Sample Data** section below or import test users manually in Firebase Console.

### **Step 5: Set Security Rules**

In Firebase Console → Firestore → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own documents
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == request.resource.data.uid;
      allow update: if request.auth.uid == userId;
    }

    // Requests visible to owners and assigned sitters
    match /requests/{requestId} {
      allow read: if request.auth.uid == resource.data.ownerId 
                     || request.auth.uid == resource.data.sitterId;
      allow create: if request.auth.uid == request.resource.data.ownerId;
      allow update: if request.auth.uid == resource.data.ownerId 
                       || request.auth.uid == resource.data.sitterId;
    }

    // Chat messages
    match /chats/{chatId} {
      allow read, write: if request.auth.uid in resource.data.participants;
      match /messages/{messageId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }

    // Diary entries
    match /diary_entries/{entryId} {
      allow read, write: if request.auth.uid in resource.data.relatedUsers;
    }

    // Notifications
    match /notifications/{userId}/{notificationId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### **Step 6: Start Development Server**

```bash
npm run dev
```

This starts Expo and displays a QR code. Scan with your phone's camera to open the app.

---

## 📊 Sample Data Setup

### **Pet Owner Account**
```json
{
  "fullName": "John Smith",
  "email": "owner@example.com",
  "phone": "+1-555-0101",
  "address": "123 Main St, New York, NY 10001",
  "city": "New York",
  "role": "pet-owner"
}
```

### **Pet Sitter Account**
```json
{
  "fullName": "Sarah Johnson",
  "email": "sitter@example.com",
  "phone": "+1-555-0102",
  "address": "456 Oak Ave, New York, NY 10002",
  "city": "New York",
  "role": "pet-sitter",
  "yearsOfExperience": 3,
  "skills": {
    "bigDogs": true,
    "smallDogs": true,
    "puppies": false,
    "cats": true,
    "kittens": false,
    "medicalCare": true,
    "training": false,
    "grooming": false,
    "multiplePets": true,
    "seniorPets": true
  }
}
```

### **Pet Sitting Request Example**
```json
{
  "petName": "Max",
  "petType": "dog",
  "breed": "Golden Retriever",
  "age": 3,
  "gender": "Male",
  "size": "Large",
  "temperament": "Friendly, energetic",
  "feedingSchedule": "2 times daily (morning & evening)",
  "behaviorNotes": "Very energetic, needs 2 walks daily",
  "walkRequirement": true,
  "startDate": "2026-02-15",
  "endDate": "2026-02-20",
  "location": "New York",
  "city": "New York",
  "address": "123 Main St, New York",
  "messageToVolunteers": "Max loves playing fetch!",
  "emergencyContactName": "Jane Smith",
  "emergencyPhone": "+1-555-9999",
  "status": "Open",
  "ownerId": "owner_user_id"
}
```

---

## 👥 User Roles

| Role | Capabilities |
|------|--------------|
| **Pet Owner** | Create requests, browse sitters, message, view diaries, award badges |
| **Pet Sitter** | Browse requests, accept jobs, message, write diaries, earn badges |
| **Admin** | Manage users, moderate content, award badges, view analytics |

---

## 🏗️ Project Structure

```
Pet-Sitting-App-Test/
├── src/
│   ├── screens/           # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── PetOwnerDashboard/
│   │   ├── PetSitterDashboard/
│   │   │   ├── PetSitterDashboardScreen.tsx
│   │   │   ├── BrowseRequestsScreen.tsx
│   │   │   ├── RequestDetailsScreen.tsx
│   │   │   └── SitterProfileScreen.tsx
│   │   └── Chat-Diary-Notifications/
│   ├── components/        # Reusable UI components
│   ├── services/          # Firebase & API services
│   ├── context/           # React Context (notifications, auth)
│   ├── utils/             # Helpers, constants, responsive design
│   └── types/             # TypeScript interfaces
├── assets/                # Images, icons
├── credentials/           # Firebase serviceAccountKey.json
├── scripts/               # Utility scripts
├── app.json              # Expo config
├── package.json
└── README.md
```

---

## 🔄 Matching Algorithm

The app calculates match percentage (0-100%) based on:

1. **Location Match (40%)** - Sitter's city matches request location
2. **Pet Type Skills (30%)** - Sitter has experience with pet type
3. **Special Care Abilities (20%)** - Skills for medical/special needs
4. **Experience & Badges (10%)** - Years of experience and earned badges

**Minimum baseline: 50%** to show decent compatibility

---

## 📱 Testing the App

### **Test User Workflow**

1. **Sign up as Pet Owner**
   - Create account with pet owner role
   - Add pet details
   - Create a sitting request

2. **Sign up as Pet Sitter**
   - Create account with sitter role
   - Add skills and experience
   - Browse requests and accept one

3. **Test Features**
   - Messaging system
   - Diary updates
   - Badge awards
   - Notifications

---

## 🔐 Security Checklist

- [ ] serviceAccountKey.json is in `.gitignore`
- [ ] Firebase config is in environment variables (not hardcoded)
- [ ] Firestore security rules are properly configured
- [ ] User authentication required for all protected routes
- [ ] Data validation on client and backend

---

## 📞 Support & Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

## 👨‍💼 Project Team

**Group A** - Mobile Application Development Project

---

## 📄 License

This project is for educational purposes.

---

**Last Updated:** February 8, 2026
