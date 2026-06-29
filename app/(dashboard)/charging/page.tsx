"use client";

import { format } from "date-fns";
import { MetricBarChart } from "@/components/charts/metric-bar-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChargingSessions } from "@/features/charging/hooks/use-charging";

export default function ChargingPage() {
  const { data, isLoading } = useChargingSessions();
  const sessions = data?.sessions ?? [];
  const totalKwh = sessions.reduce(
    (sum: number, s: { energyKwh?: number }) => sum + (s.energyKwh ?? 0),
    0,
  );
  const totalCost = sessions.reduce(
    (sum: number, s: { costUsd?: number }) => sum + (s.costUsd ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Charging</h2>
        <p className="text-sm text-muted-foreground">
          {totalKwh.toFixed(1)} kWh total · ${totalCost.toFixed(2)} spent
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Energy per session</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricBarChart
            data={sessions.slice(0, 8).map((s: { energyKwh?: number; startedAt: string }) => ({
              label: format(new Date(s.startedAt), "MMM d"),
              value: s.energyKwh ?? 0,
            }))}
            color="#a855f7"
          />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Session history</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Energy</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s: {
                  _id: string;
                  startedAt: string;
                  location?: { name?: string };
                  energyKwh?: number;
                  costUsd?: number;
                }) => (
                  <TableRow key={s._id}>
                    <TableCell>
                      {format(new Date(s.startedAt), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>{s.location?.name ?? "Unknown"}</TableCell>
                    <TableCell className="tabular-nums">{s.energyKwh ?? "—"} kWh</TableCell>
                    <TableCell className="tabular-nums">
                      ${(s.costUsd ?? 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
