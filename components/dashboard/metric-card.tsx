import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  label: string;
  value?: string;
  subtext?: string;
  isLoading?: boolean;
}

export const MetricCard = ({
  label,
  value,
  subtext,
  isLoading,
}: MetricCardProps) => {
  return (
    <Card className="shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="tabular-nums text-2xl font-semibold tracking-tight">
            {value ?? "—"}
          </p>
        )}
        {subtext && (
          <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
};
