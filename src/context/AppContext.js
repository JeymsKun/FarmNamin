import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../backend/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

export const UserProvider = ({ children }) => {
  const [userApp, setUserApp] = useState(null); 
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [appData, setAppData] = useState(null); 

  const getUserSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session retrieval error:', error.message);
        setUserApp(null);
      } else if (data?.userApp) {
        const userId = data.userApp.id;
        const userInfo = await getUserInfoComplete(userId); 
        const authenticatedUser = {
          id_user: userId,
          email: data.userApp.email,
          ...userInfo, 
        };
        await AsyncStorage.setItem('userApp', JSON.stringify(authenticatedUser));
        setUserApp(authenticatedUser);
      }
    } catch (err) {
      console.error('Session retrieval error:', err.message);
      setUserApp(null);
    }
  };

  const getUserInfoComplete = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*') 
        .eq('id_user', userId)
        .single();

      if (error) {
        console.error('User info retrieval error:', error.message);
        return {}; 
      }

      console.log('Retrieved user data:', data);
      return data; 
    } catch (err) {
      console.error('User info retrieval error:', err.message);
      return {};
    }
  };

  useEffect(() => {
    getUserSession();

    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.userApp) {
        setUserApp({
          id_user: session.userApp.id,
          email: session.userApp.email,
        });
      } else {
        setUserApp(null);
      }
    });

    return () => {
      if (typeof subscription === 'function') subscription();
    };
  }, []);

  const updateAppData = (newData) => {
    setAppData(newData);
  };

  return (
    <AppContext.Provider value={{ userApp, error, loading, appData, updateAppData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within a AppProvider');
  }
  return context;
};
