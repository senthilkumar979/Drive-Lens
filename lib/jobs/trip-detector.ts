import {
  createTrip,
  getActiveTrip,
  updateTrip,
} from "@/lib/db/repositories";
import type { VehicleSnapshotDocument } from "@/types/database";

const STOP_SPEED_KMH = 5;
const STOP_DURATION_MS = 10 * 60 * 1000;

export async function detectTripActivity(
  userId: string,
  vehicleId: string,
  snapshot: VehicleSnapshotDocument,
): Promise<void> {
  const speed = snapshot.speedKmh ?? 0;
  const isMoving = speed > STOP_SPEED_KMH;
  const activeTrip = await getActiveTrip(vehicleId);

  if (isMoving && !activeTrip) {
    await createTrip({
      vehicleId,
      userId,
      startTime: snapshot.timestamp,
      distanceKm: 0,
      isActive: true,
      startLocation:
        snapshot.latitude && snapshot.longitude
          ? { lat: snapshot.latitude, lng: snapshot.longitude }
          : undefined,
    });
    return;
  }

  if (!activeTrip) return;

  if (!isMoving) {
    const elapsed = snapshot.timestamp.getTime() - activeTrip.startTime.getTime();
    if (elapsed >= STOP_DURATION_MS) {
      const startOdo = activeTrip.distanceKm;
      const endOdo = snapshot.odometerKm ?? 0;
      const distance =
        activeTrip.startLocation && snapshot.latitude && snapshot.longitude
          ? haversineKm(
              activeTrip.startLocation.lat,
              activeTrip.startLocation.lng,
              snapshot.latitude,
              snapshot.longitude,
            )
          : Math.max(0, endOdo - startOdo);

      await updateTrip(String(activeTrip._id), {
        isActive: false,
        endTime: snapshot.timestamp,
        distanceKm: distance,
        endLocation:
          snapshot.latitude && snapshot.longitude
            ? { lat: snapshot.latitude, lng: snapshot.longitude }
            : undefined,
        avgSpeedKmh: elapsed > 0 ? (distance / (elapsed / 3600000)) : 0,
      });
    }
  }
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
