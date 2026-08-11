import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Magnetic } from "./Magnetic";

gsap.registerPlugin(ScrollTrigger);

const C = {
  base: "#1e1e2e",
  mantle: "#181825",
  crust: "#11111b",
  text: "#cdd6f4",
  sub: "#a6adc8",
  sky: "#89dceb",
  flamingo: "#f2cdcd",
  mauve: "#cba6f7",
  sapphire: "#74c7ec",
  teal: "#94e2d5",
  peach: "#fab387",
};

export type Station = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  accent: string;
  painPoint: string;
  solution: string;
};

export const STATIONS: Station[] = [
  {
    id: "audit",
    eyebrow: "01. Technical Audit",
    title: "Stop paying $500/mo per crawler seat.",
    body: "Traditional crawlers charge per URL and lock features behind enterprise paywalls. Mission Control runs deep technical audits directly on your hardware with zero page limits and real-time streaming findings.",
    accent: C.sky,
    painPoint: "High monthly crawler bills & page cap lockouts",
    solution: "Unlimited local audits with zero per-page fees",
  },
  {
    id: "crm",
    eyebrow: "02. Dual CRM & Pipelines",
    title: "One CRM for your agency. One for every client.",
    body: "Stop juggling separate CRM subscriptions for your sales team and your client accounts. Mission Control provides partitioned agency sales pipelines and client CRMs built on the exact same core engine.",
    accent: C.mauve,
    painPoint: "Fragile integrations between agency & client CRMs",
    solution: "Unified dual-workspace CRM primitive",
  },
  {
    id: "social",
    eyebrow: "03. Social & Approvals",
    title: "Kill client approval chaos across 5 platforms.",
    body: "Stop chasing clients for email approvals or dealing with third-party publishing failures. Schedule posts into an interactive look-ahead calendar where clients review, edit, or flag content effortlessly.",
    accent: C.peach,
    painPoint: "Endless email threads & missed client post approvals",
    solution: "Interactive client look-ahead approval calendar",
  },
  {
    id: "portal",
    eyebrow: "04. White-Label Client Portal",
    title: "Give clients a 24/7 view of their growth.",
    body: "Replace static PDF reports with a white-labeled client portal. Clients log into their own branded dashboard to track live organic search rank, Google Business Profile calls, and ongoing delivery tasks.",
    accent: C.flamingo,
    painPoint: "Time-consuming manual monthly client reporting PDFs",
    solution: "Live 24/7 client portal with real-time analytics",
  },
  {
    id: "automations",
    eyebrow: "05. Email & Workflows",
    title: "Automate client onboarding and lead nurturing.",
    body: "Build multi-step email & SMS sequences, lead assignment rules, and audit alert triggers without paying per-contact markup fees or managing complex third-party webhooks.",
    accent: C.sapphire,
    painPoint: "Expensive per-contact email tier markups",
    solution: "Built-in trigger workflow & sequence engine",
  },
];

type ProgressRef = MutableRefObject<number>;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/** Draws dynamic animated NASA MCR screen demos onto a 2D canvas texture */
function useScreenTexture(stationId: string, accentHex: string) {
  const { canvas, texture } = useMemo(() => {
    if (typeof document === "undefined") return { canvas: null, texture: null };
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 400;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return { canvas, texture: tex };
  }, []);

  const drawScreen = (time: number) => {
    if (!canvas || !texture) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark screen background
    ctx.fillStyle = "#0c0d14";
    ctx.fillRect(0, 0, w, h);

    // MCR Screen Header bar
    ctx.fillStyle = "#161724";
    ctx.fillRect(0, 0, w, 40);
    ctx.fillStyle = accentHex;
    ctx.fillRect(0, 38, w, 2);

    // Live Status Pulsing Dot
    const pulse = 0.5 + Math.sin(time * 4) * 0.5;
    ctx.fillStyle = `rgba(34, 197, 94, ${0.5 + pulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(20, 20, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#cdd6f4";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText(`MISSION CONTROL MCR // SYS_${stationId.toUpperCase()}`, 35, 24);

    ctx.fillStyle = "#a6adc8";
    ctx.font = "11px monospace";
    ctx.fillText(`LIVE DEMO FEED · LIVE`, w - 160, 24);

    // Station specific screen content
    if (stationId === "audit") {
      // Audit scanner display
      ctx.fillStyle = "#1e1e2e";
      roundRect(ctx, 20, 55, 280, 320, 8);
      ctx.fill();

      ctx.fillStyle = accentHex;
      ctx.font = "bold 13px system-ui";
      ctx.fillText("CRAWL HEALTH SCORE", 35, 82);

      // Radial progress dial
      const cx = 160, cy = 190, r = 65;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#313244";
      ctx.lineWidth = 12;
      ctx.stroke();

      const progress = 0.78 + Math.sin(time * 2) * 0.12;
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.strokeStyle = accentHex;
      ctx.lineWidth = 12;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(progress * 100)}`, cx, cy + 12);
      ctx.font = "11px system-ui";
      ctx.fillStyle = "#a6adc8";
      ctx.fillText("OPTIMIZED", cx, cy + 32);
      ctx.textAlign = "left";

      // Issues bar graph
      ctx.fillStyle = "#1e1e2e";
      roundRect(ctx, 315, 55, 305, 320, 8);
      ctx.fill();

      ctx.fillStyle = "#cdd6f4";
      ctx.font = "bold 13px system-ui";
      ctx.fillText("ISSUES DETECTED BY SEVERITY", 330, 82);

      const categories = [
        { label: "Broken Links (404)", val: 18, color: "#f38ba8" },
        { label: "Missing Meta Title", val: 42, color: "#fab387" },
        { label: "H1 Tag Missing", val: 12, color: "#f9e2af" },
        { label: "Slow Render (>2s)", val: 29, color: "#89dceb" },
      ];

      categories.forEach((cat, idx) => {
        const y = 115 + idx * 60;
        ctx.fillStyle = "#a6adc8";
        ctx.font = "12px system-ui";
        ctx.fillText(cat.label, 330, y);

        ctx.fillStyle = "#313244";
        roundRect(ctx, 330, y + 8, 275, 14, 4);
        ctx.fill();

        const barW = (cat.val / 50) * 275 * (0.85 + 0.15 * Math.sin(time * 2 + idx));
        ctx.fillStyle = cat.color;
        roundRect(ctx, 330, y + 8, Math.max(10, barW), 14, 4);
        ctx.fill();
      });
    } else if (stationId === "crm") {
      // Kanban pipeline display
      const cols = [
        { title: "Lead In", count: 4 },
        { title: "Audit Sent", count: 3 },
        { title: "Proposal", count: 2 },
        { title: "Won ($18k)", count: 5 },
      ];
      cols.forEach((col, idx) => {
        const x = 20 + idx * 150;
        ctx.fillStyle = "#161724";
        roundRect(ctx, x, 55, 140, 320, 6);
        ctx.fill();

        ctx.fillStyle = accentHex;
        ctx.font = "bold 12px system-ui";
        ctx.fillText(col.title, x + 10, 78);

        // Cards inside columns
        for (let i = 0; i < 3; i++) {
          const cardY = 95 + i * 75;
          ctx.fillStyle = "#1e1e2e";
          roundRect(ctx, x + 8, cardY, 124, 62, 6);
          ctx.fill();

          ctx.fillStyle = "#cdd6f4";
          ctx.font = "bold 11px system-ui";
          ctx.fillText(`Client deal #${idx * 3 + i + 101}`, x + 16, cardY + 22);

          ctx.fillStyle = "#a6adc8";
          ctx.font = "10px monospace";
          ctx.fillText(`$${(idx + 1) * 2500}/mo`, x + 16, cardY + 42);

          // Glowing card indicator dot
          ctx.fillStyle = idx === 3 ? "#a6e3a1" : "#89dceb";
          ctx.beginPath();
          ctx.arc(x + 118, cardY + 20, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (stationId === "social") {
      // Social approval calendar
      ctx.fillStyle = "#1e1e2e";
      roundRect(ctx, 20, 55, 600, 320, 8);
      ctx.fill();

      ctx.fillStyle = accentHex;
      ctx.font = "bold 13px system-ui";
      ctx.fillText("CLIENT APPROVAL CALENDAR — THIS WEEK", 35, 85);

      const days = ["MON", "TUE", "WED", "THU", "FRI"];
      days.forEach((day, i) => {
        const x = 35 + i * 115;
        ctx.fillStyle = "#161724";
        roundRect(ctx, x, 105, 105, 250, 6);
        ctx.fill();

        ctx.fillStyle = "#89dceb";
        ctx.font = "bold 12px system-ui";
        ctx.fillText(day, x + 10, 125);

        // Post cards
        ctx.fillStyle = i % 2 === 0 ? "#2a2b3d" : "#313244";
        roundRect(ctx, x + 6, 140, 93, 85, 4);
        ctx.fill();

        ctx.fillStyle = i === 3 ? "#f38ba8" : "#a6e3a1";
        ctx.font = "bold 9px system-ui";
        ctx.fillText(i === 3 ? "NEEDS REVISION" : "APPROVED", x + 10, 158);

        ctx.fillStyle = "#cdd6f4";
        ctx.font = "10px system-ui";
        ctx.fillText("Local SEO Tip...", x + 10, 180);
        ctx.fillStyle = "#a6adc8";
        ctx.font = "9px system-ui";
        ctx.fillText("Scheduled 10am", x + 10, 198);
      });
    } else if (stationId === "portal") {
      // White-label dashboard display
      ctx.fillStyle = "#1e1e2e";
      roundRect(ctx, 20, 55, 380, 320, 8);
      ctx.fill();

      ctx.fillStyle = accentHex;
      ctx.font = "bold 13px system-ui";
      ctx.fillText("ORGANIC TRAFFIC & IMPRESSIONS", 35, 82);

      // Organic line chart
      ctx.beginPath();
      ctx.moveTo(40, 330);
      for (let i = 0; i <= 10; i++) {
        const px = 40 + i * 34;
        const py = 310 - Math.sin((i / 10) * Math.PI + time * 1.8) * 110 - i * 10;
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = accentHex;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Right column gauges
      ctx.fillStyle = "#1e1e2e";
      roundRect(ctx, 415, 55, 205, 150, 8);
      ctx.fill();
      ctx.fillStyle = "#cdd6f4";
      ctx.font = "bold 12px system-ui";
      ctx.fillText("GOOGLE MAPS CALLS", 430, 80);
      ctx.fillStyle = "#a6e3a1";
      ctx.font = "bold 36px system-ui";
      ctx.fillText("+142%", 430, 140);

      ctx.fillStyle = "#1e1e2e";
      roundRect(ctx, 415, 220, 205, 155, 8);
      ctx.fill();
      ctx.fillStyle = "#cdd6f4";
      ctx.font = "bold 12px system-ui";
      ctx.fillText("TASKS COMPLETED", 430, 245);
      ctx.fillStyle = "#fab387";
      ctx.font = "bold 36px system-ui";
      ctx.fillText("28 / 30", 430, 305);
    } else if (stationId === "automations") {
      // Automation node workflow map
      ctx.fillStyle = "#1e1e2e";
      roundRect(ctx, 20, 55, 600, 320, 8);
      ctx.fill();

      ctx.fillStyle = accentHex;
      ctx.font = "bold 13px system-ui";
      ctx.fillText("WORKFLOW: AUTOMATED CLIENT ONBOARDING", 35, 85);

      const nodes = [
        { label: "Trigger: Form Submit", x: 45, y: 180, color: "#89dceb" },
        { label: "Condition: Audit OK", x: 225, y: 180, color: "#cba6f7" },
        { label: "Action: Send Welcome SMS", x: 415, y: 130, color: "#a6e3a1" },
        { label: "Action: Create CRM Deal", x: 415, y: 230, color: "#fab387" },
      ];

      // Connector wires
      ctx.strokeStyle = "#45475a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(175, 180); ctx.lineTo(225, 180);
      ctx.moveTo(355, 180); ctx.lineTo(415, 130);
      ctx.moveTo(355, 180); ctx.lineTo(415, 230);
      ctx.stroke();

      // Glowing animated pulse dot traveling along connectors
      const pulseT = (time * 1.5) % 1;
      const pulseX = 175 + pulseT * 50;
      ctx.fillStyle = "#89dceb";
      ctx.beginPath();
      ctx.arc(pulseX, 180, 4, 0, Math.PI * 2);
      ctx.fill();

      nodes.forEach((n) => {
        ctx.fillStyle = "#161724";
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 2;
        roundRect(ctx, n.x, n.y - 25, 140, 50, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#cdd6f4";
        ctx.font = "bold 11px system-ui";
        ctx.fillText(n.label, n.x + 10, n.y + 5);
      });
    }

    texture.needsUpdate = true;
  };

  return { texture, drawScreen };
}

/** 3D NASA Mission Control Room (MCR) Console Desk with animated monitor */
function MCRConsoleMonitor({
  position,
  rotation,
  color,
  active,
  stationId,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  active: number;
  stationId: string;
}) {
  const group = useRef<THREE.Group>(null);
  const { texture, drawScreen } = useScreenTexture(stationId, color);

  useFrame((state) => {
    drawScreen(state.clock.elapsedTime);
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.y = position[1] + Math.sin(t * 0.7 + position[0]) * 0.04;
    const targetScale = 0.9 + active * 0.2;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, targetScale, 0.08));
  });

  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.2}>
      <group ref={group} position={position} rotation={rotation}>
        {/* Console Desk Base */}
        <mesh position={[0, -1.25, 0]}>
          <boxGeometry args={[3.6, 0.25, 1.6]} />
          <meshStandardMaterial color="#181825" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.6, -0.2]}>
          <boxGeometry args={[3.2, 1.1, 0.8]} />
          <meshStandardMaterial color="#11111b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Console Monitor Bezel Frame */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[3.4, 2.15, 0.12]} />
          <meshStandardMaterial
            color="#181825"
            metalness={0.85}
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.08 + active * 0.25}
          />
        </mesh>

        {/* Monitor Screen Display (Canvas Texture) */}
        <mesh position={[0, 0.4, 0.07]}>
          <planeGeometry args={[3.2, 1.95]} />
          {texture ? (
            <meshBasicMaterial map={texture} toneMapped={false} />
          ) : (
            <meshBasicMaterial color="#0c0d14" />
          )}
        </mesh>

        {/* Outer Glowing Neon Border Accent */}
        <mesh position={[0, 0.4, -0.01]}>
          <boxGeometry args={[3.48, 2.23, 0.08]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4 + active * 0.6}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* NASA MCR Status Lights strip on top of monitor */}
        {[ -1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2 ].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 1.55, 0.05]}>
            <boxGeometry args={[0.2, 0.06, 0.06]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? C.sky : color}
              emissive={i % 2 === 0 ? C.sky : color}
              emissiveIntensity={0.5 + active * 0.5}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function MCRFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial
        color="#11111b"
        metalness={0.8}
        roughness={0.4}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function CameraRig({ progress }: { progress: ProgressRef }) {
  const { camera } = useThree();
  const smooth = useRef(0);

  // Smooth camera panning through NASA Mission Control Center consoles along Z axis
  useFrame(() => {
    smooth.current += (progress.current - smooth.current) * 0.07;
    const p = smooth.current;
    const n = STATIONS.length;
    const t = p * (n - 1);
    const i = Math.floor(t);
    const f = t - i;
    const ease = f * f * (3 - 2 * f);

    const z0 = i * 7;
    const z1 = Math.min(i + 1, n - 1) * 7;
    const z = THREE.MathUtils.lerp(z0, z1, ease);

    // NASA MCR scanner pan trajectory
    const x = Math.sin(p * Math.PI * 1.8) * 1.8;
    const y = 1.0 + Math.cos(p * Math.PI * 2) * 0.2;

    camera.position.set(x, y, z + 4.8);
    camera.lookAt(x * 0.15, 0.4, z);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 42;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function Scene({ progress }: { progress: ProgressRef }) {
  return (
    <>
      <color attach="background" args={[C.crust]} />
      <fog attach="fog" args={[C.crust, 10, 36]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} color="#e6e9ef" />
      <pointLight position={[-5, 4, 3]} intensity={0.8} color={C.sky} />
      <pointLight position={[6, 3, 14]} intensity={0.6} color={C.flamingo} />

      <MCRFloor />
      <Sparkles count={100} scale={[24, 8, 40]} size={2} speed={0.2} color={C.sky} opacity={0.35} />

      {STATIONS.map((s, i) => {
        const center = i / Math.max(STATIONS.length - 1, 1);
        const active = 1 - Math.min(1, Math.abs(progress.current - center) * 3.0);
        const sideOffset = i % 2 === 0 ? -1.1 : 1.1;
        const rotY = i % 2 === 0 ? 0.15 : -0.15;

        return (
          <MCRConsoleMonitor
            key={s.id}
            position={[sideOffset, 0.2, i * 7]}
            rotation={[0, rotY, 0]}
            color={s.accent}
            active={Math.max(0, active)}
            stationId={s.id}
          />
        );
      })}

      <CameraRig progress={progress} />
    </>
  );
}

/**
 * Scroll-scrubbed NASA Mission Control Room experience selling agency solutions.
 */
export function WorldStage() {
  const progress = useRef(0);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.55,
        pin: pin,
        anticipatePin: 1,
        onUpdate: (self) => {
          progress.current = self.progress;
          const idx = Math.min(
            STATIONS.length - 1,
            Math.floor(self.progress * STATIONS.length),
          );
          setActive(idx);
        },
      });
    });

    return () => ctx.revert();
  }, [reduced]);

  if (reduced) {
    return (
      <section className="relative bg-[#11111b] px-6 py-24">
        <div className="mx-auto max-w-[48rem] space-y-16">
          {STATIONS.map((s) => (
            <article key={s.id} className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: s.accent }}>
                {s.eyebrow}
              </p>
              <h3 className="text-2xl font-semibold text-[#cdd6f4]">{s.title}</h3>
              <p className="text-[#a6adc8] leading-relaxed">{s.body}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={trackRef} className="relative" style={{ height: `${STATIONS.length * 100}vh` }}>
      <div ref={pinRef} className="relative h-dvh w-full overflow-hidden bg-[#11111b]">
        <Canvas
          className="absolute inset-0"
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 1.2, 4.8], fov: 42, near: 0.1, far: 60 }}
        >
          <Suspense fallback={null}>
            <Scene progress={progress} />
          </Suspense>
        </Canvas>

        {/* Glass feature card copy overlay selling agency solutions */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end md:items-center">
          <div className="w-full max-w-[38rem] p-6 md:p-12 md:ml-8 lg:ml-16">
            {STATIONS.map((s, i) => {
              const on = i === active;
              return (
                <article
                  key={s.id}
                  className="absolute bottom-20 left-6 right-6 md:static md:bottom-auto md:left-auto md:right-auto transition-all duration-500"
                  style={{
                    opacity: on ? 1 : 0,
                    transform: on ? "translateY(0)" : "translateY(16px)",
                    pointerEvents: on ? "auto" : "none",
                    position: on ? "relative" : "absolute",
                  }}
                  aria-hidden={!on}
                >
                  <div
                    className="rounded-2xl border border-white/10 bg-[#1e1e2e]/75 px-6 py-6 backdrop-blur-xl"
                    style={{ boxShadow: `0 0 52px ${s.accent}25` }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p
                        className="text-[11px] font-bold uppercase tracking-[0.24em]"
                        style={{ color: s.accent }}
                      >
                        {s.eyebrow}
                      </p>
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium text-[#a6adc8]">
                        Console Screen #{i + 1}
                      </span>
                    </div>

                    <h2 className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                      {s.title}
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-[#a6adc8] sm:text-base">
                      {s.body}
                    </p>

                    {/* Pain point vs Solution pills */}
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-200">
                        <span className="block font-semibold uppercase tracking-wider text-red-400 text-[9px] mb-0.5">
                          Agency Pain Point
                        </span>
                        {s.painPoint}
                      </div>
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-200">
                        <span className="block font-semibold uppercase tracking-wider text-emerald-400 text-[9px] mb-0.5">
                          Mission Control Solution
                        </span>
                        {s.solution}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Route rail navigation */}
        <nav
          className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2.5 md:right-8"
          aria-label="Mission Control Consoles"
        >
          {STATIONS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="group flex items-center justify-end gap-2.5"
              onClick={() => {
                const track = trackRef.current;
                if (!track) return;
                const top = track.offsetTop;
                const h = track.offsetHeight - window.innerHeight;
                const y = top + (i / Math.max(STATIONS.length - 1, 1)) * h;
                window.scrollTo({ top: y, behavior: "smooth" });
              }}
              aria-current={i === active ? "true" : undefined}
              aria-label={s.eyebrow}
            >
              <span className="hidden text-[10px] uppercase tracking-wider text-[#a6adc8] opacity-0 transition group-hover:opacity-100 md:inline">
                {s.eyebrow}
              </span>
              <span
                className="block h-2.5 w-2.5 rounded-full transition-all"
                style={{
                  background: i === active ? s.accent : "#45475a",
                  boxShadow: i === active ? `0 0 14px ${s.accent}` : "none",
                  transform: i === active ? "scale(1.4)" : "scale(1)",
                }}
              />
            </button>
          ))}
        </nav>

        <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-[#6c7086]">
          Scroll to scan Mission Control consoles
        </p>
      </div>
    </section>
  );
}
