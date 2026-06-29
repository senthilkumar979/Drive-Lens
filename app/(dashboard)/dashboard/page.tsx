"use client";

import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import { BatteryChart } from "@/components/charts/battery-chart";
import { MetricBarChart } from "@/components/charts/metric-bar-chart";
import { VehicleMap } from "@/components/maps/vehicle-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVehicle, useVehicleSnapshots, useSyncVehicle } from "@/features/vehicle/hooks/use-vehicle";
import { useTrips } from "@/features/trip/hooks/use-trips";
import { useChargingSessions } from "@/features/charging/hooks/use-charging";
import { useAiInsight } from "@/features/assistant/hooks/use-assistant";

export default function DashboardPage() {
  const { data: vehicleData, isLoading } = useVehicle();
  const { data: snapshotsData } = useVehicleSnapshots(7);
  const { data: tripsData } = useTrips();
  const { data: chargingData } = useChargingSessions();
  const { data: insightData } = useAiInsight();
  const sync = useSyncVehicle();

  const snapshot = vehicleData?.snapshot;
  const vehicle = vehicleData?.vehicle;
  const trips = tripsData?.trips?.slice(0, 5) ?? [];
  const sessions = chargingData?.sessions ?? [];
  const totalCost = sessions.reduce(
    (sum: number, s: { costUsd?: number }) => sum + (s.costUsd ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {vehicle?.displayName ?? "Vehicle"} overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator />
          <Button
            variant="outline"
            size="sm"
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
          >
            <RefreshCw className={`mr-2 size-4 ${sync.isPending ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Battery"
          value={snapshot ? `${snapshot.batteryLevel}%` : undefined}
          subtext={snapshot?.chargingState ?? "—"}
          isLoading={isLoading}
        />
        <MetricCard
          label="Range"
          value={snapshot ? `${snapshot.rangeKm} km` : undefined}
          isLoading={isLoading}
        />
        <MetricCard
          label="Temperature"
          value={
            snapshot
              ? `${Math.round(snapshot.insideTempC ?? 0)}° / ${Math.round(snapshot.outsideTempC ?? 0)}°`
              : undefined
          }
          subtext="Inside / outside"
          isLoading={isLoading}
        />
        <MetricCard
          label="Last Sync"
          value={
            snapshot?.timestamp
              ? format(new Date(snapshot.timestamp), "HH:mm")
              : undefined
          }
          subtext={
            snapshot?.timestamp
              ? format(new Date(snapshot.timestamp), "MMM d, yyyy")
              : "—"
          }
          isLoading={isLoading}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Battery trend</CardTitle>
        </CardHeader>
        <CardContent>
          {snapshotsData?.snapshots?.length ? (
            <BatteryChart data={snapshotsData.snapshots} />
          ) : (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              No snapshot data
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent trips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trips yet</p>
            ) : (
              trips.map((trip: { _id: string; startTime: string; distanceKm: number }) => (
                <div
                  key={trip._id}
                  className="flex justify-between rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-sm">
                    {format(new Date(trip.startTime), "MMM d, HH:mm")}
                  </span>
                  <span className="tabular-nums text-sm font-medium">
                    {trip.distanceKm} km
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Charging analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricBarChart
              data={sessions.slice(0, 6).map((s: { energyKwh?: number; startedAt: string }) => ({
                label: format(new Date(s.startedAt), "MMM d"),
                value: s.energyKwh ?? 0,
              }))}
              color="#a855f7"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Total cost: ${totalCost.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Vehicle map</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleMap
              latitude={snapshot?.latitude}
              longitude={snapshot?.longitude}
              className="h-52 w-full"
            />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>AI insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insightData?.insight ? (
              <>
                <p className="text-sm leading-relaxed">{insightData.insight.summary}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {insightData.insight.recommendations?.map((r: string) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Insights generate weekly via cron or sync.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
