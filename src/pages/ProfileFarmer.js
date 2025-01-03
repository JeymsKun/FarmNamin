import React, { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground, StatusBar, FlatList, Animated, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { setProfile, setProducts } from '../store/profileSlice';
import { fetchProfileData, fetchUserProducts, fetchFeedbacks } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import useRealTimeUpdates from '../hooks/useRealTimeUpdates';
import * as VideoThumbnails from 'expo-video-thumbnails';

const thumbnailCache = {};

class ProductItem extends React.Component {
  state = {
    thumbnail: null,
  };

  async componentDidMount() {
    const { item } = this.props;
    await this.generateThumbnail(item);
  }

  async generateThumbnail(item) {
    const videoUri = item.videos?.[0];
    if (videoUri) {
      if (thumbnailCache[videoUri]) {
        this.setState({ thumbnail: thumbnailCache[videoUri] });
      } else {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri);
          thumbnailCache[videoUri] = uri; 
          this.setState({ thumbnail: uri });
        } catch (error) {
          console.error("Error generating thumbnail:", error);
        }
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.item !== this.props.item || 
      nextProps.navigation !== this.props.navigation || 
      nextState.thumbnail !== this.state.thumbnail
    );
  }

  render() {
    const { item, navigation, setIsProductDetailActive, formatPrice, productNameFontSize, productPriceFontSize} = this.props;
    const { thumbnail } = this.state;

    return (
      <View style={styles.productCard}>
        <View>
          {thumbnail ? (
            <View style={styles.videoContainer}>
              <Image
                source={{ uri: thumbnail }} 
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.playButton}>
                <Ionicons name="play-circle-outline" size={30} color="white" />
              </View>
            </View>
          ) : item.images?.[0] ? (
            <Image
              source={{ uri: item.images[0] }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>No Image Available</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.productInfo} 
          onPress={() => {
            setIsProductDetailActive(true); 
            navigation.navigate('FarmerOwnViewer', { product: item });
          }}
        >
          <Text style={[styles.productName, { fontSize: productNameFontSize }]}>{item.name}</Text>
          <Text style={[styles.productPrice, { fontSize: productPriceFontSize }]}>{formatPrice(item.price)}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const DEFAULT_COVER_PHOTO = require('../../assets/main/default_cover_photo.png'); 
const DEFAULT_PROFILE_IMAGE = require('../../assets/main/default_profile_photo.png');

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [showMessage, setShowMessage] = useState(false);
  const [isProductDetailActive, setIsProductDetailActive] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const flatListRef = useRef(null);

  const getFontSizes = (item) => {
    const productNameFontSize = item.name.length > 15 ? 11 : 14; 
    const productPriceFontSize = item.price > 8 ? 11 : 15; 
    return { productNameFontSize, productPriceFontSize };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  useFocusEffect(
    useCallback(() => {
      if (!isProductDetailActive) {
        refetchProfile();
        if (user) {
          refetchProducts();
        }
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ animated: true, offset: 0 }); 
        }
      }
    }, [isProductDetailActive, user, refetchProfile, refetchProducts])
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

  const { data: feedbackData = [], isLoading: loadingFeedback, refetch: refetchFeedbacks } = useQuery({
    queryKey: ['feedback', user?.id_user],
    queryFn: () => fetchFeedbacks(user.id_user), 
    staleTime: 1000 * 60 * 5,
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

  const handleDotsClick = () => {
    navigation.navigate('ProfileSettings'); 
  };

  const renderUserPhoto = () => {
    return(
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('ImageViewer', { uri: profile.cover_photo })}>
          <ImageBackground 
            source={profile?.cover_photo ? { uri: profile.cover_photo } : DEFAULT_COVER_PHOTO}
            style={styles.coverPhoto} 
            resizeMode="cover" 
          />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('ImageViewer', { uri: profile.profile_pic })}>
            <View style={styles.profileImageContainer}>
              <Image
                source={profile?.profile_pic ? { uri: profile.profile_pic } : DEFAULT_PROFILE_IMAGE} 
                style={styles.profileImage} 
                resizeMode="cover" 
              />
            </View>
          </TouchableOpacity>

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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"} 
          size={15} 
          color="#FFEB3B" 
        />
      );
    }
    return stars;
  };

  const renderFeedback = () => {
    const truncateDescription = (description) => {
      if (description.length > 22) {
        return description.substring(0, 22) + '...';
      }
        return description;
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {feedbackData.map((feedback) => (
            <View key={feedback.id} style={styles.feedbackCard}>
              <View style={styles.feedbackInfo}>
                <View style={styles.ratingContainer}>
                  {renderStars(feedback.rating)}
                </View>

                <View style={styles.descriptionWrapper}>
                  <Text style={styles.feedbackDescription}>
                    {truncateDescription(feedback.description)}
                  </Text>
                </View>

                <View style={styles.tagWrapper}>
                  <Text style={styles.feedbackTag}>{feedback.tags}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
    );
  };

  const renderItem = ({ item }) => {
    const { productNameFontSize, productPriceFontSize } = getFontSizes(item);

    return (
      <ProductItem 
        item={item} 
        formatPrice={formatPrice}
        navigation={navigation}
        setIsProductDetailActive={setIsProductDetailActive} 
        productNameFontSize={productNameFontSize} 
        productPriceFontSize={productPriceFontSize}
      />
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={products}
      renderItem={renderItem}
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
            <TouchableOpacity onPress={() => navigation.navigate('ConsumerFeedback')}>
              <Text style={styles.reviewTitle}>Go to Consumer's Feedback</Text>
            </TouchableOpacity>
            {renderFeedback()}
            <View>
              <Text style={styles.sectionTitle}>My Posted Products</Text>
            </View>
          </View>

        </View>
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
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',  
  },
  playButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    left: '50%',
    marginLeft: -15, 
    marginTop: -15, 
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
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'medium',
  },
  mobile: {
    fontSize: 14,
    color: 'black',
    marginVertical: 5,
    fontFamily: 'regular',
  },
  experience: {
    fontSize: 12,
    fontFamily: 'regular',
    color: 'gray',
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
    fontSize: 14,
    fontFamily: 'medium',
  },
  productCard: {
    width: '48%',
    margin: '1%',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noImageContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  noImageText: {
    color: '#888', 
    fontSize: 14,
    fontFamily: 'regular',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10, 
    borderTopRightRadius: 10,
  },
  productInfo: {
    padding: 10,
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
  feedbackContainer: {
    padding: 5,
  },
  feedbackCard: {
    marginRight: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    position: 'relative',
  },
  feedbackInfo: {
    padding: 10,
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontFamily: 'regular',
  },
  descriptionWrapper:{
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackDescription: {
    fontSize: 12,
    fontFamily: 'regular',
    color: 'white',
  },
  tagWrapper: {
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackTag: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    fontSize: 12,
    fontFamily: 'regular',
    color: 'black',
  },
});

export default ProfileScreen;