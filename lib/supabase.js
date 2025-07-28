import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;
// console.log("✅ supabaseUrl:", process.env.EXPO_PUBLIC_SUPABASE_URL);
// console.log("✅ supabaseKey:", process.env.EXPO_PUBLIC_SUPABASE_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
