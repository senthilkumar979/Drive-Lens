import { requireSessionUserId } from "@/lib/auth/session";
import {
  getAnalyticsRollups,
  getChargingSessions,
  getTripsByUserId,
  getVehiclesByUserId,
} from "@/lib/db/repositories";
import { generateReportPdf } from "@/lib/reports/monthly-report";
import { apiError } from "@/lib/api/response";

export async function GET() {
  let userId: string;
  try {
    userId = await requireSessionUserId();
  } catch {
    return apiError("Unauthorized", 401);
  }

  const vehicles = await getVehiclesByUserId(userId);
  const vehicleId = vehicles[0] ? String(vehicles[0]._id) : "";
  const rollups = vehicleId
    ? await getAnalyticsRollups(vehicleId, "monthly")
    : [];
  const monthly = rollups[0];
  const trips = await getTripsByUserId(userId, 20);
  const charging = await getChargingSessions(userId, 20);

  const pdf = await generateReportPdf(monthly, trips, charging);

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=drivelens-report.pdf",
    },
  });
}
