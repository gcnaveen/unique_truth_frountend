import React from "react";

const BRAND_WORD_REGEX = /(Unique|Truth|TRUTH)/g;
const UNIQUE_WORD_STYLE = {
  fontFamily: '"BabySnail", "Pacifico", cursive',
  fontStyle: "normal",
  letterSpacing: "0.01em",
  lineHeight: 1,
};
const TRUTH_WORD_STYLE = {
  fontFamily: '"Candara", "Montserrat", sans-serif',
  fontStyle: "normal",
  textTransform: "uppercase",
};

export default function BrandText({ text, children }) {
  const source = typeof text === "string" ? text : children;

  if (typeof source !== "string") return <>{source}</>;

  return (
    <>
      {source.split(BRAND_WORD_REGEX).map((part, idx) => {
        if (part === "Unique") {
          return (
            <span key={`unique-${idx}`} style={UNIQUE_WORD_STYLE}>
              Unique
            </span>
          );
        }
        if (part === "Truth" || part === "TRUTH") {
          return (
            <span key={`truth-${idx}`} style={TRUTH_WORD_STYLE}>
              {part.toUpperCase()}
            </span>
          );
        }
        return <React.Fragment key={`text-${idx}`}>{part}</React.Fragment>;
      })}
    </>
  );
}
