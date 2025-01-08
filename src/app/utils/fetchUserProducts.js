import supabase from "../admin/supabaseClient";

const fetchUserProducts = async (userId) => {
  const { data, error } = await supabase
    .from("product")
    .select("*")
    .eq("id_user", userId);

  if (error) throw new Error(error.message);

  const filteredProducts = data.filter((product) => {
    const availableQuantity = parseFloat(product.available) || 0;
    return availableQuantity > 0 && !product.done_product;
  });

  return filteredProducts || [];
};

export default fetchUserProducts;
