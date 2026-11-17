import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

// Register GSAP plugins once. Every animation in the app goes through this
// module so there is exactly one clock (the GSAP ticker).
export function ensureGsap() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return gsap;
}

// Motion verb for the whole app: snap into place. One ease family, related
// durations. expo.out for reveals, power3.out for feedback.
export const EASE_OUT = "expo.out";
export const EASE_SOFT = "power3.out";
export const EASE_SNAP = "expo.inOut";

export function motionOK() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function finePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

export { gsap, ScrollTrigger };
