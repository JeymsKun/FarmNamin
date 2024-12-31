import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions } from "react-native";
import { decode } from 'base64-arraybuffer';
import { v4 as uuidv4 } from 'uuid';
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { fetchProfileData } from '../utils/api';
import { setProfile } from '../store/profileSlice';
import { supabase } from '../backend/supabaseClient';
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';
import CustomAlert from '../support/CustomAlert';

const { width, height } = Dimensions.get('window');

const VerificationScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const userId = user?.id_user;
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState("");
  const [contactVerificationCode, setContactVerificationCode] = useState("");
  const [documentNames, setDocumentNames] = useState([]);
  const [contactNumber, setContactNumber] = useState("09359335222");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isContactCodeSent, setIsContactCodeSent] = useState(false);
  const [isModifiedEmail, setIsModifiedEmail] = useState('');
  const [isModifiedContactNumber, setIsModifiedContactNumber] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const { data: profile, refetch: refetchProfile } = useQuery({
      queryKey: ['profile', user?.id_user],
      queryFn: () => fetchProfileData(user.id_user),
      enabled: !!user,
      onSuccess: (profile) => {
      dispatch(setProfile(profile));
    },
  });

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useRealTimeUpdates(user?.id_user);

  useFocusEffect(
    React.useCallback(() => {

    refetchProfile();

    }, [])
  );

  const handleSendVerificationCode = () => {
    setIsCodeSent(true);
    showAlert("Verification Code Sent", "Check your email for the code.");
  };

  const handleVerifyCode = () => {
    if (verificationCode === "123321") {
      showAlert("Success", "Your email has been verified.");
    } else {
      showAlert("Error", "Invalid verification code.");
    }
  };

  const handleSendContactVerificationCode = () => {
    setIsContactCodeSent(true);
    showAlert("Verification Code Sent", "Check your contact number for the code.");
  };

  const handleVerifyContactCode = () => {
    if (contactVerificationCode === "456654") {
      showAlert("Success", "Your contact number has been verified.");
    } else {
      showAlert("Error", "Invalid verification code for contact number.");
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setIsModifiedEmail(true);
  };

  const formatPhoneNumberForDisplay = (phoneNumber) => {
    if (phoneNumber && phoneNumber.length === 10 && phoneNumber[0] !== '0') {
      return '0' + phoneNumber;
    }
    return phoneNumber;
  };

  const handleContactNumberChange = (text) => {
    const formattedText = text.replace(/\D/g, '');
    setContactNumber(formattedText);
    setIsModifiedContactNumber(true);
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

        <Text style={styles.title}>Verification</Text>
      </View>

      <View style={styles.core}>
        <Text style={styles.subTitle}>Email Address (unverified)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Add Email address'
            value={isModifiedEmail ? email : profile?.email || ''}
            onChangeText={handleEmailChange}
          />
          <View style={styles.line}/>

          <TouchableOpacity onPress={handleSendVerificationCode}>
            <Text style={styles.linkText}>Verify email address here</Text>
          </TouchableOpacity>

          {isCodeSent && (
            <>
              <TextInput
                style={[styles.underlineInput, styles.greenUnderline]} 
                placeholder="Enter Verification Code"
                keyboardType="numeric"
                value={verificationCode}
                onChangeText={setVerificationCode}
              />
              <TouchableOpacity style={styles.smallButton} onPress={handleVerifyCode}>
                <Text style={styles.buttonText}>Verify Code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.subTitle}>Contact Number (unverified)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Add Contact number'
            value={isModifiedContactNumber ? contactNumber : formatPhoneNumberForDisplay(profile?.phone_number || '')}
            onChangeText={handleContactNumberChange}
          />
          <View style={styles.line}/>
          <TouchableOpacity onPress={handleSendContactVerificationCode}>
            <Text style={styles.linkText}>Verify contact number here</Text>
          </TouchableOpacity>

          {isContactCodeSent && (
            <>
              <TextInput
                style={[styles.underlineInput, styles.greenUnderline]}
                placeholder="Enter Verification Code"
                keyboardType="numeric"
                value={contactVerificationCode}
                onChangeText={setContactVerificationCode}
              />
              <TouchableOpacity style={styles.smallButton} onPress={handleVerifyContactCode}>
                <Text style={styles.buttonText}>Verify Code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

      </View>

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
    padding: 20,
    backgroundColor: "#fff",
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
  core: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  subTitle: {
    marginTop: 30,
    fontSize: 13,
    fontFamily: 'regular',
  },
  inputContainer: {
    justifyContent: 'center',
    position: 'relative',
  },
  input: {
    borderRadius: 8,
    padding: width * 0.03,
    fontSize: 14,
    fontFamily: 'regular',
    color: '#444',
  },
  line: {
    height: 1,
    backgroundColor: '#555',
  },
  label: {
    fontSize: 14,
    color: "#777",
    marginTop: 10,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: "#4CAF50",
    marginTop: 5,
  },
  underlineInput: {
    fontSize: 14,
    fontFamily: 'regular',
    marginVertical: 10,
    paddingVertical: 5,
    paddingLeft: 10,
  },
  blackUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  greenUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#4CAF50", 
  },
  smallButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8, 
    paddingHorizontal: 15,
    borderRadius: 20,
    marginVertical: 8,
    alignSelf: "center", 
    width: 'auto',
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14, 
    fontFamily: 'regular',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'medium',
    marginTop: 20,
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 14,
    color: "#777",
  },
});

export default VerificationScreen;
