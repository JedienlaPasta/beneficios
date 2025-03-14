import { NextResponse } from "next/server";

export async function checkSession(req: Request) {
  const userSessionCookie = req.headers.get("cookie")?.match(/userSession=([^;]*)/)?.[1];

  if (!userSessionCookie) {
    return { authenticated: false };
  }

  try {
    // Parse the session to verify it's valid JSON
    JSON.parse(decodeURIComponent(userSessionCookie));
    return { authenticated: true };
  } catch (error) {
    console.error("Error parsing session cookie:", error);
    return { authenticated: false };
  }
}

export async function GET(req: Request) {
  const sessionStatus = await checkSession(req);
  return NextResponse.json(sessionStatus, { status: 200 });
}