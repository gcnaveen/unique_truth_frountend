import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Homepage from "./pages/Homepage";
import RelationshipAwareness from "./pages/Relationshipawareness";
import Talentawareness from "./pages/Talentawareness";
import Behavioralawareness from "./pages/Behavioralawareness";
import Skillsbehindstudy from "./pages/Skillsbehindstudy";
import PageLoader from "./pages/Pageloader";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <PageLoader onComplete={() => setLoading(false)} />}

      {!loading && (
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route
              path="/skills-behind-studies"
              element={<Skillsbehindstudy />}
            />
            <Route
              path="/behavioural-awareness"
              element={<Behavioralawareness />}
            />
            <Route
              path="/relationship-awareness"
              element={<RelationshipAwareness />}
            />
            <Route path="/talent-awareness" element={<Talentawareness />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
