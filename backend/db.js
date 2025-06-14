import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = 'https://aqwyrnxdmkogarrkveoz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxd3lybnhkbWtvZ2Fycmt2ZW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNzgwNzksImV4cCI6MjA2NDk1NDA3OX0.SrfR6rIzFetTmq-vJzhA6Jt6ScHi6jFohuLih0Vkwg8'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseKey) 