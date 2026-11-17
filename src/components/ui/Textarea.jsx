import { useEffect, useId, useState } from "react";
import clsx from "clsx";

function Textarea({ label, maxLength = 280, error, className, ...props }) {
  const id = useId();
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(props.value?.length ?? 0);
  }, [props.value]);
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[var(--text)] mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        maxLength={maxLength}
        className={clsx(
          "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder-[var(--text-muted)]",
          "px-4 py-3 min-h-[120px] resize-vertical transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
          error && "border-[var(--danger)] focus:ring-[var(--danger)]",
          className
        )}
        aria-invalid={!!error}
        onChange={(e) => setCount(e.target.value.length)}
        {...props}
      />
      <div className="mt-2 flex justify-between text-xs">
        {error ? <p className="text-[var(--danger)]">{error}</p> : <span />}
        <p className="text-[var(--text-muted)]">
          {count}/{maxLength}
        </p>
      </div>
    </div>
  );
}

export default Textarea;
