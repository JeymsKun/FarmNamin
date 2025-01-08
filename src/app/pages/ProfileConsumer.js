import React, { useState, useRef, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  FlatList,
  Animated,
  BackHandler,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setProfile } from "../store/profileSlice";
import fetchUserBookmarkedProducts from "../utils/fetchUserBookmarkedProducts";
import fetchProfileData from "../utils/fetchProfileData";
import fetchUserFavorites from "../utils/fetchUserFavorites";
import useAuth from "../hooks/useAuth";
import * as VideoThumbnails from "expo-video-thumbnails";
import useRealTimeUpdates from "../hooks/useRealTimeUpdates";
import { useRouter } from "expo-router";
import { useGlobalState } from "../context/GlobalState";

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
    const {
      item,
      navigation,
      setIsProductDetailActive,
      formatPrice,
      productNameFontSize,
      productPriceFontSize,
      isFavorite,
    } = this.props;
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
        <TouchableOpacity
          style={styles.productInfo}
          onPress={() => {
            setIsProductDetailActive(true);
            navigation.navigate("ConsumerProductViewer", {
              product: item,
              isFavorite,
              id_user: item.id_user,
            });
          }}
        >
          <Text style={[styles.productName, { fontSize: productNameFontSize }]}>
            {item.name}
          </Text>
          <Text
            style={[styles.productPrice, { fontSize: productPriceFontSize }]}
          >
            {formatPrice(item.price)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const DEFAULT_COVER_PHOTO = require("../assets/main/default_cover_photo.png");
const DEFAULT_PROFILE_IMAGE = require("../assets/main/default_profile_photo.png");

const ProfileScreen = ({ navigation }) => {
  const { setSelectedImageUri } = useGlobalState();
  const { user } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isProductDetailActive, setIsProductDetailActive] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const flatListRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

  const getFontSizes = (item) => {
    const productNameFontSize = item.name.length > 15 ? 11 : 14;
    const productPriceFontSize = item.price > 8 ? 11 : 15;
    return { productNameFontSize, productPriceFontSize };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  useFocusEffect(
    useCallback(() => {
      if (!isProductDetailActive) {
        refetchProfile();
        if (user) {
          refetchBookmarkedProducts();
        }
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }
      }
      refetchFavorites();
    }, [isProductDetailActive, user, refetchProfile, refetchBookmarkedProducts])
  );

  const {
    data: profile,
    isLoading: loadingProfile,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile", user?.id_user],
    queryFn: () => fetchProfileData(user.id_user),
    enabled: !!user,
    onSuccess: (data) => dispatch(setProfile(data)),
  });

  const {
    data: bookmarkedProducts,
    isLoading: loadingBookmarkedProducts,
    refetch: refetchBookmarkedProducts,
  } = useQuery({
    queryKey: ["bookmarkedProducts", user?.id_user],
    queryFn: () => fetchUserBookmarkedProducts(user.id_user),
    enabled: !!user,
  });

  const { data: favoriteProducts = [], refetch: refetchFavorites } = useQuery({
    queryKey: ["favorites", user?.id_user],
    queryFn: () => fetchUserFavorites(user.id_user),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  useRealTimeUpdates(user?.id_user);

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchProfile(), refetchBookmarkedProducts()]);
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

  const renderUserPhoto = () => {
    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity
          onPress={() => {
            setSelectedImageUri(profile.cover_photo);
            router.push("/support/ImageViewer");
          }}
        >
          <ImageBackground
            source={
              profile?.cover_photo
                ? { uri: profile.cover_photo }
                : DEFAULT_COVER_PHOTO
            }
            style={styles.coverPhoto}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              setSelectedImageUri(profile.profile_pic);
              router.push("/support/ImageViewer");
            }}
          >
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  profile?.profile_pic
                    ? { uri: profile.profile_pic }
                    : DEFAULT_PROFILE_IMAGE
                }
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/pages/ProfileConsumerSettings")}
          >
            <Icon
              name="more-horiz"
              size={30}
              color="green"
              style={styles.dotsIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleVerifyPress}
            style={styles.verifyIconContainer}
          >
            <Icon name="check-circle" size={28} color="#50D751" />
          </TouchableOpacity>

          {showMessage && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.verifiedMessage}>
                This user is verified and trusted.
              </Text>
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
            {`${(profile?.first_name || "").trim()} ${(
              profile?.middle_name || ""
            ).trim()} ${(profile?.last_name || "").trim()} ${
              profile?.suffix || ""
            }`}
          </Text>
          <Text style={styles.mobile}>
            {profile?.phone_number
              ? `0${profile.phone_number}`.replace(/^00/, "0")
              : "-----"}
          </Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const { productNameFontSize, productPriceFontSize } = getFontSizes(item);
    const isFavorite = favoriteProducts.some(
      (fav) => fav.product.id === item.id && fav.is_bookmarked
    );

    return (
      <ProductItem
        item={item}
        navigation={navigation}
        setIsProductDetailActive={setIsProductDetailActive}
        formatPrice={formatPrice}
        productNameFontSize={productNameFontSize}
        productPriceFontSize={productPriceFontSize}
        isFavorite={isFavorite}
      />
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={bookmarkedProducts}
      renderItem={renderItem}
      keyExtractor={(item) =>
        item.product?.id ? item.product.id.toString() : Math.random().toString()
      }
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
            <View>
              <Text style={styles.sectionTitle}>My Favorite Products</Text>
            </View>
          </View>
        </View>
      }
      onRefresh={handleRefresh}
      refreshing={loadingBookmarkedProducts || loadingProfile}
      ListEmptyComponent={
        !loadingBookmarkedProducts && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              You haven't marked any product as your favorite.
            </Text>
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
    width: "100%",
    aspectRatio: 1.9,
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  headerContainer: {
    alignItems: "center",
    marginTop: -80,
    position: "relative",
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#00a400",
    borderWidth: 5,
    overflow: "hidden",
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: 200,
  },
  verifyIconContainer: {
    position: "absolute",
    top: 20,
    right: 100,
  },
  verifiedMessage: {
    marginTop: 3,
    color: "#1BA40F",
    fontSize: 12,
    fontFamily: "regular",
  },
  dotsIcon: {
    marginLeft: 300,
    marginTop: -80,
    fontSize: 45,
  },
  allInfoContainer: {
    padding: 20,
    alignItems: "center",
  },
  userInfoContainer: {
    marginTop: 45,
    padding: 20,
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontFamily: "medium",
  },
  mobile: {
    fontSize: 14,
    color: "black",
    marginVertical: 5,
    fontFamily: "medium",
  },
  reviewContainer: {
    padding: 20,
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "medium",
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  playButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -15,
  },
  noImageContainer: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  productCard: {
    width: "48%",
    margin: "1%",
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productInfo: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  productName: {
    fontSize: 16,
    fontFamily: "medium",
    textAlign: "center",
  },
  productPrice: {
    fontSize: 15,
    fontFamily: "regular",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: "medium",
    color: "#666",
  },
});

export default ProfileScreen;
