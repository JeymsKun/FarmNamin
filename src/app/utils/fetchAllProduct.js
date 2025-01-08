import supabase from "../admin/supabaseClient";

const fetchAllProduct = async () => {
  const { data, error } = await supabase
    .from("product")
    .select(
      `
      *,
      users (*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message);
    throw new Error(error.message);
  }

  return data || [];
};

export default fetchAllProduct;
