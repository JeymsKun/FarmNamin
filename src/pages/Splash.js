import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Text } from 'react-native';
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
          source={require('../../assets/main/official_logo.png')} 
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
        <Animated.Text
          style={[
            styles.by,
            {
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim, 
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 6, 
            },
          ]}
        >
          Transfarmers
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
    width: 100,
    height: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    marginTop: 20,
    fontSize: 32,
    color: 'white',
    fontFamily: 'bold',
  },
  by: {
    marginTop: -10,
    fontSize: 11,
    color: 'white',
    fontFamily: 'bold',
  },
});

export default SplashScreen;