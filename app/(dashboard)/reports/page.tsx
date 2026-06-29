"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
        <p className="text-sm text-muted-foreground">Export monthly summaries</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Monthly PDF report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Includes trips, charging costs, efficiency metrics, CO₂ savings, and maintenance
            summary.
          </p>
          <Button asChild>
            <a href="/api/reports/generate" download>
              <Download className="mr-2 size-4" />
              Download PDF
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
