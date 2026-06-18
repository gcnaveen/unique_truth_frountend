import BrandSplashLoader from "./loaders/BrandSplashLoader";

export default function AppLoader({
  label = "Loading…",
  className = "",
  minHeight = "min-h-[50vh]",
  variant = "inline",
  compact = false,
}) {
  return (
    <BrandSplashLoader
      label={label}
      className={className}
      minHeight={minHeight}
      variant={variant}
      compact={compact}
    />
  );
}
