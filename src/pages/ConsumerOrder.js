import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import CustomAlert from '../support/CustomAlert';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../backend/supabaseClient';
import { markProductAsDone } from '../utils/api';

const { width, height } = Dimensions.get('window');

import headerImage from '../../assets/images/order-header.webp';

const ConsumerOrderPage = ({ route, navigation }) => {
  const { orderData } = route.params;
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');

  const handleProceedOrder = async () => {
    if (isChecked) {
      setModalVisible(false);

      console.log("Fetching product data for productId:", orderData.productId);
      const { data: productData, error: fetchError } = await supabase
        .from('product') 
        .select('available')
        .eq('id', orderData.productId) 
        .single();

      if (fetchError) {
        showAlert("Fetch Error", "Failed to fetch product data. Please try again.");
        console.error("Fetch Error:", fetchError);
        return;
      }

      const availableString = productData.available; 
      const availableMatch = availableString.match(/(\d+(\.\d+)?)/); 
      const currentAvailable = availableMatch ? parseFloat(availableMatch[0]) : 0; 

      console.log("Current available quantity:", currentAvailable);
      
      const quantityOrdered = orderData.quantity; 
      const newAvailable = currentAvailable - quantityOrdered; 

      console.log("Quantity ordered:", quantityOrdered);
      console.log("New available quantity after order:", newAvailable);

      const { data, error } = await supabase
        .from('orders') 
        .insert([
          {
            order_id: orderData.orderId,
            product_id: orderData.productId,
            product_name: orderData.product,
            product_location: orderData.productLocation,
            price: orderData.price,
            quantity: orderData.quantity,
            total_price: orderData.totalPrice,
            farmer_name: orderData.farmerName,
            farmer_contact: orderData.farmerContact,
            farmer_id: orderData.farmer_id,
            consumer_id: user.id_user,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        showAlert("Order Error", "Failed to record the order. Please try again.");
        console.error("Order Error:", error);
        return;
      }

      console.log("Order recorded successfully:", data);

      const nonNumericPart = availableString.replace(/(\d+(\.\d+)?)/, '').trim(); 
      const updatedAvailableString = `${newAvailable.toFixed(2)} ${nonNumericPart}`;

      const { error: updateError } = await supabase
        .from('product') 
        .update({ available: updatedAvailableString })
        .eq('id', orderData.productId); 

      if (updateError) {
        showAlert("Update Error", "Failed to update available quantity. Please try again.");
        console.error("Update Error:", updateError);
        return;
      }

      if (newAvailable <= 0) {
        try {
          await markProductAsDone(orderData.productId); 
        } catch (error) {
          console.error("Error marking product as done:", error);
        }
      }

      console.log("Available quantity updated successfully. New available quantity:", updatedAvailableString);
      
      showAlert("Order Recorded", "Your order has been recorded. Please wait until the farmer confirms it after you have contacted them.");
      
      setTimeout(() => {
        navigation.goBack();
      }, 3000); 
    }
  };

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      showsVerticalScrollIndicator={false} 
      keyboardShouldPersistTaps="handled"
    >
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={35} color="#34A853" />
            </TouchableOpacity>

            <Text style={styles.title}>Order Process</Text>
        </View>

        <Image source={headerImage} style={styles.headerImage} />

        <View style={styles.orderDetailsContainer}>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Order ID:</Text> {orderData.orderId}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Location:</Text> {orderData.productLocation}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Product:</Text> {orderData.product}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Price:</Text> {orderData.price}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Quantity:</Text> {orderData.quantity}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Total Price:</Text> {orderData.totalPrice}
          </Text>
        </View>

        <View style={styles.farmerProfileContainer}>
          <View style={styles.farmerDetailsContainer}>
            <Text style={styles.farmerDetails}>
              <Text style={styles.boldText}>Farmer:</Text> {orderData.farmerName}
            </Text>
            <Text style={styles.farmerDetails}>
              <Text style={styles.boldText}>Contact:</Text> {orderData.farmerContact}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.proceedButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.proceedButtonText}>Place Order</Text>
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Farmers may not always be online. 
                Please contact the farmer within 3 days to confirm the order. 
                Unconfirmed orders will be automatically canceled.
              </Text>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={styles.checkbox} 
                  onPress={() => setIsChecked(!isChecked)}
                >
                  {isChecked ? (
                    <Ionicons name="checkbox" size={24} color="#4CAF50" />
                  ) : (
                    <Ionicons name="square-outline" size={24} color="#4CAF50" />
                  )}
                  <Text style={styles.checkboxText}>I understand.</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, styles.cancelText]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleProceedOrder}
                >
                  <Text style={[styles.modalButtonText, styles.okayText]}>
                    Okay
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <CustomAlert 
          visible={alertVisible} 
          title={alertTitle} 
          message={alertMessage} 
          onClose={() => setAlertVisible(false)} 
        />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  title: {
    fontSize: width * 0.045,
    fontFamily: 'medium',
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
    fontFamily: 'regular',
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  boldText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#333',
  },
  normalText: {
    fontFamily: 'normal',
    color: '#555',
  },
  productImage: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 10,
  },
  farmerProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
  },
  farmerDetailsContainer: {
    flex: 1,
  },
  farmerDetails: {
    fontSize: 14,
    fontFamily: 'medium',
    marginBottom: 5,
    color: '#333',
  },
  proceedButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'medium',
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
    marginBottom: 5,
    fontFamily: 'regular',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  checkboxText: {
    padding: 5,
    fontSize: 14,
    fontFamily: 'regular',
    color: '#4CAF50',
  },
  checkedText: {
    color: '#4CAF50',
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
    fontFamily: 'medium',
  },
  cancelText: {
    color: '#d9534f',
  },
  okayText: {
    color: '#5cb85c',
  },
});

export default ConsumerOrderPage;