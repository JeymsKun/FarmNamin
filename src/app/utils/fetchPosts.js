import supabase from "../admin/supabaseClient";

const fetchPosts = async (userId) => {
  const { data, error } = await supabase
    .from("posts")
    .select("id, description, location, images, created_at")
    .eq("id_user", userId);

  if (error) throw new Error(error.message);
  return data || [];
};

export default fetchPosts;
