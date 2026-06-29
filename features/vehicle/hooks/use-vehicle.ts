import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    mutationFn: async () => {
      const res = await fetch("/api/vehicle/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle-snapshots"] });
    },
  });
}
