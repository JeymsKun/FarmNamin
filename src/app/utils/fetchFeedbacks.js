import supabase from "../admin/supabaseClient";

const fetchFeedbacks = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch feedbacks");
  }
  const { data, error } = await supabase
    .from("feedback")
    .select(
      ` id, farmer_id, consumer_id, rating, tags, description, created_at, consumer:users!feedback_consumer_id_fkey (*) `
    )
    .eq("farmer_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default fetchFeedbacks;
