import supabase from "../admin/supabaseClient";

const fetchFarmersWithOrders = async (userId) => {
  if (!userId) {
    throw new Error("User  ID is undefined or null.");
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*, farmers:farmer_id(*)")
    .eq("consumer_id", userId);

  if (ordersError) {
    console.error("Error fetching orders:", ordersError.message);
    throw new Error(ordersError.message);
  }

  const { data: farmers, error: farmersError } = await supabase
    .from("users")
    .select("*")
    .eq("role", "farmer");

  if (farmersError) {
    console.error("Error fetching farmers:", farmersError.message);
    throw new Error(farmersError.message);
  }

  const combinedData = orders.map((order) => {
    const farmer = farmers.find((farmer) => farmer.id_user === order.farmer_id);
    return {
      ...order,
      farmer: farmer ? farmer : null,
    };
  });

  return combinedData;
};

export default fetchFarmersWithOrders;
