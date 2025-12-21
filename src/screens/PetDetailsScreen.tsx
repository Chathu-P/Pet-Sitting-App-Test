import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PetDetailsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pet Details Screen - Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9F0",
  },
  text: {
    fontSize: 18,
    color: "#333333",
  },
});

export default PetDetailsScreen;
