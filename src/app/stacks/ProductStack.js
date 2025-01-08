import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ProductScreen from "../pages/Product";
import MarketplaceFarmerScreen from "../pages/MarketplaceFarmer";
import NotificationFarmerScreen from "../pages/NotificationFarmer";
import PostScreen from "../pages/Post";
import TrackAndTraceScreen from "../pages/TrackAndTrace";
import TagScreen from "../pages/Tag";
import WeatherScreen from "../pages/Weather";
import ScheduleScreen from "../pages/Schedule";
import OverviewBalanceScreen from "../pages/OverviewBalance";
import AgricultureTipsScreen from "../pages/AgricultureTips";
import CalendarScreen from "../pages/Calendar";
import ProductPostScreen from "../pages/ProductPost";
import AdditionalDetailsScreen from "../pages/AdditionalDetails";
import MarketPriceScreen from "../pages/MarketPrice";
import ImageViewerScreen from "../support/ImageViewer";
import VideoPlayerScreen from "../support/VideoPlayer";
import FarmerProductViewerScreen from "../pages/FarmerProductViewer";
import FarmerOwnViewerScreen from "../pages/FarmerOwnViewer";
import FarmerOrderConfirmationScreen from "../pages/FarmerOrderConfirmation";

const Stack = createStackNavigator();

const ProductStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
      <Stack.Screen
        name="MarketplaceFarmer"
        component={MarketplaceFarmerScreen}
      />
      <Stack.Screen
        name="NotificationFarmer"
        component={NotificationFarmerScreen}
      />
      <Stack.Screen name="Post" component={PostScreen} />
      <Stack.Screen name="TrackAndTrace" component={TrackAndTraceScreen} />
      <Stack.Screen name="Tag" component={TagScreen} />
      <Stack.Screen name="Weather" component={WeatherScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="OverviewBalance" component={OverviewBalanceScreen} />
      <Stack.Screen name="AgricultureTips" component={AgricultureTipsScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="ProductPost" component={ProductPostScreen} />
      <Stack.Screen
        name="AdditionalDetails"
        component={AdditionalDetailsScreen}
      />
      <Stack.Screen name="MarketPrice" component={MarketPriceScreen} />
      <Stack.Screen
        name="FarmerProductViewer"
        component={FarmerProductViewerScreen}
      />
      <Stack.Screen name="FarmerOwnViewer" component={FarmerOwnViewerScreen} />
      <Stack.Screen
        name="FarmerOrderConfirmation"
        component={FarmerOrderConfirmationScreen}
      />
    </Stack.Navigator>
  );
};

export default ProductStack;
