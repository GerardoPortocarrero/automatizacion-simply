import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import api from '../services/api';

const FleetContext = createContext();

export function useFleet() {
  return useContext(FleetContext);
}

export function FleetProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        // We use Promise.allSettled to ensure that even if one endpoint
        // fails (e.g., due to permissions), the others can still load.
        const [driversResponse, vehiclesResponse] = await Promise.allSettled([
          api.get('/v1/accounts/drivers/'),
          api.get('/v1/routes/vehicles/'),
        ]);

        if (driversResponse.status === 'fulfilled') {
          setDrivers(driversResponse.value.data.results || driversResponse.value.data || []);
        } else {
          console.error("Error al obtener conductores:", driversResponse.reason);
        }

        if (vehiclesResponse.status === 'fulfilled') {
          setVehicles(vehiclesResponse.value.data.results || vehiclesResponse.value.data || []);
        } else {
          console.error("Error al obtener vehículos:", vehiclesResponse.reason);
        }

      } catch (err) {
        // This catches errors if the Promise.allSettled itself fails, which is unlikely.
        console.error("An unexpected error occurred while fetching fleet data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFleetData();
  }, []);

  // useMemo will prevent these maps from being recalculated on every render.
  const driverMap = useMemo(() => {
    const map = new Map(drivers.map(driver => [driver.id, driver.name]));
    return map;
  }, [drivers]);

  const vehicleMap = useMemo(() => {
    const map = new Map(vehicles.map(vehicle => [vehicle.id, vehicle.name]));
    return map;
  }, [vehicles]);

  const value = {
    drivers,
    vehicles,
    driverMap,
    vehicleMap,
    loading,
    error,
  };

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}
