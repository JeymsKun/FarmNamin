import supabase from "../admin/supabaseClient";

const fetchConsumersWithOrders = async (userId) => {
  if (!userId) {
    throw new Error("User ID is undefined or null.");
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("farmer_id", userId);

  if (ordersError) {
    console.error("Error fetching orders:", ordersError.message);
    throw new Error(ordersError.message);
  }

  const { data: consumers, error: consumersError } = await supabase
    .from("users")
    .select(
      "id_user, first_name, last_name, middle_name, suffix, phone_number, role"
    )
    .eq("role", "consumer");

  if (consumersError) {
    console.error("Error fetching consumers:", consumersError.message);
    throw new Error(consumersError.message);
  }

  const combinedData = orders.map((order) => {
    const consumer = consumers.find(
      (consumer) => consumer.id_user === order.consumer_id
    );
    return {
      ...order,
      consumer: consumer ? consumer : null,
    };
  });

  return combinedData;
};

export default fetchConsumersWithOrders;
