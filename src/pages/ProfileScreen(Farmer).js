import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native'; // Added Dimensions import
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window'); // Destructure width from Dimensions

const productsData = [
  { id: 1, image: require('../assets/images/santol.jpg'), name: 'Santol per kilo na lang', price: '₱10.00' },
  { id: 2, image: require('../assets/images/eggplant.jpg'), name: 'Dako nga Talong per kilo', price: '₱15.00' },
];

const ProfileScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image source={require('../assets/images/coverphoto.jpg')} style={styles.backgroundImage} />
        <TouchableOpacity
          style={styles.threeDotButton}
          onPress={() => navigation.navigate('ProfileMenu')} // Navigate to ProfileMenu
        >
          <Text style={styles.threeDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageWrapper}>
          <Image source={require('../assets/images/profilepic.jpg')} style={styles.profileImage} />
          <Image source={require('../assets/images/verified.png')} style={styles.verifiedIcon} />
        </View>
        <Text style={styles.name}>James David Maceren</Text>
        <Text style={styles.contact}>09363932622</Text>
      </View>

      {/* Feedback Section */}
      <View style={styles.feedbackContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Feedback')}>
          <Text style={styles.feedbackTitle}>Your Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Bookmarks Section */}
      <View style={styles.productsContainer}>
        <Text style={styles.bookmarksTitle}>Your Bookmarks</Text>
        <View style={styles.productsRow}>
          {productsData.map((product) => (
            <View key={product.id} style={styles.productItem}>
              <Text style={styles.productDate}>Date you bookmarked: 10/11/24</Text>
              <Image source={product.image} style={styles.productImage} />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  threeDotButton: {
    position: 'absolute',
    top: 30,
    right: 10,
    padding: 5,
    borderRadius: 20,
    elevation: 0,
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
  },
  threeDots: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  profileImageWrapper: {
    position: 'relative',
    borderWidth: 5,
    borderColor: '#4caf50',
    borderRadius: 60,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  verifiedIcon: {
    position: 'absolute',
    bottom: 5,
    right: -10,
    width: 20,
    height: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  contact: {
    fontSize: 16,
    color: '#888',
  },
  feedbackContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'left', // Align to the left
    marginBottom: 10,
  },
  noFeedbackText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'left',
  },
  productsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  bookmarksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // Changed to black
    textAlign: 'left', // Align to the left
    marginBottom: 10,
  },
  productsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItem: {
    width: '48%',
    marginBottom: 20,
  },
  productDate: {
    fontSize: 10,
    color: '#666',
    textAlign: 'left',
    marginBottom: 5,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 12,
    color: '#4caf50',
    textAlign: 'center',
  },
});

export default ProfileScreen;
