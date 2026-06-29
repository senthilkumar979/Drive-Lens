"use client";

interface VehicleMapProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

export const VehicleMap = ({ latitude, longitude, className }: VehicleMapProps) => {
  if (!latitude || !longitude) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-border bg-surface text-sm text-muted-foreground ${className ?? "h-48"}`}
      >
        No location data
      </div>
    );
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const src = token
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-l+2D7FF9(${longitude},${latitude})/${longitude},${latitude},13,0/600x300@2x?access_token=${token}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02},${latitude - 0.02},${longitude + 0.02},${latitude + 0.02}&layer=mapnik&marker=${latitude},${longitude}`;

  if (token) {
    return (
      // Mapbox static tiles — dynamic URL, not suitable for next/image
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Vehicle location"
        className={`rounded-xl object-cover ${className ?? "h-48 w-full"}`}
      />
    );
  }

  return (
    <iframe
      title="Vehicle location"
      src={src}
      className={`rounded-xl border border-border ${className ?? "h-48 w-full"}`}
    />
  );
};
