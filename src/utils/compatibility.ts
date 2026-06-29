import { VehicleProfile } from "../types";

/**
 * Checks if a vehicle has EV or Hybrid systems (EV, PHEV, HEV, electric motorcycle, etc.)
 */
export function hasEvBatteryAndCharging(vehicle: VehicleProfile | null): boolean {
  if (!vehicle) return false;

  // 1. Check new category/engine/fuel types
  if (
    vehicle.vehicleCategory === "EV" ||
    vehicle.vehicleCategory === "hybrid" ||
    vehicle.engineTypeNew === "electric" ||
    vehicle.engineTypeNew === "hybrid" ||
    vehicle.engineTypeNew === "plug-in hybrid" ||
    vehicle.fuelEnergyType === "electric" ||
    vehicle.fuelEnergyType === "petrol + electric" ||
    vehicle.fuelEnergyType === "diesel + electric"
  ) {
    return true;
  }

  // 2. Fallbacks to older types
  const fuel = (vehicle.fuelType || "").toLowerCase();
  const engine = (vehicle.engineType || "").toLowerCase();

  if (
    fuel === "ev" ||
    fuel === "hybrid" ||
    engine.includes("ev") ||
    engine.includes("hybrid") ||
    engine.includes("electric") ||
    engine.includes("phev")
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if a vehicle has an electric charging log/plug capabilities (EV, PHEV - NOT standard HEV hybrid)
 */
export function hasElectricChargingPlug(vehicle: VehicleProfile | null): boolean {
  if (!vehicle) return false;

  if (
    vehicle.engineTypeNew === "electric" ||
    vehicle.engineTypeNew === "plug-in hybrid" ||
    vehicle.fuelEnergyType === "electric"
  ) {
    return true;
  }

  const fuel = (vehicle.fuelType || "").toLowerCase();
  const engine = (vehicle.engineType || "").toLowerCase();

  // HEV hybrid is not plug-in, whereas PHEV is plug-in
  if (engine.includes("plug-in") || engine.includes("phev") || fuel === "ev" || engine.includes("fully electric")) {
    return true;
  }

  return false;
}

/**
 * Checks if a vehicle uses petrol/gasoline (Petrol cars, hybrids, PHEVs, petrol motorbikes)
 */
export function hasPetrolSystem(vehicle: VehicleProfile | null): boolean {
  if (!vehicle) return true; // Default to showing if no vehicle selected

  // 1. Check new fields
  if (
    vehicle.engineTypeNew === "petrol" ||
    vehicle.engineTypeNew === "hybrid" ||
    vehicle.engineTypeNew === "plug-in hybrid" ||
    vehicle.fuelEnergyType === "petrol" ||
    vehicle.fuelEnergyType === "petrol + electric"
  ) {
    return true;
  }

  // 2. Fallback check (must not be pure EV/Diesel/LPG unless it's a hybrid)
  const fuel = (vehicle.fuelType || "").toLowerCase();
  const engine = (vehicle.engineType || "").toLowerCase();

  // If it's explicitly EV-only or Diesel-only, then it has no petrol system
  if (fuel === "ev" && !engine.includes("hybrid") && !engine.includes("phev")) {
    return false;
  }
  if (fuel === "diesel" && !engine.includes("hybrid") && !engine.includes("phev")) {
    return false;
  }

  // If it's gasoline or hybrid, yes
  if (
    fuel === "gasoline" ||
    fuel === "hybrid" ||
    engine.includes("petrol") ||
    engine.includes("gasoline") ||
    engine.includes("hybrid") ||
    engine.includes("phev")
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if a vehicle is pure EV (no petrol/diesel engine at all)
 */
export function isPureEV(vehicle: VehicleProfile | null): boolean {
  if (!vehicle) return false;

  if (vehicle.engineTypeNew === "electric" || vehicle.fuelEnergyType === "electric") {
    return true;
  }

  const fuel = (vehicle.fuelType || "").toLowerCase();
  const engine = (vehicle.engineType || "").toLowerCase();

  if (
    (fuel === "ev" || engine.includes("fully electric") || engine.includes("e-bike")) &&
    !engine.includes("hybrid") &&
    !engine.includes("phev")
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if a vehicle uses diesel (Diesel trucks, pickups, cars, diesel hybrids)
 */
export function hasDieselSystem(vehicle: VehicleProfile | null): boolean {
  if (!vehicle) return false;

  if (
    vehicle.engineTypeNew === "diesel" ||
    vehicle.fuelEnergyType === "diesel" ||
    vehicle.fuelEnergyType === "diesel + electric"
  ) {
    return true;
  }

  const fuel = (vehicle.fuelType || "").toLowerCase();
  const engine = (vehicle.engineType || "").toLowerCase();

  if (fuel === "diesel" || engine.includes("diesel")) {
    return true;
  }

  return false;
}

/**
 * Checks if a vehicle uses LPG or CNG
 */
export function hasLpgCngSystem(vehicle: VehicleProfile | null): boolean {
  if (!vehicle) return false;

  if (vehicle.engineTypeNew === "LPG/CNG" || vehicle.fuelEnergyType === "gas") {
    return true;
  }

  const engine = (vehicle.engineType || "").toLowerCase();
  if (engine.includes("lpg") || engine.includes("cng") || engine.includes("gas vehicle")) {
    return true;
  }

  return false;
}
