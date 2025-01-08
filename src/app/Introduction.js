import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

const IntroductionCarousel = () => {
  const router = useRouter();
  const { role, name } = useLocalSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const progressAnim = useState(() => new Animated.Value(0))[0];

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  const slides = [
    {
      topText: ["Easily direct to the", "consumers."],
      images: [
        require("./assets/introduction/farmer.png"),
        require("./assets/introduction/handshake.png"),
        require("./assets/introduction/tao.png"),
      ],
      bottomText: [
        "Direct contact through",
        "phone number.",
        "No online chat, etc.",
      ],
    },

    {
      image: require("./assets/introduction/free.png"),
      description: ["Free advertising for", "farm produce products."],
      subtext: ["No charges and", "additional fees."],
    },

    {
      images: [
        require("./assets/introduction/id.png"),
        require("./assets/introduction/info.png"),
      ],
      description: "A legitimate account and verified.",
      subtext: ["To ensure the safeguard of", "information."],
    },

    {
      topImage: require("./assets/introduction/search.png"),
      topText: [
        "You can sell if you are a farmer.",
        "You can buy if you are a consumer.",
      ],
      images: [
        require("./assets/introduction/editV.png"),
        require("./assets/introduction/chat.png"),
        require("./assets/introduction/quality-control.png"),
        require("./assets/introduction/bookmark.png"),
      ],
      bottomText: ["And many more.", "Take a look and enjoy the rest."],
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      Animated.timing(progressAnim, {
        toValue: currentSlide + 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setCurrentSlide(currentSlide + 1));
    } else {
      router.push("/Welcome?role=" + role + "&name=" + name);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      Animated.timing(progressAnim, {
        toValue: currentSlide - 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setCurrentSlide(currentSlide - 1));
    }
  };

  const handleTap = (event) => {
    const { locationX } = event.nativeEvent;
    if (locationX < screenWidth / 2) {
      previousSlide();
    } else {
      nextSlide();
    }
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressBarContainer}>
        {slides.map((_, index) => {
          const inputRange = [index - 1, index, index + 1];

          const width = progressAnim.interpolate({
            inputRange,
            outputRange: [10, currentSlide === index ? 60 : 10, 10],
            extrapolate: "clamp",
          });

          const height = progressAnim.interpolate({
            inputRange,
            outputRange: [10, currentSlide === index ? 10 : 10, 10],
            extrapolate: "clamp",
          });

          const backgroundColor = progressAnim.interpolate({
            inputRange,
            outputRange: ["#4CAF50", "#4CAF50", "#4CAF50"],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.progressDot,
                {
                  width,
                  height,
                  backgroundColor,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleTap}
      activeOpacity={1}
    >
      <Text style={styles.title}>Introduction</Text>

      <View style={styles.content}>
        {currentSlide === 0 ? (
          <>
            {slides[currentSlide].topText.map((line, index) => (
              <Text key={index} style={styles.topText}>
                {line}
              </Text>
            ))}
            <View style={styles.iconsRow}>
              {slides[currentSlide].images.map((image, index) => (
                <Image
                  key={index}
                  source={image}
                  style={[
                    image === require("./assets/introduction/farmer.png") &&
                      styles.slide1IconFarmer,
                    image === require("./assets/introduction/tao.png") &&
                      styles.slide1IconTao,
                    image === require("./assets/introduction/handshake.png") &&
                      styles.slide1IconHandshake,
                  ]}
                />
              ))}
            </View>
            {slides[currentSlide].bottomText.map((line, index) => (
              <Text key={index} style={styles.bottomText}>
                {line}
              </Text>
            ))}
          </>
        ) : currentSlide === 1 ? (
          <>
            <Image
              source={slides[currentSlide].image}
              style={styles.mainImage}
            />
            {slides[currentSlide].description.map((line, index) => (
              <Text key={index} style={styles.description}>
                {line}
              </Text>
            ))}
            {slides[currentSlide].subtext.map((line, index) => (
              <Text key={index} style={styles.subtext}>
                {line}
              </Text>
            ))}
          </>
        ) : currentSlide === 2 ? (
          <>
            <View style={styles.iconsRow}>
              {slides[currentSlide].images.map((image, index) => (
                <Image key={index} source={image} style={styles.largeIcon} />
              ))}
            </View>
            <Text style={styles.description}>
              {slides[currentSlide].description}
            </Text>
            {slides[currentSlide].subtext.map((line, index) => (
              <Text key={index} style={styles.subtext}>
                {line}
              </Text>
            ))}
          </>
        ) : currentSlide === 3 ? (
          <>
            <Image
              source={slides[currentSlide].topImage}
              style={styles.largeTopImage}
            />
            {slides[currentSlide].topText.map((text, index) => (
              <Text key={index} style={styles.topText}>
                {text}
              </Text>
            ))}
            <View style={styles.iconsRow}>
              {slides[currentSlide].images.map((image, index) => (
                <Image key={index} source={image} style={styles.smallImage} />
              ))}
            </View>
            {slides[currentSlide].bottomText.map((text, index) => (
              <Text key={index} style={styles.bottomText}>
                {text}
              </Text>
            ))}
          </>
        ) : null}
        <View style={styles.absoluteProgressBar}>{renderProgressBar()}</View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontFamily: "bold",
    color: "#4CAF50",
    padding: 10,
    margin: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  topText: {
    fontSize: 16,
    fontFamily: "medium",
    textAlign: "center",
    color: "#4CAF50",
  },
  slide1IconFarmer: {
    width: 80,
    height: 80,
  },
  slide1IconTao: {
    width: 80,
    height: 80,
  },
  slide1IconHandshake: {
    width: 50,
    height: 50,
    marginTop: 55,
  },
  iconsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  largeIcon: {
    width: 80,
    height: 80,
    marginHorizontal: 15,
  },
  mainImage: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    fontFamily: "medium",
    textAlign: "center",
    color: "#4CAF50",
    marginBottom: 5,
  },
  subtext: {
    fontSize: 16,
    fontFamily: "medium",
    textAlign: "center",
    color: "#4CAF50",
  },
  bottomText: {
    fontSize: 16,
    fontFamily: "medium",
    textAlign: "center",
    color: "#4CAF50",
  },
  largeTopImage: {
    width: 100,
    height: 100,
  },
  smallImage: {
    width: 25,
    height: 25,
    marginHorizontal: 20,
    marginTop: 20,
  },
  progressBarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  progressDot: {
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeProgressLine: {
    width: 40,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    marginHorizontal: 5,
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
  activeDot: {
    backgroundColor: "#4CAF50",
  },
  absoluteProgressBar: {
    position: "absolute",
    bottom: 150,
    width: "100%",
    alignItems: "center",
  },
});

export default IntroductionCarousel;
