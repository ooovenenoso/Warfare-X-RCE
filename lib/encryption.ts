import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-for-development-only"
const ALGORITHM = "aes-256-gcm"

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return iv.toString("hex") + ":" + encrypted
  } catch (error) {
    return text // Fallback to original text if encryption fails
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(":")
    if (parts.length !== 2) return encryptedText

    const iv = Buffer.from(parts[0], "hex")
    const encrypted = parts[1]
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    return encryptedText // Fallback to original text if decryption fails
  }
}

export function sanitizeForLogging(data: any): any {
  if (typeof data !== "object" || data === null) {
    return data
  }

  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "key",
    "email",
    "phone",
    "ssn",
    "credit_card",
    "stripe",
    "payment",
    "discord_id",
    "user_id",
    "ip",
    "address",
    "location",
    "personal",
  ]

  const sanitized = { ...data }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]"
    }
  }

  return sanitized
}

// Alias for compatibility with different naming conventions
export const sanitizeForLogs = sanitizeForLogging

export async function secureDbOperation<T>(
  operation: () => Promise<T>,
  errorMessage = "Database operation failed",
): Promise<T | null> {
  try {
    const result = await operation()
    return result
  } catch (error) {
    // Silent error handling - don't log sensitive database errors
    return null
  }
}

export function secureLog(message: string, data?: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(message, data ? sanitizeForLogging(data) : "")
  }
  // In production, we don't log anything to prevent information disclosure
}
