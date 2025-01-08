import supabase from "../admin/supabaseClient";

const fetchAllPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      ` id, description, location, images, created_at, id_user, users ( first_name, phone_number)`
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    data.map((post) => ({
      ...post,
      first_name: post.users?.first_name || "Anonymous",
      phone_number: post.users?.phone_number || "------",
    })) || []
  );
};

export default fetchAllPosts;
