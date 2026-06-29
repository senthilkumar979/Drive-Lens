import { useQuery } from "@tanstack/react-query";

export function useAnalytics(period: "daily" | "weekly" | "monthly" | "yearly" = "weekly") {
  return useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });
}
