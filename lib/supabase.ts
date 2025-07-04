import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { encrypt, decrypt } from "./secure-config"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create client function for client-side usage
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Create admin client function for server-side operations
export function createAdminClient() {
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Default client instance
export const supabase = createClient()

// Admin client instance
export const supabaseAdmin = createAdminClient()

// Secure query wrapper that encrypts sensitive data and hides errors
export async function secureQuery<T = any>(
  query: () => Promise<{ data: T | null; error: any }>,
  options: {
    encryptFields?: string[]
    hideErrors?: boolean
  } = {},
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await query()

    if (result.error) {
      if (options.hideErrors) {
        console.error("Database error (hidden):", result.error)
        return { data: null, error: { message: "Database operation failed" } }
      }
      return result
    }

    // Encrypt specified fields if in production
    if (result.data && options.encryptFields && process.env.NODE_ENV === "production") {
      const encryptedData = { ...result.data }
      for (const field of options.encryptFields) {
        if (encryptedData[field as keyof T]) {
          ;(encryptedData as any)[field] = encrypt(String((encryptedData as any)[field]))
        }
      }
      return { data: encryptedData, error: null }
    }

    return result
  } catch (error) {
    console.error("Secure query error:", error)
    return {
      data: null,
      error: options.hideErrors ? { message: "Database operation failed" } : error,
    }
  }
}

// Helper function to decrypt data
export function decryptData<T>(data: T, fields: string[]): T {
  if (!data || process.env.NODE_ENV !== "production") return data

  const decryptedData = { ...data }
  for (const field of fields) {
    if ((decryptedData as any)[field]) {
      try {
        ;(decryptedData as any)[field] = decrypt((decryptedData as any)[field])
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error)
      }
    }
  }
  return decryptedData
}

// Helper function to get user session
export async function getUserSession() {
  const client = createClient()
  const {
    data: { session },
    error,
  } = await client.auth.getSession()

  if (error) {
    console.error("Session error:", error)
    return null
  }

  return session
}

// Helper function to get user
export async function getUser() {
  const client = createClient()
  const {
    data: { user },
    error,
  } = await client.auth.getUser()

  if (error) {
    console.error("User error:", error)
    return null
  }

  return user
}
