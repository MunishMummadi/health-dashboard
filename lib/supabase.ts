import { createClient } from "@supabase/supabase-js"

// Environment variables are automatically available from the Supabase integration
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

// Create a Supabase client with the service role key for server operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Create a Supabase client with the anon key for client operations
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Cache query results in the stats_cache table
export async function cacheQueryResult(key: string, value: any) {
  try {
    const { error } = await supabaseAdmin.from("stats_cache").upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
  } catch (error) {
    console.error("Error caching query result:", error)
  }
}

// Get cached query result
export async function getCachedQueryResult(key: string) {
  try {
    const { data, error } = await supabaseAdmin.from("stats_cache").select("value, updated_at").eq("key", key).single()

    if (error) return null
    if (!data) return null

    // Check if cache is older than 1 hour
    const updatedAt = new Date(data.updated_at)
    const now = new Date()
    const cacheAge = (now.getTime() - updatedAt.getTime()) / 1000 / 60 // in minutes

    if (cacheAge > 60) return null // Cache expired

    return data.value
  } catch (error) {
    console.error("Error getting cached query result:", error)
    return null
  }
}

