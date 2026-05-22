import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ButterflyBackground from "../components/threejsanimations/Butterflybackground";
import {
  getAuthErrorMessage,
  loginUser,
  pickAuthToken,
  pickAuthUser,
} from "../api/auth";
import { login } from "../reducers/user";
import { pickPortalAccessFromLogin } from "../portal/utils/access";
import { getDashboardHome, isPortalUser, normalizeAuthRole } from "../utils/roles";
import { MIN_PASSWORD_LENGTH, normalizeLoginEmail } from "../utils/authConstants";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTarget = useMemo(() => {
    const from = location.state?.from?.pathname;
    return from && from !== "/login" ? from : null;
  }, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      const response = await loginUser({
        email,
        password,
      });

      const userData = pickAuthUser(response);
      const token = pickAuthToken(response);
      const refreshToken =
        response?.refresh_token || response?.refreshToken || "";
      const role = normalizeAuthRole(userData?.role || response?.role);
      const portalAccess = pickPortalAccessFromLogin(response, userData);

      const authPayload = {
        id: userData?._id || userData?.id || "",
        name: userData?.name || response?.name || "",
        role,
        email_id: userData?.email || response?.email || normalizeLoginEmail(email),
        access_token: token,
        refresh_token: refreshToken,
        venueId: userData?.venueId || null,
        is_change_password: Boolean(userData?.is_change_password),
        is_logged_in: Boolean(token),
        venue: userData?.venue || null,
        venueProfile: userData?.venueProfile || null,
        canAccessDashboard: portalAccess.canAccessDashboard,
        advancePayment: portalAccess.advancePayment,
        counselingLevel: portalAccess.counselingLevel,
      };

      if (!authPayload.access_token) {
        throw new Error("Token not found in login response.");
      }

      dispatch(login(authPayload));

      if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
        return;
      }

      navigate(
        isPortalUser(role) && !portalAccess.canAccessDashboard
          ? "/portal/dashboard"
          : getDashboardHome(role),
        { replace: true },
      );
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a1f14] text-white">
      <div className="absolute inset-0 bg-linear-to-b from-[#0a1f14] via-[#0f2e1a] to-[#0d2416]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-80 w-80 rounded-full bg-amber-600/10 blur-3xl" />
      </div>
      <ButterflyBackground />
      <div className="absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-transparent" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 xl:px-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15 sm:left-6 sm:top-6"
        >
          <span aria-hidden="true">←</span>
          Back to Home
        </button>

        <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/8 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl xl:max-w-xl xl:p-10">
          <h1 className="mb-2 text-center text-3xl font-semibold tracking-tight xl:text-4xl">
            Welcome Back
          </h1>
          <p className="mb-8 text-center text-sm text-white/80 xl:text-base">
            Sign in to continue to your dashboard. Passwords must be at least{" "}
            {MIN_PASSWORD_LENGTH} characters (same as when the account was created).
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="user@example.com"
                className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-[#5eead4]/60 focus:ring-2 focus:ring-[#5eead4]/40 xl:text-base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/25 bg-white/10 py-3 pl-4 pr-12 text-white outline-none transition focus:border-[#5eead4]/60 focus:ring-2 focus:ring-[#5eead4]/40 xl:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/70 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#5eead4]/50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-300/50 bg-red-500/15 px-3 py-2 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-3 text-sm font-semibold text-[#0f2e1a] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 xl:text-base"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;