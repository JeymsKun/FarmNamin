import supabase from "../admin/supabaseClient";

const fetchNewOrders = async (userId) => {
  const currentDate = new Date();
  const twentyFourHoursAgo = new Date(currentDate);
  twentyFourHoursAgo.setHours(currentDate.getHours() - 24);

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("farmer_id", userId)
    .gt("created_at", twentyFourHoursAgo.toISOString());

  if (error) {
    console.error("Error fetching new orders:", error.message);
    return [];
  }

  return data || [];
};

export default fetchNewOrders;
