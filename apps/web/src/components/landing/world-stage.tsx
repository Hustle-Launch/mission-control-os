import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, MeshReflectorMaterial } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  DepthOfField,
  ChromaticAberration,
} from "@react-three/postprocessing";
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

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────── Palette ─────────────────────────── */

const C = {
  base: "#1e1e2e",
  mantle: "#181825",
  crust: "#0b0c16",
  text: "#cdd6f4",
  sub: "#a6adc8",
  sky: "#89dceb",
  flamingo: "#f2cdcd",
  mauve: "#cba6f7",
  sapphire: "#74c7ec",
  teal: "#94e2d5",
  peach: "#fab387",
  emerald: "#a6e3a1",
};

/* ─────────────────────────── Station Data ─────────────────────────── */

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

/* ───────────────────── 2070 HUD Canvas Rendering ───────────────────── */

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

/** Draws 2070 Glass HUD Panel with Glowing Bevels & Tech Brackets */
function drawGlassPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  accentHex: string,
  r = 10,
) {
  /* Translucent glass backdrop */
  const pGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  pGrad.addColorStop(0, "rgba(18, 20, 34, 0.85)");
  pGrad.addColorStop(1, "rgba(10, 11, 20, 0.92)");
  ctx.fillStyle = pGrad;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();

  /* Glowing inner border */
  ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();

  /* Tech corner brackets */
  const cl = 12;
  ctx.strokeStyle = accentHex + "90";
  ctx.lineWidth = 2;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(x, y + cl);
  ctx.lineTo(x, y);
  ctx.lineTo(x + cl, y);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(x + w - cl, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - cl);
  ctx.stroke();
}

/** Render 2070 Holographic Visor Frame & Header Telemetry */
function draw2070VisorChrome(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stationId: string,
  accentHex: string,
  time: number,
) {
  /* Dark space background with deep radial gradient */
  const bgGrad = ctx.createRadialGradient(
    w / 2,
    h / 2,
    50,
    w / 2,
    h / 2,
    w * 0.7,
  );
  bgGrad.addColorStop(0, "#0e101d");
  bgGrad.addColorStop(0.7, "#080912");
  bgGrad.addColorStop(1, "#040409");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  /* Subtle holographic grid lines */
  ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
  ctx.lineWidth = 1;
  for (let gx = 30; gx < w; gx += 30) {
    ctx.beginPath();
    ctx.moveTo(gx, 50);
    ctx.lineTo(gx, h - 30);
    ctx.stroke();
  }
  for (let gy = 60; gy < h - 30; gy += 30) {
    ctx.beginPath();
    ctx.moveTo(30, gy);
    ctx.lineTo(w - 30, gy);
    ctx.stroke();
  }

  /* 2070 Header Bar */
  const hdrGrad = ctx.createLinearGradient(0, 0, w, 0);
  hdrGrad.addColorStop(0, "rgba(255, 255, 255, 0.05)");
  hdrGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
  hdrGrad.addColorStop(1, "rgba(255, 255, 255, 0.05)");
  ctx.fillStyle = hdrGrad;
  ctx.fillRect(0, 0, w, 52);

  /* Laser line separator */
  const laserGrad = ctx.createLinearGradient(0, 0, w, 0);
  laserGrad.addColorStop(0, accentHex + "00");
  laserGrad.addColorStop(0.2, accentHex);
  laserGrad.addColorStop(0.8, accentHex);
  laserGrad.addColorStop(1, accentHex + "00");
  ctx.fillStyle = laserGrad;
  ctx.fillRect(0, 50, w, 2);

  /* Pulsing Reactor Node Status */
  const pulse = 0.5 + Math.sin(time * 5) * 0.5;
  ctx.save();
  ctx.shadowBlur = 14;
  ctx.shadowColor = accentHex;
  ctx.fillStyle = accentHex;
  ctx.beginPath();
  ctx.arc(28, 26, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* Sci-fi System Header */
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 13px system-ui, sans-serif";
  ctx.letterSpacing = "0.15em";
  ctx.fillText(
    `MISSION CONTROL 2070 // HOLO_SYS_${stationId.toUpperCase()}`,
    46,
    30,
  );

  /* Real-time telemetry feed */
  ctx.fillStyle = accentHex;
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`SYSTEM STABLE · 120 FPS · QUANTUM SYNC`, w - 24, 30);
  ctx.textAlign = "left";

  /* Bottom status rail */
  ctx.fillStyle = "rgba(10, 11, 20, 0.9)";
  ctx.fillRect(0, h - 28, w, 28);
  ctx.fillStyle = "#6c7086";
  ctx.font = "10px monospace";
  ctx.fillText("HOLO_SHELL v4.8.2 // LATENCY: 0.2ms // ENCRYPTION: 4096-QUANTUM", 20, h - 10);
}

/* ───────────────────── Station Specific 2070 HUD Content ───────────────────── */

function drawAuditScreen2070(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accent: string,
) {
  /* Left Glass Dial Panel */
  drawGlassPanel(ctx, 30, 70, 530, h - 118, accent, 12);

  ctx.fillStyle = accent;
  ctx.font = "bold 13px system-ui";
  ctx.fillText("CYBERNETIC AUDIT SCANNER", 56, 104);

  const cx = 295;
  const cy = 290;
  const r = 105;

  /* Rotating Outer Telemetry Tick Ring */
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.3);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    const innerR = r + 16;
    const outerR = r + (i % 3 === 0 ? 24 : 20);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
    ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
    ctx.stroke();
  }
  ctx.restore();

  /* Radial Health Track */
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.stroke();

  /* Active Holographic Arc */
  const scoreProgress = 0.84 + Math.sin(time * 1.8) * 0.06;
  const startA = Math.PI * 0.75;
  const endA = startA + Math.PI * 1.5 * scoreProgress;

  ctx.save();
  ctx.shadowBlur = 24;
  ctx.shadowColor = accent;
  ctx.beginPath();
  ctx.arc(cx, cy, r, startA, endA);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();

  /* Central Score Text */
  ctx.save();
  ctx.shadowBlur = 30;
  ctx.shadowColor = accent;
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 56px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(scoreProgress * 100)}`, cx, cy + 18);
  ctx.restore();

  ctx.fillStyle = accent;
  ctx.font = "bold 11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("OPTIMIZED PARALLEL CRAWL", cx, cy + 46);
  ctx.textAlign = "left";

  /* Metrics summary strip */
  const metrics = [
    { label: "PAGES AUDITED", val: "48,290" },
    { label: "LATENCY", val: "0.14s" },
    { label: "LOCAL HARDWARE", val: "100%" },
  ];
  metrics.forEach((m, i) => {
    const mx = 60 + i * 165;
    ctx.fillStyle = "#6c7086";
    ctx.font = "10px system-ui";
    ctx.fillText(m.label, mx, h - 74);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px system-ui";
    ctx.fillText(m.val, mx, h - 52);
  });

  /* Right Panel — Severity Breakdown */
  drawGlassPanel(ctx, 580, 70, w - 610, h - 118, accent, 12);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px system-ui";
  ctx.fillText("AUDIT SEVERITY DISTRIBUTION", 606, 104);

  const categories = [
    { label: "Broken Links (404)", val: 14, color: "#f38ba8" },
    { label: "Missing Meta Title", val: 38, color: "#fab387" },
    { label: "H1 Tag Missing", val: 9, color: "#f9e2af" },
    { label: "Slow Render (>1.5s)", val: 22, color: accent },
    { label: "Unoptimized Assets", val: 31, color: "#cba6f7" },
  ];

  categories.forEach((cat, idx) => {
    const cy = 138 + idx * 56;
    ctx.fillStyle = "#cdd6f4";
    ctx.font = "12px system-ui";
    ctx.fillText(cat.label, 606, cy);

    const barW = w - 690;
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    roundRect(ctx, 606, cy + 10, barW, 14, 5);
    ctx.fill();

    const fillW = Math.max(12, (cat.val / 50) * barW * (0.9 + 0.1 * Math.sin(time * 2 + idx)));

    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = cat.color;
    ctx.fillStyle = cat.color;
    roundRect(ctx, 606, cy + 10, fillW, 14, 5);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = cat.color;
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "right";
    ctx.fillText(String(cat.val), w - 46, cy + 22);
    ctx.textAlign = "left";
  });
}

function drawCrmScreen2070(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accent: string,
) {
  /* Pipeline Header Summary */
  drawGlassPanel(ctx, 30, 70, w - 60, 60, accent, 10);
  const metrics = [
    { label: "TOTAL PIPELINE VALUE", val: "$482,000" },
    { label: "AGENCY REVENUE", val: "$194,500/mo" },
    { label: "WIN RATE", val: "74.2%" },
    { label: "ACTIVE CLIENT CRMs", val: "32 PORTALS" },
  ];
  metrics.forEach((m, i) => {
    const mx = 56 + i * 280;
    ctx.fillStyle = "#6c7086";
    ctx.font = "10px system-ui";
    ctx.fillText(m.label, mx, 94);
    ctx.fillStyle = i === 1 ? "#a6e3a1" : "#ffffff";
    ctx.font = "900 18px system-ui";
    ctx.fillText(m.val, mx, 116);
  });

  /* 4 Glass Pipeline Columns */
  const cols = [
    { title: "INBOUND LEADS", val: 8, color: "#89dceb" },
    { title: "AUDIT DELIVERED", val: 5, color: accent },
    { title: "PROPOSAL SENT", val: 4, color: "#fab387" },
    { title: "CLOSED / WON", val: 12, color: "#a6e3a1" },
  ];

  const colW = (w - 90) / 4;
  cols.forEach((col, idx) => {
    const cx = 30 + idx * (colW + 10);
    drawGlassPanel(ctx, cx, 142, colW, h - 190, col.color, 10);

    /* Column Header */
    ctx.fillStyle = col.color;
    ctx.font = "bold 11px system-ui";
    ctx.fillText(col.title, cx + 16, 168);

    /* Deal Cards */
    for (let ci = 0; ci < 3; ci++) {
      const cy = 186 + ci * 105;
      ctx.fillStyle = "rgba(22, 24, 40, 0.9)";
      roundRect(ctx, cx + 10, cy, colW - 20, 92, 8);
      ctx.fill();
      ctx.strokeStyle = col.color + "30";
      ctx.lineWidth = 1;
      roundRect(ctx, cx + 10, cy, colW - 20, 92, 8);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px system-ui";
      ctx.fillText(`Enterprise Client #${idx * 3 + ci + 101}`, cx + 22, cy + 26);

      ctx.fillStyle = "#6c7086";
      ctx.font = "11px monospace";
      ctx.fillText(`MRR: $${(idx + 1) * 3500}/mo`, cx + 22, cy + 48);

      /* Holographic Confidence Bar */
      const conf = 0.5 + Math.sin(time + idx + ci) * 0.3 + 0.2;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, cx + 22, cy + 64, colW - 64, 6, 3);
      ctx.fill();

      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = col.color;
      ctx.fillStyle = col.color;
      roundRect(ctx, cx + 22, cy + 64, (colW - 64) * conf, 6, 3);
      ctx.fill();
      ctx.restore();
    }
  });
}

function drawSocialScreen2070(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accent: string,
) {
  drawGlassPanel(ctx, 30, 70, w - 60, h - 118, accent, 12);

  ctx.fillStyle = accent;
  ctx.font = "bold 14px system-ui";
  ctx.fillText("HOLOGRAPHIC CLIENT APPROVAL LOOK-AHEAD CALENDAR", 56, 104);

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const colW = (w - 110) / 5;

  days.forEach((day, i) => {
    const dx = 50 + i * (colW + 10);

    ctx.fillStyle = "rgba(15, 17, 30, 0.8)";
    roundRect(ctx, dx, 125, colW, h - 200, 8);
    ctx.fill();

    ctx.fillStyle = "#89dceb";
    ctx.font = "bold 12px system-ui";
    ctx.fillText(day, dx + 14, 150);

    /* Post Preview Cards */
    for (let pi = 0; pi < 2; pi++) {
      const py = 170 + pi * 190;
      ctx.fillStyle = "rgba(26, 28, 48, 0.9)";
      roundRect(ctx, dx + 8, py, colW - 16, 170, 8);
      ctx.fill();

      const needsRevision = i === 3 && pi === 0;
      const statusColor = needsRevision ? "#f38ba8" : "#a6e3a1";
      const statusLabel = needsRevision ? "REVISION REQ" : "APPROVED";

      ctx.fillStyle = statusColor + "20";
      roundRect(ctx, dx + 16, py + 12, colW - 48, 22, 4);
      ctx.fill();
      ctx.fillStyle = statusColor;
      ctx.font = "bold 10px system-ui";
      ctx.fillText(statusLabel, dx + 24, py + 27);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px system-ui";
      ctx.fillText(`OmniPost #${i * 2 + pi + 1}`, dx + 16, py + 60);

      ctx.fillStyle = "#a6adc8";
      ctx.font = "11px system-ui";
      ctx.fillText("Organic SEO & Social", dx + 16, py + 82);

      /* Predictive Reach Metric */
      ctx.fillStyle = "#6c7086";
      ctx.font = "10px monospace";
      ctx.fillText("ESTIMATED REACH: 45.2K", dx + 16, py + 115);
    }
  });
}

function drawPortalScreen2070(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accent: string,
) {
  /* Main Organic Chart Glass Panel */
  drawGlassPanel(ctx, 30, 70, 720, h - 118, accent, 12);

  ctx.fillStyle = accent;
  ctx.font = "bold 14px system-ui";
  ctx.fillText("24/7 WHITE-LABEL LIVE ORGANIC GROWTH ENGINE", 56, 104);

  /* Spline Chart Area */
  const chartL = 80;
  const chartR = 710;
  const chartT = 140;
  const chartB = h - 120;
  const chartH = chartB - chartT;

  /* Horizontal Grid Lines */
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const gy = chartT + (i / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(chartL, gy);
    ctx.lineTo(chartR, gy);
    ctx.stroke();

    ctx.fillStyle = "#6c7086";
    ctx.font = "10px monospace";
    ctx.fillText(`${(4 - i) * 25}k`, chartL - 32, gy + 4);
  }

  /* Spline Curve Points */
  const points: [number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const px = chartL + (i / 12) * (chartR - chartL);
    const wave = Math.sin((i / 12) * Math.PI * 1.2 + 0.4) * 0.65 + 0.35;
    const anim = Math.sin(time * 1.2 + i * 0.5) * 0.04;
    const py = chartB - (wave + anim) * chartH;
    points.push([px, py]);
  }

  /* Gradient Fill under organic curve */
  ctx.beginPath();
  ctx.moveTo(points[0]![0], chartB);
  points.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.lineTo(points[points.length - 1]![0], chartB);
  ctx.closePath();

  const areaGrad = ctx.createLinearGradient(0, chartT, 0, chartB);
  areaGrad.addColorStop(0, accent + "50");
  areaGrad.addColorStop(0.7, accent + "10");
  areaGrad.addColorStop(1, accent + "00");
  ctx.fillStyle = areaGrad;
  ctx.fill();

  /* Glowing Spline Path */
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = accent;
  ctx.beginPath();
  ctx.moveTo(points[0]![0], points[0]![1]);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const cpx = (prev[0] + curr[0]) / 2;
    ctx.bezierCurveTo(cpx, prev[1], cpx, curr[1], curr[0], curr[1]);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  /* Right Panel — Real-Time KPI Cards */
  drawGlassPanel(ctx, 770, 70, w - 800, 240, accent, 12);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px system-ui";
  ctx.fillText("GOOGLE MAPS CALLS", 796, 104);

  ctx.save();
  ctx.shadowBlur = 35;
  ctx.shadowColor = "#a6e3a1";
  ctx.fillStyle = "#a6e3a1";
  ctx.font = "900 52px system-ui";
  ctx.fillText("+142%", 796, 185);
  ctx.restore();

  ctx.fillStyle = "#a6e3a1";
  ctx.font = "bold 12px system-ui";
  ctx.fillText("▲ VERIFIED ORGANIC LEADS", 796, 218);

  /* Bottom Right Panel — Tasks Completed Gauge */
  drawGlassPanel(ctx, 770, 330, w - 800, h - 378, accent, 12);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px system-ui";
  ctx.fillText("TASKS COMPLETED", 796, 364);

  ctx.save();
  ctx.shadowBlur = 30;
  ctx.shadowColor = "#fab387";
  ctx.fillStyle = "#fab387";
  ctx.font = "900 48px system-ui";
  ctx.fillText("28 / 30", 796, 435);
  ctx.restore();

  /* Progress Bar */
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  roundRect(ctx, 796, 460, w - 852, 14, 7);
  ctx.fill();

  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#fab387";
  ctx.fillStyle = "#fab387";
  roundRect(ctx, 796, 460, (w - 852) * 0.933, 14, 7);
  ctx.fill();
  ctx.restore();
}

function drawAutomationsScreen2070(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accent: string,
) {
  drawGlassPanel(ctx, 30, 70, w - 60, h - 118, accent, 12);

  ctx.fillStyle = accent;
  ctx.font = "bold 14px system-ui";
  ctx.fillText("QUANTUM WORKFLOW & TRIGGER AUTOMATION GRAPH", 56, 104);

  /* 5 Node Topology */
  const nodes = [
    { label: "Trigger: Webhook", type: "ENTRY", x: 70, y: 310, color: "#89dceb" },
    { label: "Condition: Audit OK", type: "EVAL", x: 340, y: 310, color: "#cba6f7" },
    { label: "Action: Send SMS", type: "EXEC", x: 620, y: 190, color: "#a6e3a1" },
    { label: "Action: Create CRM Deal", type: "EXEC", x: 620, y: 430, color: "#fab387" },
    { label: "Notify Ops Channel", type: "EXEC", x: 900, y: 310, color: "#f38ba8" },
  ];

  const connections: [number, number][] = [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
  ];

  /* Draw glowing energy conduits */
  connections.forEach(([from, to]) => {
    const fn = nodes[from]!;
    const tn = nodes[to]!;
    const sx = fn.x + 200;
    const sy = fn.y;
    const ex = tn.x;
    const ey = tn.y;
    const cpx1 = sx + (ex - sx) * 0.5;
    const cpx2 = ex - (ex - sx) * 0.5;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(cpx1, sy, cpx2, ey, ex, ey);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 3;
    ctx.stroke();

    /* Animated energy particle pulse */
    const pulseT = ((time * 0.8 + from * 0.5) % 1.5) / 1.5;
    const invT = 1 - pulseT;
    const px =
      invT * invT * invT * sx +
      3 * invT * invT * pulseT * cpx1 +
      3 * invT * pulseT * pulseT * cpx2 +
      pulseT * pulseT * pulseT * ex;
    const py =
      invT * invT * invT * sy +
      3 * invT * invT * pulseT * sy +
      3 * invT * pulseT * pulseT * ey +
      pulseT * pulseT * pulseT * ey;

    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = fn.color;
    ctx.fillStyle = fn.color;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  /* Render 3D Glass Node Cards */
  nodes.forEach((n) => {
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = n.color + "40";
    ctx.fillStyle = "rgba(16, 18, 32, 0.95)";
    roundRect(ctx, n.x, n.y - 45, 200, 90, 10);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = n.color + "80";
    ctx.lineWidth = 2;
    roundRect(ctx, n.x, n.y - 45, 200, 90, 10);
    ctx.stroke();

    ctx.fillStyle = n.color + "25";
    roundRect(ctx, n.x + 14, n.y - 32, 64, 20, 4);
    ctx.fill();
    ctx.fillStyle = n.color;
    ctx.font = "bold 9px system-ui";
    ctx.fillText(n.type, n.x + 22, n.y - 18);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px system-ui";
    ctx.fillText(n.label, n.x + 14, n.y + 16);
  });
}

/* ───────────────────── Canvas Screen Texture Hook ───────────────────── */

function use2070ScreenTexture(stationId: string, accentHex: string) {
  const { canvas, texture } = useMemo(() => {
    if (typeof document === "undefined") return { canvas: null, texture: null };
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 750;
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

    draw2070VisorChrome(ctx, w, h, stationId, accentHex, time);

    if (stationId === "audit") drawAuditScreen2070(ctx, w, h, time, accentHex);
    else if (stationId === "crm") drawCrmScreen2070(ctx, w, h, time, accentHex);
    else if (stationId === "social") drawSocialScreen2070(ctx, w, h, time, accentHex);
    else if (stationId === "portal") drawPortalScreen2070(ctx, w, h, time, accentHex);
    else if (stationId === "automations") drawAutomationsScreen2070(ctx, w, h, time, accentHex);

    texture.needsUpdate = true;
  };

  return { texture, drawScreen };
}

/* ───────────────────── 2070 Moonlander Glass Console ───────────────────── */

function Moonlander2070Console({
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
  const { texture, drawScreen } = use2070ScreenTexture(stationId, color);

  useFrame((state) => {
    drawScreen(state.clock.elapsedTime);
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.03;
    const targetScale = 0.94 + active * 0.16;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, targetScale, 0.07));
  });

  return (
    <Float speed={0.9} rotationIntensity={0.06} floatIntensity={0.15}>
      <group ref={group} position={position} rotation={rotation}>
        {/* ── Moonlander Left Ergonomic Glass Wing Base ── */}
        <group position={[-0.9, -1.0, 0.1]} rotation={[0.1, 0.22, -0.05]}>
          <mesh>
            <boxGeometry args={[1.7, 0.22, 1.2]} />
            <meshPhysicalMaterial
              color="#0e101d"
              transmission={0.82}
              roughness={0.12}
              ior={1.52}
              thickness={0.8}
              clearcoat={1.0}
              clearcoatRoughness={0.04}
              emissive={color}
              emissiveIntensity={0.12 + active * 0.2}
            />
          </mesh>
          {/* Tactile Skeuomorphic Glass Keys Matrix */}
          {[-0.5, -0.25, 0, 0.25, 0.5].map((kx, idx) => (
            <mesh key={`lkey-${idx}`} position={[kx, 0.15, -0.1]}>
              <boxGeometry args={[0.18, 0.08, 0.18]} />
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.4 + active * 0.8}
                roughness={0.1}
                clearcoat={0.9}
              />
            </mesh>
          ))}
        </group>

        {/* ── Moonlander Right Ergonomic Glass Wing Base ── */}
        <group position={[0.9, -1.0, 0.1]} rotation={[0.1, -0.22, 0.05]}>
          <mesh>
            <boxGeometry args={[1.7, 0.22, 1.2]} />
            <meshPhysicalMaterial
              color="#0e101d"
              transmission={0.82}
              roughness={0.12}
              ior={1.52}
              thickness={0.8}
              clearcoat={1.0}
              clearcoatRoughness={0.04}
              emissive={color}
              emissiveIntensity={0.12 + active * 0.2}
            />
          </mesh>
          {/* Tactile Skeuomorphic Glass Keys Matrix */}
          {[-0.5, -0.25, 0, 0.25, 0.5].map((kx, idx) => (
            <mesh key={`rkey-${idx}`} position={[kx, 0.15, -0.1]}>
              <boxGeometry args={[0.18, 0.08, 0.18]} />
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.4 + active * 0.8}
                roughness={0.1}
                clearcoat={0.9}
              />
            </mesh>
          ))}
        </group>

        {/* ── Holographic Visor Chamfered Glass Frame ── */}
        <mesh position={[0, 0.48, -0.02]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[3.6, 2.25, 0.08]} />
          <meshPhysicalMaterial
            color="#080912"
            transmission={0.92}
            roughness={0.08}
            ior={1.55}
            thickness={0.6}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            emissive={color}
            emissiveIntensity={0.06 + active * 0.15}
          />
        </mesh>

        {/* ── 2070 HUD Canvas Display Surface ── */}
        <mesh position={[0, 0.48, 0.03]} rotation={[-0.08, 0, 0]}>
          <planeGeometry args={[3.45, 2.1]} />
          {texture ? (
            <meshBasicMaterial map={texture} toneMapped={false} />
          ) : (
            <meshBasicMaterial color="#040409" />
          )}
        </mesh>

        {/* ── Outer Protective Optical Glass Visor ── */}
        <mesh position={[0, 0.48, 0.05]} rotation={[-0.08, 0, 0]}>
          <planeGeometry args={[3.45, 2.1]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.05}
            roughness={0.02}
            clearcoat={1.0}
            clearcoatRoughness={0.01}
            color="#ffffff"
            depthWrite={false}
          />
        </mesh>

        {/* ── Laser Light Pipe Rim Glow ── */}
        <mesh position={[0, 0.48, -0.04]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[3.66, 2.31, 0.02]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8 + active * 1.4}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* ── Floating Concentric Laser Base Projection Ring ── */}
        <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.35, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6 + active * 1.0}
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ───────────────────── Reflective Floor ───────────────────── */

function MCRFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[400, 200]}
        resolution={512}
        mixBlur={1}
        mixStrength={18}
        roughness={0.7}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#080912"
        metalness={0.8}
        mirror={0.5}
      />
    </mesh>
  );
}

/* ───────────────────── Camera Rig ───────────────────── */

function CameraRig({ progress }: { progress: ProgressRef }) {
  const { camera } = useThree();
  const smooth = useRef(0);

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

    const currentSideOffset = Math.round(p * (n - 1)) % 2 === 0 ? -1.1 : 1.1;
    const x = Math.sin(p * Math.PI * 1.8) * 1.5;
    const y = 0.75 + Math.cos(p * Math.PI * 2) * 0.12;

    camera.position.set(x, y, z + 4.8);
    camera.lookAt(currentSideOffset * 0.35, 0.48, z);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 42;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

/* ───────────────────── 3D Holographic Scene ───────────────────── */

function Scene({ progress }: { progress: ProgressRef }) {
  return (
    <>
      <color attach="background" args={[C.crust]} />
      <fog attach="fog" args={[C.crust, 8, 32]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[8, 14, 6]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-6, 5, 4]} intensity={0.8} color={C.sky} />
      <pointLight position={[6, 4, 18]} intensity={0.7} color={C.flamingo} />
      <pointLight position={[0, 6, 12]} intensity={0.5} color={C.mauve} />

      <MCRFloor />

      <Sparkles
        count={150}
        scale={[26, 12, 45]}
        size={1.8}
        speed={0.2}
        color={C.sky}
        opacity={0.3}
      />

      {STATIONS.map((s, i) => {
        const center = i / Math.max(STATIONS.length - 1, 1);
        const active = 1 - Math.min(1, Math.abs(progress.current - center) * 3.0);
        const sideOffset = i % 2 === 0 ? -1.1 : 1.1;
        const rotY = i % 2 === 0 ? 0.15 : -0.15;

        return (
          <Moonlander2070Console
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

      <EffectComposer>
        <DepthOfField
          focusDistance={0.08}
          focalLength={0.05}
          bokehScale={2.5}
        />
        <Bloom
          luminanceThreshold={0.55}
          luminanceSmoothing={0.35}
          intensity={0.8}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0008, 0.0008)}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.5} />
      </EffectComposer>
    </>
  );
}

/* ───────────────────── WorldStage Component ───────────────────── */

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
      <section className="relative bg-[#0b0c16] px-6 py-24">
        <div className="mx-auto max-w-[48rem] space-y-16">
          {STATIONS.map((s) => (
            <article key={s.id} className="space-y-3">
              <p
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: s.accent }}
              >
                {s.eyebrow}
              </p>
              <h3 className="text-2xl font-semibold text-[#cdd6f4]">
                {s.title}
              </h3>
              <p className="text-[#a6adc8] leading-relaxed">{s.body}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={trackRef}
      className="relative"
      style={{ height: `${STATIONS.length * 100}vh` }}
    >
      <div
        ref={pinRef}
        className="relative h-dvh w-full overflow-hidden bg-[#0b0c16]"
      >
        <Canvas
          className="absolute inset-0"
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 1.2, 4.8], fov: 42, near: 0.1, far: 60 }}
        >
          <Suspense fallback={null}>
            <Scene progress={progress} />
          </Suspense>
        </Canvas>

        {/* Glass feature card copy overlay */}
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
                    className="rounded-2xl border border-white/10 bg-[#121422]/80 px-6 py-6 backdrop-blur-2xl"
                    style={{ boxShadow: `0 0 60px ${s.accent}30` }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p
                        className="text-[11px] font-bold uppercase tracking-[0.24em]"
                        style={{ color: s.accent }}
                      >
                        {s.eyebrow}
                      </p>
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium text-[#a6adc8]">
                        Console Station #{i + 1}
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
                const trackH = track.offsetHeight - window.innerHeight;
                const y =
                  top + (i / Math.max(STATIONS.length - 1, 1)) * trackH;
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
                  boxShadow:
                    i === active ? `0 0 14px ${s.accent}` : "none",
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
