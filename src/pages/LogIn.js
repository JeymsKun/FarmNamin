import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, ActivityIndicator, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../backend/supabaseClient';

const { width, height } = Dimensions.get('window');

export default function LogIn({ navigation, route }) {
  const { role } = route.params;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorUsername, setErrorUsername] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false); 

  const handleLogin = async () => {
    setUsernameFocused(true);
    setPasswordFocused(true);
    setErrorUsername(false);
    setErrorPassword(false);

    if (!username || !password) {
        Alert.alert("Validation Error", "Please fill in both username and password.");
        return;
    }

    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password);

        if (error) throw error;

        if (data.length > 0) {
            const user = data[0];

            if (user.role !== role) {
            Alert.alert(
              'Role Mismatch Detected',
              `We detected that your account belongs to the ${user.role} role. Switching to the correct role now.`
            );

            navigation.replace('LogIn', { role: user.role });
          } else {
            if (!user.isInfoComplete) {
              navigation.navigate('ProfileSetUp', { userId: user.id_user });
            } else {
              navigation.navigate('HomeTabs', { role });
            }
          }
        } else {
          Alert.alert("Login Failed", "Invalid credentials or role.");
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
            <Text style={styles.inputText}>Username or Email</Text> 
            <View style={[styles.inputContainer, (errorUsername || (usernameFocused && username.length === 0)) && styles.errorBorder]}> 
              <TextInput 
                value={username} 
                style={styles.input} 
                onChangeText={(text) => setUsername(text)}  
                placeholder='Username or Email'
                placeholderTextColor='#127810'
                onFocus={() => setUsernameFocused(false)}
                onBlur={() => setUsernameFocused(true)} 
              /> 

              {username.length >= 5 && (
                <TouchableOpacity onPress={() => setUsername('')}>
                  <Icon name="close-circle" size={24} color="white" />
                </TouchableOpacity>
              )}
              
              {usernameFocused && username.length === 0 && (
                <Text style={styles.errorText}>* Please enter your username.</Text>
              )}
              {errorUsername && (
                <Text style={styles.errorText}>* Username not found.</Text>
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
    fontSize: 50,
    color: '#12C824',
    fontWeight: 'bold',
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
    fontSize: 18,
    color: 'black',
    flex: 1, 
  },
  inputText: {
    fontSize: 16, 
    color: 'white',
  },
  forgotContainer: {
    padding: 10,
    marginBottom: 10,
  },
  forgotPassword: {
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  signUp: {
    marginRight: 5,
    fontSize: 16,
    color: 'white',
  },
  signUpLink: {
    fontSize: 16,
    color: '#4BFF5D',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});
