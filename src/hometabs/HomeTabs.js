import React, { useRef, useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { View, Animated, useWindowDimensions, BackHandler } from 'react-native';
import MarketplaceScreen from './../pages/Marketplace';
import ProductScreen from './../pages/Product';
import ProfileConsumerScreen from '../pages/ProfileConsumer';
import ProfileFarmerScreen from './../pages/ProfileFarmer';  
import HomepageScreen from '../pages/Homepage';
import PostScreen from './../pages/Post';
import CalendarScreen from '../pages/Calendar';
import ScheduleScreen from '../pages/Schedule';
import TraceAndTraceScreen from '../pages/TrackAndTrace';
import TagScreen from '../pages/Tag';
import OverviewBalanceScreen from '../pages/OverviewBalance';
import AgricultureTipsScreen from '../pages/AgricultureTips';
import WeatherScreen from '../pages/Weather';
import MarketPriceScreen from '../pages/MarketPrice';
import ProductPostScreen from '../pages/ProductPost';
import AdditonalDetailsScreen from '../pages/AdditionalDetails';
import ProductViewerScreen from '../support/ProductViewer';
import PostDetailScreen from '../support/PostDetail';
import ConsumerOrderScreen from '../pages/ConsumerOrder';
import ProfileSettingsScreen from '../pages/ProfileSettings';
import EditProfileScreen from '../pages/EditProfile';
import EditBasicInfoScreen from '../pages/EditBasicInfo';
import EditAccountScreen from '../pages/EditAccount';
import VerificationScreen from '../pages/Verification';
import ProfileConsumerSettingsScreen from '../pages/ProfileConsumerSettings';
import EditConsumerAccountScreen from '../pages/EditConsumerAccount';
import EditConsumerBasicInfoScreen from '../pages/EditConsumerBasicInfo';
import EditConsumerProfileScreen from '../pages/EditConsumerProfile';
import VerificationConsumerScreen from '../pages/VerificationConsumer';
import ConsumerFeedbackScreen from '../pages/ConsumerFeedback';
import ConsumerDetailsScreen from '../pages/ConsumerDetails';
import NotificationFarmerScreen from '../pages/NotificationFarmer';
import FarmerOrderConfirmationScreen from '../pages/FarmerOrderConfirmation';
import MarketplaceFarmerScreen from '../pages/MarketplaceFarmer';
import OrderConfirmationScreen from '../pages/OrderConfirmation';
import NotificationConsumerScreen from '../pages/NotificationConsumer';
import ConsumerProductViewerScreen from '../support/ConsumerProductViewer';
import FarmerDetailsScreen from '../pages/FarmerDetails';
import FarmerOwnViewerScreen from '../pages/FarmerOwnViewer';
import FarmerProductViewerScreen from '../pages/FarmerProductViewer';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProductStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="Product" component={ProductScreen} />
            <Stack.Screen name="Post" component={PostScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen}/>
            <Stack.Screen name="Schedule" component={ScheduleScreen}/>
            <Stack.Screen name="TraceAndTrack" component={TraceAndTraceScreen}/>
            <Stack.Screen name="Tag" component={TagScreen}/>
            <Stack.Screen name="OverviewBalance" component={OverviewBalanceScreen}/>
            <Stack.Screen name="MarketplaceFarmer" component={MarketplaceFarmerScreen} />
            <Stack.Screen name="AgricultureTips" component={AgricultureTipsScreen}/>
            <Stack.Screen name="Weather" component={WeatherScreen}/>
            <Stack.Screen name="MarketPrice" component={MarketPriceScreen}/>
            <Stack.Screen name="ProductPost" component={ProductPostScreen}/>
            <Stack.Screen name="AdditionalDetails" component={AdditonalDetailsScreen}/>
            <Stack.Screen name="NotificationFarmer" component={NotificationFarmerScreen}/>
            <Stack.Screen name="FarmerOrderConfirmation" component={FarmerOrderConfirmationScreen}/>
            <Stack.Screen name="FarmerDetails" component={FarmerDetailsScreen}/>
            <Stack.Screen name="FarmerProductViewer" component={FarmerProductViewerScreen}/>
        </Stack.Navigator>
    );
};

const MarketplaceStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
            <Stack.Screen name="ProductViewer" component={ProductViewerScreen}/>
            <Stack.Screen name="ConsumerOrder" component={ConsumerOrderScreen}/>
            <Stack.Screen name="NotificationConsumer" component={NotificationConsumerScreen}/>
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen}/>
        </Stack.Navigator>
    );
};

const HomepageStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="Homepage" component={HomepageScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen}/>
        </Stack.Navigator>
    );
};

const ProfileConsumerStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="ProfileConsumer" component={ProfileConsumerScreen} />
            <Stack.Screen name="ProfileConsumerSettings" component={ProfileConsumerSettingsScreen}/>
            <Stack.Screen name="EditConsumerAccount" component={EditConsumerAccountScreen}/>
            <Stack.Screen name="EditConsumerBasicInfo" component={EditConsumerBasicInfoScreen}/>
            <Stack.Screen name="EditConsumerProfile" component={EditConsumerProfileScreen}/>
            <Stack.Screen name="VerificationConsumer" component={VerificationConsumerScreen}/>
            <Stack.Screen name="ConsumerProductViewer" component={ConsumerProductViewerScreen}/>
            <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen}/>
            <Stack.Screen name="ConsumerOrder" component={ConsumerOrderScreen}/>
            <Stack.Screen name="FarmerDetails" component={FarmerDetailsScreen}/>
        </Stack.Navigator>
    );
};

const ProfileFarmerStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="ProfileFarmer" component={ProfileFarmerScreen} />
            <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen}/>
            <Stack.Screen name="EditProfile" component={EditProfileScreen}/>
            <Stack.Screen name="EditBasicInfo" component={EditBasicInfoScreen}/>
            <Stack.Screen name="EditAccount" component={EditAccountScreen}/>
            <Stack.Screen name="Verification" component={VerificationScreen}/>
            <Stack.Screen name="ConsumerFeedback" component={ConsumerFeedbackScreen}/>
            <Stack.Screen name="ConsumerDetails" component={ConsumerDetailsScreen}/>
            <Stack.Screen name="FarmerOwnViewer" component={FarmerOwnViewerScreen}/>
        </Stack.Navigator>
    );
};

const HomeTabs = ({ route }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const { width } = useWindowDimensions(); 
    const [tabWidth, setTabWidth] = useState(width / 3);
    const { role } = route.params;

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
    
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
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
                        if (route.name === 'HomeScreen') {
                            iconName = role === 'consumer' ? 'home-outline' : 'home-outline';
                        } else if (route.name === 'MarketScreen') {
                            iconName = role === 'consumer' ? 'storefront-outline' : 'product-house';
                        } else if (route.name === 'ProductScreen') {
                            iconName = 'nutrition-outline';  
                        } else if (route.name === 'ProfileScreen') {
                            iconName = 'person-outline';
                        } else if (route.name === 'ProfileFarmerScreen') {
                            iconName = 'person-outline'; 
                        }
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: 'green',
                    tabBarInactiveTintColor: 'gray',
                    headerShown: false,
                    tabBarStyle: { 
                        position: 'relative', 
                        display: 'flex', 
                        height: 55, 
                        backgroundColor: '#f5f5f5',
                    },
                    tabBarLabelStyle: { 
                        fontSize: width < 375 ? 12 : 14, 
                        fontFamily: 'medium', 
                        marginBottom: 7 
                    }, 
                    tabBarIconStyle: { 
                        size: width < 375 ? 20 : 22, 
                    },
                })}
                screenListeners={({ route }) => ({
                    tabPress: (e) => {
                        let index;
                        
                        if (route.name === 'HomeScreen') {
                            index = 0;
                        } else if (route.name === 'MarketScreen') {
                            index = role === 'consumer' ? 1 : 2;
                        } else if (route.name === 'ProductScreen') {
                            index = 1;
                        } else if (route.name === 'ProfileScreen') {
                            index = 2;
                        } else if (route.name === 'ProfileFarmerScreen') {
                            index = 2;
                        }
                        
                        animateLine(index);
                    },
                })}
            >
                {/* For both consumer and farmer */}
                <Tab.Screen name="HomeScreen" component={HomepageStack} options={{ title: 'Home' }} />

                {/* Marketplace/Products */}
                {role === 'consumer' ? (
                    <Tab.Screen name="MarketScreen" component={MarketplaceStack} options={{ title: 'Marketplace' }} />
                ) : (
                    <Tab.Screen name="ProductScreen" component={ProductStack} options={{ title: 'Product' }} />
                )}

                {/* Consumer and Farmer Profiles */}
                {role === 'consumer' ? (
                    <Tab.Screen name="ProfileScreen" component={ProfileConsumerStack} options={{ title: 'Profile' }} />
                ) : (
                    <Tab.Screen name="ProfileFarmerScreen" component={ProfileFarmerStack} options={{ title: 'Profile' }} />
                )}
                
            </Tab.Navigator>

            <Animated.View
                style={{
                justifyContent: 'center',
                position: 'absolute', 
                bottom: 0, 
                left: tabWidth / 6, 
                width: tabWidth / 1.5,
                height: 6, 
                backgroundColor: 'green',
                borderRadius: 3, 
                transform: [{ translateX }],
                }}
            />
        </View>
    );
};

export default HomeTabs;
