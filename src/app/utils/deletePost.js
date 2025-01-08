import supabase from "../admin/supabaseClient";

const deletePost = async (postId) => {
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }
};

export default deletePost;
