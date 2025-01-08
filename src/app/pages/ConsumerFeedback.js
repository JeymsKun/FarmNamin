import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import useAuth from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import fetchFeedbacks from "../utils/fetchFeedbacks";
import useRealTimeUpdates from "../hooks/useRealTimeUpdates";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const DEFAULT_PROFILE_IMAGE = require("../assets/main/default_profile_photo.png");

class FeedbackItem extends React.PureComponent {
  renderStars(rating) {
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
  }

  render() {
    const { item, navigateToConsumerDetails } = this.props;

    return (
      <View style={styles.feedbackCard}>
        <TouchableOpacity onPress={() => navigateToConsumerDetails(item)}>
          <Image
            source={
              item.consumer.profile_pic
                ? { uri: item.consumer.profile_pic }
                : DEFAULT_PROFILE_IMAGE
            }
            style={styles.feedbackImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.feedbackInfo}>
          <View style={styles.ratingContainer}>
            {this.renderStars(item.rating)}
          </View>

          <View style={styles.descriptionWrapper}>
            <Text style={styles.feedbackDescription}>{item.description}</Text>
          </View>

          <View style={styles.tagWrapper}>
            <Text style={styles.feedbackTag}>{item.tags}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const ConsumerFeedback = () => {
  const { user } = useAuth();
  const router = useRouter();
  const userId = user?.id_user;
  const navigation = useNavigation();

  const {
    data: feedbackData = [],
    isLoading: loadingFeedback,
    refetch: refetchFeedbacks,
  } = useQuery({
    queryKey: ["feedback", userId],
    queryFn: () => fetchFeedbacks(userId),
    staleTime: 1000 * 60 * 5,
  });

  useRealTimeUpdates(userId);

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

  useFocusEffect(
    React.useCallback(() => {
      refetchFeedbacks();
    }, [])
  );

  if (loadingFeedback) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34A853" />
      </View>
    );
  }

  const navigateToConsumerDetails = (item) => {
    navigation.navigate("ConsumerDetails", { feedback: item });
  };

  const handleBack = () => {
    router.back();
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={35} color="#34A853" />
        </TouchableOpacity>

        <Text style={styles.title}>Consumer's Feedback History</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No feedback available.</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={feedbackData}
      renderItem={({ item }) => (
        <FeedbackItem
          item={item}
          navigateToConsumerDetails={navigateToConsumerDetails}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <StatusBar hidden={false} />
          {renderHeader()}
        </View>
      }
      ListEmptyComponent={renderEmptyComponent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    padding: 10,
    marginBottom: height * 0.02,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
  },
  title: {
    fontSize: 14,
    fontFamily: "medium",
    textAlign: "center",
  },
  feedbackCard: {
    flexWrap: "wrap",
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
  feedbackImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "white",
    marginRight: 10,
  },
  feedbackInfo: {
    padding: 10,
    justifyContent: "center",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "regular",
    color: "#888",
  },
});

export default ConsumerFeedback;
