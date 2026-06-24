import { VehicleProfile } from "../types";

/**
 * Safely merges a vehicle profile with new updates, ensuring that driver-submitted
 * odometer values (mileage) correctly overwrite older values and the last-service-date is synchronized.
 */
export function syncVehicleRecords(
  currentVehicles: VehicleProfile[],
  vehicleId: string,
  newData: Partial<VehicleProfile>
): VehicleProfile[] {
  return currentVehicles.map((vehicle) => {
    if (vehicle.id !== vehicleId) {
      return vehicle;
    }

    const updatedMileage =
      newData.mileage !== undefined && newData.mileage > (vehicle.mileage || 0)
        ? newData.mileage
        : (vehicle.mileage || 0);

    const updatedLastServiceDate =
      newData.lastServiceDate || vehicle.lastServiceDate;

    return {
      ...vehicle,
      ...newData,
      mileage: updatedMileage,
      lastServiceDate: updatedLastServiceDate,
    };
  });
}
