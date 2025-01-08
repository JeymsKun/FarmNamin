import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Image,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { setProducts } from "../store/allProductSlice";
import fetchUserFavorites from "../utils/fetchUserFavorites";
import fetchAllProduct from "../utils/fetchAllProduct";
import { useQuery } from "@tanstack/react-query";
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
          console.error("Video URI:", videoUri);
        }
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.item !== this.props.item ||
      nextProps.router !== this.props.router ||
      nextState.thumbnail !== this.state.thumbnail
    );
  }

  render() {
    const {
      item,
      router,
      setIsProductDetailActive,
      formatPrice,
      productNameFontSize,
      productPriceFontSize,
      setSelectedProduct,
      setSelectedFarmer,
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
            setSelectedProduct(item);
            setSelectedFarmer(item.users);
            router.push("/pages/FarmerProductViewer");
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

const ProductItemWrapper = (props) => {
  const { setSelectedProduct, setSelectedFarmer } = useGlobalState();
  return (
    <ProductItem
      {...props}
      setSelectedProduct={setSelectedProduct}
      setSelectedFarmer={setSelectedFarmer}
    />
  );
};

const { width } = Dimensions.get("window");

const Marketplace = () => {
  const { user } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState("All");
  const [isProductDetailActive, setIsProductDetailActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const flatListRef = useRef(null);
  const scrollViewRef = useRef(null);

  useRealTimeUpdates(user?.id_user);

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

  const {
    data: fetchProducts = [],
    isLoading: loadingProducts,
    refetch: refetchAllProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProduct,
    staleTime: 1000 * 60 * 5,
    onSuccess: (data) => {
      console.log("Fetched products:", data);
      dispatch(setProducts(data));
    },
  });

  const { data: favoriteProducts = [], refetch: refetchFavorites } = useQuery({
    queryKey: ["favorites", user?.id_user],
    queryFn: () => fetchUserFavorites(user.id_user),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  useFocusEffect(
    useCallback(() => {
      if (!isProductDetailActive) {
        refetchAllProducts();
        if (user) {
          refetchFavorites();
        }
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }
      }
    }, [isProductDetailActive, user, refetchAllProducts, refetchFavorites])
  );

  const filteredProducts = fetchProducts.filter((product) => {
    const matchesCategory =
      activeCategory === "All" ||
      (activeCategory === "Recent" &&
        new Date(product.created_at).toDateString() ===
          new Date().toDateString()) ||
      product.category === activeCategory;

    const matchesSearch = product.name.includes(searchQuery);

    const availableMatch = product.available.match(/(\d+(\.\d+)?)/);
    const availableQuantity = availableMatch
      ? parseFloat(availableMatch[0])
      : 0;

    const isAvailable = availableQuantity > 0 && !product.done_product;

    return matchesCategory && matchesSearch && isAvailable;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerWrapper}>
          <Text style={styles.headerText}>Welcome to Marketplace</Text>
        </View>
      </View>
    );
  };

  const renderSearch = () => {
    const uniqueCategories = Array.from(
      new Set(fetchProducts.map((product) => product.category))
    );
    const categoriesToDisplay = ["All", "Recent", ...uniqueCategories];

    return (
      <View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search product"
            placeholderTextColor="#fff"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              const matchedCategory = categoriesToDisplay.find(
                (category) => category.toLowerCase() === text.toLowerCase()
              );
              if (matchedCategory) {
                setActiveCategory(matchedCategory);
                const index = categoriesToDisplay.indexOf(matchedCategory);
                const categoryOffset = index * 100;
                scrollViewRef.current.scrollTo({
                  x: categoryOffset,
                  animated: true,
                });
              }
            }}
          />
          {searchQuery.length > 6 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.closeIconContainer}
            >
              <Ionicons name="close-circle" size={30} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.searchIconContainer}>
            <Ionicons name="search-outline" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.fixedCategoryContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilterContainer}
          >
            {categoriesToDisplay.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryFilter,
                  activeCategory === category && styles.activeCategoryFilter,
                ]}
                onPress={() => {
                  setActiveCategory(category);
                }}
              >
                <Text
                  style={[
                    styles.categoryFilterText,
                    activeCategory === category &&
                      styles.activeCategoryFilterText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {searchQuery &&
          loadingProducts &&
          !categoriesToDisplay.some((category) =>
            category.toLowerCase().includes(searchQuery.toLowerCase())
          ) && <Text style={styles.noCategoryText}>No category found.</Text>}
      </View>
    );
  };

  const handleRefresh = () => {
    refetchAllProducts();
  };

  const renderItem = ({ item }) => {
    const { productNameFontSize, productPriceFontSize } = getFontSizes(item);
    const isFavorite = favoriteProducts.some(
      (fav) => fav.product.id === item.id && fav.is_bookmarked
    );

    return (
      <ProductItemWrapper
        item={item}
        router={router}
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
      data={filteredProducts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      numColumns={2}
      key={`columns_${2}`}
      ListHeaderComponent={
        <View>
          <StatusBar hidden={false} />
          {renderHeader()}
          {renderSearch()}
        </View>
      }
      onRefresh={handleRefresh}
      refreshing={loadingProducts}
      ListEmptyComponent={
        loadingProducts ? (
          <Text style={styles.noFoundText}>Loading products...</Text>
        ) : (
          <Text style={styles.noFoundText}>No products found.</Text>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: width * 0.04,
    fontFamily: "medium",
    color: "#333",
    marginRight: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 40,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    fontFamily: "regular",
    color: "#fff",
  },
  searchIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  closeIconContainer: {
    marginRight: 10,
  },
  fixedCategoryContainer: {
    marginBottom: 8,
  },
  categoryFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryFilter: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 15,
  },
  activeCategoryFilter: {
    backgroundColor: "#4CAF50",
  },
  categoryFilterText: {
    fontSize: 13,
    fontFamily: "regular",
    color: "#666",
  },
  activeCategoryFilterText: {
    color: "#fff",
    fontFamily: "regular",
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
  noImageText: {
    color: "#888",
    fontSize: 14,
    fontFamily: "regular",
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
    fontSize: 14,
    fontFamily: "medium",
    textAlign: "center",
  },
  productPrice: {
    fontSize: 15,
    fontFamily: "regular",
    textAlign: "center",
  },
  noFoundText: {
    margin: 50,
    fontSize: width * 0.04,
    color: "gray",
    textAlign: "center",
    fontFamily: "regular",
  },
  noCategoryText: {
    margin: 50,
    fontSize: width * 0.04,
    color: "gray",
    textAlign: "center",
    fontFamily: "regular",
  },
});

export default Marketplace;
