/** Matches API swagger: AdminUserCreateRequest.password.minLength */
export const MIN_PASSWORD_LENGTH = 10;

export function validatePasswordForApi(password, { required = false } = {}) {
  const value = String(password ?? "").trim();
  if (!value) {
    return required ? `Password is required (minimum ${MIN_PASSWORD_LENGTH} characters).` : null;
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters (API requirement).`;
  }
  return null;
}

export function normalizeLoginEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}
