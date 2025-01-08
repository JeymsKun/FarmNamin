import React, { useState, useRef, useEffect } from "react";
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
  ScrollView,
  BackHandler,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { setProducts } from "../store/profileSlice";
import fetchUserProducts from "../utils/fetchUserProducts";
import fetchFeedbacks from "../utils/fetchFeedbacks";
import * as VideoThumbnails from "expo-video-thumbnails";
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
    const { item, formatPrice, productNameFontSize, productPriceFontSize } =
      this.props;
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
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { fontSize: productNameFontSize }]}>
            {item.name}
          </Text>
          <Text
            style={[styles.productPrice, { fontSize: productPriceFontSize }]}
          >
            {formatPrice(item.price)}
          </Text>
        </View>
      </View>
    );
  }
}

const DEFAULT_COVER_PHOTO = require("../assets/main/default_cover_photo.png");
const DEFAULT_PROFILE_IMAGE = require("../assets/main/default_profile_photo.png");

const FarmerDetailScreen = ({ navigation }) => {
  const { selectedFarmer, setSelectedImageUri } = useGlobalState();
  const router = useRouter();
  const dispatch = useDispatch();
  const [showMessage, setShowMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const flatListRef = useRef(null);

  const getFontSizes = (item) => {
    const productNameFontSize = item.name.length > 15 ? 11 : 14;
    const productPriceFontSize = item.price > 8 ? 11 : 15;
    return { productNameFontSize, productPriceFontSize };
  };

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      }

      refetchFeedbacks();
      refetchProducts();
    }, [])
  );

  const {
    data: products = [],
    isLoading: loadingProducts,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products", selectedFarmer.id_user],
    queryFn: () => fetchUserProducts(selectedFarmer.id_user),
    enabled: !!selectedFarmer,
    onSuccess: (data) => dispatch(setProducts(data)),
  });

  const {
    data: feedbackData = [],
    isLoading: loadingFeedback,
    refetch: refetchFeedbacks,
  } = useQuery({
    queryKey: ["feedback", selectedFarmer.id_user],
    queryFn: () => fetchFeedbacks(selectedFarmer.id_user),
    enabled: !!selectedFarmer,
    staleTime: 1000 * 60 * 5,
    onSuccess: (data) => {
      console.log("Feedback data fetched successfully:", data);
    },
  });

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchFeedbacks(), refetchProducts()]);
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

  const handleBack = () => {
    router.back();
  };

  const renderUserPhoto = () => {
    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={32} color="#4CAF50" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedImageUri(selectedFarmer.cover_photo);
            router.push("/support/ImageViewer");
          }}
        >
          <ImageBackground
            source={
              selectedFarmer?.cover_photo
                ? { uri: selectedFarmer.cover_photo }
                : DEFAULT_COVER_PHOTO
            }
            style={styles.coverPhoto}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              setSelectedImageUri(selectedFarmer.profile_pic);
              router.push("/support/ImageViewer");
            }}
          >
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  selectedFarmer?.profile_pic
                    ? { uri: selectedFarmer.profile_pic }
                    : DEFAULT_PROFILE_IMAGE
                }
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
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
            {`${(selectedFarmer.first_name || "").trim()} ${(
              selectedFarmer.middle_name || ""
            ).trim()} ${(selectedFarmer.last_name || "").trim()} ${
              selectedFarmer.suffix || ""
            }`}
          </Text>
          <Text style={styles.mobile}>
            {selectedFarmer.phone_number
              ? `0${selectedFarmer.phone_number}`.replace(/^00/, "0")
              : "-----"}
          </Text>
          <Text style={styles.experience}>
            {selectedFarmer.experience || "-----"}
          </Text>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>
            {selectedFarmer.bio || "No bio available"}
          </Text>
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
        return description.substring(0, 22) + "...";
      }
      return description;
    };

    return (
      <View>
        {feedbackData.length > 0 ? (
          <View>
            <Text style={styles.reviewTitle}>Feedback</Text>
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
          </View>
        ) : null}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const { productNameFontSize, productPriceFontSize } = getFontSizes(item);

    return (
      <ProductItem
        item={item}
        formatPrice={formatPrice}
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
            {renderFeedback()}

            <View>
              <Text style={styles.sectionTitle}>
                {selectedFarmer.first_name}'s Posted Products
              </Text>
            </View>
          </View>
        </View>
      }
      onRefresh={handleRefresh}
      refreshing={loadingProducts}
      ListEmptyComponent={
        !loadingProducts && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedFarmer.first_name} haven't posted products yet.
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
    position: "relative",
  },
  backButton: {
    padding: 10,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 100,
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
  noImageText: {
    fontSize: 12,
    fontFamily: "regular",
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
    textAlign: "center",
    fontSize: 16,
    fontFamily: "medium",
  },
  mobile: {
    fontSize: 14,
    color: "black",
    marginVertical: 5,
    fontFamily: "regular",
  },
  experience: {
    fontSize: 12,
    fontFamily: "regular",
    color: "gray",
  },
  bioContainer: {
    width: "100%",
    borderRadius: 10,
  },
  bioText: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "regular",
    paddingHorizontal: 6,
  },
  reviewContainer: {
    padding: 20,
  },
  reviewTitle: {
    fontSize: 12,
    fontFamily: "bold",
    color: "#4CAF50",
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "medium",
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
    fontSize: 14,
    fontFamily: "medium",
    color: "#666",
  },
  feedbackCard: {
    marginRight: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  feedbackInfo: {
    padding: 10,
    justifyContent: "center",
  },
  descriptionWrapper: {
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackDescription: {
    fontSize: 12,
    fontFamily: "regular",
    color: "white",
  },
  tagWrapper: {
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackTag: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 5,
    fontSize: 12,
    fontFamily: "regular",
    color: "black",
  },
});

export default FarmerDetailScreen;
