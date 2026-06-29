import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Accent = "emerald" | "sky" | "amber" | "violet" | "rose" | "cyan";

const accentStyles: Record<Accent, { card: string; title: string; dot: string }> = {
  emerald: {
    card: "border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-card to-card",
    title: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  sky: {
    card: "border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-card to-card",
    title: "text-sky-400",
    dot: "bg-sky-400",
  },
  amber: {
    card: "border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-card to-card",
    title: "text-amber-400",
    dot: "bg-amber-400",
  },
  violet: {
    card: "border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-card to-card",
    title: "text-violet-400",
    dot: "bg-violet-400",
  },
  rose: {
    card: "border-rose-500/25 bg-gradient-to-br from-rose-500/10 via-card to-card",
    title: "text-rose-400",
    dot: "bg-rose-400",
  },
  cyan: {
    card: "border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 via-card to-card",
    title: "text-cyan-400",
    dot: "bg-cyan-400",
  },
};

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  accent?: Accent;
  className?: string;
}

export const DashboardCard = ({
  title,
  children,
  accent = "sky",
  className,
}: DashboardCardProps) => {
  const styles = accentStyles[accent];

  return (
    <Card
      className={cn(
        "shadow-card overflow-hidden border transition-all duration-200 hover:shadow-elevated",
        styles.card,
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className={cn("size-2 rounded-full", styles.dot)} />
          <span className={styles.title}>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
