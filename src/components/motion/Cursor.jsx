import { useEffect, useRef, useState } from "react";
import { ensureGsap, motionOK, finePointer } from "../../lib/motion.js";

// Dual-layer cursor: an instant dot and a springy lagging ring. It augments
// the native cursor, never replaces it. Desktop fine pointers only, and it
// stays off entirely when the user prefers reduced motion.
function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!motionOK() || !finePointer()) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const gsap = ensureGsap();
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    const onMove = (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const isInteractive = (target) =>
      target &&
      target.closest &&
      target.closest("a, button, input, textarea, select, [role='button'], [data-cursor]");

    const onOver = (e) => {
      if (isInteractive(e.target)) {
        gsap.to(ring, { scale: 1.9, opacity: 0.9, duration: 0.3, ease: "power3.out" });
        gsap.to(dot, { scale: 0.6, duration: 0.3, ease: "power3.out" });
      }
    };

    const onOut = (e) => {
      if (isInteractive(e.target)) {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" });
        gsap.to(dot, { scale: 1, duration: 0.3, ease: "power3.out" });
      }
    };

    const onLeave = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };
    const onEnter = () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="aa-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="aa-cursor-ring" aria-hidden="true" />
    </>
  );
}

export default Cursor;
