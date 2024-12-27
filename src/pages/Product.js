import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator, Image, StatusBar, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useFocusEffect } from '@react-navigation/native';
import Data from '../support/Data';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns'
import 'react-native-get-random-values'; 
import { useAuth } from '../hooks/useAuth'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, fetchProducts } from '../utils/api';
import { setSelectedPost, setSelectedProduct, clearSelectedPost, clearSelectedProduct } from '../store/productSlice';
import { useQuery } from '@tanstack/react-query';

class PostItem extends React.PureComponent {
  render() {
    const { item, user, formatDate, toggleMenu, handleEdit, handleDeletePost, selectedPost } = this.props;

    return (
      <View>
        <View style={styles.postInfoContainer}>
          <Text style={styles.postInfo}>You • {formatDate(item.created_at)}</Text>
          <TouchableOpacity onPress={() => toggleMenu(item)}>
            <Icon name="dots-horizontal" size={25} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={styles.postLocation}>
          Located in {item.location} • Contact Number #0{user?.phone_number || '------'}
        </Text>

        {item.description && <Text style={styles.postTitle}>{item.description}</Text>}

        {item.images && item.images.length > 0 ? (
          <View style={styles.imageContainer}>
            <View>
              {item.images.length === 1 ? (
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.singleImage}
                  resizeMode="cover"
                  onLoad={() => console.log('Image loaded successfully')}
                  onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
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
            <TouchableOpacity onPress={handleEdit} style={styles.inlineMenuItem}>
              <Icon name="pencil" size={20} color="black" /> 
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeletePost} style={styles.inlineMenuItem}>
              <Icon name="trash-can" size={20} color="black" /> 
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.line} />
      </View>
    );
  }
}

class ProductItem extends React.PureComponent {
  render() {
    const { item, formatDate, formatPrice, toggleMenuProduct, selectedProduct, handleEditProduct, handleDeleteProduct } = this.props;

    return (
      <View>
        <View style={styles.productMenuWrapper}>
          <Text style={styles.productDate}>Created on {formatDate(item.created_at)}</Text>
          <TouchableOpacity onPress={() => toggleMenuProduct(item)} style={styles.dotsButton}>
            <Icon name="dots-horizontal" size={25} color="black" />
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfoContainer}>
          <TouchableOpacity style={styles.productButton}>
            <Text style={styles.productName}>{item.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>₱ {formatPrice(item.price)}</Text>
              <Text style={styles.textBalls}>••••••</Text>
            </View>
          </TouchableOpacity>
        </View>
        {selectedProduct && selectedProduct.id === item.id && (
          <View style={styles.inlineMenuContainer}>
            <TouchableOpacity onPress={handleEditProduct} style={styles.inlineMenuItem}>
              <Icon name="pencil" size={20} color="black" />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteProduct} style={styles.inlineMenuItem}>
              <Icon name="trash-can" size={20} color="black" />
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.productline} />
      </View>
    );
  }
}

const { width } = Dimensions.get('window');

const ProductScreen = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation();
  const [selectedButton, setSelectedButton] = useState('posts');
  const [menuTimeout, setMenuTimeout] = useState(null); 
  const menuTimeoutRef = useRef(null);
  const flatListRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 }); 
      }

      refetchPosts();
      refetchProducts();

    }, [])
  );

  const { data: posts = [], isLoading: loadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ['posts', user?.id_user],
    queryFn: () => fetchPosts(user.id_user),
    enabled: !!user, 
    staleTime: 1000 * 60 * 5, 
  });

  const { data: products = [], isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['products', user?.id_user],
    queryFn: () => fetchProducts(user.id_user),
    enabled: !!user, 
    staleTime: 1000 * 60 * 5, 
  });

  const selectedPost = useSelector((state) => state.product.selectedPost);
  const selectedProduct = useSelector((state) => state.product.selectedProduct);

  const formatDate = (date) => {
    try {
      return format(date ? parseISO(date) : new Date(), "EEEE • MMMM d, yyyy • hh:mm a");
    } catch (error) {
      return 'Invalid Date';
    }
  };  

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    };
  }, []);

  const handleDeletePost = () => {
    if (selectedPost) {
      setPosts(posts.filter(p => p.id !== selectedPost.id)); 
      dispatch(clearSelectedPost());
    }
  };

  const handleEdit = async () => {
    if (selectedPost) {

      navigation.navigate('Post', { 
        postToEdit: { 
          ...selectedPost, 
          images: selectedPost.images.map(image => ({ uri: image })) 
        } 
      });
  
      dispatch(clearSelectedPost());
    }
  };

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      setProducts((prevProducts) => 
        prevProducts.filter(product => product.id !== selectedProduct.id)
      );
  
      dispatch(clearSelectedProduct());
    }
  };

  const handleEditProduct = () => {
    if (selectedProduct) {
      navigation.navigate('ProductPost', { 
        productToEdit: { 
          ...selectedProduct, 
          images: selectedProduct.images.map(image => ({ uri: image })) 
        } 
      });
      dispatch(clearSelectedProduct());
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
      clearTimeout(menuTimeout); 
    } else {
      dispatch(setSelectedProduct(productItem));
      clearTimeout(menuTimeout); 

      const timeoutId = setTimeout(() => {
        dispatch(clearSelectedProduct());
      }, 5000); 
      setMenuTimeout(timeoutId); 
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(menuTimeout);
    };
  }, [menuTimeout]);

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.marketplaceButton} onPress={() => navigation.navigate('Marketplace')}>
          <Text style={styles.marketplaceText}>Go to marketplace</Text>
        </TouchableOpacity>

        <View style={styles.notificationButton}>
          <TouchableOpacity>
            <Text style={styles.notificationText}>Notification</Text>
          </TouchableOpacity>
          <Icon name="bell" size={24} color="green" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>3</Text>
          </View>
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
              <Image source={{ uri: item.imageUrl }} style={styles.carouselImage} />
              <View style={styles.textContainer}>
                <Text style={styles.carouselText}>{item.title}</Text>
                <Text style={styles.carouselDescription}>{item.description}</Text>
              </View>
              <ActivityIndicator size={30}  color="green" />
            </View>
          )}
        />
        <View style={styles.dotContainer}>
          {Data.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, { backgroundColor: activeIndex === index ? '#4AF146' : '#4CAF50' }]}
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
            <AntDesign name="questioncircleo" size={14} color="black" style={styles.questioncircleTool} />
          </TouchableOpacity>
        </View>

        {/* Section Items - now in the same row */}
        <View style={styles.sectionRowTool}>
          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => navigation.navigate('Post')}
          >
            <Image source={require('../../assets/product/social-media.png')} style={styles.sectionImageTool} />
            <View style={styles.nameContainerTool}>
              <Text style={styles.sectionItemFirstTextTool}>Create</Text>
              <Text style={styles.sectionItemSecondTextTool}>Post</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Image source={require('../../assets/product/calendar.png')} style={styles.sectionImageTool} />
            <View style={styles.nameContainerTool}>
              <Text style={styles.sectionItemFirstTextTool}>Planting</Text>
              <Text style={styles.sectionItemSecondTextTool}>Calendar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => navigation.navigate('ProductPost')}
          >
            <Image source={require('../../assets/product/vegetable.png')} style={styles.sectionImageTool} />
            <View style={styles.nameContainerTool}>
              <Text style={styles.sectionItemFirstTextTool}>Product</Text>
              <Text style={styles.sectionItemSecondTextTool}>For Sale</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => navigation.navigate('TraceAndTrack')}
          >
            <Image source={require('../../assets/product/tracking.png')} style={styles.sectionImageTool} />
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
            <AntDesign name="questioncircleo" size={14} color="black" style={styles.questioncircleGuide} />
          </TouchableOpacity>
        </View>

        {/* Section Items - now in the same row */}
        <View style={styles.sectionRowGuide}>
          <TouchableOpacity
            style={styles.sectionItemGuide}
            onPress={() => navigation.navigate('Weather')}
          >
            <Image source={require('../../assets/product/rain-burst.png')} style={styles.sectionImageGuide} />
              <View style={styles.nameContainerGuide}>
                <Text style={styles.sectionItemFirstTextGuide}>Weather</Text>
                <Text style={styles.sectionItemSecondTextGuide}>Alerts</Text>
              </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemGuide}
            onPress={() => navigation.navigate('AgricultureTips')}
          >
            <Image source={require('../../assets/product/lightbulb.png')} style={styles.sectionImageGuide} />
              <View style={styles.nameContainerGuide}>
                <Text style={styles.sectionItemFirstTextGuide}>Agricultural</Text>
                <Text style={styles.sectionItemSecondTextGuide}>Tips</Text>
              </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemGuide}
            onPress={() => navigation.navigate('MarketPrice')}
          >
            <Image source={require('../../assets/product/profit.png')} style={styles.sectionImageGuide} />
              <View style={styles.nameContainerGuide}>
                <Text style={styles.sectionItemFirstTextGuide}>Agri-Fishery</Text>
                <Text style={styles.sectionItemSecondTextGuide}>Market Prices</Text>
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
            onPress={() => setSelectedButton('posts')}
          >
            <Text
              style={[
                styles.bottomButtonText,
                { color: selectedButton === 'posts' ? 'green' : 'black' },
              ]}
            >
              See my posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => setSelectedButton('products')}
          >
            <Text
              style={[
                styles.bottomButtonText,
                { color: selectedButton === 'products' ? 'green' : 'black' },
              ]}
            >
              See my products
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.grandLine}/>
      </>
    );
  };

  const renderItem = useCallback(({ item }) => {
    return selectedButton === 'posts' ? (
      <PostItem
        item={item}
        user={user}
        formatDate={formatDate}
        toggleMenu={toggleMenu}
        handleEdit={handleEdit}
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
        handleEditProduct={handleEditProduct}
        handleDeleteProduct={handleDeleteProduct}
      />
    );
  }, [selectedButton, user, formatDate, formatPrice, toggleMenu, handleEdit, handleDeletePost, selectedPost, toggleMenuProduct, selectedProduct, handleEditProduct, handleDeleteProduct]);

  const combinedData = selectedButton === 'posts' ? posts : products;

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

        </View>
      }
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          {loadingPosts || loadingProducts ? (
            <ActivityIndicator size={30} color="green" />
          ) : (
            <Text style={styles.emptyMessage}>
              {selectedButton === 'posts' ? 'No posts available.' : 'No products available.'}
            </Text>
          )}
        </View>
      }
      onRefresh={selectedButton === 'posts' ? refetchPosts : refetchProducts}
      refreshing={loadingPosts || loadingProducts}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    padding: 5,
  },
  carouselSection: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
  },
  carouselItem: {
    width: width * 0.9,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  textContainer: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  carouselText: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#333',
  },
  carouselDescription: {
    fontSize: width * 0.03,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%',
  },
  marketplaceButton: {
    paddingVertical: 10,
    borderRadius: 5,
    width: width * 0.4,
  },
  marketplaceText: {
    fontSize: width * 0.035,
    fontFamily: 'bold',
    color: 'black',
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  notificationText: {
    color: 'green',
    fontFamily: 'bold',
    fontSize: width * 0.035,
    marginLeft: 5,
  },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  dot: {
    margin: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  sectionTool: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 20,
  },
  sectionHeaderTool: {
    flexDirection: 'row',            
    alignItems: 'center',            
    width: '100%',                           
  },
  sectionTitleTool: {
    fontSize: 14,
    fontFamily: 'bold',
    color: 'black',
  },
  questioncircleTool: {
    marginLeft: 5,
    marginBottom: 2,        
  },
  questionButtonTool: {
    paddingVertical: 5,
  },
  sectionRowTool: {
    flexDirection: 'row',         
    justifyContent: 'space-between',
    flexWrap: 'wrap',            
    marginTop: 10,
  },
  sectionItemTool: {
    alignItems: 'center',        
    paddingVertical: 10,
    width: '22%',                
    justifyContent: 'center',  
  },
  sectionImageTool: {
    width: 45,
    height: 45,
  },
  nameContainerTool: {
    alignItems: 'center', 
    marginTop: 5,
  },
  sectionItemFirstTextTool: {
    lineHeight: 14,
    fontSize: width * 0.03,
    fontFamily: 'regular',
  },
  sectionItemSecondTextTool: {
    lineHeight: 14,
    fontSize: width * 0.03,
    fontFamily: 'regular',
  },
  sectionGuide: {
    paddingHorizontal: 20,
  },
  sectionHeaderGuide: {
    flexDirection: 'row',            
    alignItems: 'center',            
    width: '100%',                           
  },
  sectionTitleGuide: {
    fontSize: width * 0.035,
    fontFamily: 'bold',
    color: 'black',
  },
  questioncircleGuide: {
    marginLeft: 5,
    marginBottom: 2,        
  },
  questionButtonGuide: {
    paddingVertical: 5,
  },
  sectionRowGuide: {
    flexDirection: 'row',         
    flexWrap: 'wrap',                
    marginTop: 10,
    gap: 10,                          
  },
  sectionItemGuide: {
    alignItems: 'center',        
    paddingVertical: 10,
    width: '25%',                    
    justifyContent: 'center',
  },
  sectionImageGuide: {
    width: 45,
    height: 45,
  },
  nameContainerGuide: {
    alignItems: 'center', 
    marginTop: 5,
  },
  sectionItemFirstTextGuide: {
    lineHeight: 14,
    fontSize: 12,
    fontFamily: 'regular',
  },
  sectionItemSecondTextGuide: {
    lineHeight: 14,
    fontSize: 12,
    fontFamily: 'regular',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
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
    fontFamily: 'medium',
  },
  postsContainer: {
    paddingHorizontal: 20,
  },
  postItem: {
    padding: 5,
  },
  postInfo: {
    fontSize: width * 0.03,
    fontFamily: 'medium',
    color: '#555',
  },
  postLocation: {
    lineHeight: 13,
    fontSize: width * 0.03,
    fontFamily: 'medium',
    color: '#555',
  },
  postTitle: {
    padding: 10,
    fontSize: width * 0.04,
    fontFamily: 'medium',
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  noPostsText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  postInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  menuContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 200,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  inlineMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    marginTop: 4,
    elevation: 2,
  },
  inlineMenuItem: {
    padding: 8,
    alignItems: 'center',
  },
  line: {
    height: 2, 
    width: '100%', 
    backgroundColor: '#ddd', 
    marginTop: 20, 
  },
  productline: {
    height: 2, 
    width: '100%', 
    backgroundColor: '#ddd', 
    marginTop: 10, 
  },
  grandLine: {
    height: 2, 
    width: '100%', 
    backgroundColor: '#ddd',
  },
  menuText: {
    fontFamily: 'regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20, 
    right: 20,
    zIndex: 1, 
  },
  imageIndexText: {
    position: 'absolute',
    top: 60, 
    right: 25,
    color: 'white',
    fontSize: width * 0.04,
    fontFamily: 'bold',
  },
  modalImage: {
    width: width * 0.8,
    height: '100%',
    resizeMode: 'contain',
    marginHorizontal: 20,
  },
  imageContainer: {
    marginTop: 10,
  },
  singleImage: {
    width: '100%',
    height: 250,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  doubleImageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doubleImage: {
    width: '50%',
    height: 250,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  gridImage: {
    width: '33%',
    height: 250,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  moreImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageCountText: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: width * 0.05,
    fontFamily: 'bold',
    color: 'black',
  },
  noImagesText: {
    fontSize: width * 0.035,
    color: '#9E9E9E',
  },
  productContainer: {
    padding: 10,
  },
  productInfoContainer: {
    flexDirection: 'column', 
  },
  priceContainer: { 
    alignItems: 'center',
  },
  productMenuWrapper: {
    padding: 5,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    position: 'relative',
  },
  dotsButton: {
    position: 'absolute', 
    right: 0, 
    bottom: 0,
  },
  productImage: {
    width: '100%', 
    height: 250, 
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productName: {
    textAlign: 'center',
    fontSize: width * 0.05,
    fontFamily: 'medium',
    marginTop: 10,
  },
  productPrice: {
    textAlign: 'center',
    fontSize: width * 0.04,
    fontFamily: 'medium',
  },
  textBalls: {
    fontSize: width * 0.07,
    color: 'gray',
  },
  productDate: {
    fontSize: width * 0.03,
    fontFamily: 'medium',
    color: '#555',
  },
  emptyContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 30, 
  },
  emptyMessage: {
    fontSize: width * 0.035, 
    color: 'gray', 
    textAlign: 'center',
    fontFamily: 'regular', 
  },
});

export default ProductScreen;
