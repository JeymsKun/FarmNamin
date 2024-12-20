import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current; 
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000, 
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        navigation.navigate('RoleSelection'); 
      }, 3000); 
    });
  }, [navigation, scaleAnim]);
  
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/official_logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Animated.Text
          style={[
            styles.title,
            {
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim, 
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 6, 
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
    fontSize: 32,
    color: '#12C824',
    fontFamily: 'bold',
  },
});

export default SplashScreen;