# 🔥 Firebase Backend Setup Guide for Pet Sitter Features

## ✅ **What Was Implemented**

### **1. Separate `sitterProfiles` Collection**
Your Pet Sitter data is now stored in two collections:
- `users/{userId}` - Basic user info (name, email, phone, role)
- `sitterProfiles/{userId}` - Complete sitter profile (badges, skills, experience, etc.)

### **2. Updated Files**
✅ `firestore.rules` - Security rules created
✅ `firebase.json` - Firebase configuration created
✅ `PetSitterSignupScreen.tsx` - Creates both collections on signup
✅ `PetSitterDashboardScreen.tsx` - Fetches badges from `sitterProfiles`
✅ `SitterProfileScreen.tsx` - Fetches and saves profile data

---

## 📋 **Steps You Need to Do NOW**

### **Step 1: Deploy Firestore Security Rules** ⚠️ **CRITICAL**

You MUST deploy the security rules to Firebase, otherwise you'll get permission errors.

#### **Option A: Using Firebase Console (Easiest)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pet-sitting-app-cc7e7**
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab at the top
5. **Copy and paste** the contents of `firestore.rules` into the editor
6. Click **Publish**

#### **Option B: Using Firebase CLI**

```powershell
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

---

### **Step 2: Create Sitter Profile in Firebase Console**

Since you already have a sitter user (`0WNYga5MRPfRxK2p4KxoWSujP3K2`), you need to create their profile:

1. Go to **Firestore Database**
2. Click **+ Start collection**
3. Collection ID: `sitterProfiles`
4. Click **Next**
5. Document ID: `0WNYga5MRPfRxK2p4KxoWSujP3K2` (your existing sitter's userId)
6. Add these fields:

```javascript
userId: "0WNYga5MRPfRxK2p4KxoWSujP3K2"  (string)

profile: (map)
  ├─ photoUrl: ""  (string)
  ├─ rating: 0  (number)
  └─ totalReviews: 0  (number)

badges: (map)
  ├─ animal-lover: (map)
  │   ├─ count: 0  (number)
  │   └─ awardedBy: []  (array)
  ├─ puppy-pro: (map)
  │   ├─ count: 0  (number)
  │   └─ awardedBy: []  (array)
  ... (repeat for all 15 badges)

experience: (map)
  ├─ yearsOfExperience: 5  (number)
  └─ description: "5 years of pet sitting"  (string)

skills: (map)
  ├─ bigDogs: true  (boolean)
  ├─ smallDogs: true  (boolean)
  ├─ puppies: true  (boolean)
  ├─ cats: false  (boolean)
  ... (repeat for all 10 skills)

availability: (map)
  └─ schedule: "Weekends & Evenings"  (string)

aboutMe: "Passionate about animals..."  (string)

createdAt: (timestamp - current time)
updatedAt: (timestamp - current time)
```

7. Click **Save**

---

### **Step 3: Test the App**

1. **Restart your Expo app:**
```powershell
# Stop the current server (Ctrl+C)
# Start again
npm start
```

2. **Login as a sitter** (or signup as new sitter)
3. **Navigate to Sitter Profile Screen**
4. **Check if data loads** from Firebase
5. **Update skills and click "Save Profile"**
6. **Verify changes in Firebase Console**

---

## 🏗️ **Firebase Collection Structure**

```javascript
// Collection: users
users/{userId} {
  role: "sitter",
  fullName: "Jsudhf",
  email: "sitter@p.com",
  phone: "6468683",
  address: "Hshxhsjs",
  createdAt: timestamp
}

// Collection: sitterProfiles (SEPARATE)
sitterProfiles/{userId} {
  userId: "userId",
  profile: {
    photoUrl: "",
    rating: 4.8,
    totalReviews: 45
  },
  badges: {
    "animal-lover": { count: 3, awardedBy: [] },
    "puppy-pro": { count: 2, awardedBy: [] },
    ... (13 more badges)
  },
  experience: {
    yearsOfExperience: 5,
    description: "5 years of pet sitting"
  },
  skills: {
    bigDogs: true,
    smallDogs: true,
    puppies: true,
    ... (7 more skills)
  },
  availability: {
    schedule: "Weekends & Evenings"
  },
  aboutMe: "Passionate about animals...",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🔒 **Security Rules Explanation**

The `firestore.rules` file ensures:
- ✅ Only authenticated users can read/write
- ✅ Users can only edit their own profiles
- ✅ Admins have full access
- ✅ Reviews cannot be edited after creation

---

## 🐛 **Troubleshooting**

### **Error: "Missing or insufficient permissions"**
➡️ **Solution:** Deploy Firestore rules (Step 1)

### **Error: "Profile not loading"**
➡️ **Solution:** Create sitterProfile document in Firebase (Step 2)

### **Error: "Cannot read property 'badges' of undefined"**
➡️ **Solution:** Ensure sitterProfile document exists with correct structure

---

## 📝 **Next Steps**

After completing the setup:

1. ✅ Test signup flow (creates both collections automatically)
2. ✅ Test profile editing (saves to sitterProfiles)
3. ✅ Test dashboard (loads badges from sitterProfiles)
4. ✅ Implement similar structure for Pet Owner profiles if needed

---

## 💡 **Tips**

- New sitters will have profiles created automatically on signup
- Existing sitters need manual profile creation (Step 2)
- Profile updates are instant and saved to `sitterProfiles`
- Badges are tracked separately and updated by pet owners

---

**Need Help?** Check the console logs for detailed error messages!
