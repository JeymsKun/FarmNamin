import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { fetchProfileData } from '../utils/api';
import { setProfile } from '../store/profileSlice';
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';

const EditProfileScreen = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [bio, setBio] = useState('Hard-working farmer.');
  const [experience, setExperience] = useState('10 years');

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id_user],
    queryFn: () => fetchProfileData(user.id_user),
    enabled: !!user,
    onSuccess: (data) => dispatch(setProfile(data)),
  });

  useRealTimeUpdates(user?.id_user);

  useFocusEffect(
    React.useCallback(() => {
      
      refetchProfile();

    }, [])
  );

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={35} color="#34A853" />
        </TouchableOpacity>

        <Text style={styles.title}>Edit Profile</Text>
      </View>


      {/* Profile Picture Section */}
      <View style={styles.imageSection}>
        <Image source={require('../../assets/images/profilepic.jpg')} style={styles.profileImage} />
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.buttonText}>Upload new profile photo</Text>
        </TouchableOpacity>
      </View>

      {/* Cover Photo Section */}
      <Text style={styles.sectionTitle}>Cover Photo</Text>
      <View style={styles.imageSection}>
        <Image source={require('../../assets/images/coverphoto.jpg')} style={styles.coverImage} />
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.buttonText}>Upload new cover photo</Text>
        </TouchableOpacity>
      </View>

      {/* Bio Input */}
      <Text style={styles.sectionTitle}>Bio</Text>
      <TextInput
        style={styles.input}
        multiline
        value={bio}
        onChangeText={setBio}
        maxLength={100}
      />

      {/* Experience Input */}
      <Text style={styles.sectionTitle}>Months/Years of Farming Experience</Text>
      <TextInput
        style={styles.input}
        value={experience}
        onChangeText={setExperience}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={() => alert('Changes Saved!')}>
        <Text style={styles.saveButtonText}>Save changes</Text>
      </TouchableOpacity>

      {/* Additional Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.basicButton}>
          <Text style={styles.buttonText}>Edit basic info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.basicButton}>
          <Text style={styles.buttonText}>Edit account details</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 20 
  },
  header: {
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  title: {
    fontSize: 16,
    fontFamily: 'medium',
    textAlign: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '', color: '#444', marginBottom: 10 },
  imageSection: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  coverImage: { width: '100%', height: 120, marginBottom: 10, borderRadius: 8 },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 20,
    color: '#444',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  basicButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
});

export default EditProfileScreen;
