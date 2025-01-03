import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { format, parseISO } from 'date-fns'

const { width, height } = Dimensions.get('window');

const OrderConfirmation = ({ route }) => {
  const { order } = route.params;
  const navigation = useNavigation();

  const formatDate = (date) => {
    try {
      return format(date ? parseISO(date) : new Date(), " MMMM d, yyyy, hh:mm a");
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      showsVerticalScrollIndicator={false} 
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={35} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Good day!</Text>
      </View>

      <Text style={styles.message}>
        Your order has been reviewed and confirmed by the farm owner.
      </Text>

      <Image
        source={require('../../assets/images/header-order-consumer.jpg')}
        style={styles.headerImage}
      />

      <View style={styles.orderSummary}>
        <Text style={styles.orderSummaryTitle}>Order Summary</Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Order ID:</Text> {order.order_id}
        </Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Product Ordered:</Text> {order.product_name}
        </Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Quantity:</Text> {order.quantity}
        </Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Total Price:</Text> {order.total_price}
        </Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Product Owned by:</Text> 
          {[
              order.farmer.first_name,
              order.farmer.middle_name,
              order.farmer.last_name,
              order.farmer.suffix
            ].filter(Boolean).join(' ')}
        </Text>
        <Text style={styles.orderSummaryText}>
          <Text style={styles.boldText}>Date Ordered:</Text> {formatDate(order.created_at)}
        </Text>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusTitle}>Status</Text>
        <Text style={styles.statusText}>Order confirmed by the farm owner</Text>
      </View>

      <View style={styles.deliveryDetails}>
        <Text style={styles.deliveryDetailsTitle}>Delivery Details</Text>
        <Text style={styles.deliveryDetailsText}>
          Your order will be delivered as per your arrangement with the farmer.
        </Text>
      </View>

      <View style={styles.contact}>
        <Text style={styles.contactTitle}>
          If you have any concerns, please contact the farmer:
        </Text>
        <Text style={styles.contactText}>Contact #: {order.farmer.phone_number}</Text>
        {order.farmer && order.farmer.address ? (
          <Text style={styles.contactText}>Address: {order.farmer.address}</Text>
        ) : null}
        <Text style={styles.contactMessage}>
          We are here to address your concerns promptly and ensure a smooth experience.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  header: {
    padding: 10,
    marginBottom: height * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'bold',
    color: '#4CAF50',
  },
  message: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#333',
    textAlign: 'center',
  },
  headerImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    marginTop: 10,
    resizeMode: 'cover',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderSummary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 18,
  },
  orderSummaryTitle: {
    fontSize: 14,
    fontFamily: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  orderSummaryText: {
    fontSize: 13,
    fontFamily: 'regular',
    color: '#555',
    marginBottom: 5,
  },
  boldText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#333', 
  },  
  status: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 18,
  },
  statusTitle: {
    fontSize: 14,
    fontFamily: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#4CAF50',
  },
  deliveryDetails: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 18,
  },
  deliveryDetailsTitle: {
    fontSize: 14,
    fontFamily: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  deliveryDetailsText: {
    fontSize: 14,
    fontFamily: 'regular',
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
    fontSize: 13,
    fontFamily: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 13,
    fontFamily: 'medium',
    color: '#555',
    marginBottom: 6,
  },
  contactMessage: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#333',
    marginTop: 10,
  },
});

export default OrderConfirmation;