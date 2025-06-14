import { supabase } from '../db.js'

export const reviewsApi = {
  // Get reviews for a book
  async getBookReviews(bookId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .eq('book_id', bookId)
    
    if (error) throw error
    return data
  },

  // Create a review
  async createReview(reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
    
    if (error) throw error
    return data[0]
  }
} 