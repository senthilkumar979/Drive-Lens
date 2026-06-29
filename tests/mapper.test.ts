import { describe, expect, it } from "vitest";
import { mapTeslaSnapshot } from "@/services/tesla/mapper";

describe("mapTeslaSnapshot", () => {
  it("maps Tesla API response to normalized snapshot", () => {
    const result = mapTeslaSnapshot("vehicle-1", {
      charge_state: {
        battery_level: 80,
        est_battery_range: 250,
        charging_state: "Charging",
      },
      drive_state: {
        latitude: 37.77,
        longitude: -122.42,
        heading: 90,
        speed: 0,
      },
      vehicle_state: {
        odometer: 18000,
        locked: true,
      },
      climate_state: {
        inside_temp: 22,
        outside_temp: 15,
        is_climate_on: false,
      },
    });

    expect(result.vehicleId).toBe("vehicle-1");
    expect(result.batteryLevel).toBe(80);
    expect(result.rangeKm).toBeGreaterThan(0);
    expect(result.locked).toBe(true);
    expect(result.location?.latitude).toBe(37.77);
  });
});
