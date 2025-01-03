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
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import CustomAlert from '../support/CustomAlert';

const { width, height } = Dimensions.get('window');

const EditProfileScreen = () => {
    const { user } = useAuth();
    const userId = user?.id_user;
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [Age, setAge] = useState('');
    const [birthday, setBirthday] = useState(new Date());
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [isModifiedFirstName, setIsModifiedFirstName] = useState('');
    const [isModifiedLastName, setIsModifiedLastName] = useState('');
    const [isModifiedMiddleName, setIsModifiedMiddleName] = useState('');
    const [isModifiedSuffix, setIsModifiedSuffix] = useState('');
    const [isModifiedAge, setIsModifiedAge] = useState('');
    const [isModifiedGender, setIsModifiedGender] = useState('');
    const [isModifiedAddress, setIsModifiedAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showGenderOptions, setShowGenderOptions] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const showAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const { data: profile, refetch: refetchProfile } = useQuery({
            queryKey: ['profile', user?.id_user],
            queryFn: () => fetchProfileData(user.id_user),
            enabled: !!user,
            onSuccess: (profile) => {
            dispatch(setProfile(profile));
        },
    });

    useRealTimeUpdates(user?.id_user);

    useEffect(() => {
        if (profile?.birth_year && profile?.birth_month && profile?.birth_day) {
            const initialBirthday = new Date(
                `${profile.birth_year}-${moment().month(profile.birth_month).format('M')}-${profile.birth_day}`
            );
            setBirthday(initialBirthday);
        }
    }, [profile]);

    useFocusEffect(
        React.useCallback(() => {
        
        refetchProfile();

        }, [])
    );
  
    const handleSaveChanges = async () => {
        setIsLoading(true);
        
        try {
            let hasChanges = false;

            if (firstName !== profile?.first_name) {
                hasChanges = true;
            }

            if (lastName !== profile?.last_name) {
                hasChanges = true;
            }

            if (middleName !== profile?.middle_name) {
                hasChanges = true;
            }

            if (suffix !== profile?.suffix) {
                hasChanges = true;
            }

            if (Age !== profile?.age) {
                hasChanges = true;
            }

            if (gender !== profile?.gender) {
                hasChanges = true;
            }

            if (address !== profile?.address) {
                hasChanges = true;
            }

            const formattedBirthday = moment(birthday).format('YYYY-MM-DD');
            const currentBirthday = moment(`${profile?.birth_year}-${moment().month(profile?.birth_month).format('M')}-${profile?.birth_day}`).format('YYYY-MM-DD');
            if (formattedBirthday !== currentBirthday) {
                hasChanges = true;
            }

            if (!hasChanges) {
                showAlert('No changes detected', 'There are no new changes to save.');
                return;
            }

            const { data, error } = await supabase
                .from('users') 
                .update({
                    first_name: firstName || profile?.first_name,
                    last_name: lastName || profile?.last_name,
                    middle_name: middleName || profile?.middle_name,
                    suffix: suffix || profile?.suffix,
                    age: Age || profile?.age,
                    gender: gender || profile?.gender,
                    address: address || profile?.address,
                    birth_year: moment(birthday).year(), 
                    birth_month: moment(birthday).format('MMMM'),
                    birth_day: moment(birthday).date() 
                })
                .eq('id_user', userId); 
        
            if (error) {
                console.error('Error updating profile:', error);
                showAlert('Error', 'There was an error updating your profile. Please try again.');
            } else {
                showAlert('Success', 'Profile updated successfully');
            }
        } catch (error) {
            console.error('Unexpected error during profile update:', error);
            showAlert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || birthday;
        setShowDatePicker(false);
        setBirthday(currentDate);
    };

    const toggleGenderOptions = () => {
        setShowGenderOptions(!showGenderOptions);
        setShowDatePicker(false); 
    };

    const handleGenderSelect = (selectedGender) => {
        setGender(selectedGender);
        setShowGenderOptions(false);
        setIsModifiedGender(true);
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
        setShowGenderOptions(false);
    };

    const showGenderpicker = () => {
        setShowGenderPicker(true);
    };


    const handleFirstNameChange = (text) => {
        setFirstName(text);
        setIsModifiedFirstName(true);
    };

    const handleLastNameChange = (text) => {
        setLastName(text);
        setIsModifiedLastName(true);
    };

    const handleMiddleNameChange = (text) => {
        setMiddleName(text);
        setIsModifiedMiddleName(true);
    };

    const handleSuffixChange = (text) => {
        setSuffix(text);
        setIsModifiedSuffix(true);
    };

    const handleAgeChange = (text) => {
        setAge(text);
        setIsModifiedAge(true);
    };

    const handleAddressChange = (text) => {
        setAddress(text);
        setIsModifiedAddress(true);
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

                <Text style={styles.title}>Basic Information</Text>
            </View>

            <View style={styles.core}>
                <Text style={styles.subTitle}>First Name</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Add first name'
                        value={isModifiedFirstName ? firstName : profile?.first_name || ''}
                        onChangeText={handleFirstNameChange}
                    />
                    <View style={styles.line}/>
                </View>

                <Text style={styles.subTitle}>Last Name</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Add Last name'
                        value={isModifiedLastName ? lastName : profile?.last_name || ''}
                        onChangeText={handleLastNameChange}
                    />
                    <View style={styles.line}/>
                </View>

                <Text style={styles.subTitle}>Middle Name</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Add Middle name'
                        value={isModifiedMiddleName ? middleName : profile?.middle_name || ''}
                        onChangeText={handleMiddleNameChange}
                    />
                    <View style={styles.line}/>
                </View>

                <Text style={styles.subTitle}>Suffix</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Add Suffix (optional)'
                        value={isModifiedSuffix ? suffix : profile?.suffix || ''}
                        onChangeText={handleSuffixChange}
                    />
                    <View style={styles.line}/>
                </View>

                <Text style={styles.subTitle}>Age</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Add Age'
                        keyboardType="numeric"
                        value={isModifiedAge ? Age : profile?.age ? profile.age.toString() : ''}
                        onChangeText={handleAgeChange}
                    />
                    <View style={styles.line}/>
                </View>

                <Text style={styles.subTitle}>Gender</Text>
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.input} onPress={toggleGenderOptions}>
                        <View style={styles.row}>
                            <Text style={styles.inputText}>
                                {gender || profile?.gender || 'Select Gender'}
                            </Text>
                            <Ionicons name={showGenderOptions ? "chevron-up" : "chevron-down"} size={24} color="black" style={styles.icon} />
                        </View>
                    </TouchableOpacity>
                    {showGenderOptions && (
                        <View style={styles.genderOptions}>
                            <TouchableOpacity onPress={() => handleGenderSelect('male')}>
                                <Text style={styles.genderOptionText}>Male</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleGenderSelect('female')}>
                                <Text style={styles.genderOptionText}>Female</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.line}/>
                </View>

                <Text style={styles.subTitle}>Birthday</Text>
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.input} onPress={showDatepicker}>
                        <View style={styles.row}>
                            <Text style={styles.inputText}>
                                {birthday ? moment(birthday).format('MMMM DD, YYYY') : 'Select Birthday'}
                            </Text>
                            <Ionicons name="calendar" size={24} color="black" style={styles.icon} />
                        </View>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={birthday}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}
                    <View style={styles.line} />
                </View>

                <Text style={styles.subTitle}>Address</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder='Add Address'
                        value={isModifiedAddress ? address : profile?.address || ''}
                        onChangeText={handleAddressChange}
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
        flexGrow006: 1,
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
        padding: 20,
    },
    subExperienceTitle: {
        marginTop: 20,
        fontSize: 12,
        fontFamily: 'regular',
    },
    profileSection: {
        alignItems: 'center', 
        marginVertical: height * 0.02,
    },
    coverSection: { 
        alignItems: 'center',
        marginBottom: 10, 
        position: 'relative',
    },
    profileImage: {
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: width * 0.2,
        marginBottom: height * 0.02,
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    coverImage: { 
        width: '100%', 
        height: height * 0.2, 
        marginTop: 10,
        marginBottom: 20, 
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    warningText: {
        fontFamily: 'regular',
        fontSize: 12,
        position: 'absolute',
        top: 10,
    },
    uploadButton: {
        backgroundColor: '#4CAF50',
        padding: height * 0.015,
        borderRadius: 20,
    },
    buttonText: { 
        color: '#fff', 
        fontSize: width * 0.035,
        fontFamily: 'medium', 
        textAlign: 'center',
    },
    inputContainer: {
        position: 'relative',
    },
    inputExperienceContainer: {
        height: 100,
        position: 'relative',
    },
    input: {
        borderRadius: 8,
        padding: width * 0.03,
        fontSize: 14,
        fontFamily: 'regular',
        color: '#444',
    },
    characterCount: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        fontFamily: 'regular', 
        color: 'gray',
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
    buttonRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        padding: 20,
        marginBottom: 20,
    },
    editButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 20,
        width: '48%',
        alignItems: 'center',
    },
    genderOptions: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        position: 'absolute',
        top: '100%', 
        left: 0,
        right: 0, 
        zIndex: 1, 
    },
    genderOptionText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'regular',
        color: '#000',
        paddingVertical: 10, 
    },
    inputText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'regular',
        color: '#000',
    },
});

export default EditProfileScreen;
