import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, ActivityIndicator, Dimensions, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen({ navigation, route }) {
  const { role } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
    };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const isStrongPassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/;
    return regex.test(password);
  };  

  const handleConfirmPasswordChange = () => {
    setPasswordFocused(true);
    setConfirmPasswordFocused(true);

    const errors = [];

    if (!password.trim()) {
      errors.push('password');
    } else if (!isStrongPassword(password)) {
      errors.push('weakPassword');
    }

    if (!confirmPassword.trim() || password !== confirmPassword) errors.push('confirmPassword');
    if (!agree) errors.push('agree');

    if (errors.length > 0) {
      setLoading(false); 
      return;
    }

    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);

    InsertRecord();
  };


  const InsertRecord = () => {
    setLoading(true);

    const InsertAPIURL = "http://192.168.1.56/farmnamin/change_password.php";  
    const headers = {
        'Accept': 'application/json', 
        'Content-Type': 'application/json'
    };

    const data = {
      username,
      email, 
      phoneNumber,
      password,
      confirmPassword,
      role
    };

    fetch(InsertAPIURL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(text => {
      console.log('Response Text:', text);
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error('JSON Parse Error:', error);
        throw error;
      }
    })
    .then(responseData => {
      setLoading(false);
      if (Array.isArray(responseData) && responseData[0] && responseData[0].Message) {
        if (responseData[0].Message === "You have successfully signed up!") {
          console.log(responseData[0].Message);
          setTimeout(() => {
            navigation.navigate('ProfileSetUp', { role }); 
          }, 2000);
        } else if (responseData[0].Message === "Username, email, or phone number already exists.") {
          if (responseData[0].Username) setUsernameExists(true);
          if (responseData[0].Email) setEmailExists(true);
          if (responseData[0].PhoneNumber) setPhoneExists(true);         
        } else {
          console.log(responseData[0].Message);
        }
      } else {
        console.log("Unexpected response format.");
      }
    })
    .catch(error => {
      setLoading(false);
      console.log("Error: " + error.message);
    });
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar hidden={false} />
      <ImageBackground 
        source={require('../../assets/Wheat1.jpg')} 
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['#4AF146', 'transparent']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          start={{ x: 0, y: 2 }}
          end={{ x: 1, y: 0 }}
        />

        <View style={styles.container}>

          <View style={styles.header}>
            {role === 'consumer' ? (
              <Image source={require('../../assets/consumer_user.png')} style={styles.logo} />
            ) : (
              <Image source={require('../../assets/farmer_user.png')} style={styles.logo} />
            )}
            <Text style={styles.title}>FarmNamin</Text>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputText}>Password</Text> 
            <View style={[styles.passwordContainer, passwordFocused && (password.length === 0 || !isStrongPassword(password)) && styles.errorBorder]}> 
              <TextInput value={password} 
                style={styles.input}
                onChangeText={setPassword} 
                placeholder='Password'
                placeholderTextColor='#127810' 
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(false)}
                onBlur={() => setPasswordFocused(true)}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="black" />
              </TouchableOpacity>

              {passwordFocused && password.length === 0 && (
                <Text style={styles.errorText}>* Password is required.</Text>
              )}
              {password && !isStrongPassword(password) && (
                <Text style={styles.errorText}>* Password must be 12+ chars, include an uppercase, number, and special char.</Text>
              )}
            </View>

            <Text style={styles.inputText}>Confirm Password</Text> 
            <View style={[styles.passwordContainer, confirmPasswordFocused &&  (confirmPassword.length === 0 || password !== confirmPassword) && styles.errorBorder]}> 
              <TextInput value={confirmPassword} 
                style={styles.input}
                onChangeText={setConfirmPassword} 
                placeholder='Confirm Password'
                placeholderTextColor='#127810' 
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setConfirmPasswordFocused(false)}
                onBlur={() => setConfirmPasswordFocused(true)} 
              />

              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="black" />
              </TouchableOpacity>

              {confirmPasswordFocused && confirmPassword.length === 0 && (
                <Text style={styles.errorText}>* Confirmed Password is required.</Text>
              )}
              {confirmPasswordFocused && confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.errorText}>* Passwords do not match.</Text>
              )}
            </View>

          </View>


          <TouchableOpacity style={styles.updateButton} onPress={handleConfirmPasswordChange}>
            {loading ? (
              <ActivityIndicator size={25} color="white" />
            ) : (
              <Text style={styles.updateButtonText}>Update Password</Text>
            )}  
          </TouchableOpacity>

        </View>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%',
  },
  header: {
    marginBottom: height * 0.05,
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 50,
    color: '#12C824',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 4 },
    textShadowRadius: 5,
  },
  logo: {
    width: 100,
    height: 100,
  },
  inputWrapper: {
    width: '100%',
    padding: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    backgroundColor: '#4ED25B',
    borderRadius: 10, 
    paddingHorizontal: 10, 
    width: '100%',
    height: height * 0.06, 
    marginBottom: 10,
    position: 'relative',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    position: 'absolute', 
    bottom: -15, 
    left: 10, 
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: '#F44336',
  },
  input: {  
    padding: 10,
    fontSize: 18,
    color: 'black',
    flex: 1, 
  },
  inputText: {
    fontSize: 16, 
    color: 'white',
  },
  updateButton: {
    backgroundColor: '#28B805',
    padding: 10,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginVertical: 30,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
