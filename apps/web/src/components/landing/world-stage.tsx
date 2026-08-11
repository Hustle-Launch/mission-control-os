import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, MeshReflectorMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
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

/* ─────────────────────────── Palette ─────────────────────────── */

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

/* ─────────────────────────── Hooks ─────────────────────────── */

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

/* ─────────────────────────── Canvas 2D Helpers ─────────────────────────── */

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

/** Panel container with subtle border */
function drawPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r = 8,
) {
  ctx.fillStyle = "#13141f";
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

/* ─────────────────────── Screen Chrome (shared) ─────────────────────── */

/** Render common header, background, grid, scanlines, vignette for all screens */
function drawScreenChrome(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stationId: string,
  accentHex: string,
  time: number,
) {
  /* Background gradient */
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, "#080910");
  bgGrad.addColorStop(1, "#0e0f1a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  /* Subtle dot grid */
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  for (let gx = 24; gx < w; gx += 24) {
    for (let gy = 56; gy < h - 20; gy += 24) {
      ctx.fillRect(gx, gy, 1, 1);
    }
  }

  /* Header bar */
  const hdrGrad = ctx.createLinearGradient(0, 0, 0, 44);
  hdrGrad.addColorStop(0, "#14151f");
  hdrGrad.addColorStop(1, "#101118");
  ctx.fillStyle = hdrGrad;
  ctx.fillRect(0, 0, w, 44);

  /* Header accent line */
  const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
  lineGrad.addColorStop(0, accentHex + "00");
  lineGrad.addColorStop(0.3, accentHex);
  lineGrad.addColorStop(0.7, accentHex);
  lineGrad.addColorStop(1, accentHex + "00");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(0, 42, w, 2);

  /* Live indicator dot with glow */
  const pulse = 0.5 + Math.sin(time * 4) * 0.5;
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = `rgba(34, 197, 94, ${pulse * 0.6})`;
  ctx.fillStyle = `rgba(34, 197, 94, ${0.6 + pulse * 0.4})`;
  ctx.beginPath();
  ctx.arc(20, 22, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* Header title */
  ctx.fillStyle = "#cdd6f4";
  ctx.font = "bold 13px monospace";
  ctx.textAlign = "left";
  ctx.fillText(
    `MISSION CONTROL MCR // SYS_${stationId.toUpperCase()}`,
    35,
    26,
  );

  /* Live badge */
  ctx.fillStyle = "#6c7086";
  ctx.font = "11px monospace";
  ctx.textAlign = "right";
  ctx.fillText("LIVE DEMO FEED · LIVE", w - 16, 26);
  ctx.textAlign = "left";

  /* Footer status bar */
  ctx.fillStyle = "#0a0b12";
  ctx.fillRect(0, h - 22, w, 22);
  ctx.fillStyle = "#45475a";
  ctx.font = "9px monospace";
  ctx.fillText("SYS OK", 12, h - 8);
  ctx.textAlign = "right";
  ctx.fillStyle = "#45475a";
  const now = new Date();
  ctx.fillText(
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} UTC`,
    w - 12,
    h - 8,
  );
  ctx.textAlign = "left";
}

/** Draw scanline + vignette overlay (call after station content) */
function drawScreenOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  /* Scanlines */
  ctx.fillStyle = "rgba(0,0,0,0.025)";
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }

  /* Corner vignette */
  const vGrad = ctx.createRadialGradient(
    w / 2,
    h / 2,
    h * 0.35,
    w / 2,
    h / 2,
    h * 0.85,
  );
  vGrad.addColorStop(0, "rgba(0,0,0,0)");
  vGrad.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, w, h);
}

/* ─────────────────────── Station Screen Content ─────────────────────── */

function drawAuditScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accent: string,
) {
  /* Left panel — Health Score Gauge */
  drawPanel(ctx, 20, 56, 430, h - 98);

  ctx.fillStyle = accent;
  ctx.font = "bold 12px system-ui";
  ctx.fillText("CRAWL HEALTH SCORE", 36, 82);

  const cx = 235;
  const cy = 230;
  const r = 80;

  /* Track */
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
  ctx.strokeStyle = "#1e1f2e";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.stroke();

  /* Progress arc with gradient */
  const progress = 0.78 + Math.sin(time * 1.5) * 0.08;
  const arcStart = Math.PI * 0.75;
  const arcEnd = arcStart + Math.PI * 1.5 * progress;

  const arcGrad = ctx.createConicGradient(arcStart, cx, cy);
  arcGrad.addColorStop(0, accent + "60");
  arcGrad.addColorStop(progress * 0.6, accent);
  arcGrad.addColorStop(1, accent);

  ctx.beginPath();
  ctx.arc(cx, cy, r, arcStart, arcEnd);
  ctx.strokeStyle = arcGrad;
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.stroke();

  /* Score text with glow */
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = accent + "80";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(progress * 100)}`, cx, cy + 14);
  ctx.restore();

  ctx.fillStyle = "#6c7086";
  ctx.font = "10px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("OPTIMIZED", cx, cy + 36);
  ctx.textAlign = "left";

  /* Stats row below gauge */
  const stats = [
    { label: "Pages", val: "2,847" },
    { label: "Avg Load", val: "1.2s" },
    { label: "CWV Pass", val: "94%" },
  ];
  stats.forEach((s, i) => {
    const sx = 45 + i * 140;
    const sy = 370;
    ctx.fillStyle = "#6c7086";
    ctx.font = "9px system-ui";
    ctx.fillText(s.label, sx, sy);
    ctx.fillStyle = "#cdd6f4";
    ctx.font = "bold 16px system-ui";
    ctx.fillText(s.val, sx, sy + 20);
  });

  /* Right panel — Issues by Severity */
  drawPanel(ctx, 466, 56, w - 486, 260);

  ctx.fillStyle = "#cdd6f4";
  ctx.font = "bold 12px system-ui";
  ctx.fillText("ISSUES BY SEVERITY", 482, 82);

  const issues = [
    { label: "Broken Links (404)", val: 18, max: 50, color: "#f38ba8" },
    { label: "Missing Meta Title", val: 42, max: 50, color: "#fab387" },
    { label: "H1 Tag Missing", val: 12, max: 50, color: "#f9e2af" },
    { label: "Slow Render (>2s)", val: 29, max: 50, color: "#89dceb" },
  ];

  issues.forEach((it, idx) => {
    const iy = 108 + idx * 48;
    ctx.fillStyle = "#a6adc8";
    ctx.font = "11px system-ui";
    ctx.fillText(it.label, 482, iy);

    /* Bar track */
    const barW = w - 536;
    ctx.fillStyle = "#1a1b28";
    roundRect(ctx, 482, iy + 8, barW, 12, 4);
    ctx.fill();

    /* Bar fill with gradient */
    const fillW =
      (it.val / it.max) * barW * (0.88 + 0.12 * Math.sin(time * 2 + idx));
    const barGrad = ctx.createLinearGradient(482, 0, 482 + fillW, 0);
    barGrad.addColorStop(0, it.color + "60");
    barGrad.addColorStop(1, it.color);
    ctx.fillStyle = barGrad;
    roundRect(ctx, 482, iy + 8, Math.max(8, fillW), 12, 4);
    ctx.fill();

    /* Value label */
    ctx.fillStyle = it.color;
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(String(it.val), w - 30, iy + 18);
    ctx.textAlign = "left";
  });

  /* Right panel — Recent Crawl Events */
  drawPanel(ctx, 466, 330, w - 486, h - 374);

  ctx.fillStyle = "#cdd6f4";
  ctx.font = "bold 12px system-ui";
  ctx.fillText("LATEST CRAWL EVENTS", 482, 356);

  const events = [
    { status: "ok", msg: "/about — 200 OK (312ms)" },
    { status: "warn", msg: "/blog/old-post — 301 redirect" },
    { status: "err", msg: "/products/xyz — 404 not found" },
    { status: "ok", msg: "/contact — 200 OK (189ms)" },
    { status: "ok", msg: "/services — 200 OK (245ms)" },
  ];

  events.forEach((ev, idx) => {
    const ey = 380 + idx * 26;
    const dotColor =
      ev.status === "ok"
        ? "#a6e3a1"
        : ev.status === "warn"
          ? "#f9e2af"
          : "#f38ba8";
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(490, ey, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a6adc8";
    ctx.font = "10px monospace";
    ctx.fillText(ev.msg, 502, ey + 4);
  });
}

function drawCrmScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accent: string,
) {
  /* Revenue summary strip */
  drawPanel(ctx, 20, 56, w - 40, 48);
  const summaries = [
    { label: "TOTAL PIPELINE", val: "$127,500" },
    { label: "DEALS WON", val: "$72,000" },
    { label: "WIN RATE", val: "68%" },
    { label: "AVG DEAL", val: "$4,500/mo" },
  ];
  summaries.forEach((s, i) => {
    const sx = 36 + i * 230;
    ctx.fillStyle = "#6c7086";
    ctx.font = "9px system-ui";
    ctx.fillText(s.label, sx, 74);
    ctx.fillStyle = i === 1 ? "#a6e3a1" : "#cdd6f4";
    ctx.font = "bold 14px system-ui";
    ctx.fillText(s.val, sx, 92);
  });

  /* Kanban columns */
  const cols = [
    { title: "LEAD IN", count: 4, color: "#89dceb" },
    { title: "AUDIT SENT", count: 3, color: accent },
    { title: "PROPOSAL", count: 2, color: "#fab387" },
    { title: "WON", count: 5, color: "#a6e3a1" },
  ];

  const colW = (w - 60) / 4;
  cols.forEach((col, idx) => {
    const cx = 20 + idx * (colW + 7);
    drawPanel(ctx, cx, 118, colW - 4, h - 162);

    /* Column header */
    ctx.fillStyle = col.color;
    ctx.font = "bold 10px system-ui";
    ctx.fillText(col.title, cx + 12, 140);

    /* Count badge */
    ctx.fillStyle = col.color + "20";
    roundRect(ctx, cx + colW - 38, 128, 24, 18, 4);
    ctx.fill();
    ctx.fillStyle = col.color;
    ctx.font = "bold 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(String(col.count), cx + colW - 26, 141);
    ctx.textAlign = "left";

    /* Deal cards */
    for (let ci = 0; ci < 3; ci++) {
      const cy = 155 + ci * 80;
      ctx.fillStyle = "#1a1b2a";
      roundRect(ctx, cx + 8, cy, colW - 20, 68, 6);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      roundRect(ctx, cx + 8, cy, colW - 20, 68, 6);
      ctx.stroke();

      ctx.fillStyle = "#cdd6f4";
      ctx.font = "bold 11px system-ui";
      ctx.fillText(`Client #${idx * 3 + ci + 101}`, cx + 18, cy + 20);

      ctx.fillStyle = "#6c7086";
      ctx.font = "10px monospace";
      ctx.fillText(`$${(idx + 1) * 2500}/mo`, cx + 18, cy + 38);

      /* Status dot */
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor =
        idx === 3 ? "rgba(166,227,161,0.5)" : "rgba(137,220,235,0.3)";
      ctx.fillStyle = idx === 3 ? "#a6e3a1" : "#89dceb";
      ctx.beginPath();
      ctx.arc(cx + colW - 26, cy + 18, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      /* Priority bar */
      const prio = [0.8, 0.5, 0.3][ci]!;
      ctx.fillStyle = "#1e1f2e";
      roundRect(ctx, cx + 18, cy + 50, colW - 46, 4, 2);
      ctx.fill();
      ctx.fillStyle = col.color + "80";
      roundRect(ctx, cx + 18, cy + 50, (colW - 46) * prio, 4, 2);
      ctx.fill();
    }
  });
}

function drawSocialScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accent: string,
) {
  drawPanel(ctx, 20, 56, w - 40, h - 98);

  ctx.fillStyle = accent;
  ctx.font = "bold 12px system-ui";
  ctx.fillText("CLIENT APPROVAL CALENDAR — THIS WEEK", 36, 82);

  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  const colW = (w - 70) / 5;

  days.forEach((day, i) => {
    const dx = 32 + i * (colW + 5);

    /* Day column */
    ctx.fillStyle = "#111220";
    roundRect(ctx, dx, 100, colW, h - 168, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    roundRect(ctx, dx, 100, colW, h - 168, 6);
    ctx.stroke();

    /* Day header */
    ctx.fillStyle = "#89dceb";
    ctx.font = "bold 11px system-ui";
    ctx.fillText(day, dx + 10, 120);

    /* Date number */
    ctx.fillStyle = "#45475a";
    ctx.font = "bold 18px system-ui";
    ctx.textAlign = "right";
    ctx.fillText(String(12 + i), dx + colW - 10, 122);
    ctx.textAlign = "left";

    /* Post cards — 2 per day */
    for (let pi = 0; pi < 2; pi++) {
      const py = 138 + pi * 155;
      ctx.fillStyle = "#1a1b2a";
      roundRect(ctx, dx + 6, py, colW - 12, 140, 5);
      ctx.fill();

      /* Platform badge */
      const platforms = ["IG", "FB", "TW", "LI", "GM"];
      ctx.fillStyle = accent + "30";
      roundRect(ctx, dx + 12, py + 8, 24, 16, 3);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.font = "bold 8px system-ui";
      ctx.fillText(platforms[i]!, dx + 15, py + 20);

      /* Approval status */
      const needsRevision = i === 3 && pi === 0;
      const statusColor = needsRevision ? "#f38ba8" : "#a6e3a1";
      const statusText = needsRevision ? "NEEDS REVISION" : "APPROVED";

      ctx.fillStyle = statusColor + "18";
      roundRect(ctx, dx + 42, py + 8, colW - 60, 16, 3);
      ctx.fill();
      ctx.fillStyle = statusColor;
      ctx.font = "bold 8px system-ui";
      ctx.fillText(statusText, dx + 48, py + 20);

      /* Post preview text */
      ctx.fillStyle = "#cdd6f4";
      ctx.font = "11px system-ui";
      const titles = [
        "Local SEO Tips…",
        "Client Results…",
        "Team Update…",
        "Case Study…",
        "Industry News…",
      ];
      ctx.fillText(titles[i]!, dx + 12, py + 50);

      ctx.fillStyle = "#6c7086";
      ctx.font = "9px system-ui";
      ctx.fillText("Preview copy of the", dx + 12, py + 68);
      ctx.fillText("scheduled post…", dx + 12, py + 82);

      /* Time */
      ctx.fillStyle = "#45475a";
      ctx.font = "9px monospace";
      ctx.fillText(`${9 + pi * 3}:00 AM`, dx + 12, py + 108);

      /* Engagement prediction mini bar */
      ctx.fillStyle = "#1e1f2e";
      roundRect(ctx, dx + 12, py + 118, colW - 30, 4, 2);
      ctx.fill();
      const eng = 0.4 + Math.sin(time + i + pi) * 0.2 + 0.3;
      const engGrad = ctx.createLinearGradient(
        dx + 12,
        0,
        dx + 12 + (colW - 30) * eng,
        0,
      );
      engGrad.addColorStop(0, accent + "40");
      engGrad.addColorStop(1, accent);
      ctx.fillStyle = engGrad;
      roundRect(ctx, dx + 12, py + 118, (colW - 30) * eng, 4, 2);
      ctx.fill();
    }
  });
}

function drawPortalScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accent: string,
) {
  /* Left panel — Traffic chart */
  drawPanel(ctx, 20, 56, 580, h - 98);

  ctx.fillStyle = accent;
  ctx.font = "bold 12px system-ui";
  ctx.fillText("ORGANIC TRAFFIC & IMPRESSIONS", 36, 82);
  ctx.fillStyle = "#6c7086";
  ctx.font = "10px system-ui";
  ctx.fillText("Last 12 months", 36, 98);

  /* Chart grid lines */
  const chartL = 60;
  const chartR = 580;
  const chartT = 120;
  const chartB = h - 130;
  const chartH = chartB - chartT;

  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const gy = chartT + (i / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(chartL, gy);
    ctx.lineTo(chartR, gy);
    ctx.stroke();

    /* Y-axis labels */
    ctx.fillStyle = "#45475a";
    ctx.font = "9px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${(4 - i) * 2.5}k`, chartL - 8, gy + 4);
    ctx.textAlign = "left";
  }

  /* X-axis labels */
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  months.forEach((m, i) => {
    const mx = chartL + (i / 11) * (chartR - chartL);
    ctx.fillStyle = "#45475a";
    ctx.font = "9px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(m, mx, chartB + 18);
    ctx.textAlign = "left";
  });

  /* Smooth traffic curve using bezier */
  const points: [number, number][] = [];
  for (let i = 0; i <= 11; i++) {
    const px = chartL + (i / 11) * (chartR - chartL);
    const base = Math.sin((i / 11) * Math.PI * 1.1 + 0.3) * 0.7 + 0.3;
    const anim = Math.sin(time * 0.8 + i * 0.4) * 0.06;
    const py = chartB - (base + anim) * chartH;
    points.push([px, py]);
  }

  /* Gradient fill under curve */
  ctx.beginPath();
  ctx.moveTo(points[0]![0], chartB);
  points.forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.lineTo(points[points.length - 1]![0], chartB);
  ctx.closePath();

  const fillGrad = ctx.createLinearGradient(0, chartT, 0, chartB);
  fillGrad.addColorStop(0, accent + "30");
  fillGrad.addColorStop(0.6, accent + "08");
  fillGrad.addColorStop(1, accent + "00");
  ctx.fillStyle = fillGrad;
  ctx.fill();

  /* Curve line */
  ctx.beginPath();
  ctx.moveTo(points[0]![0], points[0]![1]);
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const cpx = (prev[0] + curr[0]) / 2;
    ctx.bezierCurveTo(cpx, prev[1], cpx, curr[1], curr[0], curr[1]);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  /* Active data point */
  const activeIdx = Math.floor(
    (((time * 0.5) % 12) + 12) % 12,
  );
  const ap = points[activeIdx]!;
  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = accent + "80";
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(ap[0], ap[1], 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* Right column — Metric cards */
  drawPanel(ctx, 616, 56, w - 636, 230);

  ctx.fillStyle = "#cdd6f4";
  ctx.font = "bold 12px system-ui";
  ctx.fillText("GOOGLE MAPS CALLS", 632, 82);

  ctx.fillStyle = "#6c7086";
  ctx.font = "10px system-ui";
  ctx.fillText("vs. last quarter", 632, 98);

  /* Large metric with glow */
  ctx.save();
  ctx.shadowBlur = 25;
  ctx.shadowColor = "#a6e3a180";
  ctx.fillStyle = "#a6e3a1";
  ctx.font = "bold 44px system-ui";
  ctx.fillText("+142%", 632, 170);
  ctx.restore();

  /* Trend arrow */
  ctx.fillStyle = "#a6e3a1";
  ctx.font = "11px system-ui";
  ctx.fillText("▲ Trending up", 632, 196);

  /* Mini sparkline */
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const sx = 632 + i * 37;
    const sy = 240 - Math.sin(time * 0.6 + i * 0.8) * 15 - i * 3;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.strokeStyle = "#a6e3a160";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  /* Bottom right — Tasks Completed */
  drawPanel(ctx, 616, 300, w - 636, h - 342);

  ctx.fillStyle = "#cdd6f4";
  ctx.font = "bold 12px system-ui";
  ctx.fillText("TASKS COMPLETED", 632, 326);

  /* Large number with glow */
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#fab38770";
  ctx.fillStyle = "#fab387";
  ctx.font = "bold 40px system-ui";
  ctx.fillText("28 / 30", 632, 400);
  ctx.restore();

  /* Progress bar */
  ctx.fillStyle = "#1a1b2a";
  roundRect(ctx, 632, 420, w - 680, 12, 6);
  ctx.fill();

  const progGrad = ctx.createLinearGradient(632, 0, w - 48, 0);
  progGrad.addColorStop(0, "#fab387" + "60");
  progGrad.addColorStop(1, "#fab387");
  ctx.fillStyle = progGrad;
  roundRect(ctx, 632, 420, (w - 680) * 0.933, 12, 6);
  ctx.fill();

  ctx.fillStyle = "#6c7086";
  ctx.font = "10px system-ui";
  ctx.fillText("93% complete — 2 remaining", 632, 452);
}

function drawAutomationsScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accent: string,
) {
  drawPanel(ctx, 20, 56, w - 40, h - 98);

  ctx.fillStyle = accent;
  ctx.font = "bold 12px system-ui";
  ctx.fillText("WORKFLOW: AUTOMATED CLIENT ONBOARDING", 36, 82);

  ctx.fillStyle = "#6c7086";
  ctx.font = "10px system-ui";
  ctx.fillText("Active · 847 runs this month", 36, 98);

  /* Workflow nodes */
  const nodes = [
    {
      label: "Form Submit",
      type: "TRIGGER",
      x: 60,
      y: 260,
      color: "#89dceb",
    },
    {
      label: "Audit Check",
      type: "CONDITION",
      x: 300,
      y: 260,
      color: "#cba6f7",
    },
    {
      label: "Welcome SMS",
      type: "ACTION",
      x: 540,
      y: 170,
      color: "#a6e3a1",
    },
    {
      label: "Create CRM Deal",
      type: "ACTION",
      x: 540,
      y: 350,
      color: "#fab387",
    },
    {
      label: "Alert Manager",
      type: "ACTION",
      x: 760,
      y: 260,
      color: "#f38ba8",
    },
  ];

  /* Bezier connectors */
  const connections: [number, number][] = [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
  ];

  ctx.lineWidth = 2;
  connections.forEach(([from, to]) => {
    const fn = nodes[from]!;
    const tn = nodes[to]!;
    const sx = fn.x + 85;
    const sy = fn.y;
    const ex = tn.x;
    const ey = tn.y;
    const cpx1 = sx + (ex - sx) * 0.5;
    const cpx2 = ex - (ex - sx) * 0.5;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(cpx1, sy, cpx2, ey, ex, ey);
    ctx.strokeStyle = "#2a2b3d";
    ctx.stroke();

    /* Animated pulse dot along path */
    const t =
      (((time * 0.6 + from * 0.4) % 2) / 2) * (0.8 + 0.2 * Math.sin(time));
    const clamped = Math.max(0, Math.min(1, t));
    const invT = 1 - clamped;
    const px =
      invT * invT * invT * sx +
      3 * invT * invT * clamped * cpx1 +
      3 * invT * clamped * clamped * cpx2 +
      clamped * clamped * clamped * ex;
    const py =
      invT * invT * invT * sy +
      3 * invT * invT * clamped * sy +
      3 * invT * clamped * clamped * ey +
      clamped * clamped * clamped * ey;

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = fn.color + "80";
    ctx.fillStyle = fn.color;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  /* Node boxes */
  nodes.forEach((n) => {
    /* Node shadow */
    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = n.color + "25";

    ctx.fillStyle = "#14151f";
    roundRect(ctx, n.x, n.y - 32, 170, 64, 8);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = n.color + "50";
    ctx.lineWidth = 1.5;
    roundRect(ctx, n.x, n.y - 32, 170, 64, 8);
    ctx.stroke();

    /* Type badge */
    ctx.fillStyle = n.color + "18";
    roundRect(ctx, n.x + 10, n.y - 22, 60, 16, 3);
    ctx.fill();
    ctx.fillStyle = n.color;
    ctx.font = "bold 8px system-ui";
    ctx.fillText(n.type, n.x + 16, n.y - 10);

    /* Label */
    ctx.fillStyle = "#cdd6f4";
    ctx.font = "bold 12px system-ui";
    ctx.fillText(n.label, n.x + 10, n.y + 14);
  });
}

/* ─────────────────────── Screen Texture Hook ─────────────────────── */

function useScreenTexture(stationId: string, accentHex: string) {
  const { canvas, texture } = useMemo(() => {
    if (typeof document === "undefined") return { canvas: null, texture: null };
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 600;
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

    /* Common chrome */
    drawScreenChrome(ctx, w, h, stationId, accentHex, time);

    /* Station-specific content */
    if (stationId === "audit") drawAuditScreen(ctx, w, h, time, accentHex);
    else if (stationId === "crm") drawCrmScreen(ctx, w, h, time, accentHex);
    else if (stationId === "social")
      drawSocialScreen(ctx, w, h, time, accentHex);
    else if (stationId === "portal")
      drawPortalScreen(ctx, w, h, time, accentHex);
    else if (stationId === "automations")
      drawAutomationsScreen(ctx, w, h, time, accentHex);

    /* Scanline + vignette overlay */
    drawScreenOverlay(ctx, w, h);

    texture.needsUpdate = true;
  };

  return { texture, drawScreen };
}

/* ─────────────────────── 3D Console Monitor ─────────────────────── */

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
    g.position.y = position[1] + Math.sin(t * 0.7 + position[0]) * 0.03;
    const targetScale = 0.92 + active * 0.16;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, targetScale, 0.06));
  });

  return (
    <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.15}>
      <group ref={group} position={position} rotation={rotation}>
        {/* ── Desk Body (lower cabinet) ── */}
        <mesh position={[0, -1.7, -0.05]}>
          <boxGeometry args={[3.4, 1.0, 0.9]} />
          <meshPhysicalMaterial
            color="#0c0d14"
            metalness={0.85}
            roughness={0.25}
            clearcoat={0.15}
            clearcoatRoughness={0.4}
          />
        </mesh>

        {/* ── Desk Surface (countertop) ── */}
        <mesh position={[0, -1.14, 0.05]}>
          <boxGeometry args={[3.6, 0.08, 1.1]} />
          <meshPhysicalMaterial
            color="#181825"
            metalness={0.8}
            roughness={0.2}
            clearcoat={0.35}
            clearcoatRoughness={0.15}
          />
        </mesh>

        {/* ── Monitor Stand Neck ── */}
        <mesh position={[0, -0.78, -0.08]}>
          <boxGeometry args={[0.5, 0.65, 0.12]} />
          <meshPhysicalMaterial
            color="#14141f"
            metalness={0.9}
            roughness={0.15}
            clearcoat={0.5}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* ── Monitor Housing (rear casing) ── */}
        <mesh position={[0, 0.45, -0.08]}>
          <boxGeometry args={[3.6, 2.2, 0.12]} />
          <meshPhysicalMaterial
            color="#0e0f18"
            metalness={0.9}
            roughness={0.2}
            clearcoat={0.2}
            clearcoatRoughness={0.3}
          />
        </mesh>

        {/* ── Monitor Bezel Frame ── */}
        <mesh position={[0, 0.45, 0.0]}>
          <boxGeometry args={[3.55, 2.15, 0.04]} />
          <meshPhysicalMaterial
            color="#14141f"
            metalness={0.92}
            roughness={0.12}
            clearcoat={0.7}
            clearcoatRoughness={0.05}
            emissive={color}
            emissiveIntensity={0.03 + active * 0.08}
          />
        </mesh>

        {/* ── Screen Display (Canvas Texture) ── */}
        <mesh position={[0, 0.45, 0.025]}>
          <planeGeometry args={[3.35, 2.0]} />
          {texture ? (
            <meshBasicMaterial map={texture} toneMapped={false} />
          ) : (
            <meshBasicMaterial color="#080910" />
          )}
        </mesh>

        {/* ── Glass Overlay (subtle reflection) ── */}
        <mesh position={[0, 0.45, 0.03]}>
          <planeGeometry args={[3.35, 2.0]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.04}
            roughness={0.05}
            metalness={0.0}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            color="#ffffff"
            depthWrite={false}
          />
        </mesh>

        {/* ── Accent Glow Rim (behind bezel, visible via bloom) ── */}
        <mesh position={[0, 0.45, -0.03]}>
          <boxGeometry args={[3.65, 2.25, 0.02]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5 + active * 1.2}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* ── Status Light Strip ── */}
        {[-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map((xOffset, i) => (
          <mesh key={i} position={[xOffset, 1.6, 0.02]}>
            <boxGeometry args={[0.22, 0.05, 0.05]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? C.sky : color}
              emissive={i % 2 === 0 ? C.sky : color}
              emissiveIntensity={0.8 + active * 1.5}
            />
          </mesh>
        ))}

        {/* ── Control Buttons on Desk ── */}
        {[-0.6, -0.3, 0, 0.3, 0.6].map((xOff, i) => (
          <mesh key={`btn-${i}`} position={[xOff, -1.08, 0.35]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
            <meshPhysicalMaterial
              color={i === 2 ? color : "#2a2b3d"}
              emissive={i === 2 ? color : "#000000"}
              emissiveIntensity={i === 2 ? 0.6 : 0}
              metalness={0.8}
              roughness={0.2}
              clearcoat={0.8}
            />
          </mesh>
        ))}

        {/* ── Monitor screen glow point light ── */}
        <pointLight
          position={[0, 0.45, 1.5]}
          color={color}
          intensity={0.3 + active * 0.5}
          distance={4}
          decay={2}
        />
      </group>
    </Float>
  );
}

/* ─────────────────────── Reflective Floor ─────────────────────── */

function MCRFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[400, 200]}
        resolution={512}
        mixBlur={1}
        mixStrength={15}
        roughness={0.85}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0a0b12"
        metalness={0.6}
        mirror={0.4}
      />
    </mesh>
  );
}

/* ─────────────────────── Camera Rig ─────────────────────── */

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

    /* Smooth side-to-side tracking */
    const currentSideOffset = Math.round(p * (n - 1)) % 2 === 0 ? -1.1 : 1.1;
    const x = Math.sin(p * Math.PI * 1.8) * 1.6;
    const y = 0.7 + Math.cos(p * Math.PI * 2) * 0.15;

    camera.position.set(x, y, z + 4.8);
    camera.lookAt(currentSideOffset * 0.35, 0.5, z);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 42;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

/* ─────────────────────── Scene ─────────────────────── */

function Scene({ progress }: { progress: ProgressRef }) {
  return (
    <>
      <color attach="background" args={[C.crust]} />
      <fog attach="fog" args={[C.crust, 8, 32]} />

      {/* Lighting — 3-point dramatic setup */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.0}
        color="#e6e9ef"
      />
      <pointLight position={[-6, 5, 3]} intensity={0.7} color={C.sky} />
      <pointLight position={[6, 3, 18]} intensity={0.5} color={C.flamingo} />
      <pointLight position={[0, 6, 10]} intensity={0.3} color={C.mauve} />

      <MCRFloor />

      <Sparkles
        count={120}
        scale={[24, 10, 45]}
        size={1.5}
        speed={0.15}
        color={C.sky}
        opacity={0.25}
      />

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

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.4}
          intensity={0.7}
        />
        <Vignette eskil={false} offset={0.12} darkness={0.45} />
      </EffectComposer>
    </>
  );
}

/* ─────────────────────── WorldStage (export) ─────────────────────── */

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
        className="relative h-dvh w-full overflow-hidden bg-[#11111b]"
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
