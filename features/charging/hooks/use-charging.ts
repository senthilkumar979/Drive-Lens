import { useQuery } from "@tanstack/react-query";

export function useChargingSessions() {
  return useQuery({
    queryKey: ["charging"],
    queryFn: async () => {
      const res = await fetch("/api/charging");
      if (!res.ok) throw new Error("Failed to fetch charging");
      return res.json();
    },
  });
}
