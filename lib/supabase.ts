import { createClient } from "@supabase/supabase-js"
import { secureDbOperation, secureLog } from "./encryption"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role key for server-side operations
export const createAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Secure wrapper for database operations
export async function secureSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  operation: string,
): Promise<T | null> {
  return secureDbOperation(async () => {
    const { data, error } = await queryFn()

    if (error) {
      secureLog(`Supabase ${operation} error`, { error: error.message })
      throw error
    }

    return data
  }, `Supabase ${operation} failed`)
}

// Export secureDbOperation for use in other files
export { secureDbOperation }
