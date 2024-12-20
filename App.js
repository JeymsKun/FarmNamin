import React from 'react';
import AppNav from './src/navigator/AppNav';
import FontProvider from './src/providers/FontProvider';
import { UserProvider } from './src/context/AppContext'; 

export default function App() {
    return (
      <FontProvider>
        <UserProvider>
          <AppNav />
        </UserProvider>
      </FontProvider>
    );
}
