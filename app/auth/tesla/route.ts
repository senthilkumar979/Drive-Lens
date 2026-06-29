import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth/auth";
import { getAuthUrl } from "@/lib/env";

/** Start Tesla OAuth — sets cookies then redirects to Tesla authorize URL. */
export async function GET() {
  try {
    const authorizeUrl = await signIn("tesla", {
      redirectTo: "/dashboard",
      redirect: false,
    });

    if (!authorizeUrl || typeof authorizeUrl !== "string") {
      return NextResponse.redirect(new URL("/login?error=tesla", getAuthUrl()));
    }

    if (!authorizeUrl.startsWith("https://auth.tesla.com/")) {
      console.error("Unexpected Tesla authorize URL:", authorizeUrl);
      return NextResponse.redirect(new URL("/login?error=tesla", getAuthUrl()));
    }

    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    console.error("Tesla OAuth start failed:", error);
    return NextResponse.redirect(new URL("/login?error=tesla", getAuthUrl()));
  }
}
