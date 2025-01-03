import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import CustomAlert from '../support/CustomAlert';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns'
import { supabase } from '../backend/supabaseClient';

const { width, height } = Dimensions.get('window');

import headerImage from '../../assets/images/header-farmer.jpg';

const FarmerOrderConfirmation = ({ route, navigation }) => {
  const { order } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');

  const { data: orderData, refetch } = useQuery({
    queryKey: ['order', order.order_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('confirm_order')
        .eq('order_id', order.order_id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          confirm_order: true,
          date_confirmation: new Date().toISOString()
        })
        .eq('order_id', order.order_id);
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const handleOrderAction = async (action) => {
    if (action === 'confirm') {
      try {
        await mutation.mutateAsync();
        showAlert('Order Confirmed', 'You have successfully confirmed the order.');
        refetch(); 
      } catch (error) {
        showAlert('Error', 'Failed to confirm the order. Please try again.');
      }
    } else if (action === 'cancel') {
      showAlert('Order Canceled', 'You have canceled the order.');
    }
    setModalVisible(false);
  };

  const formatDate = (date) => {
    try {
      return format(date ? parseISO(date) : new Date(), " MMMM d, yyyy, hh:mm a");
    } catch (error) {
      return 'Invalid Date';
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

        <Text style={styles.title}>Consumer's Order</Text>
      </View>

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
            <Text style={styles.boldText}>Order ID:</Text> {order.order_id}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Date Ordered:</Text> {formatDate(order.created_at)}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Product Ordered:</Text> {order.product_name}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Price:</Text> {order.price}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Quantity:</Text> {order.quantity}
          </Text>
          <Text style={styles.orderText}>
            <Text style={styles.boldText}>Total Price:</Text> {order.total_price}
          </Text>
        </View>

        <View style={styles.consumerDetailsContainer}>
          <Text style={styles.boldText}>Customer's Details</Text> 
        
          <Text style={styles.consumerDetails}>
            <Text style={styles.boldText}>Name: </Text> 
            {[
              order.consumer.first_name,
              order.consumer.middle_name,
              order.consumer.last_name,
              order.consumer.suffix
            ].filter(Boolean).join(' ')}
          </Text>
          <Text style={styles.consumerDetails}>
            <Text style={styles.boldText}>Contact:</Text> {order.consumer.phone_number}
          </Text>
          {order.consumer.address && (
            <Text style={styles.consumerDetails}>
              <Text style={styles.boldText}>Address:</Text> {order.consumer.address}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.actionButtonText}>
            {orderData?.confirm_order ? 'Confirmed Order' : 'Order Actions'}
          </Text>
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
    flexGrow: 1,
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
  notificationHeader: {
    marginTop: 10,
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 15,
    fontFamily: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    fontFamily: 'regular',
    textAlign: 'center',
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
    marginBottom: 20,
  },
  orderText: {
    fontSize: 13,
    fontFamily: 'regular',
    marginBottom: 5,
    color: '#333',
  },
  boldText: {
    fontSize: 14,
    fontFamily: 'medium',
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
  consumerDetails: {
    fontSize: 14,
    fontFamily: 'regular',
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
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
    fontFamily: 'medium',
  },
  confirmText: {
    color: '#5cb85c',
  },
  cancelText: {
    color: '#d9534f',
  },
});

export default FarmerOrderConfirmation;