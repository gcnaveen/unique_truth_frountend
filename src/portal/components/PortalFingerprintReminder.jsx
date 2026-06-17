import { useNavigate } from "react-router-dom";
import { buildJourneyFingerprintPath } from "../utils/fingerprint";

export default function PortalFingerprintReminder({ open, enquiryId, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleUpload = () => {
    onClose?.();
    navigate(buildJourneyFingerprintPath(enquiryId));
  };

  const handleLater = () => {
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleLater}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-labelledby="fingerprint-reminder-title"
        className="relative w-full max-w-md rounded-3xl border border-[#5eead4]/35 bg-linear-to-br from-[#0f2e1a] via-[#133726] to-[#0a1f14] p-6 shadow-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5eead4]">
          Action required
        </p>
        <h2 id="fingerprint-reminder-title" className="mt-2 font-serif text-2xl font-semibold text-white">
          Upload your fingerprint scan
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          Your counsellor needs a fingerprint image to continue your analysis. Upload it in My
          journey — it only takes a moment and is stored securely for 48 hours.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleUpload}
            className="flex-1 rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-3 text-sm font-bold text-[#0f2e1a]"
          >
            Go to My journey
          </button>
          <button
            type="button"
            onClick={handleLater}
            className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
