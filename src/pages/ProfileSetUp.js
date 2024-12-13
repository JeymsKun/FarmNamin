import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Button, Dimensions, StatusBar, BackHandler } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../backend/supabaseClient';

const { width, height } = Dimensions.get('window');

const ProfileSetUp = ({ navigation, route }) => {
  const { userId, role } = route.params;
  const [FirstName, setFirstName] = useState('');
  const [LastName, setLastName] = useState('');
  const [MiddleName, setMiddleName] = useState('');
  const [Suffix, setSuffix] = useState('');
  const [Age, setAge] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [date, setDate] = useState(new Date());
  const [genderType, setGenderType] = useState('');
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [middleNameFocused, setMiddleNameFocused] = useState(false);
  const [ageFocused, setAgeFocused] = useState(false);
  const [isDateCanceled, setIsDateCanceled] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); 
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const closeModal = () => {
    setModalVisible(false);
  };

  const changeColor = (value) => (value ? 'black' : '#58675A');

  const isValidName = (name) => /^[a-zA-Z\s]*$/.test(name);

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setIsDateCanceled(true); 
      setShowPicker(false);
      setBirthMonth('');
      setBirthDay('');
      setBirthYear('');
      return;
    }

    const currentDate = selectedDate || date;
    setShowPicker(false);
    setDate(currentDate);

    const month = currentDate.toLocaleString('default', { month: 'long' });
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();

    setBirthMonth(month);
    setBirthDay(day.toString()); 
    setBirthYear(year.toString()); 
  };

  const handleInformationSubmit = async () => {
    setLoading(true);

    console.log("Submitting Information:");
    console.log("First Name:", FirstName);
    console.log("Last Name:", LastName);
    console.log("Middle Name:", MiddleName);
    console.log("Suffix:", Suffix);
    console.log("Age:", Age);
    console.log("Gender:", genderType);
    console.log("Birth Month:", birthMonth);
    console.log("Birth Day:", birthDay);
    console.log("Birth Year:", birthYear);
    console.log("User  ID:", userId);

    if (!FirstName || !LastName || !genderType) {
      setModalMessage('Please fill in all required fields.');
      setModalType('error');
      setModalVisible(true);
      setLoading(false);
      return;
    }

    const parsedBirthDay = parseInt(birthDay, 10);
    const parsedBirthYear = parseInt(birthYear, 10);

    if (isNaN(parsedBirthDay) || isNaN(parsedBirthYear)) {
      setModalMessage('Birth day and year must be valid numbers.');
      setModalType('error');
      setModalVisible(true);
      setLoading(false);
      return;
    }

    const userData = {
      first_name: FirstName,
      last_name: LastName,
      middle_name: MiddleName,
      suffix: Suffix,
      age: Age,
      gender: genderType,
      birth_month: birthMonth,
      birth_day: parsedBirthDay, 
      birth_year: parsedBirthYear,
      isInfoComplete: true,
    };

    console.log("User  Data to Submit:", userData);

    try {
      const { data, error } = await supabase
        .from('users') 
        .update(userData)
        .eq('id_user', userId);

      if (error) throw error;

      setModalMessage('Your information has been successfully updated!');
      setModalType('success');
      setModalVisible(true);

      setTimeout(() => {
        navigation.navigate('IntroScreen', { role, name: FirstName });
      }, 2000);
    } catch (error) {
      console.log(`Error: ${error.message}`);
      setModalMessage(`Error: ${error.message}`);
      setModalType('Error');
      setModalVisible(true);
    } finally {
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
      <StatusBar hidden={false} />
      <View style={styles.container}>
        <Text style={styles.title}>Basic Information</Text>
        <Text style={styles.subtitle}>Please fill in your profile information.</Text>

        <Text style={styles.name}>First Name</Text>
        <View style={[styles.inputContainer, (firstNameFocused && (!isValidName(FirstName) || FirstName.length === 0)) && styles.errorBorder]}>
          <TextInput
            style={styles.text}
            placeholder="Add First Name"
            value={FirstName}
            onChangeText={setFirstName}
            onFocus={() => setFirstNameFocused(false)}
            onBlur={() => setFirstNameFocused(true)}
          />
          {firstNameFocused && FirstName.length === 0 && (
            <Text style={styles.errorText}>* First name is required.</Text>
          )}
          {firstNameFocused && !isValidName(FirstName) && (
            <Text style={styles.errorText}>* No numbers or special characters allowed.</Text>
          )}
        </View>

        <Text style={styles.name}>Last Name</Text>
        <View style={[styles.inputContainer, (lastNameFocused && (!isValidName(LastName) || LastName.length === 0)) && styles.errorBorder]}>
          <TextInput
            style={styles.text}
            placeholder="Add Last Name"
            value={LastName}
            onChangeText={setLastName}
            onFocus={() => setLastNameFocused(false)}
            onBlur={() => setLastNameFocused(true)}
          />
          {lastNameFocused && LastName.length === 0 && (
            <Text style={styles.errorText}>* Last name is required.</Text>
          )}
          {lastNameFocused && !isValidName(LastName) && (
            <Text style={styles.errorText}>* No numbers or special characters allowed.</Text>
          )}
        </View>

        <Text style={styles.name}>Middle Name</Text>
        <View style={[styles.inputContainer, (middleNameFocused && (!isValidName(MiddleName) || MiddleName.length === 0)) && styles.errorBorder]}>
          <TextInput
            style={styles.text}
            placeholder="Add Middle Name"
            value={MiddleName}
            onChangeText={setMiddleName}
            onFocus={() => setMiddleNameFocused(false)}
            onBlur={() => setMiddleNameFocused(true)}
          />
          {middleNameFocused && MiddleName.length === 0 && (
            <Text style={styles.errorText}>* Middle name is required</Text>
          )}
          {middleNameFocused && !isValidName(MiddleName) && (
            <Text style={styles.errorText}>* No numbers or special characters allowed.</Text>
          )}
        </View>

        <Text style={styles.name}>Suffix</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.text}
            placeholder="Add Suffix (Sr, Jr, PhD, etc) (optional)"
            value={Suffix}
            onChangeText={setSuffix}
          />
        </View>

        <Text style={styles.name}>Age</Text>
        <View style={[styles.inputContainer, ageFocused && Age.length === 0  && styles.errorBorder]}>
          <TextInput
            style={styles.text}
            placeholder="Add Age"
            value={Age}
            onChangeText={setAge}
            keyboardType="numeric"
            onFocus={() => setAgeFocused(false)}
            onBlur={() => setAgeFocused(true)} 
          />
          {ageFocused && Age.length === 0 && (
            <Text style={styles.errorText}>* Age is required.</Text>
          )}
        </View>

        <Text style={styles.name}>Please fill in a complete birthday</Text>
        <View style={styles.birthdateContainer}>

          <TouchableOpacity 
            onPress={() => setShowPicker(true)} 
            style={[styles.pickerSection, birthDay.length === 0 && isDateCanceled && styles.errorBorder]}>
            <Text style={[styles.birthdateText, { color: changeColor(birthMonth)}]}>{birthMonth || 'Month'}</Text>
            {!birthMonth && (<Ionicons name="calendar-outline" size={18} color="#58675A" style={styles.iconCalendar}/>)}
          </TouchableOpacity>

          <View style={[styles.pickerSection, birthDay.length === 0 && isDateCanceled && styles.errorBorder]}>
              <Text style={[styles.birthdateText, { color: changeColor(birthDay)}]}>{birthDay || 'Day'}</Text>
          </View>

          <View style={[styles.pickerSection, birthYear.length === 0 && isDateCanceled && styles.errorBorder]}>
              <Text style={[styles.birthdateText, { color: changeColor(birthYear)}]}>{birthYear || 'Year'}</Text>
          </View>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        
        <Text style={styles.name}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={genderType}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            onValueChange={(itemValue) => {
              setGenderType(itemValue);
            }}
          >
            <Picker.Item label="Add Gender" value="" color="#58675A" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
          </Picker>
        </View>
        {errors.gender && <Text style={styles.errorText}>* Gender selection is required</Text>}

        <View style={styles.footerButtons}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.proceedButton} onPress={handleInformationSubmit}>
              <Text style={styles.proceedText}>Proceed</Text>
              <Feather name="arrow-right" size={30} color="#28B805" />
          </TouchableOpacity>
        </View>

        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { borderColor: modalType === 'success' ? 'green' : 'red' }]}>
              <Text style={[styles.modalMessage, { color: modalType === 'success' ? 'green' : 'red' }]}>
                {modalMessage}
              </Text>
              <Button title="Close" onPress={closeModal} />
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: width * 0.05,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginTop: height * 0.02,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: height * 0.02,
    fontFamily: 'Poppins-Medium',
    color: '#555',
  },
  name: {
    marginTop: height * 0.01,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  inputContainer: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#80CF7E',
    height: height * 0.07,
    marginBottom: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  errorText: {
    color: 'red',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    position: 'absolute', 
    bottom: -18, 
    left: 10, 
  },
  text: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: '#F44336',
  },
  birthdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCalendar: {
    margin: 5,
  },
  birthdateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  pickerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
    height: 45,
    backgroundColor: '#80CF7E',
    borderRadius: 10,
    padding: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#80CF7E',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  pickerItem: { 
    fontSize: 14,
    fontFamily: 'Poppins-Regular',  
  },
  picker: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    paddingVertical: 30,
    paddingHorizontal: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#00B200',
    fontSize: 16,
    fontWeight: 'bold',
  },
  proceedButton: {
    flexDirection: 'row',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  proceedText: {
    padding: 5,
    fontSize: 14,
    color: "#28B805",  
    fontFamily: 'Poppins-Bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 16,
  },
});

export default ProfileSetUp;