import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import useAuth from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import fetchFarmersWithOrders from "../utils/fetchFarmersWithOrders";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useRealTimeUpdates from "../hooks/useRealTimeUpdates";
import { useGlobalState } from "../context/GlobalState";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const PRODUCT_ICON = require("../assets/notify/confirmation.png");

class NotificationItem extends React.PureComponent {
  state = {
    isNew: false,
  };

  async componentDidMount() {
    const { date_confirmation } = this.props.item;
    const currentDate = new Date();
    const confirmationDate = new Date(date_confirmation);

    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (date_confirmation) {
      if (currentDate - confirmationDate <= twentyFourHours) {
        this.setState({ isNew: true });
      } else {
        this.setState({ isNew: false });
      }
    } else {
      this.setState({ isNew: false });
    }
  }

  handlePress = async () => {
    const { item, navigateToFarmerDetails, setSelectedOrderConfirm } =
      this.props;

    await AsyncStorage.setItem(`notification_${item.id}`, "viewed");
    this.setState({ isNew: false });

    setSelectedOrderConfirm(item);
    navigateToFarmerDetails(item);
  };

  render() {
    const { item } = this.props;
    const { isNew } = this.state;
    const latestOrderId = item.order_id;
    const fullName = `${item.farmer?.first_name} ${
      item.farmer?.middle_name ? item.farmer.middle_name + " " : ""
    }${item.farmer?.last_name} ${
      item.farmer?.suffix ? item.farmer.suffix : ""
    }`.trim();

    return (
      <TouchableOpacity style={styles.notifyCard} onPress={this.handlePress}>
        <View style={styles.notifyInfo}>
          <View style={styles.titleWrapper}>
            <Image source={PRODUCT_ICON} style={styles.notifyIcon} />
            <Text
              style={styles.notifyTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              Your order has been reviewed and confirmed by the farm owner.
            </Text>
          </View>

          <View style={styles.descriptionWrapper}>
            {latestOrderId ? (
              <>
                <Text style={styles.notifyDescription}>
                  Your Order ID: {latestOrderId}
                </Text>
                <Text style={styles.notifyDescription}>
                  From Farmer: {fullName}
                </Text>
              </>
            ) : (
              <Text style={styles.notifyDescription}>No recent orders.</Text>
            )}
          </View>
        </View>

        {isNew && (
          <View style={styles.newNotificationCircle}>
            <Text style={styles.newNotificationText}>New</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
}

const NotificationScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const userId = user?.id_user;
  const { setSelectedOrderConfirm } = useGlobalState();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

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

  const { data: farmersData = [], refetch: refetchFarmers } = useQuery({
    queryKey: ["farmersWithOrders", userId],
    queryFn: () => fetchFarmersWithOrders(userId),
    staleTime: 1000 * 60 * 5,
  });

  const confirmedOrders = Array.isArray(farmersData)
    ? farmersData.filter((order) => order.confirm_order)
    : [];

  useRealTimeUpdates(user?.id_user);

  useFocusEffect(
    React.useCallback(() => {
      refetchFarmers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    refetchFarmers().finally(() => setRefreshing(false));
  };

  const navigateToFarmerDetails = (item) => {
    setSelectedOrderConfirm(item);
    router.push("/pages/OrderConfirmation");
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

        <Text style={styles.title}>Notification</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No notifications available.</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={confirmedOrders}
      renderItem={({ item }) => (
        <NotificationItem
          item={item}
          navigateToFarmerDetails={navigateToFarmerDetails}
          setSelectedOrderConfirm={setSelectedOrderConfirm}
        />
      )}
      keyExtractor={(item) =>
        item.id_user
          ? item.id_user.toString()
          : `${item.order_id || Math.random()}`
      }
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          <StatusBar hidden={false} />
          {renderHeader()}
        </View>
      }
      ListEmptyComponent={renderEmptyComponent}
      onRefresh={onRefresh}
      refreshing={refreshing}
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
    fontSize: 16,
    fontFamily: "medium",
    textAlign: "center",
  },
  notifyCard: {
    position: "relative",
    maxWidth: "100%",
    flexWrap: "wrap",
    marginTop: 10,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notifyInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  descriptionWrapper: {
    padding: 10,
  },
  notifyDescription: {
    fontSize: 13,
    fontFamily: "medium",
    color: "white",
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  notifyIcon: {
    width: 40,
    height: 40,
  },
  notifyTitle: {
    borderRadius: 10,
    padding: 5,
    fontSize: 12,
    fontFamily: "bold",
    color: "white",
    marginLeft: 10,
    flexShrink: 1,
  },
  newNotificationCircle: {
    position: "absolute",
    right: -5,
    top: -10,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  newNotificationText: {
    color: "white",
    fontSize: 10,
    fontFamily: "regular",
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

export default NotificationScreen;