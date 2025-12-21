import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Pet } from "../types/Pet";

interface PetCardProps {
  pet: Pet;
  onPress?: () => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: pet.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.breed}>{pet.breed}</Text>
        <Text style={styles.location}>{pet.location}</Text>
        <Text style={styles.price}>${pet.price}/day</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  breed: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#999999",
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF8C42",
  },
});

export default PetCard;
