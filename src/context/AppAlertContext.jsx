import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";

const AppAlertContext = createContext(null);

const defaultLabels = {
  alert: { confirm: "OK" },
  confirm: { confirm: "Confirm", cancel: "Cancel" },
};

function AppAlertDialog({ dialog, onResolve }) {
  if (!dialog) return null;

  const isConfirm = dialog.type === "confirm";
  const confirmLabel = dialog.confirmLabel || (isConfirm ? "Confirm" : "OK");
  const cancelLabel = dialog.cancelLabel || "Cancel";
  const isDanger = dialog.variant === "danger";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={() => onResolve(isConfirm ? false : undefined)}
        aria-label="Close dialog"
      />
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-alert-title"
        aria-describedby="app-alert-message"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-[#0f2e1a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {dialog.title ? (
          <h2
            id="app-alert-title"
            className="text-lg font-semibold text-[#fff8ef] md:text-xl"
          >
            {dialog.title}
          </h2>
        ) : null}
        {dialog.message ? (
          <p
            id="app-alert-message"
            className={`text-sm leading-relaxed text-white/75 ${dialog.title ? "mt-3" : ""}`}
          >
            {dialog.message}
          </p>
        ) : null}

        <div
          className={`mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${
            isConfirm ? "" : ""
          }`}
        >
          {isConfirm ? (
            <button
              type="button"
              onClick={() => onResolve(false)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onResolve(isConfirm ? true : undefined)}
            className={[
              "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold",
              isDanger
                ? "border border-red-400/40 bg-red-500/20 text-red-100 hover:bg-red-500/30"
                : "border border-[#c9a86c]/50 bg-[#c9a86c] text-[#1a120c] hover:opacity-90",
            ].join(" ")}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function AppAlertProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [resolver, setResolver] = useState(null);

  useEffect(() => {
    document.body.style.overflow = dialog ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [dialog]);

  const closeDialog = useCallback((value) => {
    setDialog(null);
    if (resolver) {
      resolver(value);
      setResolver(null);
    }
  }, [resolver]);

  const alert = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        setResolver(() => resolve);
        setDialog({
          type: "alert",
          title: options.title || "Notice",
          message: options.message || "",
          confirmLabel: options.confirmLabel || defaultLabels.alert.confirm,
          variant: options.variant || "default",
        });
      }),
    [],
  );

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        setResolver(() => resolve);
        setDialog({
          type: "confirm",
          title: options.title || "Please confirm",
          message: options.message || "",
          confirmLabel: options.confirmLabel || defaultLabels.confirm.confirm,
          cancelLabel: options.cancelLabel || defaultLabels.confirm.cancel,
          variant: options.variant || "default",
        });
      }),
    [],
  );

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm]);

  return (
    <AppAlertContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {dialog ? (
          <AppAlertDialog key="app-alert" dialog={dialog} onResolve={closeDialog} />
        ) : null}
      </AnimatePresence>
    </AppAlertContext.Provider>
  );
}

export function useAppAlert() {
  const ctx = useContext(AppAlertContext);
  if (!ctx) {
    throw new Error("useAppAlert must be used within AppAlertProvider");
  }
  return ctx;
}
