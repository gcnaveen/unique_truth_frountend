import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPortalMe } from "../../api/portal";
import { logout, updateUser } from "../../reducers/user";
import PaymentGate from "../components/PaymentGate";
import PortalSiteHeader from "../components/PortalSiteHeader";
import {
  canAccessPortalDashboard,
  pickPortalAccessFromLogin,
  unwrapPortalPayload,
} from "../utils/access";

const navItems = [
  { path: "/portal/dashboard", label: "Home", end: true },
  { path: "/portal/dashboard/enquiries", label: "My journey", end: false },
  { path: "/portal/dashboard/sessions", label: "Sessions", end: false },
  { path: "/portal/dashboard/settings", label: "Privacy", end: false },
];

export default function PortalLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isPortalHome = location.pathname === "/portal/dashboard";
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
        fullPayment: access.fullPayment,
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
    <div className="font-body min-h-screen bg-[#0F2E15] text-white">
      <PortalSiteHeader
        navItems={navItems}
        hasAccess={hasAccess}
        showNav={!loading}
        profile={!loading ? profile || { name: displayName, email: email_id } : null}
        displayName={displayName}
        email={email_id}
        levelLabel={levelLabel}
        onLogout={handleLogout}
      />

      <main className="relative z-10">
        {loading ? (
          <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-4 md:px-8">
            <p className="text-sm text-[rgba(255,248,236,0.65)]">Loading your portal…</p>
          </div>
        ) : !hasAccess ? (
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
            <PaymentGate
              accessToken={access_token}
              profile={profile}
              onAccessGranted={(me) => {
                setProfile(me);
                navigate("/portal/dashboard", { replace: true });
              }}
            />
          </div>
        ) : (
          <div
            className={
              isPortalHome ? "" : "mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10"
            }
          >
            <Outlet context={{ profile, refreshProfile }} />
          </div>
        )}
      </main>
    </div>
  );
}
