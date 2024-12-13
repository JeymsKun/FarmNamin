import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator, Image, StatusBar, TouchableOpacity, ScrollView, Modal } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import Data from '../support/Data';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns'
import 'react-native-get-random-values'; 
import { v4 as uuidv4 } from 'uuid';

const { width } = Dimensions.get('window');

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, 
});

const ProductScreen = ({ route }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation();
  const [selectedButton, setSelectedButton] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [menuTimeout, setMenuTimeout] = useState(null); 
  const menuTimeoutRef = useRef(null);
  const { post, newProduct, updatedPost, updatedProduct } = route.params || {};

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
    if (newProduct) {
      const productWithDate = { ...newProduct, id: uuidv4(), date: new Date().toISOString() };
      setProducts((prevProducts) => [...prevProducts, productWithDate]);
    }
  }, [newProduct]);

  useEffect(() => {
    if (post) {
      const postWithId = { ...post, id: uuidv4(), date: new Date().toISOString() };
      setPosts((prevPosts) => [...prevPosts, postWithId]);
    }
  }, [post]);

  useEffect(() => {
    if (updatedProduct) {
      setProducts((prevProducts) => {
        const index = prevProducts.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          const updatedProducts = [...prevProducts];
          updatedProducts[index] = { ...updatedProduct, date: new Date().toISOString() };
          return updatedProducts;
        } else {
          return [...prevProducts, { ...updatedProduct, date: new Date().toISOString() }];
        }
      });
    }
  }, [updatedProduct]);

  useEffect(() => {
    if (updatedPost) {
      setPosts((prevPosts) => {
        const index = prevPosts.findIndex(p => p.id === updatedPost.id);
        if (index !== -1) {
          const updatedPosts = [...prevPosts];
          updatedPosts[index] = { ...updatedPost, date: new Date().toISOString() };
          return updatedPosts;
        } else {
          return [...prevPosts, { ...updatedPost, date: new Date().toISOString() }];
        }
      });
    }
  }, [updatedPost]);

  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    };
  }, []);

  const handleDelete = () => {
    if (selectedPost) {
      setPosts(posts.filter(p => p.id !== selectedPost.id)); 
      setSelectedPost(null);
    }
  };

  const handleEdit = () => {
    if (selectedPost) {
      navigation.navigate('Post', { 
        postToEdit: { 
          ...selectedPost, 
          images: selectedPost.images.map(image => ({ uri: image })) 
        } 
      });
      setSelectedPost(null);
    }
  };

  const handleDeleteProduct = () => {
    if (selectedProduct) {

      setProducts((prevProducts) => 
        prevProducts.filter(product => product.id !== selectedProduct.id)
      );
  
      setSelectedProduct(null);
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
      setSelectedProduct(null);
    }
  };

  const toggleMenu = (postItem) => {
    if (selectedPost && selectedPost.id === postItem.id) {
      setSelectedPost(null); 
      clearTimeout(menuTimeout); 
    } else {
      setSelectedPost(postItem); 
      clearTimeout(menuTimeout); 
      
      const timeoutId = setTimeout(() => {
        setSelectedPost(null);
      }, 5000); 
      setMenuTimeout(timeoutId); 
    }
  };

  const toggleMenuProduct = (productItem) => {
    if (selectedProduct && selectedProduct.id === productItem.id) {
      setSelectedProduct(null); 
      clearTimeout(menuTimeout); 
    } else {
      setSelectedProduct(productItem); 
      clearTimeout(menuTimeout); 

      const timeoutId = setTimeout(() => {
        setSelectedProduct(null);
      }, 5000); 
      setMenuTimeout(timeoutId); 
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(menuTimeout);
    };
  }, [menuTimeout]);

  const openImageModal = (images) => {
    setSelectedImages(images); 
    setIsModalVisible(true); 
  };

  const closeImageModal = () => {
    setIsModalVisible(false); 
    setSelectedImages([]); 
  };

  const handleScroll = (event) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    if (contentHeight - contentOffsetY <= layoutHeight + 50) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} onScroll={handleScroll} scrollEventThrottle={16}>
      <StatusBar hidden={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.marketplaceButton}>
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

      {/* Carousel Section */}
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

      {/* Farmer's Tool Section */}
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
            <Image source={require('../../assets/social-media.png')} style={styles.sectionImageTool} />
              <View style={styles.nameContainerTool}>
                <Text style={styles.sectionItemFirstTextTool}>Create</Text>
                <Text style={styles.sectionItemSecondTextTool}>Post</Text>
              </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Image source={require('../../assets/calendar.png')} style={styles.sectionImageTool} />
              <View style={styles.nameContainerTool}>
                <Text style={styles.sectionItemFirstTextTool}>Planting</Text>
                <Text style={styles.sectionItemSecondTextTool}>Calendar</Text>
              </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => navigation.navigate('ProductPost')}
          >
            <Image source={require('../../assets/vegetable.png')} style={styles.sectionImageTool} />
              <View style={styles.nameContainerTool}>
                <Text style={styles.sectionItemFirstTextTool}>Product</Text>
                <Text style={styles.sectionItemSecondTextTool}>For Sale</Text>
              </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemTool}
            onPress={() => navigation.navigate('Finance')}
          >
            <Image source={require('../../assets/tracking.png')} style={styles.sectionImageTool} />
              <View style={styles.nameContainerTool}>
                <Text style={styles.sectionItemFirstTextTool}>Trace And</Text>
                <Text style={styles.sectionItemSecondTextTool}>Track</Text>
              </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Farmer's Guide Section */}
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
            <Image source={require('../../assets/rain-burst.png')} style={styles.sectionImageGuide} />
              <View style={styles.nameContainerGuide}>
                <Text style={styles.sectionItemFirstTextGuide}>Weather</Text>
                <Text style={styles.sectionItemSecondTextGuide}>Alerts</Text>
              </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemGuide}
            onPress={() => navigation.navigate('Tips')}
          >
            <Image source={require('../../assets/lightbulb.png')} style={styles.sectionImageGuide} />
              <View style={styles.nameContainerGuide}>
                <Text style={styles.sectionItemFirstTextGuide}>Agricultural</Text>
                <Text style={styles.sectionItemSecondTextGuide}>Tips</Text>
              </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sectionItemGuide}
            onPress={() => navigation.navigate('MarketPrice')}
          >
            <Image source={require('../../assets/profit.png')} style={styles.sectionImageGuide} />
              <View style={styles.nameContainerGuide}>
                <Text style={styles.sectionItemFirstTextGuide}>Agri - Fishery</Text>
                <Text style={styles.sectionItemSecondTextGuide}>Market Prices</Text>
              </View>
          </TouchableOpacity>
        </View>
      </View>

        {/* Bottom Buttons */}
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

      {/* Posts Section */}
      {selectedButton === 'posts' && (
        <View style={styles.postsContainer}>
          {posts.map((postItem) => (
            <View style={styles.postItem} key={postItem.id}>
              <View style={styles.postInfoContainer}>
                <Text style={styles.postInfo}>Me • {formatDate(postItem.date)}</Text>
                <TouchableOpacity onPress={() => toggleMenu(postItem)}>
                  <Icon name="dots-horizontal" size={25} color="black" />
                </TouchableOpacity>
              </View>
              <Text style={styles.postLocation}>
                Located in {postItem.location} • Contact Number #{postItem.contact}
              </Text>

              {postItem.nameDescriptionTitle && (
                <Text style={styles.postTitle}>{postItem.nameDescriptionTitle}</Text>
              )}

              {postItem.images && postItem.images.length > 0 ? (
                <View style={styles.imageContainer}>
                  <TouchableOpacity onPress={() => openImageModal(postItem.images)}>
                    {postItem.images.length === 1 ? (
                      <Image
                        source={{ uri: postItem.images[0] }}
                        style={styles.singleImage}
                        resizeMode="cover"
                      />
                    ) : postItem.images.length === 2 ? (
                      <View style={styles.doubleImageContainer}>
                        {postItem.images.map((imageUri, index) => (
                          <Image
                            key={index}
                            source={{ uri: imageUri }}
                            style={styles.doubleImage}
                            resizeMode="cover"
                          />
                        ))}
                      </View>
                    ) : (
                      <View style={styles.moreImagesContainer}>
                        {postItem.images.slice(0, 3).map((imageUri, index) => (
                          <Image
                            key={index}
                            source={{ uri: imageUri }}
                            style={styles.gridImage}
                            resizeMode="cover"
                          />
                        ))}
                        {postItem.images.length > 3 && (
                          <Text style={styles.imageCountText}>
                            + {postItem.images.length - 3}
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.noImagesText}>No images available</Text>
              )}

              {/* Inline Edit/Delete Options */}
              {selectedPost && selectedPost.id === postItem.id && (
                <View style={styles.inlineMenuContainer}>
                
                  {/* Edit Button */}
                  <TouchableOpacity onPress={handleEdit} style={styles.inlineMenuItem}>
                    <Icon name="pencil" size={20} color="black" /> 
                    <Text style={styles.menuText}>Edit</Text>
                  </TouchableOpacity>
                  
                  {/* Delete Button */}
                  <TouchableOpacity onPress={handleDelete} style={styles.inlineMenuItem}>
                    <Icon name="trash-can" size={20} color="black" /> 
                    <Text style={styles.menuText}>Delete</Text>
                  </TouchableOpacity>

                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Product Post Section */}
      {selectedButton === 'products' && (
        <View style={styles.productContainer}>
          {products.map((product) => (
            <View key={product.id} style={styles.productItem}>
              <Text style={styles.productDate}>Created on {formatDate(product.date)}</Text>
                <Image 
                  source={{ uri: product.images[0] }} 
                  style={styles.productImage}
                  resizeMode="cover"
                />
              <View style={styles.productInfoContainer}>
                <TouchableOpacity style={styles.productButton}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>₱ {formatPrice(product.price)}</Text>
                    <TouchableOpacity onPress={() => toggleMenuProduct(product)} style={styles.dotsButton}>
                      <Icon name="dots-horizontal" size={25} color="black" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>

             {/* Inline Edit/Delete Options */}
            {selectedProduct && selectedProduct.id === product.id && (
              <View style={styles.inlineMenuContainer}>
                
                {/* Edit Button */}
                <TouchableOpacity onPress={handleEditProduct} style={styles.inlineMenuItem}>
                  <Icon name="pencil" size={20} color="black" /> 
                  <Text style={styles.menuText}>Edit</Text>
                </TouchableOpacity>
                
                {/* Delete Button */}
                <TouchableOpacity onPress={handleDeleteProduct} style={styles.inlineMenuItem}>
                  <Icon name="trash-can" size={20} color="black" /> 
                  <Text style={styles.menuText}>Delete</Text>
                </TouchableOpacity>

              </View>
            )}

            </View>
          ))}
        </View>
      )}

      {/* Modal for Enlarged Image */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          
          {/* Modal Content */}
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity onPress={closeImageModal} style={styles.closeButton}>
              <Icon name="close" size={30} color="white"/>
            </TouchableOpacity>

            <Text style={styles.imageIndexText}>
              {currentImageIndex + 1}/{selectedImages.length}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedImages.map((imageUri, index) => (
                <Image key={index} source={{ uri: imageUri }} style={styles.modalImage} />
              ))}
            </ScrollView>

          </View>
        </View>
      </Modal>

      {loading && <ActivityIndicator size={30} color="green" />}
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  carouselSection: {
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  carouselDescription: {
    fontSize: 12,
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
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: 'black',
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  notificationText: {
    color: 'green',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
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
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: 'black',
  },
  questioncircleTool: {
    marginLeft: 10,
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
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  sectionItemSecondTextTool: {
    lineHeight: 14,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  sectionGuide: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeaderGuide: {
    flexDirection: 'row',            
    alignItems: 'center',            
    width: '100%',                           
  },
  sectionTitleGuide: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: 'black',
  },
  questioncircleGuide: {
    marginLeft: 10,
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
    width: '22%',                    
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
    fontFamily: 'Poppins-Regular',
  },
  sectionItemSecondTextGuide: {
    lineHeight: 14,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
  },
  bottomButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 5,
    padding: 10,
  },
  bottomButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  postsContainer: {
    paddingHorizontal: 20,
  },
  postItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  postInfo: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  postLocation: {
    lineHeight: 13,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  postTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  postDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
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
  menuText: {
    fontFamily: 'Poppins-Regular',
  },
  imageContainer: {
    marginTop: 10,
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
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
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
    height: 150,
  },
  doubleImageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doubleImage: {
    width: '49%',
    height: 150,
  },
  gridImage: {
    width: '32%',
    height: 150,
  },
  moreImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  imageCountText: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  noImagesText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  productContainer: {
    padding: 10,
  },
  productInfoContainer: {
    flexDirection: 'column', 
  },
  priceContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between', 
  },
  dotsButton: {
    marginLeft: 10, 
  },
  productItem: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%', 
    height: 200, 
  },
  productName: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    marginTop: 10,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginRight: 10, 
    color: '#4CAF50',
  },
  productDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
});

export default ProductScreen;
