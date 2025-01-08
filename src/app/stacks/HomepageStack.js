import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomepageScreen from '../pages/Homepage'; 
import PostDetailScreen from '../support/PostDetail';


const Stack = createStackNavigator();

const HomepageStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Homepage" component={HomepageScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen}/>

    </Stack.Navigator>
  );
};

export default HomepageStack;