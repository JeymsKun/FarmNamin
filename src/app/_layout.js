import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FontProvider from "../app/providers/FontProvider";
import store from "../app/store/store";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GlobalStateProvider } from "../app/context/GlobalState";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <FontProvider>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <GlobalStateProvider>
                <Stack screenOptions={{ headerShown: false }}></Stack>
              </GlobalStateProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </FontProvider>
      </QueryClientProvider>
    </Provider>
  );
}
