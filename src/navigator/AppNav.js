import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Easing } from 'react-native';
import HomeTabs from '../hometabs/HomeTabs';
import ProfileSetUp from '../pages/ProfileSetUp';
import LogIn from '../pages/LogIn';
import ResetPasswordScreen from '../pages/ResetPasswordScreen';
import ChangePassword from '../pages/ChangePassword';
import SignUpScreen from '../pages/SignUpScreen';
import IntroScreen from '../pages/IntroScreen';
import WelcomeScreen from '../pages/WelcomeNewUser';
import SplashScreen from '../pages/SplashScreen';
import RoleSelection from '../pages/RoleSelection';
import ImageViewer from '../support/ImageViewer';
import PrivacyPolicyScreen from '../pages/PrivacyPolicy';
import TermsScreen from '../pages/Terms';
import WebViewScreen from '../support/WebViewScreen';

const Stack = createStackNavigator();

const AppNav = () => {
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
                easing: Easing.out(Easing.ease),
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 300,
                easing: Easing.in(Easing.ease),
              },
            },
          },
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                opacity: current.progress,
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelection} />
        <Stack.Screen name="LogIn" component={LogIn} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ProfileSetUp" component={ProfileSetUp} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePassword}/>
        <Stack.Screen name="IntroScreen" component={IntroScreen} />
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="ImageViewer" component={ImageViewer}/>
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen}/>
        <Stack.Screen name="Terms" component={TermsScreen}/>
        <Stack.Screen name="WebBrowser" component={WebViewScreen}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default AppNav;
