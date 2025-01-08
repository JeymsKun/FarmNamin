import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StatusBar,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { useFocusEffect } from "@react-navigation/native";
import useAuth from "../hooks/useAuth";
import quotes from "../data/QuotesData";
import fetchAllPosts from "../utils/fetchAllPosts";
import { useQuery } from "@tanstack/react-query";
import DataInfo from "../data/DataInfo";
import agritechData from "../data/agritechData";
import globaltrendsData from "../data/globaltrendsData";
import agriNewsData from "../data/agriNewsData";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { parseISO } from "date-fns";
import { useRouter } from "expo-router";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

class PostItem extends React.PureComponent {
  render() {
    const { item, user, formatDate, navigation, setIsPostDetailActive } =
      this.props;

    return (
      <View style={styles.postItem}>
        <View style={styles.postInfoContainer}>
          <Text style={styles.postInfo}>
            {item.id_user === user?.id_user
              ? "You"
              : `${item.first_name || "Farmer"}`}{" "}
            • {formatDate(item.created_at)}
          </Text>
        </View>

        <Text style={styles.postLocation}>
          Located in {item.location || "Unknown"} • Contact Number #
          {item.id_user === user?.id_user
            ? `${user?.phone_number || "------"}`
            : `${item.phone_number || "------"}`}
        </Text>

        {item.description && (
          <TouchableOpacity
            onPress={() => {
              setIsPostDetailActive(true);
              navigation.navigate("PostDetail", { post: item });
            }}
          >
            <Text style={styles.postTitle}>{item.description}</Text>
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
      </View>
    );
  }
}

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const scrollViewRefs = {
    agritech: useRef(null),
    globalTrends: useRef(null),
    agriNews: useRef(null),
  };
  const [isPostDetailActive, setIsPostDetailActive] = useState(false);

  const {
    data: fetchedPosts = [],
    isLoading: loadingPosts,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["posts"],
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
      if (fetchedPosts.length > 0) {
        setPosts(
          fetchedPosts.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        );
      }
    }, [fetchedPosts])
  );

  useFocusEffect(
    useCallback(() => {
      if (!isPostDetailActive) {
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }

        Object.values(scrollViewRefs).forEach((ref) => {
          if (ref.current) {
            ref.current.scrollTo({ x: 0, animated: true });
          }
        });
      }

      refetchPosts();
    }, [isPostDetailActive])
  );

  const changeQuote = () => {
    setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
  };

  useEffect(() => {
    changeQuote();
  }, [user]);

  const formatDate = (date) => {
    try {
      if (!date) {
        return "Invalid Date";
      }

      const parsedDate = parseISO(date);

      if (isNaN(parsedDate)) {
        return "Invalid Date";
      }

      const options = {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const formatter = new Intl.DateTimeFormat("en-PH", options);
      const parts = formatter.formatToParts(parsedDate);

      const day = parts.find((part) => part.type === "weekday").value;
      const month = parts.find((part) => part.type === "month").value;
      const dayOfMonth = parts.find((part) => part.type === "day").value;
      const year = parts.find((part) => part.type === "year").value;
      const hour = parts.find((part) => part.type === "hour").value;
      const minute = parts.find((part) => part.type === "minute").value;
      const ampm = parts.find((part) => part.type === "dayPeriod").value;

      return `${day} • ${month} ${dayOfMonth}, ${year} • ${hour}:${minute} ${ampm}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const handleScrollEnd = (ref) => (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = width * 0.97 + 5;
    const index = Math.round(contentOffsetX / itemWidth);
    const targetX = index * itemWidth;

    ref.current.scrollTo({ x: targetX, animated: true });
  };

  const handleNewsClick = (link) => {
    router.push(`/support/WebBrowser?link=${encodeURIComponent(link)}`);
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
                <Text style={styles.newsTitle}>
                  {item.title} • {item.source}
                </Text>
              </TouchableOpacity>
              <Text style={styles.newsDescription}>{item.description}...</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAgritechNews = () =>
    renderNewsSection(
      agritechData,
      "🚜 Agriculture Latest Technology",
      scrollViewRefs.agritech
    );
  const renderGlobalAgri = () =>
    renderNewsSection(
      globaltrendsData,
      "🌍 Global Agriculture Trends",
      scrollViewRefs.globalTrends
    );
  const renderAgriNews = () =>
    renderNewsSection(
      agriNewsData,
      "🌾 Agriculture News",
      scrollViewRefs.agriNews
    );

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

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            Hello, {user?.first_name || "User"}
          </Text>

          <Text style={styles.quote}>{quotes[quoteIndex]}</Text>
        </View>

        <TouchableOpacity
          style={styles.helpContainer}
          onPress={() => router.push("/legal/Faqs")}
        >
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

  const renderIntroDailyFeeds = () => {
    return (
      <View>
        <View style={styles.dailyLine} />
        <Text style={styles.dailyText}>Daily Feeds</Text>
        <View style={[styles.dailyLine, { marginBottom: 10 }]} />
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
    marginTop: 10,
  },
  carouselItem: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greetingContainer: {
    flex: 1,
    flexDirection: "column",
    padding: 10,
  },
  helpContainer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
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
  quote: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
    textAlign: "left",
  },
  dailyText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "medium",
    color: "#333",
  },
  dailyLine: {
    height: 3,
    width: "100%",
    backgroundColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 5,
    fontFamily: "medium",
    color: "#333",
  },
  newsSection: {
    marginRight: -5,
    marginBottom: 20,
  },
  newsItem: {
    padding: 5,
    overflow: "hidden",
    width: width * 0.97,
    marginRight: 5,
  },
  newsImage: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  newsTitle: {
    fontSize: 15,
    fontFamily: "medium",
    marginTop: 10,
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
    fontSize: width * 0.06,
    fontFamily: "bold",
    color: "#66BB6A",
  },
  noImagesText: {
    fontSize: width * 0.035,
    color: "#9E9E9E",
  },
  emptyMessage: {
    fontSize: width * 0.04,
    color: "gray",
    textAlign: "center",
    fontFamily: "regular",
  },
});

export default HomeScreen;
