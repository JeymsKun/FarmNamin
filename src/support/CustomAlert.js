import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';

const CustomAlert = ({ visible, title, message, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1, 
          duration: 150, 
          useNativeDriver: true, 
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, 
          duration: 150, 
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim]);

  return (
    <Modal transparent={true} animationType="none" visible={visible}>
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.alertBox, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity style={styles.alertButton} onPress={onClose}>
            <Text style={styles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000, 
  },
  alertBox: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: 'regular', 
    textAlign: 'left',
    marginBottom: 20,
  },
  alertButton: {
    padding: 10,
  },
  alertButtonText: {
    color: '#4ED25B',
    fontFamily: 'medium', 
    textAlign: 'right',
  },
});

export default CustomAlert;
