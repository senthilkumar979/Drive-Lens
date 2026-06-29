import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type {
  AnalyticsRollupDocument,
  ChargingSessionDocument,
  TripDocument,
} from "@/types/database";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  title: { fontSize: 24, marginBottom: 20 },
  section: { marginBottom: 16 },
  heading: { fontSize: 14, marginBottom: 8 },
  text: { fontSize: 10, marginBottom: 4 },
});

function buildReportDocument(
  monthly: AnalyticsRollupDocument | undefined,
  trips: TripDocument[],
  charging: ChargingSessionDocument[],
) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>DriveLens Monthly Report</Text>
        <View style={styles.section}>
          <Text style={styles.heading}>Summary</Text>
          <Text style={styles.text}>
            Distance: {monthly?.metrics.distanceKm ?? 0} km
          </Text>
          <Text style={styles.text}>
            Energy: {monthly?.metrics.energyKwh ?? 0} kWh
          </Text>
          <Text style={styles.text}>
            Charging cost: ${monthly?.metrics.chargingCostUsd ?? 0}
          </Text>
          <Text style={styles.text}>
            CO₂ saved: {monthly?.metrics.co2SavedKg ?? 0} kg
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Recent trips ({trips.length})</Text>
          {trips.slice(0, 5).map((t) => (
            <Text key={String(t._id)} style={styles.text}>
              {t.startTime.toISOString().slice(0, 10)} — {t.distanceKm} km
            </Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.heading}>Charging sessions</Text>
          {charging.slice(0, 5).map((c) => (
            <Text key={String(c._id)} style={styles.text}>
              {c.startedAt.toISOString().slice(0, 10)} — {c.energyKwh ?? 0} kWh
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export async function generateReportPdf(
  monthly: AnalyticsRollupDocument | undefined,
  trips: TripDocument[],
  charging: ChargingSessionDocument[],
): Promise<Uint8Array> {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const buffer = await renderToBuffer(
    buildReportDocument(monthly, trips, charging),
  );
  return new Uint8Array(buffer);
}
