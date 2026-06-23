const crypto = require("crypto");

// Secret for signing QR tokens - same as JWT_SECRET
// A valid token = sessionId + timestamp signed with HMAC
// This prevents forged tokens

const QR_SECRET = process.env.JWT_SECRET || "qr_fallback_secret";

/**
 * Generate a signed QR token for a session
 * Token format: base64( sessionId + "." + timestamp + "." + signature )
 * Timestamp is when token was created (for expiry checks if needed)
 */
const generateQRToken = (sessionId) => {
  const timestamp = Date.now();
  const payload = `${sessionId}.${timestamp}`;
  const signature = crypto
    .createHmac("sha256", QR_SECRET)
    .update(payload)
    .digest("hex");

  // Combine and base64 encode for clean QR data
  const token = Buffer.from(`${payload}.${signature}`).toString("base64url");
  return token;
};

/**
 * Verify a QR token and extract the sessionId
 * Returns { valid: true, sessionId } or { valid: false, reason }
 */
const verifyQRToken = (token) => {
  try {
    // Decode from base64url
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(".");

    if (parts.length !== 3) {
      return { valid: false, reason: "Malformed token" };
    }

    const [sessionId, timestamp, receivedSignature] = parts;

    // Recompute signature to verify authenticity
    const payload = `${sessionId}.${timestamp}`;
    const expectedSignature = crypto
      .createHmac("sha256", QR_SECRET)
      .update(payload)
      .digest("hex");

    if (receivedSignature !== expectedSignature) {
      return { valid: false, reason: "Invalid token signature" };
    }

    return { valid: true, sessionId };
  } catch (err) {
    return { valid: false, reason: "Token decode failed" };
  }
};

module.exports = { generateQRToken, verifyQRToken };