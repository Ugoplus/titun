export const normalizeAdminPassword = (password: string) =>
  password.normalize("NFC");

export function validateAdminPassword(password: string) {
  const normalized = normalizeAdminPassword(password);
  const length = Array.from(normalized).length;
  if (length < 12)
    return { valid: false as const, error: "Use at least 12 characters." };
  if (length > 128)
    return { valid: false as const, error: "Use no more than 128 characters." };
  const blocked = new Set([
    "password1234",
    "password12345",
    "administrator",
    "adminpassword",
    "titunpassword",
    "123456789012",
  ]);
  if (blocked.has(normalized.toLowerCase()))
    return {
      valid: false as const,
      error: "Choose a less common password or passphrase.",
    };
  return { valid: true as const, password: normalized };
}
