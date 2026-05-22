import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getPortalMe } from "../../../api/portal";
import { updateUser } from "../../../reducers/user";
import {
  canAccessPortalDashboard,
  getAdvancePaymentStatus,
  pickPortalAccessFromLogin,
  unwrapPortalPayload,
} from "../../utils/access";

export default function PaymentReturnPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { access_token } = useSelector((state) => state.user.value);
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!access_token) {
      navigate("/login", { replace: true });
      return;
    }
    const verify = async () => {
      try {
        const response = await getPortalMe(access_token);
        const data = unwrapPortalPayload(response);
        const access = pickPortalAccessFromLogin(data);
        dispatch(
          updateUser({
            canAccessDashboard: access.canAccessDashboard,
            advancePayment: access.advancePayment,
            counselingLevel: access.counselingLevel,
          }),
        );
        const paymentStatus = getAdvancePaymentStatus(data);
        const urlHint = searchParams.get("status") || searchParams.get("paymentStatus");
        if (canAccessPortalDashboard(data)) {
          setStatus("success");
          setMessage("Payment confirmed. Opening your portal…");
          setTimeout(() => navigate("/portal/dashboard", { replace: true }), 1500);
        } else if (urlHint === "failed" || urlHint === "failure") {
          setStatus("failed");
          setMessage("Payment was not completed. You can try again from the portal.");
        } else {
          setStatus("pending");
          setMessage(
            paymentStatus === "pending"
              ? "We are still confirming your payment. Refresh in a moment or use the button below."
              : "Payment status is being updated.",
          );
        }
      } catch {
        setStatus("error");
        setMessage("Could not verify payment. Sign in again or contact support.");
      }
    };
    verify();
  }, [access_token, dispatch, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1f14] px-4 text-white">
      <div className="max-w-md rounded-3xl border border-white/15 bg-[#0f2e1a]/95 p-8 text-center shadow-2xl">
        {status === "checking" ? (
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#5eead4] border-t-transparent" />
        ) : null}
        <h1 className="font-serif text-2xl font-semibold">
          {status === "success"
            ? "Thank you"
            : status === "failed"
              ? "Payment incomplete"
              : "Almost there"}
        </h1>
        <p className="mt-3 text-sm text-white/75">{message}</p>
        {status !== "checking" && status !== "success" ? (
          <Link
            to="/portal/dashboard"
            className="mt-6 inline-flex rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-5 py-2.5 text-sm font-bold text-[#0f2e1a]"
          >
            Back to portal
          </Link>
        ) : null}
      </div>
    </div>
  );
}
