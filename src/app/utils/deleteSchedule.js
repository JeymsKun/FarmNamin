import supabase from "../admin/supabaseClient";

const deleteSchedule = async (scheduleId) => {
  const { error } = await supabase
    .from("schedules")
    .delete()
    .eq("id", scheduleId);

  if (error) {
    console.error("Error deleting schedule:", error.message);
    throw new Error(error.message);
  }
};

export default deleteSchedule;
