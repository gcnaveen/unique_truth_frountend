import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPortalMe, getPortalAnnouncementsUnreadCount } from "../../api/portal";
import { logout, updateUser } from "../../reducers/user";
import PaymentGate from "../components/PaymentGate";
import PortalFingerprintReminder from "../components/PortalFingerprintReminder";
import PortalSiteHeader from "../components/PortalSiteHeader";
import { pickUserProfilePhotoUrl } from "../../utils/profilePhoto";
import { pickProfileEdit } from "../../utils/profileEdit";
import {
  canAccessPortalDashboard,
  pickPortalAccessFromLogin,
  unwrapPortalPayload,
} from "../utils/access";
import { PORTAL_ANNOUNCEMENTS_PATH, pickAnnouncementUnreadCount } from "../../utils/announcements";
import {
  checkPortalFingerprintStatus,
  loadPortalEnquiryList,
  resolvePrimaryEnquiryId,
} from "../utils/fingerprint";

const navItems = [
  { path: "/portal/dashboard", label: "Home", end: true },
  { path: "/portal/dashboard/enquiries", label: "My journey", end: false },
  { path: "/portal/dashboard/sessions", label: "Sessions", end: false },
  { path: "/portal/dashboard/announcements", label: "Announcements", end: false },
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
        await refreshProfile();
      } catch {
        setProfile(null);
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

  const hasAccess = canAccessPortalDashboard(profile);
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
    if (location.pathname.startsWith("/portal/dashboard/enquiries")) {
      setFingerprintReminderOpen(false);
      return;
    }

    try {
      const enquiries = await loadPortalEnquiryList(access_token);
      const enquiryId = resolvePrimaryEnquiryId(enquiries, profile);
      if (!enquiryId) {
        setFingerprintReminderOpen(false);
        return;
      }

      setPrimaryEnquiryId(enquiryId);
      const status = await checkPortalFingerprintStatus(access_token, enquiryId);
      if (status.paymentRequired || status.hasFingerprint) {
        setFingerprintReminderOpen(false);
        return;
      }
      setFingerprintReminderOpen(true);
    } catch {
      setFingerprintReminderOpen(false);
    }
  }, [access_token, hasAccess, location.pathname, profile]);

  useEffect(() => {
    if (!loading && hasAccess) {
      refreshFingerprintReminder();
    }
  }, [loading, hasAccess, location.pathname, refreshFingerprintReminder]);

  const displayName = profile?.name || name || "Member";
  const levelLabel = counselingLevel || profile?.counselingLevel;

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
        ) : !hasAccess && !onAnnouncementsRoute ? (
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
            <PaymentGate
              accessToken={access_token}
              profile={profile}
              announcementUnreadCount={announcementUnreadCount}
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
            <Outlet
              context={{
                profile,
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
