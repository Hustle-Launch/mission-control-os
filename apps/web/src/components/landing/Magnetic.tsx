import { useEffect, useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "cnfast";

type Props = {
  children: ReactNode;
  strength?: number;
  className?: string;
};

/**
 * Magnetic wrapper — children gravitate toward the mouse pointer.
 * Vanilla spring physics via rAF (no motion/framer-motion dependency).
 * Ported from modern-design-playground/Magnetic.
 */
export function Magnetic({ children, strength = 0.35, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, raf: 0 });

  const tick = () => {
    const s = state.current;
    const el = ref.current;
    if (!el) {
      s.raf = 0;
      return;
    }

    const STIFFNESS = 0.08;
    const DAMPING = 0.72;

    s.vx += (s.tx - s.x) * STIFFNESS;
    s.vy += (s.ty - s.y) * STIFFNESS;
    s.vx *= DAMPING;
    s.vy *= DAMPING;
    s.x += s.vx;
    s.y += s.vy;

    const settled =
      Math.abs(s.vx) < 0.01 &&
      Math.abs(s.vy) < 0.01 &&
      Math.abs(s.tx - s.x) < 0.1 &&
      Math.abs(s.ty - s.y) < 0.1;

    if (settled) {
      s.x = s.tx;
      s.y = s.ty;
      el.style.transform =
        s.x === 0 && s.y === 0
          ? ""
          : `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
      s.raf = 0;
      return;
    }

    el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
    s.raf = requestAnimationFrame(tick);
  };

  const ensureLoop = () => {
    if (!state.current.raf) {
      state.current.raf = requestAnimationFrame(tick);
    }
  };

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    state.current.tx = dx * strength;
    state.current.ty = dy * strength;
    ensureLoop();
  };

  const onLeave = () => {
    state.current.tx = 0;
    state.current.ty = 0;
    ensureLoop();
  };

  useEffect(() => {
    return () => {
      if (state.current.raf) cancelAnimationFrame(state.current.raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("inline-flex will-change-transform", className)}
    >
      {children}
    </div>
  );
}
