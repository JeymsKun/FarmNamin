import { supabase } from '../backend/supabaseClient';
import { isAfter } from 'date-fns';

export const fetchTags = async (userId) => {
  if (!userId) {
      throw new Error("User  ID is required to fetch tags.");
  }

  try {
      const { data, error } = await supabase
          .from('tags')
          .select('main_tag_id, description, amount')
          .eq('id_user', userId); 

      if (error) {
          console.error('Error fetching tags:', error.message);
          throw new Error(error.message); 
      }

      return data || []; 
  } catch (err) {
      console.error('Unexpected error loading tags:', err);
      throw err; 
  }
};

export const fetchBalances = async (userId) => {
  const { data, error } = await supabase
      .from('overviewbalance')
      .select('overview_balance_id, description, amount, type, created_at')
      .eq('id_user', userId);

  if (error) {
      console.error('Error fetching balances:', error.message);
      throw new Error(error.message);
  }

  return data || [];
};

export const fetchSchedules = async (userId) => {
  const { data, error } = await supabase
    .from('schedules')
    .select('id, description, date, start_time, end_time, created_at')
    .eq('id_user', userId);

  if (error) {
    console.error('Error fetching schedules:', error.message);
    throw new Error(error.message);
  }

  return data || [];
};

export const createSchedule = async (schedule) => {
  const { data, error } = await supabase
    .from('schedules')
    .insert([schedule]);

  if (error) {
    console.error('Error creating schedule:', error.message);
    throw new Error(error.message);
  }

  return data[0]; 
};

export const updateSchedule = async (scheduleId, updates) => {
  const { data, error } = await supabase
    .from('schedules')
    .update(updates)
    .eq('id', scheduleId);

  if (error) {
    console.error('Error updating schedule:', error.message);
    throw new Error(error.message);
  }

  return data[0]; 
};

export const deleteSchedule = async (scheduleId) => {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) {
    console.error('Error deleting schedule:', error.message);
    throw new Error(error.message);
  }
};

export const checkAndDeleteExpiredSchedules = async (schedules) => {
  const now = new Date();
  
  for (const schedule of schedules) {
    const scheduleDate = new Date(schedule.date);

    if (!schedule.start_time) {
      if (isAfter(now, scheduleDate)) {
        await deleteSchedule(schedule.id);
      }
    } else {
      const scheduleStartTime = new Date(`${schedule.date}T${schedule.start_time}`);
      const scheduleEndTime = schedule.end_time ? new Date(`${schedule.date}T${schedule.end_time}`) : null;

      const hoursUntilStart = (scheduleStartTime - now) / (1000 * 60 * 60);

      if (isAfter(now, scheduleStartTime) || (hoursUntilStart >= 0 && hoursUntilStart <= 24)) {
        if (scheduleEndTime && isAfter(now, scheduleEndTime)) {
          await deleteSchedule(schedule.id);
        } else if (!scheduleEndTime) {
          await deleteSchedule(schedule.id);
        }
      }
    }
  }
};

export const deleteFavoritesByProductId = async (productId) => {
  const { error } = await supabase
    .from('favorites') 
    .delete()
    .eq('product_id', productId);

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteProduct = async (productId) => {
  const { error } = await supabase
    .from('product')
    .delete()
    .eq('id', productId);

  if (error) {
    throw new Error(error.message);
  }
};

export const deletePost = async (postId) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    throw new Error(error.message);
  }
};

export const markProductAsDone = async (productId) => {
  const { error } = await supabase
    .from('product')
    .update({ done_product: true }) 
    .eq('id', productId);

  if (error) {
    console.error('Error marking product as done:', error.message);
    throw new Error(error.message);
  }
};

export const fetchUserBookmarkedProducts = async (userId) => {

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

  const filteredProducts = products.filter(product => {
      const availableMatch = product.available.match(/(\d+(\.\d+)?)/);
      const availableQuantity = availableMatch ? parseFloat(availableMatch[0]) : 0;
      return availableQuantity > 0 && !product.done_product;
  });

  return filteredProducts || []; 
};

export const fetchNewOrders = async (userId) => {
  const currentDate = new Date();
  const twentyFourHoursAgo = new Date(currentDate);
  twentyFourHoursAgo.setHours(currentDate.getHours() - 24); 

  const { data, error } = await supabase
      .from('orders')
      .select('*') 
      .eq('farmer_id', userId)
      .gt('created_at', twentyFourHoursAgo.toISOString()); 

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

export const fetchFarmersWithOrders = async (userId) => {
  if (!userId) {
      throw new Error('User  ID is undefined or null.');
  }

  const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*, farmers:farmer_id(*)') 
      .eq('consumer_id', userId);

  if (ordersError) {
      console.error('Error fetching orders:', ordersError.message);
      throw new Error(ordersError.message);
  }

  const { data: farmers, error: farmersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'farmer'); 

  if (farmersError) {
      console.error('Error fetching farmers:', farmersError.message);
      throw new Error(farmersError.message);
  }

  const combinedData = orders.map(order => {
      const farmer = farmers.find(farmer => farmer.id_user === order.farmer_id);
      return {
          ...order,
          farmer: farmer ? farmer : null,
      };
  });

  return combinedData;
};

export const fetchNewNotificationCount = async (userId) => {
  if (!userId) {
      throw new Error('User  ID is undefined or null.');
  }

  const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('consumer_id', userId);

  if (ordersError) {
      console.error('Error fetching orders:', ordersError.message);
      throw new Error(ordersError.message);
  }

  const currentDate = new Date();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  const newNotificationCount = orders.filter(order => {
      const confirmationDate = new Date(order.date_confirmation);
      return order.confirm_order && order.date_confirmation && (currentDate - confirmationDate <= twentyFourHours);
  }).length;

  return newNotificationCount;
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

  const { data, error } = await supabase
    .from('product')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error.message); 
    throw new Error(error.message); 
  }
  return data || []; 
};

export const fetchAllProduct = async () => {
  const { data, error } = await supabase
    .from('product')
    .select(`
      *,
      users (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error.message); 
    throw new Error(error.message); 
  }

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
    .select('*') 
    .eq('id_user', userId);
  
  if (error) throw new Error(error.message);

  const filteredProducts = data.filter(product => {
    const availableQuantity = parseFloat(product.available) || 0; 
    return availableQuantity > 0 && !product.done_product; 
  });

  return filteredProducts || [];
};