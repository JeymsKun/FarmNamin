import supabase from "../admin/supabaseClient";

const deleteFavoritesByProductId = async (productId) => {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("product_id", productId);

  if (error) {
    throw new Error(error.message);
  }
};

export default deleteFavoritesByProductId;
