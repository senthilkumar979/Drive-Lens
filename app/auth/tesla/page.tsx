import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth/auth";
import { TeslaOAuthRedirect } from "./tesla-redirect";

export const metadata: Metadata = {
  referrer: "no-referrer",
};

export default async function TeslaAuthPage() {
  const authorizeUrl = await signIn("tesla", {
    redirectTo: "/dashboard",
    redirect: false,
  });

  if (!authorizeUrl || typeof authorizeUrl !== "string") {
    redirect("/login?error=tesla");
  }

  return <TeslaOAuthRedirect authorizeUrl={authorizeUrl} />;
}
