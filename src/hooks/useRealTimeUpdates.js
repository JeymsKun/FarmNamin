import { useEffect } from 'react';
import { supabase } from '../backend/supabaseClient';
import { useDispatch } from 'react-redux';
import { setProducts, setProfile } from '../store/profileSlice';
import { fetchProfileData, fetchUserProducts } from '../utils/api';
import { setFavorites } from '../store/favoritesSlice';

const useRealTimeUpdates = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const productSubscription = supabase
      .channel('database_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product' }, async () => {
        const data = await fetchUserProducts(userId);
        dispatch(setProducts(data));
      })
      .subscribe();

    const profileSubscription = supabase
      .channel('database_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
        const data = await fetchProfileData(userId);
        dispatch(setProfile(data));
      })
      .subscribe();

    const favoritesSubscription = supabase
      .channel('database_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, async () => {
        const { data: favoritesData, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('id_user', userId);

        if (error) {
          console.error('Error fetching favorites:', error.message);
        } else {
          dispatch(setFavorites(favoritesData)); 
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productSubscription);
      supabase.removeChannel(profileSubscription);
      supabase.removeChannel(favoritesSubscription);
    };
  }, [userId, dispatch]);
};

export default useRealTimeUpdates;