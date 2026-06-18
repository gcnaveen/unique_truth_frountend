import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPortalMe, getPortalAnnouncementsUnreadCount } from "../../api/portal";
import { logout, updateUser } from "../../reducers/user";
import PaymentGate from "../components/PaymentGate";
import PortalFingerprintReminder from "../components/PortalFingerprintReminder";
import PortalLoader from "../components/PortalLoader";
import PortalSiteHeader from "../components/PortalSiteHeader";
import { pickUserProfilePhotoUrl } from "../../utils/profilePhoto";
import { pickProfileEdit } from "../../utils/profileEdit";
import {
  getPortalProfileLoadErrorMessage,
  hasStoredPortalDashboardAccess,
  pickPortalAccessFromLogin,
  resolvePortalDashboardAccess,
  unwrapPortalPayload,
} from "../utils/access";
import { PORTAL_ANNOUNCEMENTS_PATH, pickAnnouncementUnreadCount } from "../../utils/announcements";
import {
  checkPortalFingerprintStatus,
  loadPortalEnquiryList,
  profileIndicatesFingerprint,
  resolvePrimaryEnquiryId,
} from "../utils/fingerprint";

const navItems = [
  { path: "/portal/dashboard", label: "Home", end: true },
  { path: "/portal/dashboard/enquiries", label: "My journey", end: false },
  { path: "/portal/dashboard/sessions", label: "Sessions", end: false },
  { path: "/portal/dashboard/announcements", label: "Announcements", end: false },
  { path: "/portal/dashboard/settings", label: "My profile", end: false },
];

export default function PortalLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isPortalHome = location.pathname === "/portal/dashboard";
  const { name, email_id, access_token, counselingLevel, ...storedUser } = useSelector(
    (state) => state.user.value,
  );
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [fingerprintReminderOpen, setFingerprintReminderOpen] = useState(false);
  const [primaryEnquiryId, setPrimaryEnquiryId] = useState("");
  const [announcementUnreadCount, setAnnouncementUnreadCount] = useState(0);

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
        name: data.name,
        profilePhotoUrl: pickUserProfilePhotoUrl(data),
        profileEdit: pickProfileEdit(data, { isPortalUser: true }),
      }),
    );
    return data;
  }, [access_token, dispatch]);

  const refreshAnnouncementUnreadCount = useCallback(async () => {
    if (!access_token) return;
    try {
      const response = await getPortalAnnouncementsUnreadCount(access_token);
      setAnnouncementUnreadCount(pickAnnouncementUnreadCount(response));
    } catch {
      setAnnouncementUnreadCount(0);
    }
  }, [access_token]);

  useEffect(() => {
    if (!access_token) return;
    const load = async () => {
      try {
        setLoading(true);
        setProfileError("");
        await refreshProfile();
      } catch (error) {
        setProfileError(getPortalProfileLoadErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token, refreshProfile]);

  useEffect(() => {
    if (!loading && access_token) {
      refreshAnnouncementUnreadCount();
    }
  }, [loading, access_token, location.pathname, refreshAnnouncementUnreadCount]);

  const hasAccess = resolvePortalDashboardAccess(profile, storedUser);
  const effectiveProfile =
    profile || (hasStoredPortalDashboardAccess(storedUser) ? storedUser : null);
  const showPaymentGate = !loading && !hasAccess && !profileError;
  const showConnectionError = !loading && !hasAccess && Boolean(profileError);

  const handleRetryProfile = async () => {
    try {
      setLoading(true);
      setProfileError("");
      await refreshProfile();
    } catch (error) {
      setProfileError(getPortalProfileLoadErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const onAnnouncementsRoute = location.pathname.startsWith(PORTAL_ANNOUNCEMENTS_PATH);
  const announcementsNavItem = navItems.find((item) => item.path === PORTAL_ANNOUNCEMENTS_PATH);
  const visibleNavItems = hasAccess
    ? navItems
    : announcementsNavItem
      ? [announcementsNavItem]
      : [];

  const refreshFingerprintReminder = useCallback(async () => {
    if (!access_token || !hasAccess) {
      setFingerprintReminderOpen(false);
      return;
    }
    if (
      location.pathname.startsWith("/portal/dashboard/enquiries") ||
      location.pathname.startsWith("/portal/dashboard/settings")
    ) {
      setFingerprintReminderOpen(false);
      return;
    }

    try {
      if (profileIndicatesFingerprint(effectiveProfile)) {
        setFingerprintReminderOpen(false);
        return;
      }

      const enquiries = await loadPortalEnquiryList(access_token);
      const enquiryId = resolvePrimaryEnquiryId(enquiries, effectiveProfile);
      if (!enquiryId) {
        setFingerprintReminderOpen(false);
        return;
      }

      setPrimaryEnquiryId(enquiryId);
      const status = await checkPortalFingerprintStatus(
        access_token,
        enquiryId,
        effectiveProfile,
      );
      if (status.paymentRequired || status.hasFingerprint) {
        setFingerprintReminderOpen(false);
        return;
      }
      setFingerprintReminderOpen(true);
    } catch {
      setFingerprintReminderOpen(false);
    }
  }, [access_token, hasAccess, location.pathname, effectiveProfile]);

  useEffect(() => {
    if (!loading && hasAccess) {
      refreshFingerprintReminder();
    }
  }, [loading, hasAccess, location.pathname, refreshFingerprintReminder]);

  const displayName = effectiveProfile?.name || name || "Member";
  const levelLabel = counselingLevel || effectiveProfile?.counselingLevel;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="font-body min-h-screen bg-[#0F2E15] text-white">
      <PortalSiteHeader
        navItems={visibleNavItems}
        hasAccess={hasAccess || onAnnouncementsRoute}
        announcementUnreadCount={announcementUnreadCount}
        showNav={!loading}
        profile={!loading ? effectiveProfile || { name: displayName, email: email_id } : null}
        displayName={displayName}
        email={email_id}
        levelLabel={levelLabel}
        onLogout={handleLogout}
      />

      <main className="relative z-10">
        {loading ? (
          <PortalLoader label="Loading your portal…" />
        ) : showConnectionError && !onAnnouncementsRoute ? (
          <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4 py-8 md:px-8">
            <div className="w-full rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 text-center shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90">
                Connection problem
              </p>
              <h1 className="mt-2 font-serif text-2xl font-semibold text-white">
                Could not load your portal
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{profileError}</p>
              <button
                type="button"
                onClick={handleRetryProfile}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-3 text-sm font-bold text-[#0f2e1a] disabled:opacity-50"
              >
                {loading ? "Retrying…" : "Try again"}
              </button>
            </div>
          </div>
        ) : showPaymentGate && !onAnnouncementsRoute ? (
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
            <PaymentGate
              accessToken={access_token}
              profile={profile}
              announcementUnreadCount={announcementUnreadCount}
              onAccessGranted={(me) => {
                const data = unwrapPortalPayload(me);
                const access = pickPortalAccessFromLogin(data);
                setProfile(data);
                setProfileError("");
                dispatch(
                  updateUser({
                    canAccessDashboard: access.canAccessDashboard,
                    advancePayment: access.advancePayment,
                    fullPayment: access.fullPayment,
                    counselingLevel: access.counselingLevel,
                    name: data.name,
                    profilePhotoUrl: pickUserProfilePhotoUrl(data),
                    profileEdit: pickProfileEdit(data, { isPortalUser: true }),
                  }),
                );
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
            {profileError && hasAccess ? (
              <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p>{profileError} Showing your last known portal access.</p>
                  <button
                    type="button"
                    onClick={handleRetryProfile}
                    disabled={loading}
                    className="rounded-lg border border-amber-300/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-50 disabled:opacity-50"
                  >
                    {loading ? "Retrying…" : "Retry"}
                  </button>
                </div>
              </div>
            ) : null}
            <Outlet
              context={{
                profile: effectiveProfile,
                refreshProfile,
                refreshFingerprintReminder,
                announcementUnreadCount,
                refreshAnnouncementUnreadCount,
              }}
            />
          </div>
        )}
      </main>

      <PortalFingerprintReminder
        open={hasAccess && fingerprintReminderOpen}
        enquiryId={primaryEnquiryId}
        onClose={() => setFingerprintReminderOpen(false)}
      />
    </div>
  );
}
