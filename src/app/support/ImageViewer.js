import React, { useRef } from "react";
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  PinchGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useGlobalState } from "../context/GlobalState";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ImageViewer = () => {
  const { selectedImageUri } = useGlobalState();
  const router = useRouter();

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      if (scale._value < 1) {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const imageScale = scale.interpolate({
    inputRange: [1, 2, 3, 4],
    outputRange: [1, 2, 3, 4],
    extrapolate: "clamp",
  });

  const handleBack = () => {
    router.back();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={30} color="#4CAF50" />
        </TouchableOpacity>
        <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchStateChange}
        >
          <Animated.View
            style={{
              flex: 1,
              transform: [
                { scale: imageScale },
                { translateX: translateX },
                { translateY: translateY },
              ],
            }}
          >
            <Image
              source={{ uri: selectedImageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </Animated.View>
        </PinchGestureHandler>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    padding: 10,
  },
  image: {
    width: screenWidth,
    height: screenHeight,
  },
});

export default ImageViewer;
