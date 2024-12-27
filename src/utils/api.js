import { supabase } from '../backend/supabaseClient';

export const fetchUserBookmarkedProducts = async (userId) => {
  console.log('Fetching bookmarked products for user ID:', userId);

  const { data: favorites, error: favoritesError } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('id_user', userId)
    .eq('is_bookmarked', true); 

  if (favoritesError) {
    console.error('Error fetching favorites:', favoritesError.message);
    throw new Error(favoritesError.message);
  }

  if (!favorites || favorites.length === 0) {
    return [];
  }

  const productIds = favorites.map(fav => fav.product_id);

  const { data: products, error: productsError } = await supabase
    .from('product')
    .select('*')
    .in('id', productIds);

  if (productsError) {
    console.error('Error fetching products:', productsError.message);
    throw new Error(productsError.message);
  }

  console.log('Fetched favorite products:', products);
  return products; 
};

export const fetchUserFavorites = async (userId) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('id, product (*), is_bookmarked') 
    .eq('id_user', userId); 

  if (error) throw new Error(error.message);
  return data; 
};

export const fetchAllProducts = async () => {
  console.log('Fetching all products...'); 

  const { data, error } = await supabase
    .from('product')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error.message); 
    throw new Error(error.message); 
  }

  console.log('Fetched products here api:', data); 
  return data; 
};

export const fetchAllPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select(` id, description, location, images, created_at, id_user, users ( first_name, phone_number)`)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message);

  return data.map(post => ({
    ...post,
    first_name: post.users?.first_name || "Anonymous",
    phone_number: post.users?.phone_number || "------",
  }));
};

export const fetchPosts = async (userId) => {
  const { data, error } = await supabase
    .from('posts')
    .select('id, description, location, images, created_at')
    .eq('id_user', userId);

  if (error) throw new Error(error.message);
  return data;
};

export const fetchProducts = async (userId) => {
  const { data, error } = await supabase
    .from('product')
    .select('id, name, price, images, created_at')
    .eq('id_user', userId);

  if (error) throw new Error(error.message);
  return data;
};

export const fetchProfileData = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id_user, first_name, last_name, middle_name, suffix, birth_month, birth_day, birth_year, bio, experience, profile_pic, cover_photo, phone_number')
    .eq('id_user', userId);
  
  if (error) throw new Error(error.message);
  return data[0];
};

export const fetchUserProducts = async (userId) => {
  const { data, error } = await supabase
    .from('product')
    .select('id, name, price, images, created_at')
    .eq('id_user', userId);
  
  if (error) throw new Error(error.message);
  return data;
};