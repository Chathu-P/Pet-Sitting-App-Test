import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../utils/constants";
import { useResponsive, useResponsiveFonts } from "../../utils/responsive";

interface Props {
  active: "overview" | "users" | "requests";
}

const AdminTabs: React.FC<Props> = ({ active }) => {
  const navigation = useNavigation<any>();
  const { wp } = useResponsive();
  const fonts = useResponsiveFonts();

  const isActive = (tab: Props["active"]) => active === tab;

  return (
    <View style={[styles.tabBar, { paddingHorizontal: wp(5) }]}>
      <Pressable
        style={[styles.tabItem, isActive("overview") && styles.tabItemActive]}
        onPress={() => navigation.navigate("AdminDashboardScreen")}
      >
        <MaterialIcons
          name="dashboard"
          size={18}
          color={isActive("overview") ? "#4B5563" : "#6B7280"}
        />
        <Text
          style={[
            styles.tabText,
            isActive("overview") && styles.tabTextActive,
            { fontSize: fonts.regular, marginLeft: 8 },
          ]}
        >
          Overview
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tabItem, isActive("users") && styles.tabItemActive]}
        onPress={() => navigation.navigate("AdminUsersScreen")}
      >
        <MaterialIcons
          name="group"
          size={18}
          color={isActive("users") ? "#4B5563" : "#6B7280"}
        />
        <Text
          style={[
            styles.tabText,
            isActive("users") && styles.tabTextActive,
            { fontSize: fonts.regular, marginLeft: 8 },
          ]}
        >
          Users
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tabItem, isActive("requests") && styles.tabItemActive]}
        onPress={() => navigation.navigate("AdminRequestsScreen")}
      >
        <MaterialIcons
          name="assignment"
          size={18}
          color={isActive("requests") ? "#4B5563" : "#6B7280"}
        />
        <Text
          style={[
            styles.tabText,
            isActive("requests") && styles.tabTextActive,
            { fontSize: fonts.regular, marginLeft: 8 },
          ]}
        >
          Requests
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#EEE7E1",
  },
  tabItemActive: {
    backgroundColor: "#E8DFD6",
  },
  tabText: { color: "#6B7280", fontWeight: "600" },
  tabTextActive: { color: "#4B5563", fontWeight: "700" },
});

export default AdminTabs;
