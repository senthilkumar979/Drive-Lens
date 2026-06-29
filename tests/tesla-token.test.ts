import { describe, expect, it } from "vitest";
import { stripTeslaIdTokenFromResponse } from "@/lib/auth/providers/tesla-token";

describe("stripTeslaIdTokenFromResponse", () => {
  it("removes id_token from successful token responses", async () => {
    const response = Response.json({
      access_token: "at",
      id_token: "header.payload.sig",
      refresh_token: "rt",
    });

    const stripped = await stripTeslaIdTokenFromResponse(response);
    const body = await stripped.json();

    expect(body.access_token).toBe("at");
    expect(body.refresh_token).toBe("rt");
    expect(body.id_token).toBeUndefined();
  });

  it("returns error responses unchanged", async () => {
    const response = Response.json(
      { error: "invalid_auth_code" },
      { status: 400 },
    );

    const result = await stripTeslaIdTokenFromResponse(response);
    expect(result.status).toBe(400);
    expect(await result.json()).toEqual({ error: "invalid_auth_code" });
  });
});
