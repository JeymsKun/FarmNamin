import React from 'react';
import {View,Text,Image,StyleSheet,ScrollView,Dimensions,TouchableOpacity,}from 'react-native';
import Carousel from 'react-native-snap-carousel-v4';
import StarRating from 'react-native-star-rating-widget';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const feedbackData = [
  { id: 1, text: 'Sulit talaga salamat po.', rating: 5, boxText: 'High Quality' },
  { id: 2, text: 'Good and very fresh, super sulit!', rating: 4.5, boxText: 'Fast Delivery' },
  { id: 3, text: 'Affordable farmer rate, order ulit ako soon', rating: 5, boxText: 'Affordable Price' },
];

const productsData = [
  { id: 1, image: require('../assets/images/santol.jpg'), name: 'Fresh Santol', price: '₱100/kg' },
  { id: 2, image: require('../assets/images/eggplant.jpg'), name: 'Organic Eggplant', price: '₱80/kg' },
  { id: 3, image: require('../assets/images/mango.jpg'), name: 'Sweet Mango', price: '₱150/kg' },
  { id: 4, image: require('../assets/images/tomato.jpg'), name: 'Ripe Tomato', price: '₱50/kg' },
];

const ProfileScreen = () => {
  const navigation = useNavigation(); // To navigate to the menu screen

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackItem}>
      <Text style={styles.feedbackText}>{item.text}</Text>
      <StarRating
        rating={item.rating}
        onChange={() => {}}
        starSize={20}
        enableHalfStar={true}
        style={{ marginTop: 3 }}
      />
      <View style={styles.feedbackBox}>
        <Text style={styles.boxText}>{item.boxText}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image source={require('../assets/images/coverphoto.jpg')} style={styles.backgroundImage} />
        {/* Three-dot button */}
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
        <Text style={styles.name}>Jojo Romeyo Terada Jr</Text>
        <Text style={styles.contact}>09369392622</Text>
        <Text style={styles.experience}>10 Years of Agriculture</Text>
        <Text style={styles.description}>Hard-working farmer.</Text>
      </View>

      {/* Feedback Section */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.sectionTitle}>Consumer Feedback</Text>
        <Carousel
          data={feedbackData}
          renderItem={renderFeedbackItem}
          sliderWidth={width}
          itemWidth={width * 0.8}
          loop={true}
        />
      </View>

      {/* Products Section */}
      <View style={styles.productsContainer}>
        <Text style={styles.sectionTitle}>Your Posted Products</Text>
        <View style={styles.productsRow}>
          {productsData.map((product) => (
            <View key={product.id} style={styles.productItem}>
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
    top: 30, // Adjusted to move the button lower
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
    color: '#4caf50', // Green color for the dot
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
  experience: {
    fontSize: 16,
    color: '#444',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 7,
    color: '#4caf50',
  },
  feedbackContainer: {
    marginTop: 10,
  },
  feedbackItem: {
    backgroundColor: '#f0f8f5',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  boxText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4caf50',
    marginTop: 5,
  },
  productsContainer: {
    paddingHorizontal: 10,
  },
  productsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItem: {
    width: '48%',
    marginBottom: 10,
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
