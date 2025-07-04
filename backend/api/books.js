import { supabase } from '../db.js'

export const booksApi = {
  // Get all books
  async getAllBooks() {
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        authors (
          id,
          name
        )
      `)
    
    if (error) throw error
    return data
  },

  // Get a single book by ID
  async getBookById(id) {
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        authors (
          id,
          name
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create a new book
  async createBook(bookData) {
    const { data, error } = await supabase
      .from('books')
      .insert([bookData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Update a book
  async updateBook(id, bookData) {
    const { data, error } = await supabase
      .from('books')
      .update(bookData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete a book
  async deleteBook(id) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Get user's book requests
  async getUserRequests(userId) {
    const { data, error } = await supabase
      .from('book_requests')
      .select(`
        *,
        book:books (
          id,
          title,
          author,
          image_url,
          donor:user_id (
            id,
            full_name
          )
        )
      `)
      .eq('requester_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
} 