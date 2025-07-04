import crypto from "crypto"

// Get encryption secret from environment
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || "fallback-secret-key-change-in-production"

// Ensure we have a proper 32-byte key for AES-256
const ENCRYPTION_KEY = crypto.scryptSync(ENCRYPTION_SECRET, "salt", 32)

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return iv.toString("hex") + ":" + encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    return text // Return original text if encryption fails
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const textParts = encryptedText.split(":")
    if (textParts.length !== 2) return encryptedText

    const iv = Buffer.from(textParts[0], "hex")
    const encryptedData = textParts[1]
    const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY)
    let decrypted = decipher.update(encryptedData, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    return encryptedText // Return encrypted text if decryption fails
  }
}

export function obfuscateKey(key: string): string {
  if (!key || key.length < 8) return key

  const start = key.substring(0, 4)
  const end = key.substring(key.length - 4)
  const middle = "*".repeat(Math.max(4, key.length - 8))

  return `${start}${middle}${end}`
}

export function hashId(id: string): string {
  return crypto.createHash("sha256").update(id).digest("hex").substring(0, 16)
}

export function getSecureConfig() {
  // Validate required environment variables
  const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  const missing = requiredVars.filter((varName) => !process.env[varName])
  if (missing.length > 0) {
    console.error("Missing required environment variables:", missing)
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    encryptionSecret: ENCRYPTION_SECRET,
  }
}

// Security headers for API responses
export function getSecurityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  }
}
