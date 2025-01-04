import { useState, useEffect } from 'react';
import { supabase } from '../backend/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const [user, setUser ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session retrieval error:', error.message);
        throw new Error(error.message);
      } else if (data?.user) {
        const userId = data.user.id;
        const userInfo = await getUserInfoComplete(userId);

        const authenticatedUser  = {
          id_user: userId,
          email: data.user.email,
          role: userInfo.role,
          is_info_complete: userInfo.is_info_complete,
        };

        await AsyncStorage.setItem('user', JSON.stringify(authenticatedUser ));
        setUser(authenticatedUser );
      }
    } catch (err) {
      console.error('Session retrieval error:', err.message);
      throw err;
    }
  };

  const getUserInfoComplete = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, phone_number, role, is_info_complete')
        .eq('id_user', userId)
        .single();

      if (error) {
        console.error('User info retrieval error:', error.message);
        throw new Error(error.message);
      }

      return {
        first_name: data?.first_name || null,
        phone_number: data?.phone_number || null,
        role: data?.role || null,
        is_info_complete: data?.is_info_complete || false,
      };
    } catch (err) {
      console.error('User info retrieval error:', err.message);
      throw new Error(error.message);
    }
  };

  const signInWithEmailPassword = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };  
      }

      const userId = data?.user?.id;
      const userInfo = await getUserInfoComplete(userId);

      if (!userInfo.role) {
        return null;
      }

      const authenticatedUser  = {
        id_user: userId,
        email: data?.user?.email,
        first_name: userInfo.first_name,
        phone_number: userInfo.phone_number,
        role: userInfo.role,
        is_info_complete: userInfo.is_info_complete,
      };

      await AsyncStorage.setItem('user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return authenticatedUser ;
    } catch (err) {
      return { success: false, message: 'Unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign-out error:', error.message);
        throw new Error(error.message);
      } else {
        await AsyncStorage.removeItem('user');
        setUser(null);
      }
    } catch (err) {
      console.error('Sign-out error:', err.message);
      throw err;
    }
  };

  const fetchUserInfo = async (userId) => {
    const userInfo = await getUserInfoComplete(userId);
    const authenticatedUser  = {
      id_user: userId,
      email: userInfo.email,
      first_name: userInfo.first_name,
      phone_number: userInfo.phone_number,
      role: userInfo.role,
      is_info_complete: userInfo.is_info_complete,
    };

    await AsyncStorage.setItem('user', JSON.stringify(authenticatedUser));
    setUser (authenticatedUser );
  };

  useEffect(() => {
    const checkStoredUser  = async () => {
      const storedUser  = await AsyncStorage.getItem('user');
      if (storedUser ) {
        setUser (JSON.parse(storedUser ));
      }
      setLoading(false);
    };
  
    const getSessionAndSubscribe = async () => {
      await getUserSession(); 
      checkStoredUser (); 
  
      const subscription = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          fetchUserInfo(session.user.id);
        } else {
          setUser (null);
        }
      });
  
      return () => {
        if (typeof subscription === 'function') subscription();
      };
    };
  
    getSessionAndSubscribe();
  }, []); 

  return {
    user,
    loading,
    error,
    signInWithEmailPassword,
    signOut,
  };
};