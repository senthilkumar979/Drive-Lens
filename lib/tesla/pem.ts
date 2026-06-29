/** Normalize PEM stored in env (supports literal `\n` sequences). */
export function normalizePem(pem: string): string {
  const trimmed = pem.trim();
  if (trimmed.includes("\\n")) {
    return trimmed.replace(/\\n/g, "\n");
  }
  return trimmed;
}

export function isValidEcPublicKeyPem(pem: string): boolean {
  const normalized = normalizePem(pem);
  return (
    normalized.includes("BEGIN PUBLIC KEY") &&
    normalized.includes("END PUBLIC KEY")
  );
}
