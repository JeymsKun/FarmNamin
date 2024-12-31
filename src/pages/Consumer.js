import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";

const ProductCard = () => {
  const [quantity, setQuantity] = useState("");
  const [rating, setRating] = useState(0); // State for managing selected rating
  const availableStock = 300;

  const handlePlaceOrder = () => {
    Alert.alert("Order placed successfully!", `Quantity ordered: ${quantity}`);
  };

  const handleQuantityChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setQuantity(numericValue ? `${numericValue}${numericValue === "1" ? "kl" : "kls"}` : "");
  };

  const handleAddRating = () => {
    Alert.alert("Thank you!", `You rated this product ${rating} star${rating > 1 ? "s" : ""}.`);
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => setRating(star)}
        style={styles.starContainer}
      >
        <Text
          style={[
            styles.star,
            { color: star <= rating ? "#FFD700" : "#000", borderColor: "#000" },
          ]}
        >
          ★
        </Text>
      </TouchableOpacity>
    ));
  };

  const feedbacks = [
  {
    name: "John Doe",
    profileImage: require("../../assets/images/john_doe.png"),  
    feedback: "High Quality! Fresh and affordable produce.",
    rating: 5,
  },
  {
    name: "Jane Smith",
    profileImage: require("../../assets/images/jane_smith.png"),  
    feedback: "Negotiations are smooth. Great farmer!",
    rating: 4,
  },
  {
    name: "Mark Johnson",
    profileImage: require("../../assets/images/mark_johnson.png"),  
    feedback: "Exceptional value for money.",
    rating: 5,
  },
];

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => console.log("Go Back")}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        {/* Product Image */}
        <Image
            source={require("../../assets/images/talong(3).jpg")} 
            style={styles.farmerImage}
        />

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productTitle}>Talong</Text>
          <Text style={styles.price}>₱50.00 per kilo</Text>
          <Text style={styles.category}>Category: Vegetable</Text>
          <Text style={styles.available}>Available: {availableStock}kls</Text>

          {/* Quantity Input */}
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <TextInput
            style={styles.quantityInput}
            keyboardType="numeric"
            value={quantity}
            onChangeText={handleQuantityChange}
            placeholder="Enter quantity"
          />

          {/* Place Order Button */}
          <TouchableOpacity
            style={[
              styles.orderButton,
              {
                backgroundColor:
                  parseInt(quantity) > 0 &&
                  parseInt(quantity) <= availableStock
                    ? "#27ae60"
                    : "rgba(0, 0, 0, 0.2)",
              },
            ]}
            onPress={handlePlaceOrder}
            disabled={
              parseInt(quantity) <= 0 || parseInt(quantity) > availableStock
            }
          >
            <Text style={styles.orderButtonText}>Place Order</Text>
          </TouchableOpacity>

          {/* Description */}
          <Text style={styles.description}>
            Mo palit mo or ipanglabog kuni sa suba!
          </Text>

          {/* Freshness Information */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              <Text style={styles.boldText}>Freshness duration:</Text> 3 days
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.boldText}>Maximum duration:</Text> 3 days
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.boldText}>Date & time harvest:</Text> August
              25, 2024, 8:00 AM
            </Text>
          </View>
        </View>

        {/* Bottom Section: Farmer Details and Feedback */}
        <View style={styles.bottomSection}>
          {/* Farmer Details */}
          <View style={styles.farmerContainer}>
            <Image
            source={require("../../assets/images/RodrigoDuterte.jpg")} // Local image
            style={styles.farmerImage}
            />
            <View>
              <Text style={styles.farmerName}>Rodrigo Duterte</Text>
              <Text style={styles.contactNumber}>0976-7635-265</Text>
              <Text style={styles.location}>Pagatpat, Cagayan de Oro City</Text>
            </View>
          </View>

          {/* Feedback Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Consumer Feedback</Text>
            <ScrollView style={styles.feedbackContainer}>
              {feedbacks.map((feedback, index) => (
                <View key={index} style={styles.feedbackItem}>
                  <Image
                    source={feedback.profileImage}
                    style={styles.consumerImage}
                  />
                  <View style={styles.feedbackTextContainer}>
                    <Text style={styles.consumerName}>{feedback.name}</Text>
                    <Text style={styles.starHighlight}>{"★".repeat(feedback.rating)}{"☆".repeat(5 - feedback.rating)}</Text>
                    <Text style={styles.feedbackText}>{feedback.feedback}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Add Ratings Section */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rate this product:</Text>
              <View style={styles.horizontalStars}>{renderStars()}</View>
            </View>

            {/* Add Ratings Button */}
            <TouchableOpacity
              style={styles.addRatingButton}
              onPress={handleAddRating}
            >
              <Text style={styles.addRatingButtonText}>Add Ratings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: "#555",
  },
  image: {
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
  },
  price: {
    fontSize: 20,
    color: "#27ae60",
  },
  category: {
    fontSize: 14,
    color: "#555",
  },
  available: {
    fontSize: 14,
    color: "#555",
  },
  quantityLabel: {
    fontWeight: "bold",
    marginVertical: 5,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  orderButton: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  orderButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  description: {
    marginTop: 10,
    color: "#555",
  },
  infoContainer: {
    marginTop: 10,
  },
  infoText: {
    color: "#444",
  },
  boldText: {
    fontWeight: "bold",
  },
  bottomSection: {
    padding: 20,
  },
  farmerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  farmerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  farmerName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
  },
  contactNumber: {
    color: "#555",
  },
  location: {
    color: "#888",
  },
  feedbackSection: {
    marginTop: 5,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 18,
  },
  feedbackContainer: {
    height: 150,
  },
  feedbackText: {
    color: "#555",
    lineHeight: 20,
  },
  starHighlight: {
    color: "#FFD700",
  },
  ratingContainer: {
    marginVertical: 10,
  },
  ratingLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "bold",
  },
  horizontalStars: {
    flexDirection: "row",
  },
  starContainer: {
    marginHorizontal: 5,
  },
  star: {
    fontSize: 24,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 2,
  },starHighlight: {
    color: "#FFD700",
  },
  ratingContainer: {
    marginVertical: 10,
  },
  ratingLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: "bold",
  },
  horizontalStars: {
    flexDirection: "row",
  },
  starContainer: {
    marginHorizontal: 5,
  },
  star: {
    fontSize: 24,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 2,
  },
  addRatingButton: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#27ae60",
    borderRadius: 5,
    marginTop: 10,
  },
  addRatingButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ProductCard;
