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
import { CheckBox } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

import headerImage from '../../assets/images/order-header.webp';

const ConsumerOrderPage = ({ navigation }) => {
  const orderId = "12345";
  const product = "Dako nga Talong";
  const price = "₱15.00";
  const quantity = 2;
  const totalPrice = "₱30.00";
  const farmerName = "Mang Kanor Rodrigo";
  const farmerContact = "09123456789";
  const productImageUrl = "https://via.placeholder.com/150";
  const farmerImageUrl = "https://via.placeholder.com/80";

  const [modalVisible, setModalVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleProceedOrder = () => {
    if (isChecked) {
      setModalVisible(false);
      Alert.alert(
        'Order Recorded',
        'Your order has been recorded. Please wait until the farmer confirms it after you have contacted them.'
      );
    } else {
      Alert.alert('Confirmation Required', 'Please check the box to proceed.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Process</Text>
          <View style={{ width: 24 }} /> 
        </View>

        <Image source={headerImage} style={styles.headerImage} />

        <View style={styles.orderDetailsContainer}>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Order ID:</Text> {orderId}
          </Text>
          <Image source={{ uri: productImageUrl }} style={styles.productImage} />
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Product:</Text> {product}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Price:</Text> {price}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Quantity:</Text> {quantity}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Total Price:</Text> {totalPrice}
          </Text>
        </View>

        <View style={styles.farmerProfileContainer}>
          <Image source={{ uri: farmerImageUrl }} style={styles.farmerImage} />
          <View style={styles.farmerDetailsContainer}>
            <Text style={styles.farmerDetails}>
              <Text style={styles.boldText}>Farmer:</Text> {farmerName}
            </Text>
            <Text style={styles.farmerDetails}>
              <Text style={styles.boldText}>Contact:</Text> {farmerContact}
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
              <Text style={[styles.modalText]}>
                Farmers may not always be online. 
                Please contact the farmer within 3 days to confirm the order. 
                Unconfirmed orders will be automatically canceled.
              </Text>

              <View style={styles.checkboxContainer}>
                <CheckBox
                  checked={isChecked}
                  onPress={() => setIsChecked(!isChecked)}
                  containerStyle={[
                    styles.checkbox,
                    isChecked && styles.checkedCheckbox,
                  ]}
                  title="I understand"
                  textStyle={[
                    styles.checkboxText,
                    isChecked && styles.checkedText,
                  ]}
                  checkedColor="#4CAF50"
                />
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
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerImage: {
    width: '100%',
    height: 150,
    marginBottom: 20,
    marginTop: 10,
    borderRadius: 10,
    resizeMode: 'cover',
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
  normalText: {
    fontWeight: 'normal',
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
    marginBottom: 5,
    color: '#333',
  },
  proceedButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  proceedButtonText: {
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
    marginBottom: 5,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    marginBottom: 5,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  checkedCheckbox: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  checkboxText: {
    color: '#333',
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
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#d9534f',
  },
  okayText: {
    color: '#5cb85c',
  },
});

export default ConsumerOrderPage;