import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SyncVehicleOptions {
  wake?: boolean;
}

interface SyncVehicleResult {
  snapshots: number;
  errors: string[];
}

export function useVehicle() {
  return useQuery({
    queryKey: ["vehicle"],
    queryFn: async () => {
      const res = await fetch("/api/vehicle");
      if (!res.ok) throw new Error("Failed to fetch vehicle");
      return res.json();
    },
  });
}

export function useVehicleSnapshots(days = 7) {
  return useQuery({
    queryKey: ["vehicle-snapshots", days],
    queryFn: async () => {
      const res = await fetch(`/api/vehicle/snapshots?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch snapshots");
      return res.json();
    },
  });
}

export function useSyncVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (options?: SyncVehicleOptions) => {
      const res = await fetch("/api/vehicle/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wake: options?.wake ?? true }),
      });
      const data = (await res.json()) as SyncVehicleResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Sync failed");
      }
      if (data.errors?.length) {
        throw new Error(data.errors.join("; "));
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-snapshots"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["charging-sessions"] });
    },
  });
}
