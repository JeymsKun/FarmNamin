import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, StatusBar, Animated } from 'react-native';

const SplashScreen = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current; // Start with scale 0
  const shadowAnim = useRef(new Animated.Value(0)).current; // Start shadow with no opacity

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1, // Scale to normal size
        duration: 1000, // 1 second duration
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1, // Add shadow effect
        duration: 500, // 0.5 second duration
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }} // Replace with your logo URL
          style={styles.logo}
          resizeMode="contain"
        />
        <Animated.Text
          style={[
            styles.title,
            {
              transform: [{ scale: scaleAnim }], // Apply scaling animation
              textShadowRadius: shadowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 6], // Shadow starts at 0 and grows to 6
              }),
              opacity: shadowAnim, // Fade-in effect
            },
          ]}
        >
          FarmNamin
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    marginTop: 20,
    fontSize: 40,
    color: '#12C824',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Shadow color
    textShadowOffset: { width: 2, height: 2 }, // Offset of the shadow
  },
});

export default SplashScreen;

