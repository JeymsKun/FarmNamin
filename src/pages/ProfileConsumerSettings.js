import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { fetchProfileData } from '../utils/api';
import { setProfile } from '../store/profileSlice';
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';
import { supabase } from '../backend/supabaseClient';
import CustomAlert from '../support/CustomAlert';

const EditProfileScreen = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const currentYear = new Date().getFullYear();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id_user],
    queryFn: () => fetchProfileData(user.id_user),
    enabled: !!user?.id_user,
    onSuccess: (data) => dispatch(setProfile(data)),
  });

  useRealTimeUpdates(user?.id_user);

  const DEFAULT_PROFILE_IMAGE = require('../../assets/main/default_profile_photo.png');

  useFocusEffect(
    React.useCallback(() => {
      
      refetchProfile();

    }, [])
  );

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const fullName = `${(profile?.first_name || '').trim()} ${(profile?.middle_name || '').trim()} ${(profile?.last_name || '').trim()} ${profile?.suffix || ''}`;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      showAlert('Error', 'Failed to log out. Please try again.');
    } else {
      showAlert('Success', 'You have been logged out.');
      
      setTimeout(() => {
        navigation.navigate('LogIn', { role: user?.role});
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={35} color="#34A853" />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Image
          source={profile?.profile_pic ? { uri: profile.profile_pic } : DEFAULT_PROFILE_IMAGE}
          style={styles.profileImage}
          resizeMode="cover" 
        />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {fullName}
          </Text>
        </View>
      </View>

      <View style={styles.mainSettingsContainer}>

        <TouchableOpacity style={styles.wrapIcons} onPress={() => navigation.navigate('EditConsumerProfile')}>
          <Image 
            source={require('../../assets/icons/edit_profile.png')} 
            style={styles.icon}
          />
          <Text style={styles.allText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.wrapIcons} onPress={() => navigation.navigate('VerificationConsumer')}>
          <Image 
            source={require('../../assets/icons/verification.png')} 
            style={styles.icon}
          />
          <Text style={styles.allText}>Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.wrapIcons} onPress={handleLogout}>
          <Image 
            source={require('../../assets/icons/logout.png')} 
            style={styles.icon}
          />
          <Text style={styles.allText}>Log Out</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.blackSeparator} />

      <View style={styles.moreContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.textMore}>Terms and Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.textMore}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('AboutUs')}>
          <Text style={styles.textMore}>About Us</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.copyright}>
            © {currentYear} Transfarmers. All rights reserved.
        </Text>
        <Text style={styles.version}>
            FarmNamin Version 1.0.3
        </Text>
      </View>

      <CustomAlert 
        visible={alertVisible} 
        title={alertTitle} 
        message={alertMessage} 
        onClose={() => setAlertVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 20,
  },
  mainSettingsContainer: {
    padding: 10,
    marginTop: 20,
  },
  wrapIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 5,
  },
  allText: {
    fontSize: 15,
    fontFamily: 'medium',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 30, 
  },
  blackSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "#000", 
  },
  moreContainer: {
    padding: 10,
  },
  textMore: {
    fontSize: 15,
    fontFamily: 'medium',
    marginTop: 10,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 14,
    color: '#555',
  },
  version: {
    fontSize: 12,
    color: '#888', 
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20, 
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#34A853",
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontFamily: "medium",
    color: "#34A853",
  },
});

export default EditProfileScreen;