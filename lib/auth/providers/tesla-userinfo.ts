import { getTeslaFleetAudience } from "@/lib/env";

interface TeslaUserProfile {
  sub?: string;
  email?: string;
  name?: string;
}

function decodeIdTokenPayload(idToken: string): Record<string, unknown> | null {
  try {
    const segment = idToken.split(".")[1];
    if (!segment) return null;
    const json = Buffer.from(segment, "base64url").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function fetchTeslaUserProfile(
  accessToken: string,
  idToken?: string | null,
): Promise<TeslaUserProfile> {
  try {
    const response = await fetch("https://auth.tesla.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.ok) {
      return (await response.json()) as TeslaUserProfile;
    }
    console.warn(
      "[auth] Tesla userinfo HTTP",
      response.status,
      await response.text(),
    );
  } catch (error) {
    console.warn("[auth] Tesla userinfo request failed:", error);
  }

  if (idToken) {
    const claims = decodeIdTokenPayload(idToken);
    if (claims?.sub) {
      return {
        sub: String(claims.sub),
        email: claims.email ? String(claims.email) : undefined,
        name: claims.name ? String(claims.name) : undefined,
      };
    }
  }

  try {
    const fleetResponse = await fetch(
      `${getTeslaFleetAudience()}/api/1/users/me`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (fleetResponse.ok) {
      const data = (await fleetResponse.json()) as {
        response?: { email?: string; full_name?: string };
      };
      const user = data.response;
      if (user?.email) {
        return {
          sub: user.email,
          email: user.email,
          name: user.full_name ?? user.email,
        };
      }
    }
  } catch (error) {
    console.warn("[auth] Tesla fleet users/me failed:", error);
  }

  return { sub: "tesla-user" };
}
