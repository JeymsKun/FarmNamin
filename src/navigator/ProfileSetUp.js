import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const ProfileSetUp = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    age: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    gender: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    if (field === 'birthMonth' || field === 'birthDay' || field === 'birthYear') {
      const { birthMonth, birthDay, birthYear } = { ...formData, [field]: value };
      if (birthMonth && birthDay && birthYear) {
        setErrors((prevErrors) => ({ ...prevErrors, birthDate: false }));
      }
    } else {
      setErrors({ ...errors, [field]: false });
    }
  };

  const handleSubmit = () => {
    let newErrors = {};

    if (!formData.firstName) newErrors.firstName = true;
    if (!formData.lastName) newErrors.lastName = true;
    if (!formData.middleName) newErrors.middleName = true;
    if (!formData.age) newErrors.age = true;
    if (!formData.birthMonth || !formData.birthDay || !formData.birthYear) newErrors.birthDate = true;
    if (!formData.gender) newErrors.gender = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      navigation.replace('HomeTabs'); 
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.scrollContent}>
          <Text style={styles.title}>Basic Information</Text>
          <Text style={styles.subtitle}>Please fill in your profile information.</Text>

          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(text) => handleInputChange('firstName', text)}
          />
          {errors.firstName && <Text style={styles.errorText}>* First name is required</Text>}

          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(text) => handleInputChange('lastName', text)}
          />
          {errors.lastName && <Text style={styles.errorText}>* Last name is required</Text>}

          <TextInput
            style={[styles.input, errors.middleName && styles.inputError]}
            placeholder="Middle Name"
            value={formData.middleName}
            onChangeText={(text) => handleInputChange('middleName', text)}
          />
          {errors.middleName && <Text style={styles.errorText}>* Middle name is required</Text>}

          <TextInput
            style={styles.input}
            placeholder="Suffix (Sr, Jr, etc)"
            value={formData.suffix}
            onChangeText={(text) => handleInputChange('suffix', text)}
          />

          <TextInput
            style={[styles.input, errors.age && styles.inputError]}
            placeholder="Age"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(text) => handleInputChange('age', text)}
          />
          {errors.age && <Text style={styles.errorText}>* Age is required</Text>}

          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={formData.birthMonth}
              style={[styles.picker, errors.birthDate && styles.inputError]}
              onValueChange={(itemValue) => handleInputChange('birthMonth', itemValue)}
            >
              <Picker.Item label="MM" value="" />
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                <Picker.Item key={index} label={month} value={month} />
              ))}
            </Picker>

            <Picker
              selectedValue={formData.birthDay}
              style={[styles.picker, errors.birthDate && styles.inputError]}
              onValueChange={(itemValue) => handleInputChange('birthDay', itemValue)}
            >
              <Picker.Item label="DD" value="" />
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <Picker.Item key={day} label={String(day)} value={String(day)} />
              ))}
            </Picker>

            <Picker
              selectedValue={formData.birthYear}
              style={[styles.picker, errors.birthDate && styles.inputError]}
              onValueChange={(itemValue) => handleInputChange('birthYear', itemValue)}
            >
              <Picker.Item label="YY" value="" />
              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <Picker.Item key={year} label={String(year)} value={String(year)} />
              ))}
            </Picker>
          </View>
          {errors.birthDate && <Text style={styles.errorText}>* Complete your birth date</Text>}

          <Picker
            selectedValue={formData.gender}
            style={[styles.picker, errors.gender && styles.inputError]}
            onValueChange={(itemValue) => handleInputChange('gender', itemValue)}
          >
            <Picker.Item label="Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
          {errors.gender && <Text style={styles.errorText}>* Gender selection is required</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Proceed →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 21,
    paddingTop: 80,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 18,
    marginBottom: 18,
    backgroundColor: '#80CF7E',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 12,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  picker: {
    flex: 1,
    height: 50,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#80CF7E',
    padding: 30,
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
});

export default ProfileSetUp;