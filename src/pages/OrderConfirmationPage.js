import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OrderConfirmationPage = ({ navigation }) => {
  const farmerContact = "09123456789";
  const farmerName = "Mang Kanor Rodrigo";
  const orderId = "12345";
  const product = "Dako nga Talong";
  const quantity = 2;
  const total = "₱30.00";


  return (
    <ScrollView style={styles.container}>
      {/* Header Row with Back Button and Centered Greeting */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Good day!</Text>
      </View>

      {/* Greeting Message */}
      <View style={styles.header}>
        <Text style={styles.message}>
          Your order has been reviewed and confirmed by the farm owner.
        </Text>
      </View>

      {/* Header Image */}
      <Image
        source={require('./assets/images/header-order-consumer.jpg')}
        style={styles.headerImage}
      />

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <Text style={styles.orderSummaryTitle}>Order Summary</Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Order ID:</Text> {orderId}
        </Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Farmer:</Text> {farmerName}
        </Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Product Ordered:</Text> {product}
        </Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Quantity:</Text> {quantity}
        </Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Total:</Text> {total}
        </Text>
      </View>

      {/* Order Status */}
      <View style={styles.status}>
        <Text style={styles.statusTitle}>Status</Text>
        <Text style={styles.statusText}>Order confirmed by the farm owner</Text>
      </View>

      {/* Delivery Details */}
      <View style={styles.deliveryDetails}>
        <Text style={styles.deliveryDetailsTitle}>Delivery Details</Text>
        <Text style={styles.deliveryDetailsText}>
          Your order will be delivered as per your arrangement with the farmer.
        </Text>
      </View>

      {/* Contact Information */}
      <View style={styles.contact}>
        <Text style={styles.contactTitle}>
          If you have any concerns, please contact the farmer:
        </Text>
        <Text style={styles.contactText}>Contact #: {farmerContact}</Text>
        <Text style={styles.contactMessage}>
          We are here to address your concerns promptly and ensure a smooth experience.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 15,
    paddingVertical: 30,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  header: {
    marginBottom: 15,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginVertical: 10,
  },
  orderSummary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 18,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  orderSummaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  status: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 18,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  deliveryDetails: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 18,
  },
  deliveryDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  deliveryDetailsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  contact: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 50,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  contactMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#333',
    marginTop: 10,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333', 
  },  
});

export default OrderConfirmationPage;