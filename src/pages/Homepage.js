import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StatusBar, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, FlatList, Dimensions, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import quotes from '../support/QuotesData';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPosts } from '../utils/api';
import { setSelectedPost, clearSelectedPost } from '../store/postSlice';
import { useQuery } from '@tanstack/react-query';
import DataInfo from '../support/DataInfo';
import agritechData from '../support/agritechData';
import globaltrendsData from "../support/globaltrendsData";
import agriNewsData from "../support/agriNewsData";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, parseISO } from 'date-fns';

class PostItem extends React.PureComponent {
  render() {
    const { item, user, formatDate, toggleMenu, handleDeletePost, selectedPost, navigation, setIsPostDetailActive } = this.props;

    return (
      <View style={styles.postItem}>
        <View style={styles.postInfoContainer}>
          <Text style={styles.postInfo}>
            {item.id_user === user?.id_user ? 'You' : `${item.first_name || 'Farmer'}`} • {formatDate(item.created_at)}
          </Text>
          <TouchableOpacity onPress={() => toggleMenu(item)}>
            <Icon name="dots-horizontal" size={25} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={styles.postLocation}>
          Located in {item.location || 'Unknown'} • Contact Number #{item.id_user === user?.id_user ? `0${user?.phone_number || '------'}` : `0${item.phone_number || '------'}`}
        </Text>

        {item.description && (
          <TouchableOpacity onPress={() => {
            setIsPostDetailActive(true); 
            navigation.navigate('PostDetail', { post: item });
          }}>
            <Text style={styles.postTitle}>{item .description}</Text>
          </TouchableOpacity>
        )}

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

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const [menuTimeout, setMenuTimeout] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState([]);
  const scrollViewRefs = {
    agritech: useRef(null),
    globalTrends: useRef(null),
    agriNews: useRef(null),
  };
  const menuTimeoutRef = useRef(null);

  const selectedPost = useSelector((state) => state.post.selectedPost);

  const [isPostDetailActive, setIsPostDetailActive] = useState(false);

  const { data: fetchedPosts  = [], isLoading: loadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchAllPosts, 
    enabled: !!user,
    staleTime: 1000 * 60 * 5, 
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 2 * 60 * 1000); 

    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (fetchedPosts .length > 0) {
 
        setPosts(fetchedPosts .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
      setIsLoading(false);
    }, [fetchedPosts])
  );

  useEffect(() => {
    console.log(posts);
  }, [posts]);

  useFocusEffect(
    useCallback(() => {
      if (!isPostDetailActive) {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }

        Object.values(scrollViewRefs).forEach(ref => {
          if (ref.current) {
            ref.current.scrollTo({ x: 0, animated: true });
          }
        });

        refetchPosts();
      }
    }, [isPostDetailActive])
  );

  const changeQuote = () => {
    setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
  };

  useEffect(() => {
    return () => {
      clearTimeout(menuTimeout);
    };
  }, [menuTimeout]);

  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    };
  }, []);

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

  useEffect(() => {
    changeQuote();
  }, [user]);

  const formatDate = (date) => {
    try {
      return format(date ? parseISO(date) : new Date(), "EEEE • MMMM d, yyyy • hh:mm a");
    } catch (error) {
      return 'Invalid Date';
    }
  };  

  const handleDeletePost = (postId) => {
    if (postId) {
      setPosts(posts.filter(p => p.id !== postId.id)); 
      dispatch(clearSelectedPost());
    }
  };

  const handleNeedHelp = () => {
    Alert.alert("Need Help?", "Contact us at support@farmnamin.com");
  };

  const handleScrollEnd = (ref) => (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = width * 0.97 + 5; 
    const index = Math.round(contentOffsetX / itemWidth);
    const targetX = index * itemWidth; 

    ref.current.scrollTo({ x: targetX, animated: true }); 
  };

  const handleNewsClick = (link) => {
    navigation.navigate("WebBrowser", { link: link });
  };

  const renderNewsSection = (data, title, ref) => {
    return (
      <View style={styles.newsSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          ref={ref}
          onScrollEndDrag={handleScrollEnd(ref)}
        >
          {data.map((item, index) => (
            <View key={index} style={styles.newsItem}>
              <Image 
                source={item.image} 
                style={styles.newsImage} 
                resizeMode="cover" 
              />
              <TouchableOpacity
                onPress={() => handleNewsClick(item.link)}
                style={styles.newsTitleContainer}
              >
                <Text style={styles.newsTitle}>{item.title} • {item.source}</Text>
              </TouchableOpacity>
              <Text style={styles.newsDescription}>{item.description}...</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAgritechNews = () => renderNewsSection(agritechData, "🚜 Agriculture Latest Technology", scrollViewRefs.agritech);
  const renderGlobalAgri = () => renderNewsSection(globaltrendsData, "🌍 Global Agriculture Trends", scrollViewRefs.globalTrends);
  const renderAgriNews = () => renderNewsSection(agriNewsData, "🌾 Agriculture News", scrollViewRefs.agriNews);

  const renderCarousel = () => { 
    return (
      <View style={styles.carouselSection}>
        <Carousel
          loop
          autoPlay
          autoPlayInterval={4000}
          width={width * 0.9}
          height={200}
          data={DataInfo}
          scrollAnimationDuration={2000}
          onSnapToItem={(index) => setActiveIndex(index)}
          renderItem={({ item }) => (
            <View style={styles.carouselItem}>
              <Image 
                source={item.imageUrl} 
                style={styles.carouselImage} 
                resizeMode="cover" 
              />
            </View>
          )}
        />
        <View style={styles.dotContainer}>
          {DataInfo.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, { backgroundColor: activeIndex === index ? '#4AF146' : '#4CAF50' }]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>

        <View style={styles.greetingContainer}>

          <Text style={styles.greetingText}>Hello, {user?.first_name.trim() || 'User'}!</Text>

          <Text style={styles.quote}>
            {quotes[quoteIndex]} 
          </Text>
        </View>

        <TouchableOpacity style={styles.helpContainer} onPress={() => navigation.navigate('Faqs')}>
          <Icon name="account-group" size={30} color="green" />
          <Text style={styles.helpText}>Need Help?</Text>
        </TouchableOpacity>

      </View>
    );
  };
  
  const renderPostItem = ({ item }) => {
    return (
      <PostItem
        item={item}
        user={user}
        formatDate={formatDate}
        toggleMenu={toggleMenu}
        handleDeletePost={() => handleDeletePost(item.id)}
        selectedPost={selectedPost}
        navigation={navigation} 
        setIsPostDetailActive={setIsPostDetailActive}
      />
    );
  };

  const handleRefresh = () => {
    refetchPosts().then(() => {
      if (fetchedPosts.length > 0) {
        setPosts(fetchedPosts);
      }
    });
  };

  const handleLoadMore = () => {
    if (!loadingMore) {
      setLoadingMore(true);
      refetchPosts().then((newPosts) => {
        if (newPosts.length > 0) {
          setPosts(prevPosts => {
            const combinedPosts = [...prevPosts, ...newPosts];
            const latestPosts = combinedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return latestPosts.slice(0, 10); 
          });
        }
        setLoadingMore(false);
      });
    }
  };

  const renderIntroDailyFeeds = () => {
    return (
      <View>
        <View style={styles.dailyLine}/>
        <Text style={styles.dailyText}>Daily Feeds</Text>
        <View style={styles.dailyLine}/>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={posts}
      renderItem={renderPostItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <StatusBar hidden={false} />
          {renderHeader()}

          {renderCarousel()}

          {renderAgritechNews()}

          {renderGlobalAgri()}
          
          {renderAgriNews()}

          {renderIntroDailyFeeds()}
        </View>
      }
      ListEmptyComponent={
        loadingPosts ? (
          <ActivityIndicator size="large" color="green" />
        ) : (
          <Text style={styles.emptyMessage}>No recent posts today.</Text>
        )
      }
      refreshing={loadingPosts}
      onRefresh={handleRefresh}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore ? <ActivityIndicator size="large" color="green" /> : null}
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
    marginTop: 10,
  },
  carouselItem: {
    width: '100%',
    height: '100%', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: '100%', 
    height: '100%', 
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  dot: {
    margin: 5,
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
  },
  helpContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 16,
    fontFamily: "medium",
    color: "#333",
    marginBottom: 5,
  },
  helpText: {
    fontSize: 12,
    fontFamily: "regular",
    color: "#333",
  },
  quoteContainer: {
    width: '100%',
    height: '100%',
  },
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
    textAlign: "left", 
  },
  dailyText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: "medium",
    color: "#333",
  },
  dailyLine: {
    height: 3, 
    width: '100%', 
    backgroundColor: '#ddd', 
  },
  scrollContent: {
    padding: 20,
    paddingTop: 160,
  },
  activeDot: {
    backgroundColor: "#28a745",
  },
  inactiveDot: {
    backgroundColor: "#bbb",
  },
  carouselCaption: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16, 
    marginBottom: 5,
    fontFamily: 'medium',
    color: "#333",
  },
  newsSection: {
    marginRight: -5,
    marginBottom: 20,
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  newsItem: {
    padding: 5,
    overflow: 'hidden',
    width: width * 0.97,
    marginRight: 5,
  },
  newsImage: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  newsTitle: {
    fontSize: 17,
    fontFamily: 'medium',
    marginTop: 10,
  },
  newsDescription: {
    fontSize: 12,
    fontFamily: 'regular',
    color: "#555",
  },
  dailyFeedSection: {
    marginBottom: 20,
  },
  dailyFeedItem: {
    marginBottom: 15,
  },
  feedImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  dailyFeedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  dailyFeedDescription: {
    fontSize: 14,
    marginTop: 5,
    color: "#555",
  },
  trendsSection: {
    marginBottom: 20,
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
  line: {
    height: 3, 
    width: '100%', 
    backgroundColor: '#ddd', 
    marginTop: 20, 
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
    fontFamily: 'regular',
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
    fontSize: width * 0.06,
    fontFamily: 'bold',
    color: '#4CAF50',
  },
  noImagesText: {
    fontSize: width * 0.035,
    color: '#9E9E9E',
  },
  emptyMessage: {
    fontSize: width * 0.040, 
    color: 'gray', 
    textAlign: 'center',
    fontFamily: 'regular', 
  },
}); 

export default HomeScreen;