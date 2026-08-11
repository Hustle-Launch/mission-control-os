#!/usr/bin/env bun
import { Command } from "commander";
import {
  aggregateUnifiedReport,
  buildGoogleAuthUrl,
  createGbpPost,
  createGoogleAuthInvite,
  fetchGa4Metrics,
  fetchGbpMetrics,
  fetchGscMetrics,
  inspectGscUrl,
  requestGscIndexing,
} from "@mc/google-integrations";

const program = new Command();

program
  .name("mc-cli")
  .description("Mission Control Master CLI — API runner for management tasks, polling & report aggregation")
  .version("0.1.0");

// Subcommand: gsc
const gsc = program.command("gsc").description("Google Search Console management & inspection");

gsc
  .command("inspect")
  .description("Inspect live URL status via GSC Inspection API")
  .argument("<url>", "Target URL to inspect")
  .option("-s, --site <siteUrl>", "GSC Site/Property URL")
  .option("--json", "Output raw JSON for AI agents/scripts", false)
  .action(async (url: string, options: { site?: string; json: boolean }) => {
    const res = await inspectGscUrl({ url, siteUrl: options.site ?? url });
    if (options.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🔍 GSC Live URL Inspection`);
      console.log(`URL: ${res.url}`);
      console.log(`Verdict: ${res.verdict}`);
      console.log(`Coverage: ${res.coverageState}`);
      console.log(`Indexing State: ${res.indexingState}\n`);
    }
  });

gsc
  .command("index")
  .description("Submit batch URLs for instant indexing")
  .argument("<urls...>", "List of URLs to submit")
  .option("-s, --site-id <siteId>", "Site ID", "default-site")
  .option("--json", "Output raw JSON", false)
  .action(async (urls: string[], options: { siteId: string; json: boolean }) => {
    const res = await requestGscIndexing({ siteId: options.siteId, urls });
    if (options.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n🚀 Submitted ${res.submittedCount} URL(s) for indexing via Google Indexing API`);
      res.urls.forEach((u) => console.log(`  • ${u}`));
      console.log("");
    }
  });

// Subcommand: gbp
const gbp = program.command("gbp").description("Google Business Profile management");

gbp
  .command("post")
  .description("Create or schedule a post on GBP location")
  .argument("<locationId>", "GBP Location ID")
  .argument("<message>", "Post summary text")
  .option("-a, --action <type>", "Action CTA button (BOOK|ORDER|SHOP|LEARN_MORE|SIGN_UP)")
  .option("-u, --url <url>", "Action CTA destination URL")
  .option("--json", "Output raw JSON", false)
  .action(async (locationId: string, message: string, options: { action?: string; url?: string; json: boolean }) => {
    const res = await createGbpPost({
      locationId,
      summary: message,
      actionType: options.action as any,
      actionUrl: options.url,
    });
    if (options.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n📍 GBP Post Created`);
      console.log(`Post ID: ${res.postId}`);
      console.log(`Status: ${res.status}`);
      console.log(`Summary: ${res.summary}\n`);
    }
  });

// Subcommand: report
const report = program.command("report").description("Unified metrics & report aggregation");

report
  .command("aggregate")
  .description("Aggregate GSC, GBP, and GA4 metrics into unified performance view")
  .argument("<clientId>", "Target Client ID")
  .option("-p, --period <range>", "Reporting period (7d|30d|90d|12m)", "30d")
  .option("--json", "Output raw JSON", false)
  .action(async (clientId: string, options: { period: "7d" | "30d" | "90d" | "12m"; json: boolean }) => {
    const [gscMetrics, gbpMetrics, ga4Metrics] = await Promise.all([
      fetchGscMetrics({ siteId: clientId }),
      fetchGbpMetrics(clientId),
      fetchGa4Metrics(clientId),
    ]);

    const res = aggregateUnifiedReport({
      clientId,
      period: options.period,
      gscMetrics,
      gbpMetrics,
      ga4Metrics,
    });

    if (options.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n📊 Unified Performance Report (${res.period})`);
      console.log(`Client ID: ${res.clientId}`);
      console.log(`Total Sessions (GA4): ${res.summary.totalSessions}`);
      console.log(`Conversions (GA4): ${res.summary.totalConversions}`);
      console.log(`GSC Organic Clicks: ${res.summary.gscTotalClicks}`);
      console.log(`GSC Average Position: ${res.summary.gscAveragePosition}`);
      console.log(`GBP Local Calls: ${res.summary.gbpTotalCalls}`);
      console.log(`GBP Direction Requests: ${res.summary.gbpTotalDirections}\n`);
    }
  });

// Subcommand: auth
const auth = program.command("auth").description("Google OAuth & invitation management");

auth
  .command("invite")
  .description("Generate tokenized OAuth self-auth invitation link for new clients")
  .argument("<clientId>", "Target Client ID")
  .option("-e, --email <email>", "Client recipient email")
  .option("-b, --base-url <url>", "Base Web app URL", "https://app.missioncontrol.agency")
  .option("--json", "Output raw JSON", false)
  .action(async (clientId: string, options: { email?: string; baseUrl: string; json: boolean }) => {
    const res = createGoogleAuthInvite({
      clientId,
      recipientEmail: options.email,
      baseUrl: options.baseUrl,
    });

    if (options.json) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      console.log(`\n✉️  Google OAuth Client Self-Auth Invitation`);
      console.log(`Client ID: ${res.clientId}`);
      console.log(`Invite URL: ${res.inviteUrl}`);
      console.log(`Expires At: ${new Date(res.expiresAt).toLocaleString()}\n`);
    }
  });

auth
  .command("url")
  .description("Build Google OAuth PKCE authorization URL")
  .option("-c, --client-id <id>", "Optional target client ID (for direct client auth)")
  .option("-s, --scope <mode>", "OAuth connection mode (agency_master|client_direct|client_invite)", "agency_master")
  .option("-r, --redirect <uri>", "Redirect URI", "http://localhost:3000/api/connections/google/callback")
  .action((options: { clientId?: string; scope: string; redirect: string }) => {
    const res = buildGoogleAuthUrl({
      clientId: options.clientId,
      scope: options.scope as any,
      redirectUri: options.redirect,
      googleClientId: process.env.GOOGLE_CLIENT_ID ?? "mock-google-client-id.apps.googleusercontent.com",
    });
    console.log(`\n🔑 Google OAuth Authorization URL (${options.scope}):\n${res.url}\n`);
  });

program.parse(process.argv);
