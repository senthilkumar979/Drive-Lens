/**
 * Tesla returns an OpenID `id_token` when `openid` is in scope. Auth.js validates it
 * and throws if the token contains a `nonce` we did not send. Drop it — we use
 * `access_token` for userinfo / Fleet API instead.
 */
export async function stripTeslaIdTokenFromResponse(
  response: Response,
): Promise<Response> {
  if (!response.ok) return response;

  try {
    const body = (await response.json()) as Record<string, unknown>;
    if (!("id_token" in body)) return response;

    delete body.id_token;
    return Response.json(body, { status: response.status });
  } catch {
    return response;
  }
}
