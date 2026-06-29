"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BRAND } from "@/lib/constants/navigation";

interface LoginPageClientProps {
  showDemo: boolean;
  isLocalDev: boolean;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Tesla callback failed after login (often id_token validation or token exchange). Deploy the latest build, then try Sign in with Tesla again.",
  AccessDenied: "Tesla denied access. Approve all requested scopes.",
  Verification: "Login link expired. Start again from Sign in with Tesla.",
  OAuthSignin: "Could not start Tesla sign-in. Try again.",
  OAuthCallback: "Tesla callback failed — complete login in the same browser you started from.",
  OAuthCreateAccount: "Could not create your account.",
  Callback: "OAuth callback error. Try /auth/tesla again in the same browser.",
  Default: "Sign-in failed. Try again.",
};

export function LoginPageClient({
  showDemo,
  isLocalDev,
}: LoginPageClientProps) {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const errorCode = searchParams.get("code");

  function signInWithTesla() {
    if (isLocalDev) {
      window.location.href = `${BRAND.productionUrl}/auth/tesla`;
      return;
    }
    window.location.href = "/auth/tesla";
  }

  const autoSignInStarted = useRef(false);

  useEffect(() => {
    if (autoSignInStarted.current) return;
    if (searchParams.get("provider") !== "tesla") return;
    autoSignInStarted.current = true;
    if (isLocalDev) {
      window.location.href = `${BRAND.productionUrl}/auth/tesla`;
      return;
    }
    window.location.href = "/auth/tesla";
  }, [isLocalDev, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
            DL
          </div>
          <CardTitle className="text-2xl">{BRAND.name}</CardTitle>
          <CardDescription>{BRAND.tagline}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {authError && (
            <div className="flex flex-col gap-2">
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-xs leading-relaxed">
                {AUTH_ERROR_MESSAGES[authError] ?? AUTH_ERROR_MESSAGES.Default}
                {errorCode ? ` (${errorCode})` : ""}
              </p>
              {authError === "Configuration" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => signInWithTesla()}
                >
                  Try Tesla login again
                </Button>
              )}
            </div>
          )}
          {showDemo && (
            <Button
              className="w-full"
              onClick={() =>
                signIn("demo", {
                  email: "demo@drivelens.app",
                  callbackUrl: "/dashboard",
                })
              }
            >
              Continue with Demo
            </Button>
          )}

          <Button className="w-full" onClick={() => signInWithTesla()}>
            Sign in with Tesla
          </Button>

          {isLocalDev && (
            <p className="text-muted-foreground text-center text-xs leading-relaxed">
              Local dev uses production Tesla OAuth (Akamai often blocks
              localhost). You will land on{" "}
              <span className="font-medium">{BRAND.productionUrl}</span> after
              login. Use the same MongoDB on Vercel for data to appear locally.
            </p>
          )}

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
