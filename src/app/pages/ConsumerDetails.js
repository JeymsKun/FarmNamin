import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Animated,
  BackHandler,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import { useRouter } from "expo-router";
import { useGlobalState } from "../context/GlobalState";

const DEFAULT_PROFILE_IMAGE = require("../assets/main/default_profile_photo.png");
const DEFAULT_COVER_PHOTO = require("../assets/main/default_cover_photo.png");

const ConsumerDetailsScreen = ({ route }) => {
  const { setSelectedImageUri } = useGlobalState();
  const { feedback } = route.params;
  const router = useRouter();
  const navigation = useNavigation();
  const [showMessage, setShowMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const profileScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

  const handleVerifyPress = () => {
    setShowMessage(true);
    fadeAnim.setValue(1);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 6000,
      useNativeDriver: true,
    }).start(() => {
      setShowMessage(false);
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={20}
          color="#FFEB3B"
        />
      );
    }
    return stars;
  };

  const formatDate = (date) => {
    try {
      return format(
        date ? parseISO(date) : new Date(),
        "EEEE • MMMM d, yyyy • hh:mm a"
      );
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={35} color="#34A853" />
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        <TouchableOpacity
          onPress={() => {
            setSelectedImageUri(feedback.consumer.cover_photo);
            router.push("/support/ImageViewer");
          }}
        >
          <ImageBackground
            source={
              feedback?.consumer.cover_photo
                ? { uri: feedback.consumer.cover_photo }
                : DEFAULT_COVER_PHOTO
            }
            style={styles.coverPhoto}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Animated.View style={{ transform: [{ scale: profileScale }] }}>
            <TouchableOpacity
              onPress={() => {
                setSelectedImageUri(feedback.consumer.profile_pic);
                router.push("/support/ImageViewer");
              }}
            >
              <View style={styles.profileImageContainer}>
                <Image
                  source={
                    feedback?.consumer.profile_pic
                      ? { uri: feedback.consumer.profile_pic }
                      : DEFAULT_PROFILE_IMAGE
                  }
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={handleVerifyPress}
            style={styles.verifyIconContainer}
          >
            <Icon name="check-circle" size={28} color="#50D751" />
          </TouchableOpacity>

          {showMessage && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.verifiedMessage}>
                This user is verified and trusted.
              </Text>
            </Animated.View>
          )}
        </View>
      </View>

      <View style={styles.allInfoContainer}>
        <View style={styles.userInfoContainer}>
          <Text style={styles.name}>
            {`${(feedback.consumer.first_name || "").trim()} ${(
              feedback.consumer.middle_name || ""
            ).trim()} ${(feedback.consumer.last_name || "").trim()} ${(
              feedback.consumer.suffix || ""
            ).trim()}`}
          </Text>
          <Text style={styles.mobile}>
            {feedback.consumer.phone_number
              ? `0${feedback.consumer.phone_number}`.replace(/^00/, "0")
              : "-----"}
          </Text>
        </View>
      </View>

      <View style={styles.feedbackContainer}>
        <Text
          style={styles.text}
        >{`${feedback.consumer.first_name} give feedback to you.`}</Text>
        <Text style={styles.text}>
          Date: {formatDate(feedback.consumer.created_at)}
        </Text>

        <View style={styles.feedbackCard}>
          <View style={styles.feedbackInfo}>
            <View style={styles.ratingContainer}>
              {renderStars(feedback.rating)}
            </View>

            <View style={styles.descriptionWrapper}>
              <Text style={styles.feedbackDescription}>
                {feedback.description}
              </Text>
            </View>

            <View style={styles.tagWrapper}>
              <Text style={styles.feedbackTag}>{feedback.tags}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    position: "relative",
  },
  backButton: {
    padding: 10,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 100,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1.9,
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  headerContainer: {
    alignItems: "center",
    marginTop: -80,
    position: "relative",
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#00a400",
    borderWidth: 5,
    overflow: "hidden",
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: 200,
  },
  verifyIconContainer: {
    position: "absolute",
    top: 20,
    right: 100,
  },
  verifiedMessage: {
    marginTop: 3,
    color: "#1BA40F",
    fontSize: 12,
    fontFamily: "regular",
  },
  allInfoContainer: {
    padding: 20,
    alignItems: "center",
  },
  userInfoContainer: {
    marginTop: 45,
    padding: 20,
    alignItems: "center",
  },
  name: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "medium",
  },
  mobile: {
    fontSize: 14,
    color: "black",
    marginVertical: 5,
    fontFamily: "regular",
  },
  feedbackContainer: {
    padding: 20,
  },
  feedbackCard: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    padding: 10,
    flexDirection: "row",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  feedbackInfo: {
    padding: 10,
    justifyContent: "center",
  },
  text: {
    fontSize: 13,
    fontFamily: "regular",
  },
  descriptionWrapper: {
    marginTop: 5,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackDescription: {
    fontSize: 12,
    fontFamily: "regular",
    color: "white",
  },
  tagWrapper: {
    marginTop: 5,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackTag: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 5,
    fontSize: 12,
    fontFamily: "regular",
    color: "black",
  },
});

export default ConsumerDetailsScreen;
