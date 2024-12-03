import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, ActivityIndicator, Dimensions, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen({ navigation, route }) {
  // const { role } = route.params;
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => email.endsWith('@gmail.com');

  const isStrongPassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/;
    return regex.test(password);
  };  

  const handleSignUpSubmit = () => {
    setUsernameFocused(true);
    setEmailFocused(true);
    setPhoneNumberFocused(true);
    setPasswordFocused(true);
    setConfirmPasswordFocused(true);

    const errors = [];

    if (!username.trim()) errors.push('username');
    if (!email.trim() || !isValidEmail(email)) errors.push('email');
    if (!phoneNumber.trim()) errors.push('phoneNumber');

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

    const formattedPhoneNumber = `0${phoneNumber}`;
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Phone Number:', formattedPhoneNumber);
    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);

    InsertRecord(formattedPhoneNumber);
  };


  const InsertRecord = (formattedPhoneNumber) => {
    setLoading(true);

    const InsertAPIURL = "http://192.168.1.56/farmnamin/signup.php";  
    const headers = {
        'Accept': 'application/json', 
        'Content-Type': 'application/json'
    };

    const data = {
      username,
      email, 
      phoneNumber: formattedPhoneNumber,
      password,
      confirmPassword,
      agree: agree ? 'yes' : 'no', 
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

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={36} color="#28B805" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Image source={require('../../assets/farm_user.png')} style={styles.logo} />
            <Text style={styles.title}>FarmNamin</Text>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputText}>Username</Text> 
            <View style={[styles.inputContainer, (usernameExists || (usernameFocused && username.length === 0)) && styles.errorBorder]}>
              <TextInput value={username} 
                style={styles.input} 
                onChangeText={setUsername}  
                placeholder='Username'
                placeholderTextColor='#127810'
                onFocus={() => setUsernameFocused(false)}
                onBlur={() => setUsernameFocused(true)}
              /> 

              {usernameFocused && username.length === 0 && (
                <Text style={styles.errorText}>* Username is required.</Text>
              )}
              {usernameExists && <Text style={styles.errorText}>* Username already exists.</Text>}
            </View>
            
            <Text style={styles.inputText}>Email Address</Text> 
            <View style={[styles.inputContainer, (emailExists || (emailFocused && (!isValidEmail(email) || email.length === 0))) && styles.errorBorder]}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#127810"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(false)}
                onBlur={() => setEmailFocused(true)}
              />

              {emailFocused && email.length === 0 ? (
                <Text style={styles.errorText}>* Email address is required.</Text>
              ) : emailFocused && !isValidEmail(email) ? (
                <Text style={styles.errorText}>* Email should be a '@gmail.com' address.</Text>
              ) : null}
              {emailExists && <Text style={styles.errorText}>* Email already exists.</Text>}
            </View>
            
            <Text style={styles.inputText}>Contact Number</Text>
            <View style={[styles.inputContainer, (phoneExists || (phoneNumberFocused && (phoneNumber.length === 0 || phoneNumber.length > 10 || phoneNumber.length < 10))) && styles.errorBorder]}>
              <Text style={styles.phonePrefix}>+63</Text>
              <TextInput
                style={styles.input}
                placeholder="Contact Number"
                placeholderTextColor="#127810"
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/^0/, ''))}
                keyboardType="phone-pad"
                onFocus={() => setPhoneNumberFocused(false)}
                onBlur={() => setPhoneNumberFocused(true)}
              />

              {phoneNumberFocused && phoneNumber.length === 0 ? (
                <Text style={styles.errorText}>* Contact Number is required.</Text>
              ) : phoneNumberFocused && phoneNumber.length < 10 ? (
                <Text style={styles.errorText}>* Contact number must be 10 digits long.</Text>
              ) : phoneNumberFocused && phoneNumber.length > 10 ? (
                <Text style={styles.errorText}>* Contact number cannot be more than 10 digits.</Text>
              ) : null}
              {phoneExists && <Text style={styles.errorText}>* Contact number already exists.</Text>}
            </View>

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

          <View style={styles.checkboxContainer}>
            <View style={styles.checkboxWrapper}>
              <TouchableOpacity onPress={() => setAgree(!agree)}>
                <Text style={styles.checkbox}>
                  {agree ? '☑' : '☐'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.label}>I agree to the </Text>
              <TouchableOpacity>
                <Text style={[styles.link, { color: agree ? 'white' : 'red' }]}>Terms and Conditions</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxWrapper}>
              <Text style={styles.label}> and </Text>
              <TouchableOpacity>
                <Text style={[styles.link, { color: agree ? 'white' : 'red' }]}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.label}>.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignUpSubmit}>
            {loading ? (
              <ActivityIndicator size={25} color="white" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    left: width * 0.05,
  },
  header: {
    marginBottom: height * 0.01,
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
  inputContainer: {
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
  phonePrefix: {
    paddingLeft: 12,
    paddingRight: 8,
    fontSize: 16,
  },
  checkboxContainer: {
    alignItems: 'center',
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    fontSize: 24,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: 'black',
  },
  link: {
    fontSize: 12,
    color: 'blue',
    textDecorationLine: 'none',
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
  signupButton: {
    backgroundColor: '#28B805',
    padding: 10,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
