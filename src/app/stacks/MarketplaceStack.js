import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MarketplaceScreen from "../pages/Marketplace";
import ImageViewerScreen from "../support/ImageViewer";
import NotificationConsumerScreen from "../pages/NotificationConsumer";
import OrderConfirmationScreen from "../pages/OrderConfirmation";
import ConsumerOrderScreen from "../pages/ConsumerOrder";
import ProductViewerScreen from "../support/ProductViewer";

const Stack = createStackNavigator();

const MarketplaceStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
      <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
      <Stack.Screen
        name="NotificationConsumer"
        component={NotificationConsumerScreen}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
      />
      <Stack.Screen name="ConsumerOrder" component={ConsumerOrderScreen} />
      <Stack.Screen name="ProductViewer" component={ProductViewerScreen} />
    </Stack.Navigator>
  );
};

export default MarketplaceStack;
