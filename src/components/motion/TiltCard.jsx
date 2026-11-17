import { useRef } from "react";
import { ensureGsap, motionOK, finePointer } from "../../lib/motion.js";

// Card that tilts toward the cursor (3D, max a few degrees) with a soft light
// reflection that follows the pointer. Transform and opacity only, desktop
// fine pointers only. Without motion it is a plain wrapper.
function TiltCard({ children, className = "", max = 4, glare = true }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!motionOK() || !finePointer() || !el) return;
    const gsap = ensureGsap();
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    gsap.to(el, {
      rotateY: (px - 0.5) * max * 2,
      rotateX: (0.5 - py) * max * 2,
      transformPerspective: 900,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    ensureGsap().to(el, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: "power3.out",
    });
  };

  return (
    <div
      ref={ref}
      className={`aa-tilt ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
      {glare && <div className="aa-tilt-glare" aria-hidden="true" />}
    </div>
  );
}

export default TiltCard;
