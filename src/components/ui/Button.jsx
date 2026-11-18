import clsx from "clsx";

function Button({ variant = "primary", size = "md", className, children, ...props }) {
  const variants = {
    primary: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]",
    secondary: "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-muted)]",
    gradient: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]",
    ghost: "bg-transparent text-[var(--text)] hover:bg-[var(--bg-muted)]",
    outline: "bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-muted)]",
    destructive: "bg-[var(--danger)] text-white hover:brightness-95",
    success: "bg-[var(--success)] text-white hover:brightness-95",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm rounded-md",
    md: "h-11 px-5 text-base rounded-lg",
    lg: "h-12 px-6 text-base rounded-lg",
  };

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus-visible-ring disabled:opacity-60 disabled:pointer-events-none",
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
