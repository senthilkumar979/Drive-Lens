export function isMockMode(): boolean {
  return (
    process.env.DRIVELENS_MOCK_MODE === "true" || !process.env.MONGODB_URI
  );
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (isMockMode()) return "drivelens-mock-dev-secret-min-32-chars";
    throw new Error("AUTH_SECRET is not defined");
  }
  return secret;
}

export function hasTeslaCredentials(): boolean {
  return Boolean(
    process.env.TESLA_CLIENT_ID && process.env.TESLA_CLIENT_SECRET,
  );
}

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function hasMapboxToken(): boolean {
  return Boolean(process.env.MAPBOX_TOKEN);
}
