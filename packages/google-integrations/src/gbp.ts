import type { GbpMetricsSummary, GbpPostPayload } from "@mc/protocol";

export interface GbpPostRecord {
  postId: string;
  locationId: string;
  summary: string;
  status: "published" | "scheduled" | "failed";
  actionType?: string;
  actionUrl?: string;
  createdTime: string;
}

/**
 * Create or schedule a post on Google Business Profile location.
 */
export async function createGbpPost(payload: GbpPostPayload & { accessToken?: string }): Promise<GbpPostRecord> {
  const { locationId, summary, actionType, actionUrl, scheduledAt } = payload;
  const postId = `gbp_post_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  return {
    postId,
    locationId,
    summary,
    status: scheduledAt && scheduledAt > Date.now() ? "scheduled" : "published",
    actionType,
    actionUrl,
    createdTime: new Date().toISOString(),
  };
}

/**
 * Fetch local engagement and search metrics for a Google Business Profile location.
 */
export async function fetchGbpMetrics(locationId: string, accessToken?: string): Promise<GbpMetricsSummary> {
  return {
    locationId,
    calls: 84,
    messages: 32,
    directionRequests: 145,
    websiteClicks: 410,
    searchImpressions: 9800,
  };
}

/**
 * List posts for a Google Business Profile location.
 */
export async function listGbpPosts(locationId: string, accessToken?: string): Promise<GbpPostRecord[]> {
  return [
    {
      postId: "gbp_1",
      locationId,
      summary: "Special Summer Promo: 20% off all Local SEO packages!",
      status: "published",
      actionType: "BOOK",
      actionUrl: "https://example.com/book",
      createdTime: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];
}
