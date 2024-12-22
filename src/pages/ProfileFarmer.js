import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ImageBackground, StatusBar, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { decode } from 'base64-arraybuffer';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../backend/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const DEFAULT_COVER_PHOTO = require('../../assets/group.png'); 
const DEFAULT_PROFILE_IMAGE = require('../../assets/farmer_user.png');

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [coverModalVisible, setCoverModalVisible] = useState(false);
  const [profile, setProfile] = useState([]);
  const [products, setProducts] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const profileScale = useRef(new Animated.Value(1)).current;
  const subscriptionRef = useRef(null); 

  useEffect(() => {
      if (user) {
        console.log('Current user navigating to Profile Screen:', user);
        loadData();
        loadProductData();
      }
  }, [user]); 

const loadProductData = async () => {
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('product')
      .select('id, name, price, images, created_at')
      .eq('id_user', user.id_user);

    if (error) {
      console.error('Error fetching product:', error);
      return;
    }

    console.log('Raw fetched product data:', data);

    if (data && data.length > 0) {
      
      setProducts(data);
    } else {
      console.log('No product found in the database.');
    }
  } catch (err) {
    console.error('Unexpected error loading data:', err);
  }
};

const listenForChangesProduct = async () => {
  if (subscriptionRef.current) return;

  try {
    const subscription = supabase
      .channel('database_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product' }, async (payload) => {
        console.log('Database change detected:', payload);
        await loadProductData();  
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to product changes.');
        }
      });
    subscriptionRef.current = subscription; 
  } catch (err) {
    console.error('Error subscribing to database changes:', err);
  }
};
        
useEffect(() => {
  loadProductData().then(() => {
    listenForChangesProduct();
  });

  return () => {
    if (subscriptionRef.current) {
      supabase.removeSubscription(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  };
}, []);

const loadData = async () => {
  if (!user) return;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id_user, first_name, last_name, middle_name, suffix, birth_month, birth_day, birth_year, bio, experience, profile_pic, cover_photo, phone_number')
      .eq('id_user', user.id_user);

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data && data.length > 0) {
      setProfile(data[0]);
    } else {
      console.log('No profile data found.');
    }
  } catch (err) {
    console.error('Unexpected error loading data:', err);
  }
};
    
const listenForChanges = async () => {
  if (subscriptionRef.current) return;

  try {
    const subscription = supabase
      .channel('database_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async (payload) => {
        console.log('Database change detected:', payload);
        await loadData();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to user changes.');
        }
      });

    subscriptionRef.current = subscription;
  } catch (err) {
    console.error('Error subscribing to database changes:', err);
  }
};
        
useEffect(() => {
  loadData().then(() => listenForChanges());

  return () => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  };
}, []);

  const handleVerifyPress = () => {
    setShowMessage(true);
    fadeAnim.setValue(1);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 6000, 
      useNativeDriver: true,
    }).start(() => {
      setShowMessage(false); 
    });
  };
  
  const handleCloseModal = (setModalVisible) => {
    Animated.timing(fadeAnim, {
      toValue: 0, 
      duration: 300, 
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false); 
      fadeAnim.setValue(1); 
    });
  };

  const animateProfile = () => {
    Animated.sequence([
      Animated.timing(profileScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(profileScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setProfileModalVisible(true));
  };  

  const navigateToReviewScreen = () => {
    navigation.navigate('ReviewScreen'); 
  };

  const navigateToProductDetails = (productId) => {
    navigation.navigate('ProductDetailsScreen', { productId });
  };  

  const handleDotsClick = () => {
    navigation.navigate('ProfileMenuScreenFarmer'); 
  };
``
  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewContent}>
        <View style={styles.ratingContainer}>
          {Array.from({ length: 10 }, (_, i) => (
            <Icon
              key={i}
              name="star"
              size={15}
              color={i < item.rating ? '#FFD700' : '#CCCCCC'} 
              style={styles.starIcon}
            />
          ))}
        </View>
        <Text style={styles.reviewText}>
          {item.text.length > 30 ? `${item.text.substring(0, 30)}...` : item.text}
        </Text>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
  
  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => navigateToProductDetails(item.id)}>
        <Image
          source={{ uri: item.images[0] }} 
          style={styles.productImage}
          resizeMode="cover"
          onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
        />
      </TouchableOpacity>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₱{parseFloat(item.price).toFixed(2)}</Text>
      </View>
    </View>
  );
  
  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.container}>
          <StatusBar hidden={false} />
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={() => setCoverModalVisible(true)}>
              <ImageBackground 
                source={profile?.cover_photo ? { uri: profile.cover_photo } : DEFAULT_COVER_PHOTO}
                style={styles.coverPhoto} 
                resizeMode="cover" 
              />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
            <Animated.View style={{ transform: [{ scale: profileScale }] }}>
              <TouchableOpacity onPress={animateProfile}>
                <View style={styles.profileImageContainer}>
                  <Image 
                    source={profile?.profile_pic ? { uri: profile.profile_pic } : DEFAULT_PROFILE_IMAGE} 
                    style={styles.profileImage} 
                    resizeMode="contain" 
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>

              <TouchableOpacity onPress={() => handleDotsClick()}>
                <Icon name="more-horiz" size={30} color="green" style={styles.dotsIcon} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleVerifyPress} style={styles.verifyIconContainer}>
                <Image 
                  source={require('../../assets/images/verified.png')}
                  style={styles.verifyIcon} 
                  resizeMode="contain" 
                />
              </TouchableOpacity>

              {showMessage && (
                <Animated.View style={{ opacity: fadeAnim }}>
                  <Text style={styles.verifiedMessage}>This user is verified and trusted.</Text>
                </Animated.View>
              )}

            </View>
          </View>

          <View style={styles.allInfoContainer}>
            <View style={styles.userInfoContainer}>
            <Text style={styles.name}>
              {`${(profile?.first_name || '').trim()} ${(profile?.last_name || '').trim()} ${(profile?.middle_name || '').trim()} ${profile?.suffix || ''}`}
            </Text>
            <Text style={styles.mobile}>
              {profile?.phone_number ? `0${profile.phone_number}`.replace(/^00/, '0') : '-----'}
            </Text>
              <Text style={styles.experience}>{profile?.experience || "-----"}</Text>
            </View>
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{profile?.bio || 'No bio available'}</Text>
            </View>
          </View>

          <View style={styles.reviewContainer}>
            <TouchableOpacity onPress={navigateToReviewScreen}>
              <Text style={styles.reviewTitle}>Go to Consumer's Feedback</Text>
            </TouchableOpacity>
              {/* <FlatList
                  data={reviews || []}
                  horizontal
                  renderItem={renderReviewItem}
                  keyExtractor={(item) => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.reviewList}
              /> */}
          </View>

          <View style={styles.fixedTitleContainer}>
            <Text style={styles.sectionTitle}>Your Posted Products</Text>
          </View>

        </View>
      }
      data={products}
      renderItem={renderProductItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={styles.productsList}
      ListFooterComponent={
        <>
         <Modal
          visible={profileModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => handleCloseModal(setProfileModalVisible)}
        >
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.modalBackground} onPress={() => handleCloseModal(setProfileModalVisible)}>
              <Image source={DEFAULT_PROFILE_IMAGE} style={styles.fullProfileImage} />
            </TouchableOpacity>
          </Animated.View>
        </Modal>

        <Modal
          visible={coverModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => handleCloseModal(setCoverModalVisible)}
        >
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.modalBackground} onPress={() => handleCloseModal(setCoverModalVisible)}>
              <Image source={DEFAULT_COVER_PHOTO} style={styles.fullCoverImage} />
            </TouchableOpacity>
          </Animated.View>
        </Modal>
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',         
    aspectRatio: 1.9,      
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },  
  headerContainer: {
    alignItems: 'center',
    marginTop: -80,
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#00a400',
    borderWidth: 5,
    overflow: 'hidden', 
  },
  profileImage: {
    width: '100%', 
    height: '100%', 
  },
  verifyIconContainer: {
    position: 'absolute',
    top: 20, 
    right: 100, 
  },
  verifyIcon: {
    width: 40, 
    height: 40,
  },
  verifiedMessage: {
    marginTop: 3,
    color: '#1BA40F',
    fontSize: 12,
    fontFamily: 'regular',
  },
  dotsIcon: {
    marginLeft: 300,
    marginTop: -80,
    fontSize: 45,
  },
  allInfoContainer: {
    padding: 20,
    alignItems: 'center',
  },
  userInfoContainer: {
    marginTop: 45,
    padding: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontFamily: 'bold',
  },
  mobile: {
    fontSize: 14,
    color: 'black',
    marginVertical: 5,
    fontFamily: 'medium',
  },
  experience: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Poppins-Medium',
  },
  bioContainer: {
    width: '100%',
    borderRadius: 10,
  },
  bioText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'regular',
    paddingHorizontal: 6,
  },
  editButton: {
    padding: 5,
    borderRadius: 5,
  },
  edit: {
    color: '#2D8D2B',
    fontSize: 14,
    fontFamily: 'medium',
    paddingHorizontal: 5,
  },
  updateButton: {
    padding: 5,
    borderRadius: 5,
  },
  update: {
    color: '#2D8D2B',
    fontSize: 14,
    fontFamily: 'medium',
  },
  reviewContainer: {
    width: '100%',
    padding: 10,
    marginLeft: 10,
  },
  reviewTitle: {
    fontSize: 12,
    fontFamily: 'bold',
    color: '#4CAF50',
  },
  reviewList: {
    paddingVertical: 5,
    paddingRight: 30,
    paddingLeft: 10,
    flexGrow: 1,
  },
  
  reviewCard: {
    width: 200,
    padding: 5,
    marginHorizontal: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  reviewContent: {
    flexDirection: 'column',
    marginLeft: 10, 
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    width: 10,
    height: 10,
  },
  reviewText: {
    marginTop: 5,
    fontSize: 12,
    fontFamily: 'regular',
    color: 'white',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 3,
  },
  tag: {
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
  },
  tagText: {
    color: 'black',
    fontSize: 12,
    fontFamily: 'regular',
  },  
  fixedTitleContainer: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    textAlign: 'left', 
    fontFamily: 'medium',
    paddingHorizontal: 5,
    marginHorizontal: 8,
  },
  productCard: {
    width: '50%', 
    padding: 15,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1, 
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: '#e0e0e0', 
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', 
  },
  productInfo: {
    alignItems: 'left',
    marginTop: 5,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'regular',
    marginTop: 5,
    
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)', 
  },
  modalBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullProfileImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  fullCoverImage: {
    width: '90%',
    height: '50%',
    borderRadius: 20,
  },
  confirmationBox: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  confirmationText: {
    fontFamily: 'medium',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  confirmButton: {
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
  },
  confirmButtonText: {
    fontFamily: 'medium',
    fontSize: 16,
    color: 'green',
  },
  cancelButtonText: {
    fontFamily: 'medium',
    fontSize: 16,
    color: 'red',
  },
  line: {
    height: 1, 
    backgroundColor: 'gray', 
    marginVertical: 5, 
    width: '100%', 
  },
  starIcon: {
    marginRight: 1,
  },
  

});

export default ProfileScreen;