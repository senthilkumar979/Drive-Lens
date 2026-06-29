import { afterEach, describe, expect, it, vi } from "vitest";
import { teslaOAuthFetch } from "@/lib/auth/providers/tesla-fetch";

describe("teslaOAuthFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("adds audience to token POST body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: "abc",
    });

    await teslaOAuthFetch("https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token", {
      method: "POST",
      body,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.body).toBeInstanceOf(URLSearchParams);
    expect((init.body as URLSearchParams).get("audience")).toBe(
      "https://fleet-api.prd.eu.vn.cloud.tesla.com",
    );
  });

  it("does not modify non-token requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);

    await teslaOAuthFetch("https://auth.tesla.com/oauth2/v3/userinfo", {
      method: "GET",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.body).toBeUndefined();
  });
});
