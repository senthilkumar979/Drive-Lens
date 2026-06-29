"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const res = await fetch("/api/maintenance");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const complete = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Marked complete");
    },
  });

  const create = useMutation({
    mutationFn: async (payload: { type: string; dueAt: string; notes?: string }) => {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Reminder added");
    },
  });

  const [type, setType] = useState("service");
  const [dueAt, setDueAt] = useState("");
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Maintenance</h2>
        <p className="text-sm text-muted-foreground">Service reminders and history</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Add reminder</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Input value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Due date</Label>
            <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <Button
            className="self-end"
            onClick={() => create.mutate({ type, dueAt })}
            disabled={!dueAt || create.isPending}
          >
            Add
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: {
                  _id: string;
                  type: string;
                  dueAt: string;
                  completedAt?: string;
                }) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{format(new Date(item.dueAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {item.completedAt ? "Done" : "Pending"}
                    </TableCell>
                    <TableCell>
                      {!item.completedAt && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => complete.mutate(item._id)}
                        >
                          Complete
                        </Button>
                      )}
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
