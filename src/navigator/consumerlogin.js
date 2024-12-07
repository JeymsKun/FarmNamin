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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LogIn({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      setErrorMessage('Username and password are required.');
    } else {
      setErrorMessage('');
      navigation.replace('HomeTabs');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/Wheat1.jpg')}
      style={[styles.background, { opacity: 0.7 }]}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Image source={require('../../assets/consumericon.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.title1}>to</Text>
        <Text style={styles.appName}>FarmNamin</Text>

        <TextInput
          style={styles.input}
          placeholder="Username or Email Address"
          placeholderTextColor="black"
          value={username}
          onChangeText={setUsername}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="black"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIconContainer}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="black" />
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Navigate to ResetPasswordScreen on "Forgot password?" press */}
        <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordScreen')}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Add navigation to SignUp screen */}
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUp}>
            Don't have an account?{' '}
            <Text style={styles.signUpLink}>Sign up</Text>
          </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 50,
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 50,
    color: '#12C824',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 1,
    bottom: 100,
  },
  title1: {
    fontSize: 50,
    color: '#12C824',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 1,
    bottom: 100,
  },
  appName: {
    fontSize: 50,
    color: '#12C824',
    fontWeight: 'bold',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 1,
    bottom: 100,
  },
  input: {
    width: '100%',
    backgroundColor: '#6cdc7c',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginVertical: 5,
  },
  forgotPassword: {
    fontSize: 14,
    color: 'white',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: '#28B805',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUp: {
    fontSize: 14,
    color: 'white',
  },
  signUpLink: {
    color: '#28B805',
    fontWeight: 'bold',
  },
});
