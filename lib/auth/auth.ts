import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { upsertUser } from "@/lib/db/repositories";
import { getAuthSecret, hasTeslaCredentials, isMockMode } from "@/lib/env";
import { DEMO_IDS, seedDemoData } from "@/lib/mock/seed";
import { teslaProvider } from "./providers/tesla";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
  ...(isMockMode()
    ? [
        Credentials({
          id: "demo",
          name: "Demo",
          credentials: {
            email: { label: "Email", type: "email" },
          },
          async authorize(credentials) {
            seedDemoData();
            const email = (credentials?.email as string) || "demo@drivelens.app";
            const user = await upsertUser({
              _id: DEMO_IDS.userId,
              email,
              name: "Demo Driver",
              preferences: {
                units: "metric",
                notifications: {
                  batteryLow: true,
                  chargingComplete: true,
                  vehicleUnlocked: true,
                },
              },
            });
            return {
              id: typeof user._id === "string" ? user._id : user._id.toString(),
              email: user.email,
              name: user.name,
            };
          },
        }),
      ]
    : []),
    ...(hasTeslaCredentials() ? [teslaProvider] : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.userId = user.id;
      }
      if (account?.provider === "tesla" && account.access_token) {
        token.teslaAccessToken = account.access_token;
        token.teslaRefreshToken = account.refresh_token;
        token.teslaExpiresAt = account.expires_at;
      }
      if (isMockMode() && !token.userId) {
        token.userId = DEMO_IDS.userId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
