# Pet Sitting App - Setup Instructions

## Home Screen Background Image

To complete the home screen setup, you need to add a background image:

1. Save your welcome screen background image as `welcome-bg.jpg`
2. Place it in the `assets` folder: `Pet-Sitting-App/assets/welcome-bg.jpg`

The image should ideally feature pets (dogs/cats) in a warm, welcoming setting to match the design.

## Running the App

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm start

# Run on specific platform
npm run android  # For Android
npm run ios      # For iOS  
npm run web      # For Web
```

## Project Structure

The app now follows this structure:

```
Pet-Sitting-App/
├── src/
│   ├── components/
│   │   ├── Button.tsx          ✅ Created
│   │   ├── Header.tsx          ✅ Created
│   │   └── PetCard.tsx         ✅ Created
│   ├── screens/
│   │   ├── HomeScreen.tsx      ✅ Created (Welcome screen)
│   │   ├── LoginScreen.tsx     ✅ Created (placeholder)
│   │   ├── SignupScreen.tsx    ✅ Created (placeholder)
│   │   ├── PetDetailsScreen.tsx ✅ Created (placeholder)
│   │   └── ProfileScreen.tsx   ✅ Created (placeholder)
│   ├── services/
│   │   └── api.ts              ✅ Created
│   ├── utils/
│   │   └── constants.ts        ✅ Created
│   └── types/
│       └── Pet.ts              ✅ Created
├── assets/
│   └── welcome-bg.jpg          ⚠️ Add your background image here
├── App.tsx                     ✅ Updated
└── package.json

```

## What's Been Implemented

### ✅ Home/Welcome Screen
- Beautiful welcome screen with:
  - Background image support
  - "Welcome!" header
  - ComfyBud logo with pet emojis
  - Tagline matching your design
  - "Get Started" button
  - Dark overlay for text readability

### ✅ Reusable Components
- **Button**: Customizable button with primary/secondary/outline variants
- **Header**: Navigation header component
- **PetCard**: Card component for displaying pet information

### ✅ Type Definitions
- Pet, User, and Booking interfaces
- Type-safe data structures

### ✅ Constants
- Color palette (orange primary, brown secondary)
- Font sizes and spacing
- Border radius values

### ✅ API Service
- Structured API calls for auth, pets, and bookings
- Ready to connect to your backend

## Next Steps

1. **Add background image** to `assets/welcome-bg.jpg`
2. **Install navigation library** (if you want navigation):
   ```bash
   npm install @react-navigation/native @react-navigation/stack
   npm install react-native-screens react-native-safe-area-context
   ```
3. **Implement navigation** in `src/navigation/AppNavigator.tsx`
4. **Build out other screens** (Login, Signup, Pet Details, Profile)
5. **Connect to backend API** once ready

## Color Scheme

- Primary: `#FF8C42` (Orange)
- Secondary: `#6B4423` (Brown)
- Background: `#FFF9F0` (Light cream)
- Text: `#333333` (Dark gray)

## Notes

- The app is using Expo and React Native
- TypeScript is configured for type safety
- All placeholder screens are ready to be developed
- The home screen matches your provided design
