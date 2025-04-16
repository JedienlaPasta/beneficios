"use server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ResponseCookies } from "next/dist/server/web/spec-extension/cookies";

// Secret key for signing JWTs
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-at-least-32-characters-long",
);

type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export async function createSession(
  userId: string,
  nombre_usuario: string,
  rol: string,
) {
  const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });

  // Use the correct type for cookies
  const cookieStore = (await cookies()) as unknown as ResponseCookies;
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });

  const userRole = {
    rol: rol,
    userId: userId,
    nombre_usuario: nombre_usuario,
  };

  cookieStore.set("userRole", JSON.stringify(userRole), {
    httpOnly: false, // Important: must be false to be accessible by client
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, secretKey);
    return verified.payload;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

// No se usa de momento
// export async function updateSession(payload: any) {
//   await createSession(payload.userId);
// }

export async function deleteSession() {
  const cookieStore = (await cookies()) as unknown as ResponseCookies;
  cookieStore.delete("session");
  cookieStore.delete("userRole"); // Also delete the client-side cookie
}

// =========================================================00

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({
    userId: payload.userId,
    expiresAt: payload.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, secretKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}
