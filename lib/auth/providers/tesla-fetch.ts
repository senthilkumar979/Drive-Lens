import { getTeslaFleetAudience } from "@/lib/env";

/**
 * Auth.js puts `token.params` on the token URL query string. Tesla Fleet API
 * requires `audience` in the POST body (see third-party token docs).
 */
export function teslaOAuthFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  if (!url.includes("/oauth2/v3/token") || !init?.body) {
    return fetch(input, init);
  }

  const audience = getTeslaFleetAudience();

  if (init.body instanceof URLSearchParams) {
    if (!init.body.has("audience")) {
      init.body.set("audience", audience);
    }
    return fetch(input, init);
  }

  if (typeof init.body === "string") {
    const params = new URLSearchParams(init.body);
    if (!params.has("audience")) {
      params.set("audience", audience);
      return fetch(input, { ...init, body: params });
    }
  }

  return fetch(input, init);
}
