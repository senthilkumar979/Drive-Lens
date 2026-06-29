export interface TeslaVehicleResponse {
  response: Array<{
    id: number;
    vehicle_id: number;
    vin: string;
    display_name: string;
    state: string;
  }>;
}

export interface TeslaVehicleDetailResponse {
  response: {
    state?: string;
    vin?: string;
    display_name?: string;
  };
}

export interface TeslaVehicleDataResponse {
  response: {
    charge_state?: {
      battery_level: number;
      est_battery_range?: number;
      ideal_battery_range?: number;
      rated_battery_range?: number;
      charging_state: string;
      charge_limit_soc?: number;
    };
    drive_state?: {
      latitude: number;
      longitude: number;
      heading: number;
      speed: number;
    };
    vehicle_state?: {
      odometer: number;
      locked: boolean;
    };
    climate_state?: {
      inside_temp: number;
      outside_temp: number;
      is_climate_on: boolean;
    };
  };
}

export interface TeslaTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}
