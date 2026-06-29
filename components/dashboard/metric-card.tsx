import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type MetricVariant = "emerald" | "sky" | "amber" | "violet";

const variantStyles: Record<
  MetricVariant,
  { card: string; icon: string; value: string; label: string }
> = {
  emerald: {
    card: "border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-card",
    icon: "bg-emerald-500/20 text-emerald-400",
    value: "text-emerald-300",
    label: "text-emerald-400/80",
  },
  sky: {
    card: "border-sky-500/30 bg-gradient-to-br from-sky-500/20 via-sky-500/5 to-card",
    icon: "bg-sky-500/20 text-sky-400",
    value: "text-sky-300",
    label: "text-sky-400/80",
  },
  amber: {
    card: "border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-card",
    icon: "bg-amber-500/20 text-amber-400",
    value: "text-amber-300",
    label: "text-amber-400/80",
  },
  violet: {
    card: "border-violet-500/30 bg-gradient-to-br from-violet-500/20 via-violet-500/5 to-card",
    icon: "bg-violet-500/20 text-violet-400",
    value: "text-violet-300",
    label: "text-violet-400/80",
  },
};

interface MetricCardProps {
  label: string;
  value?: string;
  subtext?: string;
  isLoading?: boolean;
  variant?: MetricVariant;
  icon?: React.ReactNode;
}

export const MetricCard = ({
  label,
  value,
  subtext,
  isLoading,
  variant = "sky",
  icon,
}: MetricCardProps) => {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        "shadow-card overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated",
        styles.card,
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={cn("text-xs font-medium uppercase tracking-wide", styles.label)}>
              {label}
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : (
              <p className={cn("mt-1 tabular-nums text-2xl font-bold tracking-tight", styles.value)}>
                {value ?? "—"}
              </p>
            )}
            {subtext && (
              <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                styles.icon,
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
