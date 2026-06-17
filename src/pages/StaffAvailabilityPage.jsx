import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import StaffUnavailabilityManager from "../components/staff/StaffUnavailabilityManager";
import { canManageStaffUnavailability } from "../utils/profileEdit";
import { getDashboardHome } from "../utils/roles";

export default function StaffAvailabilityPage() {
  const { access_token, profileEdit, role } = useSelector((state) => state.user.value);

  if (!canManageStaffUnavailability(profileEdit)) {
    return <Navigate to={getDashboardHome(role)} replace />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          My availability
        </h1>
        <p className="mt-2 text-sm text-white/75">
          Mark dates when you are not available. Counsellors cannot book sessions on unavailable
          days.
        </p>
      </div>

      <StaffUnavailabilityManager accessToken={access_token} />
    </div>
  );
}
