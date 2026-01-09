import React, { useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { useFleet } from '../context/FleetContext';

function DataPage() {
  const { drivers, vehicles, loading: fleetLoading } = useFleet();

  useEffect(() => {
    if (!fleetLoading) {
      console.log("Datos de Conductores:", drivers);
      console.log("Datos de Vehículos:", vehicles);
    }
  }, [drivers, vehicles, fleetLoading]);

  if (fleetLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: '100%', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Drivers Table */}
      <TableContainer component={Paper} elevation={3} sx={{ backgroundColor: 'transparent', backgroundImage: 'none' }}>
        <Table sx={{ minWidth: 650 }} aria-label="drivers table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Último Login</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{driver.name || 'N/A'}</TableCell>
                <TableCell>{driver.email || 'N/A'}</TableCell>
                <TableCell>{driver.status || 'N/A'}</TableCell>
                <TableCell>{driver.is_admin ? 'Sí' : 'No'}</TableCell>
                <TableCell>{driver.last_login ? new Date(driver.last_login).toLocaleString() : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Vehicles Table */}
      <TableContainer component={Paper} elevation={3} sx={{ backgroundColor: 'transparent', backgroundImage: 'none', mt: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="vehicles table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Dirección Final</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{vehicle.name || 'N/A'}</TableCell>
                <TableCell>{vehicle.status || 'N/A'}</TableCell>
                <TableCell>{vehicle.location_end_address || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default DataPage;
