"use client";

import { MetricCard } from "@/components/dashboard/metric-card";
import { MetricBarChart } from "@/components/charts/metric-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/features/analytics/hooks/use-analytics";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground">Pre-aggregated driving metrics</p>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
          <AnalyticsPanel period="weekly" />
        </TabsContent>
        <TabsContent value="monthly">
          <AnalyticsPanel period="monthly" />
        </TabsContent>
        <TabsContent value="yearly">
          <AnalyticsPanel period="yearly" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsPanel({
  period,
}: {
  period: "weekly" | "monthly" | "yearly";
}) {
  const { data, isLoading } = useAnalytics(period);
  const rollup = data?.rollups?.[0];

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!rollup) return <p className="text-sm text-muted-foreground">No data for this period.</p>;

  const m = rollup.metrics;

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Distance" value={`${m.distanceKm} km`} />
        <MetricCard label="Energy" value={`${m.energyKwh} kWh`} />
        <MetricCard label="Efficiency" value={`${m.avgEfficiencyWhPerKm} Wh/km`} />
        <MetricCard label="CO₂ saved" value={`${m.co2SavedKg ?? 0} kg`} />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricBarChart
            data={[
              { label: "Trips", value: m.tripCount },
              { label: "Distance", value: m.distanceKm },
              { label: "Energy", value: m.energyKwh },
              { label: "Cost $", value: m.chargingCostUsd },
            ]}
            color="#2d7ff9"
          />
        </CardContent>
      </Card>
    </div>
  );
}
