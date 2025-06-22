import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wovfvvutwfidckfhvabz.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdmZ2dnV0d2ZpZGNrZmh2YWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNTY0NzAsImV4cCI6MjA0OTYzMjQ3MH0.BGrKQUJbAPbz2YTEafE2RrNDyYQMLqNtHxkaonSPnJM";

export default supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
