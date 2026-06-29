import { registerVehicleProvider } from "./registry";
import { teslaVehicleProvider } from "./tesla/tesla-provider";

registerVehicleProvider(teslaVehicleProvider);

export { getVehicleProvider, getDefaultVehicleProvider } from "./registry";
