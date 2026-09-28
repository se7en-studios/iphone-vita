/*
 * Sesión del panel: cookie firmada con HMAC (Web Crypto, anda en middleware y en Node).
 * La clave es la service role key, que ya es secreta y solo existe en el servidor:
 * si se rota, todos vuelven a ingresar el PIN.
 */

export const SESSION_COOKIE = "vita_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/**
 * ponytail: sha256 con sal fija. Un PIN de 4 dígitos no lo protege ningún hash (son
 * 10.000 opciones); lo que lo protege es el bloqueo por intentos del login.
 */
export async function hashPin(pin: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(`iphone-vita-admin:${pin}`),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

/** `payload.firma`, payload = base64url de `{ email, exp }`. */
export async function signSession(email: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = b64url(enc.encode(JSON.stringify({ email, exp })));
  const sig = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    enc.encode(payload),
  );
  return `${payload}.${b64url(new Uint8Array(sig))}`;
}

/** Email de la sesión si la firma es válida y no venció; si no, null. */
export async function verifySession(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(),
      fromB64url(sig),
      enc.encode(payload),
    );
    if (!ok) return null;
    const { email, exp } = JSON.parse(
      new TextDecoder().decode(fromB64url(payload)),
    );
    if (typeof email !== "string" || typeof exp !== "number") return null;
    return exp > Date.now() / 1000 ? email : null;
  } catch {
    return null;
  }
}
