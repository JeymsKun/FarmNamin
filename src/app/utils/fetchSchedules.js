import supabase from "../admin/supabaseClient";

const fetchSchedules = async (userId) => {
  const { data, error } = await supabase
    .from("schedules")
    .select("id, description, date, start_time, end_time, created_at")
    .eq("id_user", userId);

  if (error) {
    console.error("Error fetching schedules:", error.message);
    throw new Error(error.message);
  }

  return data || [];
};

export default fetchSchedules;
