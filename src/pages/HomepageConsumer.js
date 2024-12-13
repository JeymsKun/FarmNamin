import React, { useState } from "react";
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Animated, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import Icon from "react-native-vector-icons/FontAwesome";


const HomeScreen = () => {
  const navigation = useNavigation();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [scrollY, setScrollY] = useState(new Animated.Value(0));
  const [lastOffset, setLastOffset] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);

  const carouselImages = [
    require("../assets/images/farmnamin1.jpg"),
    require("../assets/images/farmnamin2.jpg"),
    require("../assets/images/farmnamin3.jpg"),
  ];

  const farmingNews = [
    {
      title: "🌱 How Gen AI Is Shaping The Future of Agriculture",
      description: "AI is revolutionizing the agriculture industry, making it more sustainable and efficient.",
      image: require("../assets/images/news1.jpg"),
      link: "https://example.com/gen-ai-agriculture"
    },
    {
      title: "🚜 New Irrigation Tech for Small Farmers",
      description: "Discover how affordable irrigation solutions are transforming small farms.",
      image: require("../assets/images/news2.jpg"),
      link: "https://example.com/new-irrigation-tech"
    },
  ];

  const dailyFeed = [
    {
      title: "🌾 Daily Tip: Best Practices for Irrigation",
      description: "Learn the most effective irrigation techniques for water conservation and higher yield.",
      image: require("../assets/images/daily1.jpg"),
      link: "https://example.com/daily-tip-irrigation"
    },
    {
      title: "🌻 How to Identify Soil Issues Early",
      description: "Spot the signs of soil issues before they become a problem and save your crops.",
      image: require("../assets/images/daily2.jpg"),
      link: "https://example.com/soil-issues"
    },
    {
      title: "🍅 Tips for Growing Organic Vegetables",
      description: "Start your organic vegetable garden with these simple and proven tips.",
      image: require("../assets/images/daily3.jpg"),
      link: "https://example.com/growing-organic-vegetables"
    },
  ];

  const globalTrends = [
    {
      title: "🌍 The Rise of Vertical Farming",
      description: "Learn how urban farming is changing the agricultural landscape.",
      image: require("../assets/images/trend1.jpg"),
      link: "https://example.com/vertical-farming"
    },
    {
      title: "🌱 Regenerative Agriculture Practices",
      description: "How regenerative farming methods are improving soil health.",
      image: require("../assets/images/trend2.jpeg"),
      link: "https://example.com/regenerative-agriculture"
    },
    {
      title: "🚜 Smart Farming with IoT",
      description: "Discover the role of IoT in revolutionizing farming practices.",
      image: require("../assets/images/trend3.jpg"),
      link: "https://example.com/smart-farming-iot"
    },
  ];

  const handleNeedHelp = () => {
    Alert.alert("Need Help?", "Contact us at support@farmnamin.com");
  };

  const handleNewsClick = (link) => {
    navigation.navigate("WebView", { link: link });
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const currentOffset = event.nativeEvent.contentOffset.y;

        if (currentOffset > lastOffset && currentOffset > 50) {
          setHeaderVisible(false); // Scrolling down, hide header
        } else if (currentOffset < lastOffset && currentOffset < 50) {
          setHeaderVisible(true); // Scrolling up, show header
        }
        setLastOffset(currentOffset);
      }
    }
  );

  return (
    <View style={styles.container}>
      {headerVisible && (
        <View style={styles.headerContainer}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Hello, James David!</Text>
          </View>
        <TouchableOpacity style={styles.helpContainer} onPress={handleNeedHelp}>
            <Image source={require("../assets/images/needhelp.png")} style={styles.helpIcon} />
        </TouchableOpacity>


        </View>
      )}

      <Animated.View
        style={[
          styles.quoteContainer,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }),
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -50],
                  extrapolate: "clamp",
                }),
              },
            ],
            position: "absolute",
            top: 80,
            width: "100%",
            zIndex: 9,
          },
        ]}
      >
      <Text style={styles.quote}>
  <Text style={styles.quote}>
  "To be a farmer is to be a student {"\n"} forever, for  each  day  brings {"\n"} something new."– John Connell
</Text>

  </Text>

      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={350}
            height={210}
            data={carouselImages}
            onSnapToItem={(index) => setCurrentSlideIndex(index)}
            renderItem={({ item }) => (
              <Image source={item} style={styles.carouselImage} />
            )}
            animationInterval={3000}
          />
          <View style={styles.dotsContainer}>
            {carouselImages.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentSlideIndex === index ? styles.activeDot : styles.inactiveDot]}
              />
            ))}
          </View>
        </View>

        <View style={styles.newsSection}>
          <Text style={styles.sectionTitle}>🚜 Agriculture Latest Technology</Text>
          {farmingNews.map((news, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNewsClick(news.link)}
              style={styles.newsItem}
            >
              <Image source={news.image} style={styles.newsImage} />
              <Text style={styles.newsTitle}>{news.title}</Text>
              <Text style={styles.newsDescription}>{news.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dailyFeedSection}>
          <Text style={styles.sectionTitle}>🌾 Daily Farming Tips</Text>
          {dailyFeed.map((feed, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNewsClick(feed.link)}
              style={styles.dailyFeedItem}
            >
              <Image source={feed.image} style={styles.feedImage} />
              <Text style={styles.dailyFeedTitle}>{feed.title}</Text>
              <Text style={styles.dailyFeedDescription}>{feed.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.trendsSection}>
          <Text style={styles.sectionTitle}>🌍 Global Agriculture Trends</Text>
          {globalTrends.map((trend, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleNewsClick(trend.link)}
              style={styles.dailyFeedItem}
            >
              <Image source={trend.image} style={styles.feedImage} />
              <Text style={styles.dailyFeedTitle}>{trend.title}</Text>
              <Text style={styles.dailyFeedDescription}>{trend.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    //paddingTop: 0,
    paddingHorizontal: 20,
    //position: "absolute",
    top: 40,
    width: "100%",
    zIndex: 10,
    backgroundColor: "#fff",
  },
  greetingContainer: {
    top:10,
    paddingBottom: 10,
    
  },
  greetingText: {
    fontSize: 24,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 5,
  },
  helpIconContainer: {
    justifyContent: "center",
  },
  helpIcon: {
    width: 50,
    height: 50,
    
  },
  
  quoteContainer: {
    paddingHorizontal: 4, // Space on both sides
    paddingVertical: 4, // Adjusts spacing
    alignItems: "flex-start", // Left-aligns all text within the container
  },
  quote: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
    textAlign: "left", // Ensures the text is aligned to the left
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 50,
    lineHeight: 24,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 160,
  },
  carouselContainer: {
    marginBottom: 20,
    alignItems: "center",
    height: 250, 
    top: -15,
  },
  carouselImage: {
    marginBottom: 20,
    alignItems: "center",
    width: 350, // Increased width of the frame
    height: 210, // Increased height of the frame
    overflow: "hidden", // Ensures the images do not overflow beyond the frame
    //borderRadius: 15, 
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 5,
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
    fontSize: 20, // Increased font size
    //fontWeight: bold",
    marginBottom: 30,
  
    color: "#333",
  },
  newsSection: {
    marginBottom: 20,
  },
  newsItem: {
    marginBottom: 15,
  },
  newsImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  newsDescription: {
    fontSize: 14,
    marginTop: 5,
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
}); 