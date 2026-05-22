import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Homepage from "./pages/Homepage";
import RelationshipAwareness from "./pages/Relationshipawareness";
import Talentawareness from "./pages/Talentawareness";
import Behavioralawareness from "./pages/Behavioralawareness";
import Skillsbehindstudy from "./pages/Skillsbehindstudy";
import PageLoader from "./pages/Pageloader";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./admin/dashboardlayout/DashboardLayout";
import QuestionariesHome from "./admin/pages/questionaries/QuestionariesHome";
import AddQuestions from "./admin/pages/questionaries/AddQuestions";
import EditQuestions from "./admin/pages/questionaries/EditQuestions";
import Enquiries from "./admin/pages/enquire/Enquiries";
import FranchiseHome from "./admin/pages/franchise/FranchiseHome";
import CarriersHome from "./admin/pages/carriers/CarriersHome";
import UsersHome from "./admin/pages/users/UsersHome";
import TeamHome from "./franchise-admin/pages/team/TeamHome";
import FranchiseAdminEnquiriesHome from "./franchise-admin/pages/enquiries/EnquiriesHome";
import FranchiseAdminCarriersHome from "./franchise-admin/pages/carriers/CarriersHome";
import SalesEnquiriesHome from "./sales/pages/enquiries/EnquiriesHome";
import CounsellorDashboardHome from "./counsellor/pages/dashboard/DashboardHome";
import CounsellorAssignedUsersHome from "./counsellor/pages/assigned-users/AssignedUsersHome";
import CounsellorSessionsHome from "./counsellor/pages/sessions/SessionsHome";
import PortalLayout from "./portal/layout/PortalLayout";
import PortalDashboardHome from "./portal/pages/dashboard/DashboardHome";
import PortalEnquiriesHome from "./portal/pages/enquiries/EnquiriesHome";
import PortalEnquiryDetailPage from "./portal/pages/enquiries/EnquiryDetailPage";
import PortalSessionsHome from "./portal/pages/sessions/SessionsHome";
import PortalSessionDetailPage from "./portal/pages/sessions/SessionDetailPage";
import PortalSettingsHome from "./portal/pages/settings/SettingsHome";
import PaymentReturnPage from "./portal/pages/payment/PaymentReturnPage";
import { getDashboardHome, roleMatches } from "./utils/roles";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const RequireAuth = ({ children, role }) => {
  const location = useLocation();
  const { is_logged_in, access_token, role: userRole } = useSelector(
    (state) => state.user.value,
  );

  const isAuthenticated = Boolean(is_logged_in && access_token);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && !roleMatches(userRole, role)) {
    return <Navigate to={getDashboardHome(userRole)} replace />;
  }

  return children;
};

const RedirectIfLoggedIn = () => {
  const { is_logged_in, access_token, role } = useSelector((state) => state.user.value);
  if (!is_logged_in || !access_token) return <LoginPage />;
  return <Navigate to={getDashboardHome(role)} replace />;
};

const DashboardShell = () => (
  <RequireAuth>
    <DashboardLayout />
  </RequireAuth>
);

const App = () => {
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const [loading, setLoading] = useState(isHomepage); // ← only true on "/"
  const { is_logged_in, access_token, role } = useSelector((state) => state.user.value);
  // const [loading, setLoading] = useState(true);
  // const { is_logged_in, access_token, role } = useSelector((state) => state.user.value);

  const landingRoute = useMemo(() => {
    if (!is_logged_in || !access_token) return "/";
    return getDashboardHome(role);
  }, [is_logged_in, access_token, role]);

  if (loading) {
    return <PageLoader onComplete={() => setLoading(false)} />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/skills-behind-studies" element={<Skillsbehindstudy />} />
        <Route path="/behavioural-awareness" element={<Behavioralawareness />} />
        <Route path="/relationship-awareness" element={<RelationshipAwareness />} />
        <Route path="/talent-awareness" element={<Talentawareness />} />

        <Route path="/login" element={<RedirectIfLoggedIn />} />

        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard/questionaries" replace />}
        />
        <Route path="/admin/dashboard" element={<DashboardShell />}>
          <Route index element={<Navigate to="questionaries" replace />} />
          <Route
            path="questionaries"
            element={
              <RequireAuth role="admin">
                <QuestionariesHome />
              </RequireAuth>
            }
          />
          <Route
            path="questionaries/add"
            element={
              <RequireAuth role="admin">
                <AddQuestions />
              </RequireAuth>
            }
          />
          <Route
            path="questionaries/:questionaryId/edit"
            element={
              <RequireAuth role="admin">
                <EditQuestions />
              </RequireAuth>
            }
          />
          <Route
            path="enquiries"
            element={
              <RequireAuth role="admin">
                <Enquiries />
              </RequireAuth>
            }
          />
          <Route
            path="franchise"
            element={
              <RequireAuth role="admin">
                <FranchiseHome />
              </RequireAuth>
            }
          />
          <Route
            path="carriers"
            element={
              <RequireAuth role="admin">
                <CarriersHome />
              </RequireAuth>
            }
          />
          <Route
            path="users"
            element={
              <RequireAuth role="admin">
                <UsersHome />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="/counsellor" element={<Navigate to="/counsellor/dashboard" replace />} />
        <Route path="/counsellor/dashboard" element={<DashboardShell />}>
          <Route
            index
            element={
              <RequireAuth role="counsellor">
                <CounsellorDashboardHome />
              </RequireAuth>
            }
          />
          <Route
            path="assigned-users"
            element={
              <RequireAuth role="counsellor">
                <CounsellorAssignedUsersHome />
              </RequireAuth>
            }
          />
          <Route
            path="sessions"
            element={
              <RequireAuth role="counsellor">
                <CounsellorSessionsHome />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="/sales" element={<Navigate to="/sales/dashboard/enquiries" replace />} />
        <Route path="/sales/dashboard" element={<DashboardShell />}>
          <Route index element={<Navigate to="enquiries" replace />} />
          <Route
            path="enquiries"
            element={
              <RequireAuth role="sales">
                <SalesEnquiriesHome />
              </RequireAuth>
            }
          />
        </Route>

        <Route
          path="/franchise-admin"
          element={<Navigate to="/franchise-admin/dashboard/team" replace />}
        />
        <Route path="/franchise-admin/dashboard" element={<DashboardShell />}>
          <Route index element={<Navigate to="team" replace />} />
          <Route
            path="team"
            element={
              <RequireAuth role="franchise_admin">
                <TeamHome />
              </RequireAuth>
            }
          />
          <Route
            path="enquiries"
            element={
              <RequireAuth role="franchise_admin">
                <FranchiseAdminEnquiriesHome />
              </RequireAuth>
            }
          />
          <Route
            path="carriers"
            element={
              <RequireAuth role="franchise_admin">
                <FranchiseAdminCarriersHome />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="/user/home" element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="/user" element={<Navigate to="/portal/dashboard" replace />} />

        <Route
          path="/portal/payment/return"
          element={
            <RequireAuth role="user">
              <PaymentReturnPage />
            </RequireAuth>
          }
        />
        <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
        <Route
          path="/portal/dashboard"
          element={
            <RequireAuth role="user">
              <PortalLayout />
            </RequireAuth>
          }
        >
          <Route
            index
            element={
              <RequireAuth role="user">
                <PortalDashboardHome />
              </RequireAuth>
            }
          />
          <Route
            path="enquiries"
            element={
              <RequireAuth role="user">
                <PortalEnquiriesHome />
              </RequireAuth>
            }
          />
          <Route
            path="enquiries/:enquiryId"
            element={
              <RequireAuth role="user">
                <PortalEnquiryDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="sessions"
            element={
              <RequireAuth role="user">
                <PortalSessionsHome />
              </RequireAuth>
            }
          />
          <Route
            path="sessions/:sessionId"
            element={
              <RequireAuth role="user">
                <PortalSessionDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="settings"
            element={
              <RequireAuth role="user">
                <PortalSettingsHome />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to={landingRoute} replace />} />
      </Routes>
    </>
  );
};

export default App;
