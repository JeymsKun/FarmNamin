import supabase from "../admin/supabaseClient";

const markProductAsDone = async (productId) => {
  const { error } = await supabase
    .from("product")
    .update({ done_product: true })
    .eq("id", productId);

  if (error) {
    console.error("Error marking product as done:", error.message);
    throw new Error(error.message);
  }
};

export default markProductAsDone;
