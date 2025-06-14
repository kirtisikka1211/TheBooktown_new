import { supabase } from '../db.js'

export const ordersApi = {
  // Create a new order
  async createOrder(userId, items) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ user_id: userId }])
      .select()
    
    if (orderError) throw orderError

    const orderItems = items.map(item => ({
      order_id: order[0].id,
      book_id: item.bookId,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    return order[0]
  },

  // Get user's orders
  async getUserOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          book:books (
            id,
            title,
            price
          )
        )
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  }
} 