import supabase from "../admin/supabaseClient";

const deleteProduct = async (productId) => {
  const { error } = await supabase.from("product").delete().eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }
};

export default deleteProduct;
