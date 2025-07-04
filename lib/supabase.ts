import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { getSecureConfig, encrypt } from "./secure-config"

// Get secure configuration
const config = getSecureConfig()

// Create client-side Supabase client
export function createClient() {
  return createSupabaseClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Create admin client with service role key
export function createAdminClient() {
  return createSupabaseClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Secure query wrapper that hides database errors and encrypts sensitive data
export async function secureQuery<T>(
  queryFn: () => Promise<{ data: T; error: any }>,
  options: { hideErrors?: boolean; encryptFields?: string[] } = {},
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await queryFn()

    if (result.error) {
      if (options.hideErrors) {
        console.error("Database query failed:", result.error)
        return { data: null, error: "Query failed" }
      }
      return result
    }

    // Encrypt sensitive fields if specified
    if (options.encryptFields && result.data) {
      const encryptedData = { ...result.data } as any
      for (const field of options.encryptFields) {
        if (encryptedData[field]) {
          encryptedData[field] = encrypt(encryptedData[field])
        }
      }
      return { data: encryptedData, error: null }
    }

    return result
  } catch (error) {
    console.error("Secure query error:", error)
    return { data: null, error: options.hideErrors ? "Query failed" : error }
  }
}

// Get user session securely
export async function getUserSession() {
  try {
    const supabase = createClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Session error:", error)
      return null
    }

    return session
  } catch (error) {
    console.error("Get session error:", error)
    return null
  }
}

// Get user data securely
export async function getUser() {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("User error:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}

// Secure database operations with error handling
export async function secureInsert(table: string, data: any) {
  return secureQuery(() => createAdminClient().from(table).insert(data).select(), { hideErrors: true })
}

export async function secureUpdate(table: string, data: any, condition: any) {
  return secureQuery(() => createAdminClient().from(table).update(data).match(condition).select(), { hideErrors: true })
}

export async function secureSelect(table: string, columns = "*", condition?: any) {
  return secureQuery(
    () => {
      let query = createAdminClient().from(table).select(columns)
      if (condition) {
        query = query.match(condition)
      }
      return query
    },
    { hideErrors: true },
  )
}

export async function secureDelete(table: string, condition: any) {
  return secureQuery(() => createAdminClient().from(table).delete().match(condition), { hideErrors: true })
}
