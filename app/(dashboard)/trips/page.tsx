"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrips } from "@/features/trip/hooks/use-trips";

export default function TripsPage() {
  const { data, isLoading } = useTrips();
  const trips = data?.trips ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Trips</h2>
        <p className="text-sm text-muted-foreground">Trip history and efficiency</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>All trips</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : trips.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trips recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Consumption</TableHead>
                  <TableHead>Avg speed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip: {
                  _id: string;
                  startTime: string;
                  distanceKm: number;
                  consumptionKwh?: number;
                  avgSpeedKmh?: number;
                }) => (
                  <TableRow key={trip._id}>
                    <TableCell>
                      {format(new Date(trip.startTime), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="tabular-nums">{trip.distanceKm} km</TableCell>
                    <TableCell className="tabular-nums">
                      {trip.consumptionKwh ?? "—"} kWh
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {trip.avgSpeedKmh ? `${Math.round(trip.avgSpeedKmh)} km/h` : "—"}
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
