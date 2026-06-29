import { isMockMode } from "@/lib/env";
import { LoginPageClient } from "./login-client";

export default function LoginPage() {
  return <LoginPageClient showDemo={isMockMode()} />;
}
