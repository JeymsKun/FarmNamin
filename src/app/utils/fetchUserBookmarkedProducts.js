import supabase from "../admin/supabaseClient";

const fetchUserBookmarkedProducts = async (userId) => {
  const { data: favorites, error: favoritesError } = await supabase
    .from("favorites")
    .select("product_id")
    .eq("id_user", userId)
    .eq("is_bookmarked", true);

  if (favoritesError) {
    console.error("Error fetching favorites:", favoritesError.message);
    throw new Error(favoritesError.message);
  }

  if (!favorites || favorites.length === 0) {
    return [];
  }

  const productIds = favorites.map((fav) => fav.product_id);

  const { data: products, error: productsError } = await supabase
    .from("product")
    .select("*")
    .in("id", productIds);

  if (productsError) {
    console.error("Error fetching products:", productsError.message);
    throw new Error(productsError.message);
  }

  const filteredProducts = products.filter((product) => {
    const availableMatch = product.available.match(/(\d+(\.\d+)?)/);
    const availableQuantity = availableMatch
      ? parseFloat(availableMatch[0])
      : 0;
    return availableQuantity > 0 && !product.done_product;
  });

  return filteredProducts || [];
};

export default fetchUserBookmarkedProducts;
