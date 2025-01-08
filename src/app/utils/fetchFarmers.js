import supabase from "../admin/supabaseClient";

const fetchFarmers = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "farmer")
    .eq("id_user", userId);

  if (error) {
    console.error("Error fetching farmers:", error.message);
    throw new Error(error.message);
  }

  return data || [];
};

export default fetchFarmers;
