import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import LogoCircle from "../../components/LogoCircle";
import { COLORS } from "../../utils/constants";
import {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFonts,
} from "../../utils/responsive";
import { auth } from "../../services/firebase";

interface Props {
  subtitle?: string;
}

const AdminHeader: React.FC<Props> = ({ subtitle = "Admin User" }) => {
  const navigation = useNavigation<any>();
  const { wp, hp } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fonts = useResponsiveFonts();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    try {
      setSigningOut(true);
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: "HomeScreen" }] });
    } catch (err) {
      setSigningOut(false);
    }
  };

  const promptSignOut = () => {
    if (signingOut) return;
    Alert.alert("Sign out", "Do you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: handleSignOut },
    ]);
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingHorizontal: wp(5),
          paddingTop: hp(2),
          paddingBottom: hp(2),
        },
      ]}
    >
      <Pressable
        style={[styles.headerIcon, { width: 36, height: 36 }]}
        onPress={promptSignOut}
      >
        <MaterialIcons name="security" size={20} color={COLORS.white} />
      </Pressable>

      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={[styles.headerTitle, { fontSize: fonts.large }]}>
          Admin Dashboard
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fonts.small }]}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.rightStack}>
        <LogoCircle size={36} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#4A3C35",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.white, fontWeight: "700" },
  headerSubtitle: { color: "rgba(255,255,255,0.8)" },
  rightStack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default AdminHeader;
