import { useEffect } from "react";
import supabase from "../admin/supabaseClient";
import { useDispatch } from "react-redux";
import { setProducts, setProfile } from "../store/profileSlice";
import { fetchBalances } from "../utils/fetchBalances";
import { fetchProfileData } from "../utils/fetchProfileData";
import { fetchUserProducts } from "../utils/fetchUserProducts";
import { setFavorites } from "../store/favoritesSlice";
import { setSchedules } from "../store/scheduleSlice";
import { setBalances } from "../store/balanceSlice";

const useRealTimeUpdates = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const productSubscription = supabase
      .channel("database_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product" },
        async () => {
          const data = await fetchUserProducts(userId);
          dispatch(setProducts(data));
        }
      )
      .subscribe();

    const profileSubscription = supabase
      .channel("database_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        async () => {
          const data = await fetchProfileData(userId);
          dispatch(setProfile(data));
        }
      )
      .subscribe();

    const favoritesSubscription = supabase
      .channel("database_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "favorites" },
        async () => {
          const { data: favoritesData, error } = await supabase
            .from("favorites")
            .select("*")
            .eq("id_user", userId);

          if (error) {
            console.error("Error fetching favorites:", error.message);
          } else {
            dispatch(setFavorites(favoritesData));
          }
        }
      )
      .subscribe();

    const schedulesSubscription = supabase
      .channel("database_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedules" },
        async () => {
          const { data: schedulesData, error } = await supabase
            .from("schedules")
            .select("*")
            .eq("id_user", userId);

          if (error) {
            console.error("Error fetching schedules:", error.message);
          } else {
            dispatch(setSchedules(schedulesData));
          }
        }
      )
      .subscribe();

    const balanceSubscription = supabase
      .channel("database_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "overviewbalance" },
        async () => {
          const balances = await fetchBalances(userId);
          dispatch(setBalances(balances));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productSubscription);
      supabase.removeChannel(profileSubscription);
      supabase.removeChannel(favoritesSubscription);
      supabase.removeChannel(schedulesSubscription);
      supabase.removeChannel(balanceSubscription);
    };
  }, [userId, dispatch]);
};

export default useRealTimeUpdates;
