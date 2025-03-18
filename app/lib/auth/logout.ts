import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: "userSession",
    value: "",
    path: "/",
    expires: new Date(0), // Expira inmediatamente
  });

  return response;
}
