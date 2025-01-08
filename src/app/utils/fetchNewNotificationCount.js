import supabase from "../admin/supabaseClient";

const fetchNewNotificationCount = async (userId) => {
  if (!userId) {
    throw new Error("User  ID is undefined or null.");
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("consumer_id", userId);

  if (ordersError) {
    console.error("Error fetching orders:", ordersError.message);
    throw new Error(ordersError.message);
  }

  const currentDate = new Date();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  const newNotificationCount = orders.filter((order) => {
    const confirmationDate = new Date(order.date_confirmation);
    return (
      order.confirm_order &&
      order.date_confirmation &&
      currentDate - confirmationDate <= twentyFourHours
    );
  }).length;

  return newNotificationCount;
};

export default fetchNewNotificationCount;
