import { Suspense } from "react";
import { headers } from "next/headers";
import { isMockMode } from "@/lib/env";
import { LoginPageClient } from "./login-client";

function isLocalDevHost(host: string): boolean {
  const hostname = host.split(":")[0];
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export default async function LoginPage() {
  const host = (await headers()).get("host") ?? "";

  return (
    <Suspense fallback={null}>
      <LoginPageClient
        showDemo={isMockMode()}
        isLocalDev={isLocalDevHost(host)}
      />
    </Suspense>
  );
}
