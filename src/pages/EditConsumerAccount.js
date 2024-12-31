import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
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

const { width, height } = Dimensions.get('window');

const EditAccountScreen = () => {
    const { user } = useAuth();
    const userId = user?.id_user;
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [socialAccount, setSocialAccount] = useState('');
    const [isModifiedEmail, setIsModifiedEmail] = useState('');
    const [isModifiedContactNumber, setIsModifiedContactNumber] = useState('');
    const [isModifiedSocialAccount, setIsModifiedSocialAccount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { data: profile, refetch: refetchProfile } = useQuery({
            queryKey: ['profile', user?.id_user],
            queryFn: () => fetchProfileData(user.id_user),
            enabled: !!user,
            onSuccess: (profile) => {
            dispatch(setProfile(profile));
        },
    });

    useRealTimeUpdates(user?.id_user);

    useFocusEffect(
        React.useCallback(() => {
        
        refetchProfile();

        }, [])
    );
  
    const handleSaveChanges = async () => {
        if (!userId) {
            Alert.alert('Error', 'User ID is not available. Please log in.');
            return;
        }
    
        setIsLoading(true);
    
        try {
            let hasChanges = false;
    
            if (email !== profile?.email) {
                hasChanges = true;

                const { data: authData, error: authError } = await supabase.auth.updateUser({
                    email: email,
                });
    
                if (authError) {
                    console.error('Error updating email:', authError);
                    Alert.alert('Error', 'There was an error updating your email. Please try again.');
                    setIsLoading(false);
                    return;
                } else {
                    console.log('Email update triggered successfully:', authData);
                    Alert.alert(
                        'Email Updated',
                        'Your email has been updated. Please check your inbox to verify the new email address.'
                    );
                }
            }

            if (contactNumber !== profile?.phone_number || socialAccount !== profile?.social_account) {
                hasChanges = true;
    
                const { data, error } = await supabase
                    .from('users')
                    .update({
                        phone_number: contactNumber || profile?.phone_number,
                        social_account: socialAccount || profile?.social_account,
                    })
                    .eq('id_user', userId);
    
                if (error) {
                    console.error('Error updating profile:', error);
                    Alert.alert('Error', 'There was an error updating your profile. Please try again.');
                } else {
                    console.log('Profile updated successfully:', data);
                    Alert.alert('Success', 'Your profile has been updated successfully.');
                }
            }
    
            if (!hasChanges) {
                Alert.alert('No Changes Detected', 'There are no new changes to save.');
            }
        } catch (error) {
            console.error('Unexpected error during profile update:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
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

    const handleSocialAccountChange = (text) => {
        setSocialAccount(text);
        setIsModifiedSocialAccount(true);
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

                <Text style={styles.title}>Account Details</Text>
            </View>

            <View style={styles.core}>
                <Text style={styles.subTitle}>Email Address</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Add Email address'
                        value={isModifiedEmail ? email : profile?.email || ''}
                        onChangeText={handleEmailChange}
                    />
                    <View style={styles.line}/>
                </View>

                <Text style={styles.subTitle}>Contact Number</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Add Contact number'
                        value={isModifiedContactNumber ? contactNumber : formatPhoneNumberForDisplay(profile?.phone_number || '')}
                        onChangeText={handleContactNumberChange}
                    />
                    <View style={styles.line}/>
                </View>

                <Text style={styles.subTitle}>Social Media Account (optional)</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Add Social media account'
                        value={isModifiedSocialAccount ? socialAccount : profile?.social_account || ''}
                        onChangeText={handleSocialAccountChange}
                    />
                    <View style={styles.line}/>
                </View>
            </View>

            <View style={styles.wrapContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                {isLoading ? (
                    <ActivityIndicator size={24} color="white" />
                ) : (
                    <Text style={styles.buttonText}>Save changes</Text>
                )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: width * 0.05,
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    icon: {
        marginLeft: 10,
    },
    picker: {
        width: '100%',
        marginTop: 20,
    },
    line: {
        height: 1,
        backgroundColor: '#555',
    },
    subTitle: {
        marginTop: 10,
        fontSize: width * 0.04,
        fontFamily: 'medium',
    },
    core: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    buttonText: { 
        color: '#fff', 
        fontSize: width * 0.035,
        fontFamily: 'medium', 
        textAlign: 'center',
    },
    inputContainer: {
        justifyContent: 'center',
        position: 'relative',
    },
    wrapperPassword: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,
        top: 10,
    },
    input: {
        borderRadius: 8,
        padding: width * 0.03,
        fontSize: 14,
        fontFamily: 'regular',
        color: '#444',
    },
    wrapContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        width: '48%',
        padding: 10,
        borderRadius: 20,
        marginTop: 20,
    },
});

export default EditAccountScreen;
