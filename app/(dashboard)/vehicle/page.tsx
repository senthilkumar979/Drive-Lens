"use client";

import { format } from "date-fns";
import { RefreshCw, Lock, Unlock } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import { VehicleMap } from "@/components/maps/vehicle-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVehicle, useSyncVehicle } from "@/features/vehicle/hooks/use-vehicle";

export default function VehiclePage() {
  const { data, isLoading } = useVehicle();
  const sync = useSyncVehicle();
  const snapshot = data?.snapshot;
  const vehicle = data?.vehicle;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Vehicle</h2>
          <p className="text-sm text-muted-foreground">
            {vehicle?.displayName} · {vehicle?.model}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator />
          <Button
            variant="outline"
            size="sm"
            onClick={() => sync.mutate({ wake: true })}
            disabled={sync.isPending}
          >
            <RefreshCw className={`mr-2 size-4 ${sync.isPending ? "animate-spin" : ""}`} />
            Sync now
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Battery" value={snapshot ? `${snapshot.batteryLevel}%` : undefined} isLoading={isLoading} />
        <MetricCard label="Range" value={snapshot ? `${snapshot.rangeKm} km` : undefined} isLoading={isLoading} />
        <MetricCard
          label="Odometer"
          value={snapshot?.odometerKm ? `${Math.round(snapshot.odometerKm)} km` : undefined}
          isLoading={isLoading}
        />
        <MetricCard
          label="Status"
          value={snapshot?.locked ? "Locked" : "Unlocked"}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Climate</CardTitle>
            <Badge variant="outline">
              {snapshot?.chargingState ?? "Unknown"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              Inside: <span className="tabular-nums font-medium">{snapshot?.insideTempC ?? "—"}°C</span>
            </p>
            <p className="text-sm">
              Outside: <span className="tabular-nums font-medium">{snapshot?.outsideTempC ?? "—"}°C</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {snapshot?.locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
              {snapshot?.locked ? "Vehicle locked" : "Vehicle unlocked"}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleMap
              latitude={snapshot?.latitude}
              longitude={snapshot?.longitude}
              className="h-52 w-full"
            />
            {snapshot?.timestamp && (
              <p className="mt-2 text-xs text-muted-foreground">
                Updated {format(new Date(snapshot.timestamp), "MMM d, HH:mm")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
