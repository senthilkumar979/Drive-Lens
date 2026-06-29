"use client";

import { toast } from "sonner";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useFavorites,
  useSendNavigation,
} from "@/features/favorites/hooks/use-favorites";

const iconMap: Record<string, string> = {
  home: "🏠",
  briefcase: "💼",
  dumbbell: "🏋️",
  plane: "✈️",
  "map-pin": "📍",
};

export default function FavoritesPage() {
  const { data, isLoading } = useFavorites();
  const sendNav = useSendNavigation();
  const favorites = data?.favorites ?? [];

  const handleSend = (lat: number, lng: number, name: string) => {
    sendNav.mutate(
      { latitude: lat, longitude: lng },
      {
        onSuccess: () => toast.success(`Navigation sent to ${name}`),
        onError: () => toast.error("Failed to send navigation"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Favorites</h2>
        <p className="text-sm text-muted-foreground">Saved destinations</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f: {
            _id: string;
            name: string;
            latitude: number;
            longitude: number;
            icon: string;
          }) => (
            <Card key={f._id} className="shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span>{iconMap[f.icon] ?? "📍"}</span>
                  {f.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  <MapPin className="mr-1 inline size-3" />
                  {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleSend(f.latitude, f.longitude, f.name)}
                  disabled={sendNav.isPending}
                >
                  <Navigation className="mr-2 size-4" />
                  Send to vehicle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
