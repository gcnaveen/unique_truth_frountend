/** Normalize POST /admin/users and POST /franchise-admin/users provision responses. */
export function parseUserProvisionResponse(response) {
  const root = response?.data ?? response ?? {};
  const nested = root?.data ?? root;
  const user = nested?.user ?? root?.user ?? nested;
  const initialPassword =
    nested?.initialPassword ??
    root?.initialPassword ??
    response?.initialPassword ??
    null;
  const message = nested?.message ?? root?.message ?? "";
  const email = user?.email ?? "";
  const role = user?.role ?? "";
  const id = user?._id ?? user?.id ?? "";

  return { user, initialPassword, message, email, role, id };
}
