import React, { useRef, useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Animated, useWindowDimensions, BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import HomepageStack from "./stacks/HomepageStack";
import MarketplaceStack from "./stacks/MarketplaceStack";
import ProductStack from "./stacks/ProductStack";
import ProfileConsumerStack from "./stacks/ProfileConsumerStack";
import ProfileFarmerStack from "./stacks/ProfileFarmerStack";
import { useLocalSearchParams } from "expo-router";

const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const [tabWidth, setTabWidth] = useState(width / 3);
  const { role } = useLocalSearchParams();

  const animateLine = (index) => {
    Animated.spring(translateX, {
      toValue: index * tabWidth,
      useNativeDriver: true,
    }).start();
  };

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

  useEffect(() => {
    setTabWidth(width / 3);
  }, [width]);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="HomeScreen"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "HomeScreen") {
              iconName = "home-outline";
            } else if (route.name === "MarketScreen") {
              iconName =
                role === "consumer" ? "storefront-outline" : "product-house";
            } else if (route.name === "ProductScreen") {
              iconName = "nutrition-outline";
            } else if (route.name === "ProfileScreen") {
              iconName = "person-outline";
            } else if (route.name === "ProfileFarmerScreen") {
              iconName = "person-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "green",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
          tabBarStyle: {
            position: "relative",
            display: "flex",
            height: 55,
            backgroundColor: "#f5f5f5",
          },
          tabBarLabelStyle: {
            fontSize: width < 375 ? 12 : 14,
            fontFamily: "medium",
            marginBottom: 7,
          },
        })}
        screenListeners={({ route }) => ({
          tabPress: (e) => {
            let index;

            if (route.name === "HomeScreen") {
              index = 0;
            } else if (route.name === "MarketScreen") {
              index = role === "consumer" ? 1 : 2;
            } else if (route.name === "ProductScreen") {
              index = 1;
            } else if (route.name === "ProfileScreen") {
              index = 2;
            } else if (route.name === "ProfileFarmerScreen") {
              index = 2;
            }

            animateLine(index);
          },
        })}
      >
        <Tab.Screen
          name="HomeScreen"
          component={HomepageStack}
          options={{ title: "Home" }}
        />

        {role === "consumer" ? (
          <Tab.Screen
            name="MarketScreen"
            component={MarketplaceStack}
            options={{ title: "Marketplace" }}
          />
        ) : (
          <Tab.Screen
            name="ProductScreen"
            component={ProductStack}
            options={{ title: "Product" }}
          />
        )}

        {role === "consumer" ? (
          <Tab.Screen
            name="ProfileScreen"
            component={ProfileConsumerStack}
            options={{ title: "Profile" }}
          />
        ) : (
          <Tab.Screen
            name="ProfileFarmerScreen"
            component={ProfileFarmerStack}
            options={{ title: "Profile" }}
          />
        )}
      </Tab.Navigator>

      <Animated.View
        style={{
          justifyContent: "center",
          position: "absolute",
          bottom: 0,
          left: tabWidth / 6,
          width: tabWidth / 1.5,
          height: 6,
          backgroundColor: "green",
          borderRadius: 3,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

export default HomeTabs;
