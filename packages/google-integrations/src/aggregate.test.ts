import { describe, expect, test } from "bun:test";
import { aggregateUnifiedReport } from "./aggregate";

describe("Unified Performance Report Aggregator", () => {
  test("aggregateUnifiedReport builds summary totals and time series slice", () => {
    const report = aggregateUnifiedReport({
      clientId: "client_agency_test",
      period: "30d",
      gscMetrics: {
        clicks: 1500,
        impressions: 30000,
        ctr: 0.05,
        position: 10.2,
        topQueries: [],
      },
      gbpMetrics: {
        locationId: "loc_1",
        calls: 100,
        messages: 40,
        directionRequests: 200,
        websiteClicks: 500,
        searchImpressions: 12000,
      },
      ga4Metrics: {
        siteId: "site_1",
        activeUsers: 4000,
        sessions: 5000,
        engagementRate: 0.7,
        conversions: 200,
        topTrafficSources: [],
      },
    });

    expect(report.clientId).toBe("client_agency_test");
    expect(report.period).toBe("30d");
    expect(report.summary.gscTotalClicks).toBe(1500);
    expect(report.summary.gbpTotalCalls).toBe(100);
    expect(report.summary.totalSessions).toBe(5000);
    expect(report.timeSeries.length).toBe(30);
  });
});
