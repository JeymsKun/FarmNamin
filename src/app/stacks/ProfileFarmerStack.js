import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProfileFarmerScreen from "../pages/ProfileFarmer";
import ImageViewerScreen from "../support/ImageViewer";
import ProfileSettingScreen from "../pages/ProfileSettings";
import VerificationScreen from "../pages/Verification";
import EditAccountScreen from "../pages/EditAccount";
import EditBasicInfoScreen from "../pages/EditBasicInfo";
import EditProfileScreen from "../pages/ProfileSettings";
import FarmerOwnViewerScreen from "../pages/FarmerOwnViewer";
import ConsumerDetailsScreen from "../pages/ConsumerDetails";
import ConsumerFeedbackScreen from "../pages/ConsumerFeedback";

const Stack = createStackNavigator();

const ProfileFarmerStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileFarmer" component={ProfileFarmerScreen} />
      <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="EditAccount" component={EditAccountScreen} />
      <Stack.Screen name="EditBasicInfo" component={EditBasicInfoScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="FarmerOwnViewer" component={FarmerOwnViewerScreen} />
      <Stack.Screen name="ConsumerDetails" component={ConsumerDetailsScreen} />
      <Stack.Screen
        name="ConsumerFeedback"
        component={ConsumerFeedbackScreen}
      />
    </Stack.Navigator>
  );
};

export default ProfileFarmerStack;
