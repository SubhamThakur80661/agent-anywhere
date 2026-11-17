import { useRef } from "react";
import { ensureGsap, motionOK, finePointer } from "../../lib/motion.js";

// Magnetic wrapper: the child leans toward the cursor (max 6px) and springs
// back with an elastic return. Desktop fine pointers only; touch and reduced
// motion get the plain child with no wrapper behavior.
function Magnetic({ children, strength = 6, className = "" }) {
  const ref = useRef(null);

  const onMove = (e) => {
    if (!motionOK() || !finePointer() || !ref.current) return;
    const gsap = ensureGsap();
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    gsap.to(ref.current, {
      x: (x / rect.width) * strength * 2,
      y: (y / rect.height) * strength * 2,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    if (!ref.current) return;
    ensureGsap().to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.4)",
    });
  };

  return (
    <div
      ref={ref}
      className={`aa-magnetic ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

export default Magnetic;
