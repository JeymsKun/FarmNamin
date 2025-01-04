import React, { useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function ResetPasswordScreen({ navigation, route }) {
  const { role } = route.params;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneVerify, setPhoneVerify] = useState(false);
  const [emailVerify, setEmailVerify] = useState(false);
  const [phoneNumberFocused, setPhoneNumberFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailOTP, setEmailOTP] = useState(false);
  const [smsOTP, setSMSOTP] = useState(false);
  const [emailOTPVerify, setEmailOTPVerify] = useState(false);
  const [smsOTPVerify, setSMSOTPVerify] = useState(false);
  const [usePhoneNumber, setUsePhoneNumber] = useState(false); 
  const [verificationPhoneNumber, setVerificationPhoneNumber] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState(false);
  const [activeVerification, setActiveVerification] = useState(false);

  const isValidEmail = (email) => email.endsWith('@gmail.com');

  const handleResetPassword = () => {
    setLoading(true);

    if (isValidEmail(email)) {
      setVerificationEmail(true); 
      setActiveVerification(true);
      setLoading(false);
    } else if (phoneNumber.length === 11) {
      setVerificationPhoneNumber(true); 
      setActiveVerification(true); 
      setPhoneVerify(false); 
      setLoading(false);
    } else {
      setPhoneNumberFocused(true);
      setEmailFocused(true);
      setLoading(false);
    }
  };  

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
    <ImageBackground
      source={require('../../assets/main/Wheat1.jpg')}
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
          {role === 'consumer' ? (
            <Image source={require('../../assets/main/consumer_user.png')} style={styles.logo} />
          ) : (
            <Image source={require('../../assets/main/farmer_user.png')} style={styles.logo} />
          )}
          <Text style={styles.title}>FarmNamin</Text>
        </View>

        <View style={styles.inputWrapper}> 
          {usePhoneNumber ? (
            <>
              <Text style={styles.inputText}>Email Address</Text> 
              <View style={[styles.inputContainer, (emailVerify || (emailFocused && (!isValidEmail(email) || email.length === 0))) && styles.errorBorder]}>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#127810"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(false)}
                  onBlur={() => setEmailFocused(true)}
                />

                {email.length >= 5 && (
                  <Icon name="check-circle" size={30} color='white' />
                )}

                {emailFocused && email.length === 0 ? (
                  <Text style={styles.errorText}>* Email address is required.</Text>
                ) : emailFocused && !isValidEmail(email) ? (
                  <Text style={styles.errorText}>* Email should be a '@gmail.com' address.</Text>
                ) : null}
                {emailVerify && <Text style={styles.errorText}>* Email already exists.</Text>}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.inputText}>Contact Number</Text>
              <View style={[styles.inputContainer, (phoneVerify || (phoneNumberFocused && (phoneNumber.length === 0 || phoneNumber.length < 11 || phoneNumber.length > 11))) &&  styles.errorBorder]}>
                <TextInput
                  style={styles.input}
                  placeholder="Contact Number"
                  placeholderTextColor="#127810"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  onFocus={() => setPhoneNumberFocused(false)}
                  onBlur={() => setPhoneNumberFocused(true)}
                />

                {phoneNumber.length >= 5 && (
                  <Icon name="check-circle" size={30} color='white' />
                )}

                {phoneNumberFocused && phoneNumber.length === 0 ? (
                    <Text style={styles.errorText}>* Contact Number is required.</Text>
                ) : phoneNumberFocused && phoneNumber.length < 11 ? (
                  <Text style={styles.errorText}>* Contact number must be 11 digits long.</Text>
                ) : phoneNumberFocused && phoneNumber.length > 11 ? (
                  <Text style={styles.errorText}>* Contact number cannot be more than 11 digits.</Text>
                ) : null}
                {phoneVerify && <Text style={styles.errorText}>* Invalid contact number. Please try again.</Text>}
              </View>
            </>
          )}

          <View style={styles.switcher}>
            <TouchableOpacity
              onPress={() => {
                setUsePhoneNumber(!usePhoneNumber);
                setPhoneNumber('');
                setEmail('');
                setPhoneVerify(false);
                setEmailVerify(false);
                setPhoneNumberFocused(false);
                setEmailFocused(false);
                setVerificationPhoneNumber(false);
                setVerificationEmail(false);
                setActiveVerification(false);
                setSMSOTP('');
                setEmailOTP('');
                setSMSOTPVerify(false);
                setEmailOTPVerify(false);
              }}
            >
              <Text style={styles.helperText}>
                {usePhoneNumber ? 'Use Contact Number to reset password' : 'Use Email Address to reset password'}
              </Text>
            </TouchableOpacity>
          </View>

          {verificationPhoneNumber && (
            <View style={[styles.inputContainer, smsOTPVerify && styles.errorBorder]}>
              <TextInput
                style={styles.inputSMSEmail}
                placeholder="Enter the OTP sent via SMS to reset your password"
                placeholderTextColor="#127810"
                value={smsOTP}
                onChangeText={setSMSOTP}
                keyboardType="phone-pad"
              />

              {smsOTPVerify && <Text style={styles.errorSMSEmailText}>Invalid OTP. Please try again</Text>}
            </View>
          )}
          
          {verificationEmail && (
            <View style={[styles.inputContainer, emailOTPVerify && styles.errorBorder]}>
              <TextInput
                style={styles.inputSMSEmail}
                placeholder="Enter the OTP sent via email to reset your password"
                placeholderTextColor="#127810"
                value={emailOTP}
                onChangeText={setEmailOTP}
                keyboardType="phone-pad"
              />
    
              {emailOTPVerify && <Text style={styles.errorSMSEmailText}>Invalid OTP. Please try again</Text>}
            </View>
          )}

        </View>
          
        {activeVerification && (
          <>
            <TouchableOpacity style={styles.verifyButton} onPress={() => navigation.navigate('ChangePassword', { role })}>
              {loading ? (
                <ActivityIndicator size={25} color="white" />
              ) : (
                <Text style={styles.resendVerifyText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResetPassword}
            >
              {loading ? (
                <ActivityIndicator size={25} color="white" />
              ) : (
                <Text style={styles.resendVerifyText}>
                  Resend Code
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {!activeVerification && (
          <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
            {loading ? (
              <ActivityIndicator size={25} color="white" />
            ) : (
              <Text style={styles.resetButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        )}

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
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? height * 0.1 : height * 0.10
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 32,
    fontFamily: 'bold',
    color: '#12C824',
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
    marginBottom: height * 0.12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4ED25B',
    borderRadius: 10, 
    paddingHorizontal: 10,
    width: '100%',
    height: height * 0.07, 
    position: 'relative',
  },
  input: {  
    padding: 10,
    fontSize: 14,
    fontFamily: 'regular',
    color: 'black',
    flex: 1, 
  },
  inputSMSEmail: {
    padding: 10,
    fontSize: 12,
    fontFamily: 'regular',
    color: 'black',
    flex: 1
  },
  inputText: {
    fontSize: 14,
    fontFamily: 'regular', 
    color: 'white',
  },
  errorSMSEmailText: {
    color: 'red',
    fontSize: 14,
    fontFamily: 'regular',
    position: 'absolute', 
    bottom: -20, 
    right: 100,
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
  switcher: {
    width: '100%',
    margin: 10,
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#fff',
  },
  verifyButton: {
    backgroundColor: '#28B805',
    padding: 10,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginBottom: 30,
  },
  resendButton: {
    backgroundColor: '#28B805',
    padding: 10,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginBottom: 50,
  },
  resetButton: {
    backgroundColor: '#28B805',
    padding: 10,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginBottom: 50,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'medium',
  },
  resendVerifyText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'medium',
  },
});
