import supabase from "../admin/supabaseClient";

const fetchUserFavorites = async (userId) => {
  const { data, error } = await supabase
    .from("favorites")
    .select("id, product (*), is_bookmarked")
    .eq("id_user", userId);

  if (error) throw new Error(error.message);
  return data || [];
};

export default fetchUserFavorites;
