import React, { useRef, useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { View, Animated, Dimensions, BackHandler } from 'react-native';
import MarketScreen from './../pages/copiedMarketplace';
import ProductScreen from './../pages/Product';
import ProfileScreen from './../pages/Profile';
import ProfileFarmer from './../pages/ProfileFarmer';  
import HomepageFarmer from './../pages/HomepageFarmer';
import PostScreen from './../pages/Post';
import CalendarScreen from '../pages/Calendar';
import SchedulerScreen from '../pages/Scheduler';
import FinanceScreen from '../pages/Finance';
import TagScreen from '../pages/Tag';
import FinancialLogScreen from '../pages/FinancialLog';
import OverviewBalanceScreen from '../pages/OverviewBalance';
import AccountScreen from '../pages/Account';
import ShowAccountScreen from '../pages/ShowAccount';
import TipsScreen from '../pages/Tips';
import WeatherScreen from '../pages/Weather';
import MarketPriceScreen from '../pages/MarketPrice';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const { width } = Dimensions.get('window');

const ProductStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="FarmerProductScreen" component={ProductScreen} />
            <Stack.Screen name="Post" component={PostScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen}/>
            <Stack.Screen name="Scheduler" component={SchedulerScreen}/>
            <Stack.Screen name="Finance" component={FinanceScreen}/>
            <Stack.Screen name="Tag" component={TagScreen}/>
            <Stack.Screen name="FinancialLog" component={FinancialLogScreen}/>
            <Stack.Screen name="OverviewBalance" component={OverviewBalanceScreen}/>
            <Stack.Screen name="Account" component={AccountScreen}/>
            <Stack.Screen name="ShowAccount" component={ShowAccountScreen}/>
            <Stack.Screen name="Marketplace" component={MarketScreen} />
            <Stack.Screen name="Tips" component={TipsScreen}/>
            <Stack.Screen name="Weather" component={WeatherScreen}/>
            <Stack.Screen name="MarketPrice" component={MarketPriceScreen}/>
        
        </Stack.Navigator>
    );
};

const MarketStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="Marketplace" component={MarketScreen} />
        
        </Stack.Navigator>
    );
};

const HomeStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="HomepageFarmer" component={HomepageFarmer} />
        </Stack.Navigator>
    );
};


const ProfileStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
        >
            <Stack.Screen name="Profile" component={ProfileScreen} />
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
            <Stack.Screen name="ProfileFarmer" component={ProfileFarmer} />
        </Stack.Navigator>
    );
};

const HomeTabs = ({ route }) => {
    const translateX = useRef(new Animated.Value(0)).current;
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
        const handleResize = () => {
        setTabWidth(Dimensions.get('window').width / 3);
    };

        const dimensionsHandler = Dimensions.addEventListener('change', handleResize);

        return () => {
            dimensionsHandler?.remove();
        };
    }, []);

const screenOptions = {
    headerShown: false,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

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
                tabBarLabelStyle: { fontSize: 14, fontFamily: 'medium', marginBottom: 7 }, 
                tabBarIconStyle: { size: 24, marginTop: 1 },
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
                <Tab.Screen name="HomeScreen" component={HomeStack} options={{ title: 'Home' }} />

                {/* Marketplace/Products */}
                {role === 'consumer' ? (
                    <Tab.Screen name="MarketScreen" component={MarketStack} options={{ title: 'Marketplace' }} />
                ) : (
                    <Tab.Screen name="ProductScreen" component={ProductStack} options={{ title: 'Product' }} />
                )}

                {/* Consumer and Farmer Profiles */}
                {role === 'consumer' ? (
                    <Tab.Screen name="ProfileScreen" component={ProfileStack} options={{ title: 'Profile' }} />
                ) : (
                    <Tab.Screen name="ProfileFarmerScreen" component={ProfileFarmerStack} options={{ title: 'Profile' }} />
                )}
                
            </Tab.Navigator>

            <Animated.View
                style={{
                justifyContent: 'center',
                position: 'absolute', 
                bottom: 2, 
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
