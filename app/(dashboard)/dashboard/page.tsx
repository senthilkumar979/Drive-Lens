"use client";

import { format } from "date-fns";
import {
  Battery,
  Clock,
  MapPin,
  RefreshCw,
  Route,
  Sparkles,
  Thermometer,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import { BatteryChart } from "@/components/charts/battery-chart";
import { MetricBarChart } from "@/components/charts/metric-bar-chart";
import { VehicleMap } from "@/components/maps/vehicle-map";
import { Button } from "@/components/ui/button";
import { useVehicle, useVehicleSnapshots, useSyncVehicle } from "@/features/vehicle/hooks/use-vehicle";
import { useTrips } from "@/features/trip/hooks/use-trips";
import { useChargingSessions } from "@/features/charging/hooks/use-charging";
import { useAiInsight } from "@/features/assistant/hooks/use-assistant";

const tripAccentClasses = [
  "border-cyan-500/20 bg-cyan-500/5",
  "border-sky-500/20 bg-sky-500/5",
  "border-violet-500/20 bg-violet-500/5",
  "border-emerald-500/20 bg-emerald-500/5",
  "border-amber-500/20 bg-amber-500/5",
];

export default function DashboardPage() {
  const { data: vehicleData, isLoading } = useVehicle();
  const { data: snapshotsData } = useVehicleSnapshots(7);
  const { data: tripsData } = useTrips();
  const { data: chargingData } = useChargingSessions();
  const { data: insightData } = useAiInsight();
  const sync = useSyncVehicle();
  const autoSyncStarted = useRef(false);

  useEffect(() => {
    if (isLoading || autoSyncStarted.current) return;
    if (vehicleData?.snapshot) return;
    autoSyncStarted.current = true;
    sync.mutate({ wake: true });
  }, [isLoading, vehicleData?.snapshot, sync]);

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
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-violet-600/15 to-cyan-500/10 p-6 shadow-elevated"
      >
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-cyan-500/20 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gradient-hero">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {vehicle?.displayName ?? "Your vehicle"} · real-time overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveIndicator />
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:from-blue-400 hover:to-violet-400"
              onClick={() => sync.mutate({ wake: true })}
              disabled={sync.isPending}
            >
              <RefreshCw className={`mr-2 size-4 ${sync.isPending ? "animate-spin" : ""}`} />
              Sync now
            </Button>
          </div>
        </div>
      </div>

      {sync.isError && (
        <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm">
          {sync.error instanceof Error ? sync.error.message : "Sync failed"}
        </p>
      )}

      {sync.isPending && !snapshot && (
        <p className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-cyan-200 text-sm">
          Waking your Tesla and fetching live data — this can take up to a minute…
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Battery"
          value={snapshot ? `${snapshot.batteryLevel}%` : undefined}
          subtext={snapshot?.chargingState ?? "—"}
          isLoading={isLoading || sync.isPending}
          variant="emerald"
          icon={<Battery className="size-5" />}
        />
        <MetricCard
          label="Range"
          value={
            snapshot?.rangeKm && snapshot.rangeKm > 0
              ? `${snapshot.rangeKm} km`
              : undefined
          }
          isLoading={isLoading || sync.isPending}
          variant="sky"
          icon={<Route className="size-5" />}
        />
        <MetricCard
          label="Temperature"
          value={
            snapshot?.insideTempC != null || snapshot?.outsideTempC != null
              ? `${Math.round(snapshot.insideTempC ?? 0)}° / ${Math.round(snapshot.outsideTempC ?? 0)}°`
              : undefined
          }
          subtext="Inside / outside"
          isLoading={isLoading || sync.isPending}
          variant="amber"
          icon={<Thermometer className="size-5" />}
        />
        <MetricCard
          label="Last sync"
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
          isLoading={isLoading || sync.isPending}
          variant="violet"
          icon={<Clock className="size-5" />}
        />
      </div>

      <p className="text-xs text-slate-400">
        Trips and charging history build up as DriveLens syncs while you drive or charge.
        Use Sync after a drive if data looks stale.
      </p>

      <DashboardCard title="Battery trend" accent="emerald">
        {snapshotsData?.snapshots?.length ? (
          <BatteryChart data={snapshotsData.snapshots} />
        ) : (
          <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-emerald-500/20 text-emerald-400/60">
            No snapshot data yet
          </div>
        )}
      </DashboardCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Recent trips" accent="cyan">
          <div className="space-y-2">
            {trips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trips yet — drive and sync!</p>
            ) : (
              trips.map((trip: { _id: string; startTime: string; distanceKm: number }, i: number) => (
                <div
                  key={trip._id}
                  className={`flex justify-between rounded-xl border px-4 py-3 ${tripAccentClasses[i % tripAccentClasses.length]}`}
                >
                  <span className="text-sm text-slate-200">
                    {format(new Date(trip.startTime), "MMM d, HH:mm")}
                  </span>
                  <span className="tabular-nums text-sm font-semibold text-cyan-300">
                    {trip.distanceKm} km
                  </span>
                </div>
              ))
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Charging analytics" accent="violet">
          <MetricBarChart
            data={sessions.slice(0, 6).map((s: { energyKwh?: number; startedAt: string }) => ({
              label: format(new Date(s.startedAt), "MMM d"),
              value: s.energyKwh ?? 0,
            }))}
          />
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2">
            <Zap className="size-4 text-violet-400" />
            <p className="text-sm text-violet-200">
              Total cost: <span className="font-semibold text-violet-300">${totalCost.toFixed(2)}</span>
            </p>
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Vehicle map" accent="sky">
          <div className="overflow-hidden rounded-xl border border-sky-500/20">
            <VehicleMap
              latitude={snapshot?.latitude}
              longitude={snapshot?.longitude}
              className="h-52 w-full"
            />
          </div>
          {snapshot?.latitude != null && snapshot?.longitude != null && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-sky-300/80">
              <MapPin className="size-3.5" />
              {snapshot.latitude.toFixed(4)}, {snapshot.longitude.toFixed(4)}
            </p>
          )}
        </DashboardCard>

        <DashboardCard title="AI insights" accent="rose">
          {insightData?.insight ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-slate-200">
                {insightData.insight.summary}
              </p>
              <ul className="space-y-2">
                {insightData.insight.recommendations?.map((r: string) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 rounded-lg border border-rose-500/15 bg-rose-500/5 px-3 py-2 text-sm text-rose-100/90"
                  >
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-rose-400" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rose-500/20 text-rose-300/60">
              <Sparkles className="size-6" />
              <p className="text-sm">Insights generate weekly via cron or sync</p>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
