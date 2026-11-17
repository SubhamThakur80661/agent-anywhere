import { useLayoutEffect, useRef } from "react";
import { ensureGsap, motionOK, EASE_OUT } from "../../lib/motion.js";
import { Lines } from "../motion/Reveal.jsx";
import Ticker from "../motion/Ticker.jsx";

// Staged auth shell: a full-height ink board on the left with kinetic type,
// the form on paper on the right. On phones the board collapses to a compact
// header above the form. Entrance is choreographed in reading order: panel,
// headline lines, then the form blocks (children carry data-auth-intro).
const PLATFORMS = ["Instagram", "Facebook", "X", "YouTube", "LinkedIn", "Reddit"];

const STEPS = [
  { n: "01", title: "Write it", text: "Draft a post once, shape it for each platform." },
  { n: "02", title: "Schedule it", text: "Pick the day and time, then forget about it." },
  { n: "03", title: "See it go out", text: "Every post lands on the board, on time." },
];

function AuthShell({ headline, accent = 2, subline, children }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!motionOK() || !ref.current) return;
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.from(".aa-auth-panel", {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.1,
        ease: EASE_OUT,
      });
      gsap.from("[data-auth-intro]", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        stagger: 0.06,
        delay: 0.45,
        ease: EASE_OUT,
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="min-h-screen bg-[var(--bg)] lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Ink board */}
      <section className="aa-auth-panel board-grid relative hidden lg:flex flex-col justify-between overflow-hidden bg-[var(--ink-field)] text-[var(--ink-field-text)] p-8 xl:p-12">
        <div
          className="aa-drift pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-[var(--signal)] opacity-20 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[var(--signal)]">
              <span className="font-display text-sm font-bold text-[var(--signal-ink)]">AA</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-bold tracking-tight">Agent Anywhere</div>
              <div className="kicker text-[var(--ink-field-muted)]">Social media, on a board</div>
            </div>
          </div>
        </div>

        <div className="relative py-10">
          <h1 className="display-1">
            <Lines lines={headline} accent={accent} delay={0.25} />
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--ink-field-muted)]">
            {subline}
          </p>

          <ol className="mt-8 space-y-0 border-t border-[var(--line-on-ink)]">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="aa-ledger-row flex items-baseline gap-5 border-b border-[var(--line-on-ink)] py-3"
              >
                <span className="font-mono text-xs text-[var(--signal)]">{step.n}</span>
                <div>
                  <div className="font-display text-lg font-bold tracking-tight">{step.title}</div>
                  <div className="text-sm text-[var(--ink-field-muted)]">{step.text}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative">
          <div className="kicker mb-3 text-[var(--ink-field-muted)]">Posts to</div>
          <Ticker
            items={PLATFORMS}
            className="border-y border-[var(--line-on-ink)] py-3 font-mono text-sm text-[var(--ink-field-text)]"
          />
        </div>
      </section>

      {/* Form column */}
      <section className="flex min-h-screen flex-col justify-center px-5 py-8 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden" data-auth-intro>
            <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[var(--text)]">
              <span className="font-display text-sm font-bold text-[var(--bg)]">AA</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-bold tracking-tight">Agent Anywhere</div>
              <div className="kicker text-[var(--text-muted)]">Social media, on a board</div>
            </div>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

export default AuthShell;
