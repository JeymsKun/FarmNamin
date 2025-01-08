import React, { useEffect, useState } from 'react';
import { Text, TextInput, StyleSheet, View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';

const FontProvider = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        bold: require('../assets/fonts/Poppins-Bold.ttf'),
        light: require('../assets/fonts/Poppins-Light.ttf'),
        medium: require('../assets/fonts/Poppins-Medium.ttf'),
        regular: require('../assets/fonts/Poppins-Regular.ttf'),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.log('Failed to load fonts', error);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = [{ fontFamily: 'Poppins-Regular' }, Text.defaultProps.style];

  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.style = [{ fontFamily: 'Poppins-Regular' }, TextInput.defaultProps.style];

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default FontProvider;
