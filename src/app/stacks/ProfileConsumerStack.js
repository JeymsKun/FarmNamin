import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileConsumerScreen from "../pages/ProfileConsumer";
import ImageViewerScreen from "../support/ImageViewer";
import ProfileConsumerSettingsScreen from "../pages/ProfileConsumerSettings";
import VerificationConsumerScreen from "../pages/VerificationConsumer";
import EditConsumerAccountScreen from "../pages/EditConsumerAccount";
import EditConsumerBasicInfoScreen from "../pages/EditConsumerBasicInfo";
import EditConsumerProfileScreen from "../pages/EditConsumerProfile";
import ConsumerProductViewerScreen from "../support/ConsumerProductViewer";
import FarmerDetailsScreen from "../pages/FarmerDetails";
import OrderConfirmationScreen from "../pages/OrderConfirmation";
import ConsumerOrderScreen from "../pages/ConsumerOrder";

const Stack = createStackNavigator();

const ProfileConsumerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileConsumer" component={ProfileConsumerScreen} />
      <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
      <Stack.Screen
        name="ProfileConsumerSettings"
        component={ProfileConsumerSettingsScreen}
      />
      <Stack.Screen
        name="VerificationConsumer"
        component={VerificationConsumerScreen}
      />
      <Stack.Screen
        name="EditConsumerAccount"
        component={EditConsumerAccountScreen}
      />
      <Stack.Screen
        name="EditConsumerBasicInfo"
        component={EditConsumerBasicInfoScreen}
      />
      <Stack.Screen
        name="EditConsumerProfile"
        component={EditConsumerProfileScreen}
      />
      <Stack.Screen
        name="ConsumerProductViewer"
        component={ConsumerProductViewerScreen}
      />
      <Stack.Screen name="FarmerDetails" component={FarmerDetailsScreen} />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
      />
      <Stack.Screen name="ConsumerOrder" component={ConsumerOrderScreen} />
    </Stack.Navigator>
  );
};

export default ProfileConsumerStack;
