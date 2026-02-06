import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../utils/constants";

type TabItem = {
  key: string;
  label: string;
  icon: string;
  badge?: number | boolean; // Show indicator if truthy
};

type TabBarProps = {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
};

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabItem}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrapper}>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel,
              ]}
            >
              {tab.icon}
            </Text>
            {tab.badge && (
              <View
                style={[
                  styles.notificationDot,
                  {
                    borderColor:
                      activeTab === tab.key ? COLORS.primary : "#999",
                  },
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 2,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 20,
    color: "#777",
  },
  activeTabLabel: {
    color: COLORS.primary || "#2f6bed",
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
    borderWidth: 2,
    borderColor: "#999",
  },
  tabText: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  activeTabText: {
    color: COLORS.primary || "#2f6bed",
    fontWeight: "600",
  },
});

export default TabBar;
