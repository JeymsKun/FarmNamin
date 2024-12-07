import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from "react-native";

const IntroductionCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1
    {
      title: "Introduction",
      topText: ["Easily direct to the", "consumers."],
      images: [
        require("./assets/images/farmer.png"),
        require("./assets/images/handshake.png"),
        require("./assets/images/tao.png"),
      ],
      bottomText: ["Direct contact through", "phone number.", "No online chat, etc."],
    },
    // Slide 2
    {
      title: "Introduction",
      image: require("./assets/images/free.png"),
      description: ["Free advertising for", "farm product products."],
      subtext: ["No charges and", "additional fees."],
    },
    // Slide 3
    {
      title: "Introduction",
      images: [
        require("./assets/images/id.png"),
        require("./assets/images/info.png"),
      ],
      description: "A legitimate account and verified.",
      subtext: ["To ensure the safeguard of", "information."],
    },
    // Slide 4
    {
      title: "Introduction",
      topImage: require("./assets/images/search.png"),
      topText: ["You can sell if you are a farmer.", "You can buy if you are a consumer."],
      images: [
        require("./assets/images/edit.png"),
        require("./assets/images/chat.png"),
        require("./assets/images/cv.png"),
        require("./assets/images/bookmark.png"),
      ],
      bottomText: ["And many more.", "Take a look and enjoy the rest."],
    },
    // Slide 5
    {
      topText: ["    You are very welcome,"],
      bottomText: ["Our Beloved Farmer,"],
      bottomName: ["  Jojo"],  
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCurrentSlide(0);
    }
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressBarContainer}>
        {slides.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.progressDot,
              currentSlide === index && styles.activeDot,
              currentSlide === index && { transform: [{ scaleX: 3 }, { scaleY: 1.5 }] },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={nextSlide}>
      <Text style={styles.title}>{slides[currentSlide].title}</Text>
      <View style={styles.content}>
        {/* Slide 1 */}
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
                    image === require("./assets/images/farmer.png") && styles.slide1IconFarmer,
                    image === require("./assets/images/tao.png") && styles.slide1IconTao,
                    image === require("./assets/images/handshake.png") && styles.slide1IconHandshake,
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
          // Slide 2
          <>
            <Image source={slides[currentSlide].image} style={styles.mainImage} />
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
          // Slide 3
          <>
            <View style={styles.iconsRow}>
              {slides[currentSlide].images.map((image, index) => (
                <Image key={index} source={image} style={styles.largeIcon} />
              ))}
            </View>
            <Text style={styles.description}>{slides[currentSlide].description}</Text>
            {slides[currentSlide].subtext.map((line, index) => (
              <Text key={index} style={styles.subtext}>
                {line}
              </Text>
            ))}
          </>
        ) : currentSlide === 3 ? (
          // Slide 4
          <>
            <Image source={slides[currentSlide].topImage} style={styles.largeTopImage} />
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
        ) : currentSlide === 4 ? (
          // Slide 5
          <>
            {slides[currentSlide].topText.map((text, index) => (
              <Text key={index} style={styles.welcomeText}>
                {text}
              </Text>
            ))}
            {slides[currentSlide].bottomText.map((text, index) => (
              <Text key={index} style={styles.welcomeText}>
                {text}
              </Text>
            ))}
            {slides[currentSlide].bottomName.map((text, index) => (
              <Text key={index} style={styles.welcomeName}>
                {text}
              </Text>
            ))}
          </>
        ) : null}
      </View>
      {renderProgressBar()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    position: "absolute",
    top: 40,
    left: 20,
    textAlign: "left",
    marginBottom: 20,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  topText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4CAF50",
    marginBottom: 10,
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
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4CAF50",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4CAF50",
    marginTop: 5,
  },
  bottomText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4CAF50",
    marginTop: 5,
  },
  largeTopImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    textAlign: "right", 
    color: "#4CAF50",
    marginBottom: 10,
    paddingRight: 90, 
  },
  
  welcomeName: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "right", 
    paddingRight: 240, 
    color: "#4CAF50",
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
    marginTop: 30,
    marginBottom: 30,
  },
  progressDot: {
    width: 24,
    height: 5,
    borderRadius: 10,
    backgroundColor: "#ccc",
    marginHorizontal: 25,
    opacity: 0.10,
    transform: [{ scale: 1.2 }],
  },
  activeDot: {
    backgroundColor: "#4CAF50", 
    opacity: 1,
    transform: [{ scale: 3 }, { scaleX: 2 }, { scaleY: 1.5 }],
  },
});

export default IntroductionCarousel;