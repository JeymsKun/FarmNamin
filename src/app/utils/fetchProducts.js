import supabase from "../admin/supabaseClient";

const fetchProducts = async (userId) => {
  const { data, error } = await supabase
    .from("product")
    .select("id, name, price, images, created_at")
    .eq("id_user", userId);

  if (error) throw new Error(error.message);
  return data || [];
};

export default fetchProducts;
