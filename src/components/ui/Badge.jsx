import clsx from "clsx";

function Badge({ color = "gray", className, children }) {
  const map = {
    gray: "bg-[var(--bg-muted)] text-[var(--text-muted)] border-[var(--border)]",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    primary: "bg-[var(--brand-50)] text-[var(--brand-700)] border-[var(--brand-200)]",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        map[color] || map.gray,
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
