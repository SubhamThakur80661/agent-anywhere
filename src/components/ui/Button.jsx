import clsx from "clsx";

function Button({ variant = "primary", size = "md", className, children, ...props }) {
  const variants = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] hover:-translate-y-px active:translate-y-0",
    secondary:
      "bg-[var(--surface)] text-[var(--text)] border-[1.5px] border-[var(--border)] hover:border-[var(--text)]",
    signal:
      "bg-[var(--signal)] text-[var(--signal-ink)] shadow-[var(--shadow-hard-sm)] hover:-translate-y-px hover:shadow-[var(--shadow-hard)] active:translate-y-0 active:shadow-none",
    gradient: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]",
    ghost: "bg-transparent text-[var(--text)] hover:bg-[var(--bg-muted)]",
    outline: "bg-transparent text-[var(--text)] border-[1.5px] border-[var(--border)] hover:bg-[var(--bg-muted)]",
    destructive: "bg-[var(--danger)] text-white hover:brightness-95",
    success: "bg-[var(--success)] text-white hover:brightness-95",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm rounded-[4px]",
    md: "h-11 px-5 text-base rounded-[4px]",
    lg: "h-12 px-6 text-base rounded-[4px]",
  };

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-150 focus-visible-ring disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
