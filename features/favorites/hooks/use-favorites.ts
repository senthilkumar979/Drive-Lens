import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    },
  });
}

export function useSendNavigation() {
  return useMutation({
    mutationFn: async (coords: { latitude: number; longitude: number }) => {
      const res = await fetch("/api/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coords),
      });
      if (!res.ok) throw new Error("Navigation failed");
      return res.json();
    },
  });
}

export function useCreateFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      latitude: number;
      longitude: number;
      icon: string;
    }) => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create favorite");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
}
