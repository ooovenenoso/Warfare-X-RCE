import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || "dev-fallback-key-32-chars-long!!"
const ALGORITHM = "aes-256-cbc"

export function encrypt(text: string): string {
  try {
    if (process.env.NODE_ENV === "development") {
      return Buffer.from(text).toString("base64")
    }

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return iv.toString("hex") + ":" + encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    return Buffer.from(text).toString("base64")
  }
}

export function decrypt(encryptedText: string): string {
  try {
    if (process.env.NODE_ENV === "development") {
      return Buffer.from(encryptedText, "base64").toString("utf8")
    }

    const textParts = encryptedText.split(":")
    const iv = Buffer.from(textParts.shift()!, "hex")
    const encryptedData = textParts.join(":")
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    let decrypted = decipher.update(encryptedData, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    return Buffer.from(encryptedText, "base64").toString("utf8")
  }
}

export function obfuscateKey(key: string): string {
  if (!key) return "undefined"
  const visible = key.slice(0, 8)
  const hidden = "*".repeat(Math.max(0, key.length - 8))
  return visible + hidden
}

export function hashId(id: string): string {
  try {
    return crypto
      .createHash("sha256")
      .update(id + ENCRYPTION_KEY)
      .digest("hex")
      .slice(0, 16)
  } catch (error) {
    console.error("Hash error:", error)
    return Buffer.from(id).toString("base64").slice(0, 16)
  }
}

export function getSecureConfig() {
  return {
    supabaseUrl: obfuscateKey(process.env.SUPABASE_URL || ""),
    supabaseKey: obfuscateKey(process.env.SUPABASE_ANON_KEY || ""),
    stripeKey: obfuscateKey(process.env.STRIPE_SECRET_KEY || ""),
    encryptionEnabled: process.env.NODE_ENV === "production",
    environment: process.env.NODE_ENV || "development",
  }
}

// Generate secure random string
export function generateSecureId(length = 16): string {
  return crypto.randomBytes(length).toString("hex")
}

// Validate environment variables
export function validateEnvironment(): boolean {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error("Missing required environment variables:", missing)
    return false
  }

  return true
}
