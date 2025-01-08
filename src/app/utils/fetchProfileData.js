import supabase from "../admin/supabaseClient";

const fetchProfileData = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id_user", userId);

  if (error) throw new Error(error.message);
  return data[0] || null;
};

export default fetchProfileData;
