import React, { useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ImageBackground, StatusBar, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { setProfile, setProducts } from '../store/profileSlice';
import { fetchProfileData, fetchUserProducts } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';

class ProductItem extends React.PureComponent {
  render() {
    const { item, navigateToProductDetails } = this.props;

    return (
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
  }
}

const DEFAULT_COVER_PHOTO = require('../../assets/main/default_cover_photo.png'); 
const DEFAULT_PROFILE_IMAGE = require('../../assets/main/default_profile_photo.png');

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [coverModalVisible, setCoverModalVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const profileScale = useRef(new Animated.Value(1)).current; 
  const flatListRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 }); 
      }

      refetchProfile();
      refetchProducts();

    }, [])
  );

  const { data: profile, isLoading: loadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id_user],
    queryFn: () => fetchProfileData(user.id_user),
    enabled: !!user,
    onSuccess: (data) => dispatch(setProfile(data)),
  });

  const { data: products, isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['products', user?.id_user],
    queryFn: () => fetchUserProducts(user.id_user),
    enabled: !!user,
    onSuccess: (data) => dispatch(setProducts(data)),
  });

  useRealTimeUpdates(user?.id_user);

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchProfile(), refetchProducts()]);
    } catch (error) {
      console.error("Error during refresh:", error);
    }
  };

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
    navigation.navigate('ProfileSettings'); 
  };

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

  const renderUserPhoto = () => {
    return(
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
            <Icon name="check-circle" size={28} color="#50D751" />
          </TouchableOpacity>

          {showMessage && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.verifiedMessage}>This user is verified and trusted.</Text>
            </Animated.View>
          )}

        </View>
      </View>
    );
  };

  const renderUserInfo = () => {
    return (
      <View style={styles.allInfoContainer}>
        <View style={styles.userInfoContainer}>
          <Text style={styles.name}>
            {`${(profile?.first_name || '').trim()} ${(profile?.middle_name || '').trim()} ${(profile?.last_name || '').trim()} ${profile?.suffix || ''}`}
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
    );
  };
  
  return (
    <FlatList
      ref={flatListRef}
      data={products}
      renderItem={({ item }) => <ProductItem item={item} navigateToProductDetails={navigateToProductDetails} />}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      numColumns={2} 
      key={`columns_${2}`}
      ListHeaderComponent={
        <View>
          <StatusBar hidden={false} />
          {renderUserPhoto()}

          {renderUserInfo()}

          <View style={styles.reviewContainer}>
            <TouchableOpacity onPress={navigateToReviewScreen}>
              <Text style={styles.reviewTitle}>Go to Consumer's Feedback</Text>
            </TouchableOpacity>
            

            <View>
              <Text style={styles.sectionTitle}>My Posted Products</Text>
            </View>
          </View>

        </View>
      }
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
      onRefresh={handleRefresh}
      refreshing={loadingProducts || loadingProfile}
      ListEmptyComponent={
        !loadingProducts && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't posted products yet.</Text>
          </View>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    borderWidth: 1,
    borderColor: '#ddd',
  },  
  headerContainer: {
    alignItems: 'center',
    marginTop: -80,
    position: 'relative',
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
    position: 'relative', 
  },
  profileImage: {
    width: '100%', 
    height: 200, 
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
    fontSize: 16,
    fontFamily: 'medium',
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
    padding: 20,
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
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'medium',
  },
  productCard: {
    width: '48%',
    margin: '1%',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productInfo: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontFamily: 'medium',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontFamily: 'regular',
    textAlign: 'center',
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
  emptyContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16, 
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: '#666',
  },
});

export default ProfileScreen;