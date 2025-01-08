import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Image,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useFocusEffect } from "@react-navigation/native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import Data from "../data/updateData";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import useAuth from "../hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import deleteFavoritesByProductId from "../utils/deleteFavoritesByProductId";
import fetchPosts from "../utils/fetchPosts";
import fetchProducts from "../utils/fetchProducts";
import fetchNewOrders from "../utils/fetchNewOrders";
import deletePost from "../utils/deletePost";
import deleteProduct from "../utils/deleteProduct";
import {
  setSelectedPost,
  setSelectedProduct,
  clearSelectedPost,
  clearSelectedProduct,
} from "../store/productSlice";
import { useQuery } from "@tanstack/react-query";
import * as VideoThumbnails from "expo-video-thumbnails";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomAlert from "../support/CustomAlert";
import { useRouter } from "expo-router";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

class PostItem extends React.PureComponent {
  render() {
    const {
      item,
      user,
      formatDate,
      toggleMenu,
      handleDeletePost,
      selectedPost,
    } = this.props;

    return (
      <View style={styles.postItem}>
        <View style={styles.postInfoContainer}>
          <Text style={styles.postInfo}>
            You • {formatDate(item.created_at)}
          </Text>
          <TouchableOpacity
            onPress={() => toggleMenu(item)}
            style={styles.dotsButton}
          >
            <Icon name="dots-horizontal" size={25} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <Text style={styles.postLocation}>
          Located in {item.location} • Contact Number #
          {user?.phone_number || "------"}
        </Text>

        {item.description && (
          <Text style={styles.postTitle}>{item.description}</Text>
        )}

        {item.images && item.images.length > 0 ? (
          <View style={styles.imageContainer}>
            <View>
              {item.images.length === 1 ? (
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.singleImage}
                  resizeMode="cover"
                />
              ) : item.images.length === 2 ? (
                <View style={styles.doubleImageContainer}>
                  {item.images.map((imageURL, index) => (
                    <Image
                      key={index}
                      source={{ uri: imageURL }}
                      style={styles.doubleImage}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.moreImagesContainer}>
                  {item.images.slice(0, 3).map((imageURL, index) => (
                    <Image
                      key={index}
                      source={{ uri: imageURL }}
                      style={styles.gridImage}
                      resizeMode="cover"
                    />
                  ))}
                  {item.images.length > 3 && (
                    <Text style={styles.imageCountText}>
                      + {item.images.length - 3}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        ) : (
          <Text style={styles.noImagesText}>No images available</Text>
        )}
        {selectedPost && selectedPost.id === item.id && (
          <View style={styles.inlineMenuContainer}>
            <TouchableOpacity
              onPress={handleDeletePost}
              style={styles.inlineMenuItem}
            >
              <Icon name="trash-can" size={20} color="#4CAF50" />
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}

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
          console.log("Generated thumbnail URI:", uri);
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
      nextProps.selectedProduct !== this.props.selectedProduct ||
      nextState.thumbnail !== this.state.thumbnail
    );
  }

  render() {
    const {
      item,
      formatDate,
      formatPrice,
      toggleMenuProduct,
      selectedProduct,
      handleDeleteProduct,
    } = this.props;
    const { thumbnail } = this.state;

    return (
      <View style={styles.productContainer}>
        <View style={styles.productMenuWrapper}>
          <Text style={styles.productDate}>
            Created on {formatDate(item.created_at)}
          </Text>
          <TouchableOpacity
            onPress={() => toggleMenuProduct(item)}
            style={styles.dotsButtonProduct}
          >
            <Icon name="dots-horizontal" size={25} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <View>
          {thumbnail ? (
            <View style={{ position: "relative" }}>
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
          <View style={styles.productInfoContainer}>
            <View style={styles.productButton}>
              <Text style={styles.productName}>{item.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.productPrice}>
                  ₱ {formatPrice(item.price)}
                </Text>
              </View>
            </View>
          </View>
          {selectedProduct && selectedProduct.id === item.id && (
            <View style={styles.inlineMenuContainerProduct}>
              <TouchableOpacity
                onPress={handleDeleteProduct}
                style={styles.inlineMenuProductItem}
              >
                <Icon name="trash-can" size={20} color="#4CAF50" />
                <Text style={styles.menuText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const { width, height } = Dimensions.get("window");

const ProductScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation();
  const [selectedButton, setSelectedButton] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [menuTimeout, setMenuTimeout] = useState(null);
  const menuTimeoutRef = useRef(null);
  const [menuTimeoutProduct, setMenuTimeoutProduct] = useState(null);
  const menuTimeoutProductRef = useRef(null);
  const flatListRef = useRef(null);
  const [showInfoTool, setShowInfoTool] = useState(false);
  const [showInfoGuide, setShowInfoGuide] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  useEffect(() => {
    const clearMessage = () => {
      setShowInfoTool(false);
      setShowInfoGuide(false);
    };

    let timer;
    if (showInfoTool || showInfoGuide) {
      timer = setTimeout(clearMessage, 4000);
    }

    return () => clearTimeout(timer);
  }, [showInfoTool, showInfoGuide]);

  useFocusEffect(
    React.useCallback(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      }

      refetchOrders();
      refetchPosts();
      refetchProducts();
    }, [])
  );

  const {
    data: fetchedPosts = [],
    isLoading: loadingPosts,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["posts", user?.id_user],
    queryFn: () => fetchPosts(user.id_user),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: fetchedProducts = [],
    isLoading: loadingProducts,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products", user?.id_user],
    queryFn: () => fetchProducts(user.id_user),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: newOrders = [],
    isLoading: loadingOrders,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["newOrders", user?.id_user],
    queryFn: () => fetchNewOrders(user.id_user),
    enabled: !!user?.id_user,
  });

  useEffect(() => {
    if (fetchedPosts.length > 0) {
      setPosts(fetchedPosts);
    }
  }, [fetchedPosts]);

  useEffect(() => {
    if (fetchedProducts.length > 0) {
      setProducts(fetchedProducts);
    }
  }, [fetchedProducts]);

  const selectedPost = useSelector((state) => state.product.selectedPost);
  const selectedProduct = useSelector((state) => state.product.selectedProduct);

  const formatDate = (date) => {
    try {
      return format(
        date ? parseISO(date) : new Date(),
        "EEEE • MMMM d, yyyy • hh:mm a"
      );
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    };
  }, []);

  const handleDeletePost = async () => {
    if (selectedPost) {
      try {
        await deletePost(selectedPost.id);

        setPosts(posts.filter((p) => p.id !== selectedPost.id));
        dispatch(clearSelectedPost());
      } catch (error) {
        console.error("Error deleting post:", error);
        showAlert("Error", "Could not delete the post. Please try again.");
      }
    }
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      try {
        await deleteFavoritesByProductId(selectedProduct.id);

        await deleteProduct(selectedProduct.id);

        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== selectedProduct.id)
        );

        dispatch(clearSelectedProduct());
      } catch (error) {
        console.error("Error deleting product:", error);
        showAlert("Error", "Could not delete the product. Please try again.");
      }
    }
  };

  const toggleMenu = (postItem) => {
    if (selectedPost && selectedPost.id === postItem.id) {
      dispatch(clearSelectedPost());
      clearTimeout(menuTimeout);
    } else {
      dispatch(setSelectedPost(postItem));
      clearTimeout(menuTimeout);

      const timeoutId = setTimeout(() => {
        dispatch(clearSelectedPost());
      }, 5000);
      setMenuTimeout(timeoutId);
    }
  };

  const toggleMenuProduct = (productItem) => {
    if (selectedProduct && selectedProduct.id === productItem.id) {
      dispatch(clearSelectedProduct());
      clearTimeout(menuTimeoutProduct);
    } else {
      dispatch(setSelectedProduct(productItem));
      clearTimeout(menuTimeoutProduct);

      const timeoutId = setTimeout(() => {
        dispatch(clearSelectedProduct());
      }, 5000);
      setMenuTimeoutProduct(timeoutId);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(menuTimeoutProduct);
    };
  }, [menuTimeoutProduct]);

  useEffect(() => {
    return () => {
      clearTimeout(menuTimeout);
    };
  }, [menuTimeout]);

  const renderHeader = () => {
    const unconfirmedOrders = newOrders.filter((order) => !order.confirm_order);
    const todayNewOrdersCount = unconfirmedOrders.length;

    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.marketplaceButton}
          onPress={() => router.push("/pages/MarketplaceFarmer")}
        >
          <Text style={styles.marketplaceText}>Go to marketplace</Text>
        </TouchableOpacity>

        <View style={styles.notificationButton}>
          <TouchableOpacity
            onPress={() => router.push("/pages/NotificationFarmer")}
          >
            <Text style={styles.notificationText}>Notification</Text>
          </TouchableOpacity>

          <Icon name="bell" size={24} color="green" />
          {todayNewOrdersCount > 0 && (
            <View style={styles.notificationBadge}>
              {loadingOrders ? (
                <ActivityIndicator size={20} color="white" />
              ) : (
                <Text style={styles.notificationCount}>
                  {todayNewOrdersCount}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderCarousel = () => {
    return (
      <View style={styles.carouselSection}>
        <Carousel
          loop
          autoPlay
          autoPlayInterval={4000}
          width={width * 0.9}
          height={width * 0.5}
          data={Data}
          scrollAnimationDuration={1000}
          onSnapToItem={(index) => setActiveIndex(index)}
          renderItem={({ item }) => (
            <View style={styles.carouselItem}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.carouselImage}
              />
              <View style={styles.textContainer}>
                <Text style={styles.carouselText}>{item.title}</Text>
                <Text style={styles.carouselDescription}>
                  {item.description}
                </Text>
              </View>
            </View>
          )}
        />
        <View style={styles.dotContainer}>
          {Data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    activeIndex === index ? "#4AF146" : "#4CAF50",
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderFarmerTool = () => {
    return (
      <View style={styles.sectionTool}>
        <View style={styles.sectionHeaderTool}>
          <Text style={styles.sectionTitleTool}>Farmer's Tool</Text>
          <TouchableOpacity style={styles.questionButtonTool}>
            <AntDesign
              name="questioncircleo"
              size={14}
              color="black"
              style={styles.questioncircleTool}
              onPress={() => setShowInfoTool((prev) => !prev)}
            />
          </TouchableOpacity>
          {showInfoTool && (
            <View style={styles.infoMessage}>
              <Text style={styles.infoText}>
                FarmNamin offers a comprehensive Farmer's Tool designed to help
                farmers efficiently manage their agricultural activities.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionRowTool}>
          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => router.push("/pages/Post")}
          >
            <Image
              source={require("../assets/product/social-media.png")}
              style={styles.sectionImageTool}
            />
            <View style={styles.nameContainerTool}>
              <Text style={styles.sectionItemFirstTextTool}>Create</Text>
              <Text style={styles.sectionItemSecondTextTool}>Post</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => router.push("/pages/Calendar")}
          >
            <Image
              source={require("../assets/product/calendar.png")}
              style={styles.sectionImageTool}
            />
            <View style={styles.nameContainerTool}>
              <Text style={styles.sectionItemFirstTextTool}>Planting</Text>
              <Text style={styles.sectionItemSecondTextTool}>Calendar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => router.push("/pages/ProductPost")}
          >
            <Image
              source={require("../assets/product/vegetable.png")}
              style={styles.sectionImageTool}
            />
            <View style={styles.nameContainerTool}>
              <Text style={styles.sectionItemFirstTextTool}>Product</Text>
              <Text style={styles.sectionItemSecondTextTool}>For Sale</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => router.push("/pages/TrackAndTrace")}
          >
            <Image
              source={require("../assets/product/tracking.png")}
              style={styles.sectionImageTool}
            />
            <View style={styles.nameContainerTool}>
              <Text style={styles.sectionItemFirstTextTool}>Trace And</Text>
              <Text style={styles.sectionItemSecondTextTool}>Track</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFarmerGuide = () => {
    return (
      <View style={styles.sectionGuide}>
        <View style={styles.sectionHeaderGuide}>
          <Text style={styles.sectionTitleGuide}>Farmer's Guide</Text>
          <TouchableOpacity style={styles.questionButtonGuide}>
            <AntDesign
              name="questioncircleo"
              size={14}
              color="black"
              style={styles.questioncircleGuide}
              onPress={() => setShowInfoGuide((prev) => !prev)}
            />
          </TouchableOpacity>
          {showInfoGuide && (
            <View style={styles.infoMessage}>
              <Text style={styles.infoText}>
                Farmer's Guide is designed to provide essential information and
                tools to support farmers in their daily operations. These
                features help farmers stay informed about important updates,
                enhance their agricultural practices, and make better decisions
                based on current market trends.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionRowGuide}>
          <TouchableOpacity
            style={styles.sectionItemGuide}
            onPress={() => router.push("/pages/Weather")}
          >
            <Image
              source={require("../assets/product/rain-burst.png")}
              style={styles.sectionImageGuide}
            />
            <View style={styles.nameContainerGuide}>
              <Text style={styles.sectionItemFirstTextGuide}>Weather</Text>
              <Text style={styles.sectionItemSecondTextGuide}>Alerts</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemGuide}
            onPress={() => router.push("/pages/AgricultureTips")}
          >
            <Image
              source={require("../assets/product/lightbulb.png")}
              style={styles.sectionImageGuide}
            />
            <View style={styles.nameContainerGuide}>
              <Text style={styles.sectionItemFirstTextGuide}>Agricultural</Text>
              <Text style={styles.sectionItemSecondTextGuide}>Tips</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemGuide}
            onPress={() => router.push("/pages/MarketPrice")}
          >
            <Image
              source={require("../assets/product/profit.png")}
              style={styles.sectionImageGuide}
            />
            <View style={styles.nameContainerGuide}>
              <Text style={styles.sectionItemFirstTextGuide}>Agri-Fishery</Text>
              <Text style={styles.sectionItemSecondTextGuide}>
                Market Prices
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSwitchButton = () => {
    return (
      <>
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => {
              setSelectedButton("posts");
              dispatch(clearSelectedProduct());
            }}
          >
            <Text
              style={[
                styles.bottomButtonText,
                { color: selectedButton === "posts" ? "green" : "black" },
              ]}
            >
              See my posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => {
              setSelectedButton("products");
              dispatch(clearSelectedPost());
            }}
          >
            <Text
              style={[
                styles.bottomButtonText,
                { color: selectedButton === "products" ? "green" : "black" },
              ]}
            >
              See my products
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.grandLine} />
      </>
    );
  };

  const renderItem = useCallback(
    ({ item }) => {
      return selectedButton === "posts" ? (
        <PostItem
          item={item}
          user={user}
          formatDate={formatDate}
          toggleMenu={toggleMenu}
          handleDeletePost={handleDeletePost}
          selectedPost={selectedPost}
        />
      ) : (
        <ProductItem
          item={item}
          formatDate={formatDate}
          formatPrice={formatPrice}
          toggleMenuProduct={toggleMenuProduct}
          selectedProduct={selectedProduct}
          handleDeleteProduct={handleDeleteProduct}
        />
      );
    },
    [
      selectedButton,
      user,
      formatDate,
      formatPrice,
      toggleMenu,
      handleDeletePost,
      selectedPost,
      toggleMenuProduct,
      selectedProduct,
      handleDeleteProduct,
    ]
  );

  const combinedData = selectedButton === "posts" ? posts : products;

  return (
    <FlatList
      ref={flatListRef}
      data={combinedData}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <StatusBar hidden={false} />

          {renderHeader()}

          {renderCarousel()}

          {renderFarmerTool()}

          {renderFarmerGuide()}

          {renderSwitchButton()}

          <CustomAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            onClose={() => setAlertVisible(false)}
          />
        </View>
      }
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          {loadingPosts || loadingProducts ? (
            <ActivityIndicator size={30} color="green" />
          ) : (
            <Text style={styles.emptyMessage}>
              {selectedButton === "posts"
                ? "No posts available."
                : "No products available."}
            </Text>
          )}
        </View>
      }
      onRefresh={selectedButton === "posts" ? refetchPosts : refetchProducts}
      refreshing={loadingPosts || loadingProducts}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    padding: 5,
  },
  carouselSection: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 10,
  },
  carouselItem: {
    width: width * 0.9,
    height: width * 0.5,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  textContainer: {
    position: "absolute",
    left: 2,
    bottom: 5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    padding: 5,
    borderRadius: 5,
  },
  carouselText: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#333",
  },
  carouselDescription: {
    fontSize: 11,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    width: "100%",
  },
  marketplaceButton: {
    paddingVertical: 10,
    borderRadius: 5,
    width: width * 0.4,
  },
  marketplaceText: {
    fontSize: width * 0.035,
    fontFamily: "bold",
    color: "black",
  },
  notificationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  notificationText: {
    color: "green",
    fontFamily: "bold",
    fontSize: width * 0.035,
    marginLeft: 5,
  },
  notificationBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#FFF",
    fontSize: 12,
    fontFamily: "bold",
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  dot: {
    margin: 5,
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  sectionTool: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 20,
  },
  sectionHeaderTool: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  sectionTitleTool: {
    fontSize: 14,
    fontFamily: "bold",
    color: "black",
  },
  questioncircleTool: {
    marginLeft: 5,
    marginBottom: 2,
  },
  questionButtonTool: {
    paddingVertical: 5,
  },
  sectionRowTool: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 10,
  },
  sectionItemTool: {
    alignItems: "center",
    paddingVertical: 10,
    width: "22%",
    justifyContent: "center",
  },
  sectionImageTool: {
    width: 45,
    height: 45,
  },
  nameContainerTool: {
    alignItems: "center",
    marginTop: 5,
  },
  sectionItemFirstTextTool: {
    lineHeight: 14,
    fontSize: width * 0.03,
    fontFamily: "regular",
  },
  sectionItemSecondTextTool: {
    lineHeight: 14,
    fontSize: width * 0.03,
    fontFamily: "regular",
  },
  sectionGuide: {
    paddingHorizontal: 20,
  },
  sectionHeaderGuide: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  sectionTitleGuide: {
    fontSize: width * 0.035,
    fontFamily: "bold",
    color: "black",
  },
  questioncircleGuide: {
    marginLeft: 5,
    marginBottom: 2,
  },
  questionButtonGuide: {
    paddingVertical: 5,
  },
  sectionRowGuide: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10,
  },
  sectionItemGuide: {
    alignItems: "center",
    paddingVertical: 10,
    width: "25%",
    justifyContent: "center",
  },
  sectionImageGuide: {
    width: 45,
    height: 45,
  },
  nameContainerGuide: {
    alignItems: "center",
    marginTop: 5,
  },
  sectionItemFirstTextGuide: {
    lineHeight: 14,
    fontSize: 12,
    fontFamily: "regular",
  },
  sectionItemSecondTextGuide: {
    lineHeight: 14,
    fontSize: 12,
    fontFamily: "regular",
  },
  bottomButtonsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  bottomButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 5,
    padding: 10,
  },
  bottomButtonText: {
    fontSize: width * 0.035,
    fontFamily: "medium",
  },
  postItem: {
    marginBottom: 10,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  postInfo: {
    marginTop: 10,
    fontSize: width * 0.03,
    fontFamily: "medium",
    color: "#555",
  },
  postLocation: {
    lineHeight: 13,
    fontSize: width * 0.03,
    fontFamily: "medium",
    color: "#555",
  },
  postTitle: {
    marginTop: 10,
    fontSize: width * 0.04,
    fontFamily: "medium",
    color: "#333",
  },
  postInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -10,
  },
  dotsButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  inlineMenuContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
    marginTop: 4,
    elevation: 2,
  },
  inlineMenuItem: {
    padding: 8,
    alignItems: "center",
  },
  inlineMenuContainerProduct: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
    marginTop: 4,
    elevation: 2,
  },
  inlineMenuProductItem: {
    padding: 8,
    alignItems: "center",
  },
  grandLine: {
    marginBottom: 10,
    height: 2,
    width: "100%",
    backgroundColor: "#ddd",
  },
  menuText: {
    fontFamily: "regular",
  },
  imageContainer: {
    marginTop: 10,
  },
  singleImage: {
    width: "100%",
    height: 250,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  doubleImageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  doubleImage: {
    width: "50%",
    height: 250,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  gridImage: {
    width: "33%",
    height: 250,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  moreImagesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageCountText: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: width * 0.05,
    fontFamily: "bold",
    color: "#66BB6A",
  },
  noImagesText: {
    fontSize: width * 0.035,
    color: "#9E9E9E",
  },
  productContainer: {
    marginBottom: 10,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  productInfoContainer: {
    flexDirection: "column",
  },
  priceContainer: {
    alignItems: "center",
  },
  productMenuWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  dotsButtonProduct: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  noImageContainer: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  noImageText: {
    color: "#888",
    fontSize: 14,
    fontFamily: "regular",
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
  productImage: {
    width: "100%",
    height: 250,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  productName: {
    textAlign: "center",
    fontSize: 15,
    fontFamily: "medium",
    marginTop: 10,
  },
  productPrice: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "medium",
    color: "#333",
  },
  productDate: {
    fontSize: width * 0.03,
    fontFamily: "medium",
    color: "#555",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  emptyMessage: {
    fontSize: width * 0.035,
    color: "gray",
    textAlign: "center",
    fontFamily: "regular",
  },
  infoMessage: {
    backgroundColor: "white",
    position: "absolute",
    width: "90%",
    height: "auto",
    borderRadius: 5,
    padding: 10,
    marginBottom: 1,
    elevation: 3,
    zIndex: 10,
  },
  infoText: {
    fontFamily: "regular",
    fontSize: 12,
    color: "#333",
  },
});

export default ProductScreen;
