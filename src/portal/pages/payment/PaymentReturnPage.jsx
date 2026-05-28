import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getPortalFullPaymentStatus, getPortalMe } from "../../../api/portal";
import { updateUser } from "../../../reducers/user";
import {
  canAccessPortalDashboard,
  getAdvancePaymentStatus,
  isFullPaymentCompleted,
  pickPortalAccessFromLogin,
  unwrapPortalPayload,
} from "../../utils/access";
import { clearPaymentReturn, pickFullPaymentFromStatus, readPaymentReturn } from "../../utils/payment";

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
        const stored = readPaymentReturn();
        const paymentType = searchParams.get("type") || stored.type || "advance";
        const enquiryId = searchParams.get("enquiryId") || stored.enquiryId || "";
        const returnTo =
          searchParams.get("returnTo") ||
          stored.returnTo ||
          (enquiryId
            ? `/portal/dashboard/enquiries/${enquiryId}`
            : "/portal/dashboard/enquiries");

        const urlHint = searchParams.get("status") || searchParams.get("paymentStatus");
        const merchantOrderId = searchParams.get("merchantOrderId");

        const meResponse = await getPortalMe(access_token);
        const data = unwrapPortalPayload(meResponse);
        const access = pickPortalAccessFromLogin(data);
        dispatch(
          updateUser({
            canAccessDashboard: access.canAccessDashboard,
            advancePayment: access.advancePayment,
            counselingLevel: access.counselingLevel,
          }),
        );

        if (paymentType === "full" && enquiryId) {
          const statusParams = merchantOrderId ? { merchantOrderId } : {};
          const fullStatusRes = await getPortalFullPaymentStatus(
            access_token,
            enquiryId,
            statusParams,
          );
          const fullData = unwrapPortalPayload(fullStatusRes);
          dispatch(updateUser({ fullPayment: pickFullPaymentFromStatus(fullData) }));

          if (isFullPaymentCompleted(fullData)) {
            clearPaymentReturn();
            setStatus("success");
            setMessage("Payment confirmed. Your downloads are now unlocked.");
            setTimeout(() => navigate(returnTo, { replace: true }), 1500);
            return;
          }
          if (urlHint === "failed" || urlHint === "failure") {
            setStatus("failed");
            setMessage("Payment was not completed. You can try again from your enquiry.");
          } else {
            setStatus("pending");
            setMessage(
              "We are confirming your full payment. Refresh in a moment or return to your enquiry.",
            );
          }
          return;
        }

        const advanceStatus = getAdvancePaymentStatus(data);
        if (canAccessPortalDashboard(data)) {
          clearPaymentReturn();
          setStatus("success");
          setMessage("Payment confirmed. Opening your portal…");
          setTimeout(() => navigate(returnTo, { replace: true }), 1500);
        } else if (urlHint === "failed" || urlHint === "failure") {
          setStatus("failed");
          setMessage("Payment was not completed. You can try again from the portal.");
        } else {
          setStatus("pending");
          setMessage(
            advanceStatus === "pending"
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

  const stored = readPaymentReturn();
  const paymentType = searchParams.get("type") || stored.type || "advance";
  const enquiryId = searchParams.get("enquiryId") || stored.enquiryId || "";
  const backTo =
    searchParams.get("returnTo") ||
    stored.returnTo ||
    (enquiryId ? `/portal/dashboard/enquiries/${enquiryId}` : "/portal/dashboard/enquiries");

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
            to={paymentType === "full" ? backTo : "/portal/dashboard"}
            className="mt-6 inline-flex rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-5 py-2.5 text-sm font-bold text-[#0f2e1a]"
          >
            {paymentType === "full" ? "Back to enquiry" : "Back to portal"}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
