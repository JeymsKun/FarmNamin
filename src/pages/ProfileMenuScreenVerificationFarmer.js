import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { decode } from 'base64-arraybuffer';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../backend/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const VerificationScreen = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("jojoterada123@gmail.com");
  const [verificationCode, setVerificationCode] = useState("");
  const [contactVerificationCode, setContactVerificationCode] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [contactNumber, setContactNumber] = useState("09359335222");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isContactCodeSent, setIsContactCodeSent] = useState(false);

  // Email Verification
  const handleSendVerificationCode = () => {
    setIsCodeSent(true);
    Alert.alert("Verification Code Sent", "Check your email for the code.");
  };

  const handleVerifyCode = () => {
    if (verificationCode === "123321") {
      Alert.alert("Success", "Your email has been verified.");
    } else {
      Alert.alert("Error", "Invalid verification code.");
    }
  };

  // Contact Number Verification
  const handleSendContactVerificationCode = () => {
    setIsContactCodeSent(true);
    Alert.alert("Verification Code Sent", "Check your contact number for the code.");
  };

  const handleVerifyContactCode = () => {
    if (contactVerificationCode === "456654") {
      Alert.alert("Success", "Your contact number has been verified.");
    } else {
      Alert.alert("Error", "Invalid verification code for contact number.");
    }
  };

  // Document Handling
  const handleUploadDocumentToSupabase = async (file) => {
    try {
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        const base64FileData = base64data.split(',')[1];
  
        const arrayBuffer = decode(base64FileData);
  
        const { error } = await supabase
          .storage
          .from('documents')
          .upload(`${uuidv4()}${file.type === 'application/pdf' ? '.pdf' : '.docx'}`, arrayBuffer, {
            contentType: file.type,
          });
  
        if (error) {
          console.error('Error uploading document:', error);
          return null;
        }
  
        console.log('Document uploaded successfully');
      };
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };  

  const handleDeleteDocument = () => {
    setDocumentName("");
    Alert.alert("Document Deleted", "Your document has been removed.");
  };

  const handleConfirmDocument = () => {
    Alert.alert("Document Confirmed", "Your document has been confirmed.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Email Verification */}
      <Text style={styles.label}>Email Address (unverified)</Text>
      <TextInput
        style={[styles.underlineInput, styles.blackUnderline]} 
        value={email}
        onChangeText={setEmail} // Allow email editing
      />

      <TouchableOpacity onPress={handleSendVerificationCode}>
        <Text style={styles.linkText}>Verify email address here</Text>
      </TouchableOpacity>

      {/* Verification Code Input for Email */}
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

      {/* Contact Number */}
      <Text style={styles.label}>Contact Number (verified)</Text>
      <TextInput
        style={[styles.underlineInput, styles.blackUnderline]} 
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="numeric"
      />

      {/* Send Verification Code for Contact Number */}
      <TouchableOpacity onPress={handleSendContactVerificationCode}>
        <Text style={styles.linkText}>Verify contact number here</Text>
      </TouchableOpacity>

      {/* Verification Code Input for Contact Number */}
      {isContactCodeSent && (
        <>
          <TextInput
            style={[styles.underlineInput, styles.greenUnderline]} // Green underline for verification code
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

      {/* Document Upload */}
      <Text style={styles.sectionTitle}>Document (Optional)</Text>
      <Text style={styles.subLabel}>Document Name</Text>
      <TextInput
        style={[styles.underlineInput, styles.blackUnderline]} // Black underline for document name
        placeholder="Add Document Name"
        value={documentName}
        onChangeText={setDocumentName}
      />

      <TouchableOpacity style={styles.smallButton} onPress={handleUploadDocumentToSupabase}>
        <Text style={styles.buttonText}>Upload document</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.smallButton} onPress={handleDeleteDocument}>
        <Text style={styles.buttonText}>Delete document</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.smallButton} onPress={handleConfirmDocument}>
        <Text style={styles.buttonText}>Confirm document</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    fontSize: 24,
    color: "#4CAF50",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    color: "#777",
    marginTop: 10,
  },
  linkText: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 5,
  },
  underlineInput: {
    fontSize: 16,
    marginVertical: 10,
    paddingVertical: 5,
    paddingLeft: 10,
  },
  blackUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",  // Black underline
  },
  greenUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: "#4CAF50",  // Green underline
  },
  smallButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10, // Smaller padding for a smaller button
    paddingHorizontal: 20, // Smaller horizontal padding
    borderRadius: 8,
    marginVertical: 8,
    alignSelf: "center", // Center the button
    width: 'auto', 
    minWidth: 200, 
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14, 
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 14,
    color: "#777",
  },
});

export default VerificationScreen;
