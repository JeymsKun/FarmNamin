import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Easing } from 'react-native';
import HomeTabs from '../hometabs/HomeTabs';
import BasicInfoScreen from '../pages/BasicInfo';
import LogInScreen from '../pages/LogIn';
import ResetPasswordScreen from '../pages/ResetPassword';
import ChangePasswordScreen from '../pages/ChangePassword';
import SignUpScreen from '../pages/SignUp';
import IntroductionScreen from '../pages/Introduction';
import WelcomeScreen from '../pages/Welcome';
import SplashScreen from '../pages/Splash';
import RoleSelectionScreen from '../pages/RoleSelection';
import ImageViewer from '../support/ImageViewer';
import PrivacyPolicyScreen from '../pages/PrivacyPolicy';
import TermsScreen from '../pages/Terms';
import AgentAssistScreen from '../pages/AgentAssist';
import AboutUsScreen from '../pages/AboutUs';
import WebViewScreen from '../support/WebViewScreen';
import FaqsScreen from '../pages/Faqs';

const Stack = createStackNavigator();

const AppNav = () => {
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
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
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="LogIn" component={LogInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="BasicInfo" component={BasicInfoScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen}/>
        <Stack.Screen name="Introduction" component={IntroductionScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="ImageViewer" component={ImageViewer}/>
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen}/>
        <Stack.Screen name="Terms" component={TermsScreen}/>
        <Stack.Screen name="AgentAssist" component={AgentAssistScreen}/>
        <Stack.Screen name="AboutUs" component={AboutUsScreen}/>
        <Stack.Screen name="WebBrowser" component={WebViewScreen}/>
        <Stack.Screen name="Faqs" component={FaqsScreen}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default AppNav;
