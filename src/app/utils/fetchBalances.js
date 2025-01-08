import supabase from "../admin/supabaseClient";

const fetchBalances = async (userId) => {
  const { data, error } = await supabase
    .from("overviewbalance")
    .select("overview_balance_id, description, amount, type, created_at")
    .eq("id_user", userId);

  if (error) {
    console.error("Error fetching balances:", error.message);
    throw new Error(error.message);
  }

  return data || [];
};

export default fetchBalances;
