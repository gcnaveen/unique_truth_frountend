export default function UserAvatar({
  name = "",
  photoUrl = "",
  size = 40,
  className = "",
}) {
  const initial = name ? String(name).trim().charAt(0).toUpperCase() : "?";
  const dimension = { width: size, height: size };

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={["rounded-full object-cover shrink-0", className].join(" ")}
        style={dimension}
      />
    );
  }

  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-full border border-white/20 bg-linear-to-br from-[#7c6fcd] to-[#5ab99c] text-xs font-bold text-white",
        className,
      ].join(" ")}
      style={dimension}
      aria-hidden
    >
      {initial}
    </div>
  );
}
