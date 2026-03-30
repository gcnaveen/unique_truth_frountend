import React from "react";

/* Small decorative flower used inside the modal */
function ModalFlower({ color, darkColor, size = 52 }) {
  const NUM_PETALS = 6;
  const CX = 50;
  const HEAD_Y = 50;
  const PETAL_DIST = 24;
  const PETAL_RX = 10;
  const PETAL_RY = 18;
  const CENTER_R = 13;
  const DOT_RING = CENTER_R * 0.62;

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
    >
      <g transform={`translate(${CX}, ${HEAD_Y})`}>
        {/* Back petals */}
        {Array.from({ length: NUM_PETALS })
          .filter((_, i) => i % 2 !== 0)
          .map((_, idx, arr) => {
            const i = [1, 3, 5][idx];
            const angle = (i / NUM_PETALS) * 360;
            return (
              <ellipse
                key={`pb-${i}`}
                cx={0}
                cy={-PETAL_DIST}
                rx={PETAL_RX}
                ry={PETAL_RY}
                fill={darkColor}
                stroke={darkColor}
                strokeWidth="0.5"
                opacity="0.88"
                transform={`rotate(${angle})`}
              />
            );
          })}
        {/* Front petals */}
        {Array.from({ length: NUM_PETALS })
          .filter((_, i) => i % 2 === 0)
          .map((_, idx) => {
            const i = [0, 2, 4][idx];
            const angle = (i / NUM_PETALS) * 360;
            return (
              <ellipse
                key={`pf-${i}`}
                cx={0}
                cy={-PETAL_DIST}
                rx={PETAL_RX}
                ry={PETAL_RY}
                fill={color}
                stroke={darkColor}
                strokeWidth="0.5"
                opacity="0.92"
                transform={`rotate(${angle})`}
              />
            );
          })}
        {/* Center */}
        <circle cx={0} cy={0} r={CENTER_R + 2.5} fill="#ffc107" opacity="0.2" />
        <circle cx={0} cy={0} r={CENTER_R} fill="#ffc107" />
        <circle
          cx={0}
          cy={0}
          r={CENTER_R * 0.72}
          fill="rgba(255,255,255,0.28)"
        />
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
          return (
            <circle
              key={`d-${i}`}
              cx={Math.cos(a) * DOT_RING}
              cy={Math.sin(a) * DOT_RING}
              r={1.8}
              fill="#7a3800"
              opacity="0.68"
            />
          );
        })}
        <circle cx={0} cy={0} r={1.5} fill="#7a3800" opacity="0.5" />
        <circle
          cx={-CENTER_R * 0.28}
          cy={-CENTER_R * 0.28}
          r={CENTER_R * 0.22}
          fill="rgba(255,255,255,0.38)"
        />
      </g>
    </svg>
  );
}

export default function NatureLifeModal({ flower, onClose }) {
  if (!flower) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${flower.label} details`}
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        display: "grid",
        placeItems: "center",
        background: "rgba(12, 34, 18, 0.42)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(580px, 90vw)",
          borderRadius: "clamp(16px, 5vw, 28px)",
          border: "1.5px solid rgba(255,255,255,0.55)",
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(230,250,237,0.96) 100%)",
          boxShadow:
            "0 24px 60px rgba(14, 52, 26, 0.28), 0 4px 16px rgba(14,52,26,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
          overflow: "hidden",
          animation: "modalPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
          maxHeight: "90svh",
          overflowY: "auto",
        }}
      >
        <style>{`
          @keyframes modalPop {
            from { opacity: 0; transform: scale(0.88) translateY(12px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @media (max-width: 480px) {
            .modal-content { padding: 16px 16px 12px !important; }
            .modal-header { gap: 12px !important; margin-bottom: 14px !important; }
            .modal-flower-wrapper { gap: 10px !important; }
            .modal-title { font-size: clamp(18px, 2.5vw, 28px) !important; }
            .modal-description { font-size: clamp(13px, 1.5vw, 16px) !important; }
          }
        `}</style>

        {/* Colour band at top */}
        <div
          style={{
            height: "5px",
            background: `linear-gradient(90deg, ${flower.color} 0%, ${flower.darkColor} 100%)`,
          }}
        />

        <div
          style={{
            padding:
              "clamp(16px, 4vw, 28px) clamp(16px, 4vw, 28px) clamp(12px, 3vw, 24px)",
          }}
          className="modal-content"
        >
          {/* Header row */}
          <div
            className="modal-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "18px",
            }}
          >
            <div
              className="modal-flower-wrapper"
              style={{ display: "flex", alignItems: "center", gap: "14px" }}
            >
              <ModalFlower
                color={flower.color}
                darkColor={flower.darkColor}
                size={56}
              />

              <div>
                {/* Category chip */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: `${flower.color}18`,
                    border: `1px solid ${flower.color}44`,
                    borderRadius: "999px",
                    padding: "2px 10px",
                    marginBottom: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: flower.color,
                      boxShadow: `0 0 6px ${flower.color}88`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: flower.darkColor,
                    }}
                  >
                    Life Area
                  </span>
                </div>

                <h3
                  className="modal-title"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-cormorant-garamond), serif",
                    fontWeight: 700,
                    fontSize: "clamp(22px, 3vw, 32px)",
                    color: "#1a3d22",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                  }}
                >
                  {flower.label}
                </h3>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                flexShrink: 0,
                border: "1.5px solid rgba(28,83,46,0.18)",
                borderRadius: "999px",
                width: "36px",
                height: "36px",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color: "#1f4a2b",
                background: "rgba(255,255,255,0.85)",
                fontSize: "20px",
                lineHeight: 1,
                transition: "background 0.15s ease, transform 0.15s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,1)";
                e.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.85)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ×
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: `linear-gradient(90deg, ${flower.color}44 0%, transparent 100%)`,
              marginBottom: "18px",
            }}
          />

          {/* Description */}
          <p
            className="modal-description"
            style={{
              margin: 0,
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontWeight: 400,
              fontSize: "clamp(14px, 1.75vw, 17px)",
              lineHeight: 1.8,
              color: "rgba(20, 50, 28, 0.88)",
            }}
          >
            {flower.description}
          </p>

          {/* Footer hint */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "3px",
                borderRadius: "999px",
                background: `linear-gradient(90deg, ${flower.color} 0%, ${flower.color}22 100%)`,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                color: "rgba(20,50,28,0.4)",
                letterSpacing: "0.04em",
              }}
            >
              press Esc or click outside to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
