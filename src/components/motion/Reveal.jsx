import { useLayoutEffect, useRef } from "react";
import { ensureGsap, motionOK, EASE_OUT } from "../../lib/motion.js";

// Fade-and-rise entrance. With `scroll` it waits until the element nears the
// viewport (ScrollTrigger); otherwise it plays on mount. Content is fully
// visible by default: the hidden start state is only ever set inside the
// effect, and only when motion is allowed.
function Reveal({ children, className = "", delay = 0, y = 28, scroll = false }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!motionOK() || !ref.current) return;
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y,
        opacity: 0,
        duration: 1,
        delay,
        ease: EASE_OUT,
        ...(scroll
          ? { scrollTrigger: { trigger: ref.current, start: "top 88%" } }
          : {}),
      });
    }, ref);
    return () => ctx.revert();
  }, [delay, y, scroll]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Line-masked headline reveal: each line slides up out of its own mask, one
// after another. Pass lines as an array of strings; `accent` is the index of
// the line drawn in the accent color (`accentClass` picks the tone: the
// bright signal for ink panels, the deep lime for paper).
function Lines({ lines, className = "", accent = -1, accentClass = "aa-line-accent", delay = 0.1, stagger = 0.09 }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!motionOK() || !ref.current) return;
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".aa-line-inner",
        { yPercent: 115 },
        { yPercent: 0, duration: 1.15, delay, stagger, ease: EASE_OUT }
      );
    }, ref);
    return () => ctx.revert();
  }, [delay, stagger]);

  return (
    <span ref={ref} className={`aa-lines ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="aa-line-mask">
          <span
            className={`aa-line-inner ${i === accent ? accentClass : ""}`}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

export { Reveal, Lines };
export default Reveal;
