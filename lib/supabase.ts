import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function secureDbOperation<T>(
  operation: () => Promise<T>,
  operationName = "database_operation",
): Promise<T | null> {
  try {
    const result = await operation()
    return result
  } catch (error) {
    // Silent error handling - no sensitive logging
    return null
  }
}
