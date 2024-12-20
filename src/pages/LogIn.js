import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, ActivityIndicator, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomAlert from '../support/CustomAlert'; 
import { useAuth } from '../hooks/useAuth';

const { width, height } = Dimensions.get('window');

export default function LogIn({ navigation, route }) {
  const { role } = route.params;
  const { signInWithEmailPassword, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [isCustomAlertVisible, setIsCustomAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleLogin = async () => {
    setEmailFocused(true);
    setPasswordFocused(true);
    setErrorEmail(false);
    setErrorPassword(false);

    if (!email || !password) {
        Alert.alert("Validation Error", "Please fill in both email and password.");
        return;
    }

    setLoading(true);
    try {
        const user = await signInWithEmailPassword(email, password);

        if (user) {
          if (!user.id_user) {
            Alert.alert('Critical Error', 'User ID not found.');
            return;
          }

          if (user.role !== role) {
            setAlertTitle('Role Mismatch Detected');
            setAlertMessage(`We detected that your account belongs to the ${user.role} role. Switching to the correct role now.`);
            setIsCustomAlertVisible(true);
            
            setTimeout(() => {
              navigation.replace('LogIn', { role: user.role });
            }, 3000);
          } else {
            if (!user.is_info_complete) {
              navigation.navigate('ProfileSetUp', { userId: user.id_user });
            } else {
              navigation.navigate('HomeTabs', { role });
            }
          }
        }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const headerImage =
    role === 'farmer'
      ? require('../../assets/farmer_user.png') 
      : require('../../assets/consumer_user.png');

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
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.title}>to</Text>

            <View style={styles.headerRow}>
              <Image source={headerImage} style={styles.logo} />
              <Text style={styles.title}>FarmNamin</Text>
            </View>

          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputText}>Email Address</Text> 
            <View style={[styles.inputContainer, (errorEmail || (emailFocused && email.length === 0)) && styles.errorBorder]}> 
              <TextInput 
                value={email} 
                style={styles.input} 
                onChangeText={(text) => setEmail(text)}  
                placeholder='Email Address'
                placeholderTextColor='#127810'
                onFocus={() => setEmailFocused(false)}
                onBlur={() => setEmailFocused(true)} 
              /> 

              {email.length >= 5 && (
                <TouchableOpacity onPress={() => setEmail('')}>
                  <Icon name="close-circle" size={24} color="white" />
                </TouchableOpacity>
              )}
              
              {emailFocused && email.length === 0 && (
                <Text style={styles.errorText}>* Please enter your email address.</Text>
              )}
              {errorEmail && (
                <Text style={styles.errorText}>* Email Address not found.</Text>
              )}
            </View>
      
            <Text style={styles.inputText}>Password</Text> 
            <View style={[styles.passwordContainer,(errorPassword || (passwordFocused && password.length === 0)) && styles.errorBorder]}> 
              <TextInput 
                value={password} 
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
                <Text style={styles.errorText}>* Please enter your password.</Text>
              )}

              {errorPassword && (
                <Text style={styles.errorText}>* Incorrect password or click "Forgot password?" to reset it.</Text>
              )}
            </View>

            <View style={styles.forgotContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordScreen', { role })}>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

          </View>

          <TouchableOpacity style={styles.loginButton} onPress={(handleLogin)}>
            {loading ? (
              <ActivityIndicator size={25} color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUp}>
              Don't have an account?
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate('SignUp', { role })}> 
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
       
        </View>
      </ImageBackground>
      <CustomAlert 
        visible={isCustomAlertVisible} 
        title={alertTitle} 
        message={alertMessage} 
        onClose={() => setIsCustomAlertVisible(false)} 
      />
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
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontFamily: 'bold',
    fontSize: 32,
    color: '#12C824',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 4 },
    textShadowRadius: 5,
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
    height: 50, 
    marginBottom: 20,
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
    height: 50, 
    marginBottom: 10,
    position: 'relative',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    fontFamily: 'regular',
    position: 'absolute', 
    bottom: -18, 
    left: 10, 
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: '#F44336',
  },
  input: {  
    padding: 10,
    fontSize: 14,
    color: 'black',
    fontFamily: 'regular',
    flex: 1, 
  },
  inputText: {
    fontFamily: 'regular',
    fontSize: 14, 
    color: 'white',
  },
  forgotContainer: {
    padding: 10,
    marginBottom: 10,
  },
  forgotPassword: {
    fontFamily: 'medium',
    fontSize: 14,
    color: 'white',
  },
  loginButton: {
    backgroundColor: '#28B805',
    padding: 10,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'medium',
  },
  signUpContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  signUp: {
    marginRight: 5,
    fontSize: 14,
    fontFamily: 'regular',
    color: 'white',
  },
  signUpLink: {
    fontSize: 14,
    color: '#4BFF5D',
    textDecorationLine: 'underline',
    fontFamily: 'medium',
  },
});
