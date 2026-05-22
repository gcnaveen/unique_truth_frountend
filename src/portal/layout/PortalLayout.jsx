import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPortalMe } from "../../api/portal";
import { logout, updateUser } from "../../reducers/user";
import PaymentGate from "../components/PaymentGate";
import {
  canAccessPortalDashboard,
  pickPortalAccessFromLogin,
  unwrapPortalPayload,
} from "../utils/access";
import { getCounselingLevelLabel } from "../utils/format";

const navItems = [
  { path: "/portal/dashboard", label: "Home", end: true },
  { path: "/portal/dashboard/enquiries", label: "My journey", end: false },
  { path: "/portal/dashboard/sessions", label: "Sessions", end: false },
  { path: "/portal/dashboard/settings", label: "Privacy", end: false },
];

export default function PortalLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { name, email_id, access_token, counselingLevel } = useSelector(
    (state) => state.user.value,
  );
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!access_token) return null;
    const response = await getPortalMe(access_token);
    const data = unwrapPortalPayload(response);
    setProfile(data);
    const access = pickPortalAccessFromLogin(data);
    dispatch(
      updateUser({
        canAccessDashboard: access.canAccessDashboard,
        advancePayment: access.advancePayment,
        counselingLevel: access.counselingLevel,
      }),
    );
    return data;
  }, [access_token, dispatch]);

  useEffect(() => {
    if (!access_token) return;
    const load = async () => {
      try {
        setLoading(true);
        await refreshProfile();
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token, refreshProfile]);

  const hasAccess = canAccessPortalDashboard(profile);
  const displayName = profile?.name || name || "Member";
  const levelLabel = counselingLevel || profile?.counselingLevel;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0a1f14] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#5eead4]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#c9a86c]/10 blur-3xl" />
      </div>

      <header className="relative z-20 border-b border-white/10 bg-[#0f2e1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#c9a86c] to-[#5eead4] text-sm font-bold text-[#0f2e1a]">
              UT
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Unique Truth</p>
              <p className="text-xs text-white/55">Member portal</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <p className="text-right text-sm font-medium text-white">{displayName}</p>
            {levelLabel ? (
              <span className="rounded-full border border-[#c9a86c]/40 bg-[#c9a86c]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#fde68a]">
                {getCounselingLevelLabel(levelLabel)}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
          >
            Sign out
          </button>
        </div>

        {hasAccess ? (
          <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 md:px-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-[#5eead4]/20 text-[#a7f3d0]"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-sm text-white/70">Loading your portal…</p>
          </div>
        ) : !hasAccess ? (
          <PaymentGate
            accessToken={access_token}
            profile={profile}
            onAccessGranted={(me) => {
              setProfile(me);
              navigate("/portal/dashboard", { replace: true });
            }}
          />
        ) : (
          <Outlet context={{ profile, refreshProfile }} />
        )}
      </main>

      <p className="relative z-10 pb-8 text-center text-xs text-white/40">
        Signed in as {email_id || displayName}
      </p>
    </div>
  );
}
