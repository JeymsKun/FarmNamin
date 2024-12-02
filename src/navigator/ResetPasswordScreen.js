import React, { useState } from 'react';
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ResetPasswordScreen({ navigation }) {
  const [contactNumber, setContactNumber] = useState('');

  const handleResetPassword = () => {
    if (contactNumber) {
      // Add your reset password logic here
      console.log('Reset password for:', contactNumber);

      // Navigate back to the LogIn screen
      navigation.replace('LogIn');
    } else {
      alert('Please enter your contact number');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/Wheat1.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Image
          source={require('../../assets/Green.png')}
          style={styles.logo}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Number"
          placeholderTextColor="#000"
          value={contactNumber}
          onChangeText={setContactNumber}
        />
        <Text style={styles.helperText}>
          Use Contact Number to reset password
        </Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
          <Text style={styles.resetButtonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#28B805',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#6cdc7c',
    borderRadius: 5,
    padding: 15,
    marginVertical: 10,
    color: '#000',
  },
  helperText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#28B805',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
