import { useMutation, useQuery } from "@tanstack/react-query";

export function useAiInsight() {
  return useQuery({
    queryKey: ["ai-insight"],
    queryFn: async () => {
      const res = await fetch("/api/assistant");
      if (!res.ok) throw new Error("Failed to fetch insight");
      return res.json();
    },
  });
}

export function useAssistantChat() {
  return useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Chat failed");
      return res.json();
    },
  });
}
