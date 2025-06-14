import { supabase } from '../db.js'

export const authApi = {
  // Sign up a new user
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    if (error) throw error
    return data
  },

  // Sign in a user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  // Sign out the current user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { message: 'Successfully signed out' }
  },

  // Get the current user session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Get the current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }
} 