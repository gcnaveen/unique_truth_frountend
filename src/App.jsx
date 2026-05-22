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
import UserHome from "./user/UserHome";
import LogoSnowfall from "./components/Logosnowfall";

const roleMatches = (actualRole, expectedRole) =>
  String(actualRole || "").toLowerCase() === String(expectedRole || "").toLowerCase();

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
    const target = roleMatches(userRole, "admin")
      ? "/admin/dashboard/questionaries"
      : "/user/home";
    return <Navigate to={target} replace />;
  }

  return children;
};

const RedirectIfLoggedIn = () => {
  const { is_logged_in, access_token, role } = useSelector((state) => state.user.value);
  if (!is_logged_in || !access_token) return <LoginPage />;
  const target = roleMatches(role, "admin")
    ? "/admin/dashboard/questionaries"
    : "/user/home";
  return <Navigate to={target} replace />;
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
    return roleMatches(role, "admin")
      ? "/admin/dashboard/questionaries"
      : "/user/home";
  }, [is_logged_in, access_token, role]);

  if (loading) {
    return <PageLoader onComplete={() => setLoading(false)} />;
  }

  return (
    <>
      <LogoSnowfall />
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
        </Route>

        <Route
          path="/user/home"
          element={
            <RequireAuth>
              <UserHome />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to={landingRoute} replace />} />
      </Routes>
    </>
  );
};

export default App;
