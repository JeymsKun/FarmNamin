import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

const ProductCard = () => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => console.log("Go Back")}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Product Image */}
      <Image source={require('../assets/sili.png')} style={styles.image} />
      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productTitle}>Sili</Text>
        <Text style={styles.price}>₱30.00 per kilo</Text>

        {/* Category */}
        <Text style={styles.category}>Category: Vegetable</Text>

        {/* Additional Information */}
        <Text style={styles.description}>High quality ni maam/sir</Text>

        {/* Freshness Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Freshness duration:</Text> 2 days
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Maximum duration:</Text> 4 days
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.boldText}>Date & time harvest:</Text> October
            21, 2024, 7:00 AM
          </Text>
        </View>

        {/* Farmer Details */}
        <View style={styles.farmerContainer}>
          <Image source={require('../assets/mangkanor.png')} style={styles.image} />
          <View>
            <Text style={styles.farmerText}>
              <Text style={styles.farmerName}>Mang Kanor Rodrigo</Text>
            </Text>
            <Text style={styles.contactnumver}>0923-4268-218</Text>
            <Text style={styles.location}>Canitoan, Cagayan de Oro City</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: "#555",
  },
  productImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 20,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    color: "#27ae60",
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: "#444",
    marginVertical: 2,
  },
  boldText: {
    fontWeight: "bold",
  },
  farmerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  farmerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 9,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  farmerText: {
    fontSize: 14,
    color: "#333",
  },
  farmerName: {
    color: "#007bff",
    fontWeight: "bold",
  },
  location: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
});

export default ProductCard;