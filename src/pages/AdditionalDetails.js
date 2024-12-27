import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import CustomAlert from '../support/CustomAlert';

const { width, height } = Dimensions.get('window');

const AdditionalDetailsScreen = ({ route, navigation }) => {
  const [selectedOptions, setSelectedOptions] = useState(route.params.selectedOptions || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const options = [
    'Freshness Duration', 'Maximum Duration', 'Date & Time Harvest', 'Harvest Method', 
    'Soil Type', 'Water Source', 'Irrigation Method', 'Crop Rotation Practice', 
    'Use of Fertilizers', 'Pest Control Measures', 'Presence of GMOs', 'Organic Certification', 
    'Storage Conditions', 'Ideal Storage Temperature', 'Packaging Type', 'Community Support Projects', 
    'Cooking Recommendations', 'Best Consumption Period', 'Special Handling Instructions', 
    'Farm History', 'Use of Indigenous Knowledge', 'Use of Technology in Farming'
  ];

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (option) => {
    const updatedOptions = selectedOptions.includes(option) 
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];

    setSelectedOptions(updatedOptions);
  };

  const showInfo = (option) => {
    let message = '';
  
    switch (option) {
      case 'Freshness Duration':
        message = 'Indicate how long the product stays fresh.\n\nSample: 2 days.';
        break;
      case 'Maximum Duration':
        message = 'The maximum time the product remains consumable.\n\nSample: 3 days.';
        break;
      case 'Date & Time Harvest':
        message = 'Provide the specific date and time the product was harvested.\n\nSample: August 25, 2024, 8:00 A.M.';
        break;
      case 'Harvest Method':
        message = 'How the produce was harvested.\n\nSample: Hand-picked.';
        break;
      case 'Soil Type':
        message = 'Type of soil used for cultivation.\n\nSample: Rich loamy soil.';
        break;
      case 'Water Source':
        message = 'Source of water used for irrigation.\n\nSample: Rainwater.';
        break;
      case 'Irrigation Method':
        message = 'Method used for watering crops.\n\nSample: Drip irrigation system.';
        break;
      case 'Crop Rotation Practice':
        message = 'Description of crop rotation to improve soil health.\n\nSample: Planted with beans to improve soil.';
        break;
      case 'Use of Fertilizers':
        message = 'Types of fertilizers used.\n\nSample: Planted with beans to improve soil.';
        break;
      case 'Pest Control Measures':
        message = 'Methods used to manage pests.\n\nSample: Using natural predators.';
        break;
      case 'Presence of GMOs':
        message = 'Whether the produce is genetically modified.\n\nSample: Guaranteed non-GMO produce.';
        break;
      case 'Organic Certification':
        message = 'Certification status for organic produce.\n\nSample: Certified Organic by OCCP.';
        break;
      default:
        message = 'No additional information available.';
    }
  
    setAlertTitle(option);
    setAlertMessage(message);
    setAlertVisible(true);
  };
  

  const handleSearch = () => {
    setLoading(true);
    setNoResults(false);
    setNoResultsMessage('');

    if (searchQuery.trim() === '') {
      setNoResultsMessage('No results found');
      setNoResults(true);
      setTimeout(() => {
        setNoResults(false);
      }, 2000);
    } else {
      setTimeout(() => {
        if (filteredOptions.length === 0) {
          setNoResultsMessage(`No results found for "${searchQuery}"`);
          setNoResults(true);
        }
        setLoading(false);

        setTimeout(() => {
          setNoResults(false);
        }, 2000);
      }, 2000);
    }
  };

  const handleBack = () => {
    navigation.navigate('ProductPost', { additionalDetails: selectedOptions });
  };

  // useEffect(() => {
  //   const backAction = () => {
  //     handleBack();
  //     return true; 
  //   };

  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

  //   return () => backHandler.remove(); 
  // }, [selectedOptions]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        {/* Header with Back Button and Centered Title */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={30} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Additional Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search if you can’t find what you need."
            placeholderTextColor="white"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={30} color="#4CAF50" />
          </View>
        )}

        {/* No Results Found Message */}
        {noResults && !loading && (
          <Text style={styles.noResultsText}>{noResultsMessage}</Text>
        )}

        {/* Options List */}
        {!loading && !noResults && filteredOptions.map((option) => (
          <View key={option} style={styles.optionContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.optionText}>{option}</Text>
              <TouchableOpacity onPress={() => showInfo(option)}>
                <AntDesign name="questioncircleo" size={12} color="white" style={styles.iconSpacing} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => toggleOption(option)} style={styles.checkbox}>
              {selectedOptions.includes(option) ? (
                <MaterialIcons name="check-box" size={24} color="#fff" />
              ) : (
                <MaterialIcons name="check-box-outline-blank" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

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
    backgroundColor: '#fff',
  },
  scrollContentContainer: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  backButton: {
    marginRight: width * 0.03,
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontFamily: 'bold',
    color: 'black',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 30, 
  },
  searchBarContainer: {
    position: 'relative',
    marginBottom: height * 0.03,
  },
  searchBar: {
    backgroundColor: '#4CAF50',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: 15,
    fontSize: width * 0.035,
    color: 'white',
    paddingRight: 50,
    height: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    fontFamily: 'medium',
  },
  searchButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: height * 0.01,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * 0.015,
    marginBottom: height * 0.02,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontFamily: 'medium',
    fontSize: width * 0.035,
    color: 'white',
    marginRight: 2,
  },
  iconSpacing: {
    padding: 5,
  },
  checkbox: {
    alignSelf: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: width * 0.04,
    color: '#58675A',
    marginVertical: 20,
    fontFamily: 'medium',
  },
});

export default AdditionalDetailsScreen;
