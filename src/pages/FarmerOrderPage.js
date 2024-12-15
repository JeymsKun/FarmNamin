import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import headerImage from '../../assets/images/header-farmer.jpg';

const FarmerOrderPage = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const order = {
    orderId: 12345,
    product: 'Dako nga Talong',
    quantity: 2,
    totalPrice: '₱30.00',
    Price: '₱15.00',
    consumerName: 'James David Maserin',
    consumerContact: '09363932622',
  };

  const handleOrderAction = (action) => {
    if (action === 'confirm') {
      setIsConfirmed(true);
      Alert.alert('Order Confirmed', 'You have successfully confirmed the order.');
    } else if (action === 'cancel') {
      Alert.alert('Order Canceled', 'You have canceled the order.');
    }
    setModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
   
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer's Order</Text>
          <View style={{ width: 24 }} /> 
        </View>

        {/* Simplified Email-like Header Message */}
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationText}>Good day! You have a new order from your product.</Text>
          <Text style={styles.contactText}>
            If you have any concerns, please contact the consumer directly. Thank you!
          </Text>
        </View>

        <Image
          source={headerImage}
          style={styles.headerImage}
        />

        <View style={styles.orderDetailsContainer}>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Order ID:</Text> {order.orderId}
          </Text>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.productImage}
          />
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Product Ordered:</Text> {order.product}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Price:</Text> {order.Price}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Quantity:</Text> {order.quantity}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Total Price:</Text> {order.totalPrice}
          </Text>
        </View>

        <View style={styles.consumerDetailsContainer}>
        <Text style={styles.consumerDetailsTitle}>
            <Text style={styles.boldText}>Customer's Details</Text> 
          </Text>
          <Text style={styles.consumerDetails}>
            <Text style={styles.boldText}>Name:</Text> {order.consumerName}
          </Text>
          <Text style={styles.consumerDetails}>
            <Text style={styles.boldText}>Contact:</Text> {order.consumerContact}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.actionButtonText}>Order Actions</Text>
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={[styles.modalText, styles.boldText]}>
                Has the consumer been contacted yet?
              </Text>

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleOrderAction('confirm')}
                >
                  <Text style={[styles.modalButtonText, styles.confirmText]}>Confirm Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleOrderAction('cancel')}
                >
                  <Text style={[styles.modalButtonText, styles.cancelText]}>Cancel Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 30,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerImage: {
    width: '100%',
    height: 150,
    marginBottom: 15,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  notificationHeader: {
    marginBottom: 10,
   
  },
  notificationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 5,
  },
  orderDetailsContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 5,
  },
  orderText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  productImage: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 10,
  },
  consumerDetailsContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 5,
  },
  consumerDetailsTitle:{
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  consumerDetails: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 15,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    width: '48%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#5cb85c',
  },
  cancelText: {
    color: '#d9534f',
  },
});

export default FarmerOrderPage;