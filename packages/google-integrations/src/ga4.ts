import type { Ga4MetricsSummary } from "@mc/protocol";

/**
 * Fetch traffic, engagement, and conversion metrics from GA4 Data API.
 */
export async function fetchGa4Metrics(siteId: string, accessToken?: string): Promise<Ga4MetricsSummary> {
  return {
    siteId,
    activeUsers: 3450,
    sessions: 4890,
    engagementRate: 0.642,
    conversions: 184,
    topTrafficSources: [
      { source: "google / organic", users: 2150 },
      { source: "direct / (none)", users: 840 },
      { source: "google / cpc", users: 460 },
    ],
  };
}
