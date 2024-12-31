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
  return products || []; 
};

export const fetchNewOrders = async (userId) => {

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0); 

  const { data, error } = await supabase
    .from('orders')
    .select('*') 
    .eq('farmer_id', userId)
    .gt('created_at', startOfToday.toISOString());

  console.log('Check orders:', data);

  if (error) {
    console.error('Error fetching new orders:', error.message); 
    return []; 
  }

  return data || [];
};

export const fetchFeedbacks = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to fetch feedbacks');
  }
  const { data, error } = await supabase
    .from('feedback')
    .select(` id, farmer_id, consumer_id, rating, tags, description, created_at, consumer:users!feedback_consumer_id_fkey (*) `)
    .eq('farmer_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchConsumersWithOrders = async (userId) => {
  if (!userId) {
      throw new Error('User ID is undefined or null.');
  }

  const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('farmer_id', userId);

  if (ordersError) {
      console.error('Error fetching orders:', ordersError.message);
      throw new Error(ordersError.message);
  }

  const { data: consumers, error: consumersError } = await supabase
      .from('users')
      .select('id_user, first_name, last_name, middle_name, suffix, phone_number, role')
      .eq('role', 'consumer'); 

  if (consumersError) {
      console.error('Error fetching consumers:', consumersError.message);
      throw new Error(consumersError.message);
  }

  const combinedData = orders.map(order => {
      const consumer = consumers.find(consumer => consumer.id_user === order.consumer_id);
      return {
          ...order,
          consumer: consumer ? consumer : null,
      };
  });

  return combinedData;
};


export const fetchFarmers = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'farmer')
    .eq('id_user', userId); 

  if (error) {
    console.error('Error fetching farmers:', error.message);
    throw new Error(error.message);
  }

  return data || [];
};

export const fetchUserFavorites = async (userId) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('id, product (*), is_bookmarked') 
    .eq('id_user', userId); 

  if (error) throw new Error(error.message);
  return data || []; 
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
  return data || []; 
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
  })) || [];
};

export const fetchPosts = async (userId) => {
  const { data, error } = await supabase
    .from('posts')
    .select('id, description, location, images, created_at')
    .eq('id_user', userId);

  if (error) throw new Error(error.message);
  return data || [];
};

export const fetchProducts = async (userId) => {
  const { data, error } = await supabase
    .from('product')
    .select('id, name, price, images, created_at')
    .eq('id_user', userId);

  if (error) throw new Error(error.message);
  return data || [];
};

export const fetchProfileData = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id_user', userId);
  
  if (error) throw new Error(error.message);
  return data[0] || null;
};

export const fetchUserProducts = async (userId) => {
  const { data, error } = await supabase
    .from('product')
    .select('id, name, price, images, created_at')
    .eq('id_user', userId);
  
  if (error) throw new Error(error.message);
  return data || [];
};