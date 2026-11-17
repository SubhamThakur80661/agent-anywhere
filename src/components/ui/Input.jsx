import { useId } from "react";

export default function Input({ id, label, description, error, className = '', ...props }) {
  const generatedId = useId();
  const inputId = id || `input_${generatedId}`;
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label && <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">{label}</label>}
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={description || error ? `${inputId}-desc` : undefined}
        className="px-3 py-2 border rounded-md text-sm bg-[var(--surface)] text-[var(--text)] border-[var(--border)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        {...props}
      />
      {description && !error && <div id={`${inputId}-desc`} className="text-xs text-[var(--text-muted)]">{description}</div>}
      {error && <div id={`${inputId}-desc`} className="text-xs text-[var(--danger)]">{error}</div>}
    </div>
  );
}
