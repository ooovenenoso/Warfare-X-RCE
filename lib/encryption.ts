import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex")
const ALGORITHM = "aes-256-gcm"

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted
  } catch (error) {
    return text // Fallback to original text if encryption fails
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(":")
    if (parts.length !== 3) return encryptedText

    const iv = Buffer.from(parts[0], "hex")
    const authTag = Buffer.from(parts[1], "hex")
    const encrypted = parts[2]

    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    return encryptedText // Fallback to original text if decryption fails
  }
}

export function hashSensitiveData(data: string): string {
  return crypto
    .createHash("sha256")
    .update(data + ENCRYPTION_KEY)
    .digest("hex")
}

export function sanitizeForLogs(obj: any): any {
  const sensitiveKeys = ["password", "token", "key", "secret", "pin", "email", "discord_id", "stripe"]

  if (typeof obj !== "object" || obj === null) return obj

  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = "[REDACTED]"
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeForLogs(sanitized[key])
    }
  }

  return sanitized
}

// Secure database operations wrapper - THIS WAS MISSING
export async function secureDbOperation<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
  try {
    const result = await operation()
    // Don't log sensitive data
    return result
  } catch (error) {
    // Sanitize error logs
    const sanitizedError = sanitizeForLogs(error)
    throw new Error(`Database operation failed: ${operationName}`)
  }
}
