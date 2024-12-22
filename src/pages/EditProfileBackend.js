import React, { useState } from 'react';
import {View, Text, Image, StyleSheet, TextInput, TouchableOpacity, ScrollView,} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Install via npm install expo-image-picker
import { supabase } from '../backend/supabaseClient';

const EditProfileScreen = () => {
  const [profilePic, setProfilePic] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [bio, setBio] = useState('');

  // Function to pick an image from the gallery
  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (type === 'profile') {
        setProfilePic(result.uri);
      } else {
        setCoverPhoto(result.uri);
      }
    }
  };

  // Function to save data to Supabase
  const saveData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            profile_pic_url: profilePic,
            cover_photo_url: coverPhoto,
            bio: bio,
          },
        ]);

      if (error) {
        alert('Error saving data: ' + error.message);
      } else {
        alert('Data saved successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Picture Section */}
      <View style={styles.imageSection}>
        <Image
          source={profilePic ? { uri: profilePic } : require('../../assets/images/profilepic.jpg')}
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage('profile')}
        >
          <Text style={styles.buttonText}>Upload new profile photo</Text>
        </TouchableOpacity>
      </View>

      {/* Cover Photo Section */}
      <Text style={styles.sectionTitle}>Cover Photo</Text>
      <View style={styles.imageSection}>
        <Image
          source={coverPhoto ? { uri: coverPhoto } : require('../../assets/images/coverphoto.jpg')}
          style={styles.coverImage}
        />
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage('cover')}
        >
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

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveData}>
        <Text style={styles.saveButtonText}>Save changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  sectionTitle: { fontSize: 18, color: '#444', marginBottom: 10 },
  imageSection: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  coverImage: { width: '100%', height: 120, marginBottom: 10, borderRadius: 8 },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: { color: '#fff', fontSize: 14 },
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
  saveButtonText: { color: '#fff', fontSize: 16 },
});

export default EditProfileScreen;
