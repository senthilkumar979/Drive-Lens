"use client";

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
}

export function LoginPageClient({ showDemo }: LoginPageClientProps) {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

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

          <Button
            className="w-full"
            onClick={() => signIn("tesla", { callbackUrl: "/dashboard" })}
          >
            Sign in with Tesla
          </Button>

          {isLocalhost && (
            <Button variant="outline" className="w-full" asChild>
              <a href={`${BRAND.productionUrl}/login`}>
                Sign in with Tesla (production)
              </a>
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Sign in with Google
          </Button>

          {isLocalhost && (
            <p className="text-muted-foreground text-center text-xs leading-relaxed">
              If Tesla shows &quot;Access Denied&quot;, Akamai may be blocking
              your network. Try production sign-in above, a mobile hotspot, or
              incognito without VPN/extensions.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
