import React, { useEffect } from 'react';
import AppNav from './src/navigator/AppNav';
import FontProvider from './src/providers/FontProvider';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux'; 
import store from './src/store/store'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    const hideSplashScreen = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      await SplashScreen.hideAsync(); 
    };

    hideSplashScreen();
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <FontProvider>
          <AppNav />
        </FontProvider>
      </QueryClientProvider>
    </Provider>
  );
}