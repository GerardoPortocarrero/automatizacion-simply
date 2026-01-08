import React from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useFleet } from '../context/FleetContext'; // Use the shared context
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'; // Import LabelList
import { useTheme } from '@mui/material/styles';

function VehiclePerformanceReport() {
  // Get vehicle data and loading state from the FleetContext
  const { vehicles, loading: fleetLoading } = useFleet();
  const theme = useTheme();

  // Centered, text-less loading spinner
  if (fleetLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: '100%', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (vehicles.length === 0) {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Reporte de Rendimiento de Vehículos</Typography>
            <Typography>No se encontraron vehículos.</Typography>
      </Box>
    );
  }

  // Prepare data for the chart using data from the context
  const chartData = vehicles.map((vehicle) => ({
    name: vehicle.name,
    "Capacidad 1": vehicle.capacity,
    "Capacidad 2": vehicle.capacity_2,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reporte de Rendimiento de Vehículos</Typography>
      
      {/* Chart Section */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom align="center">Capacidad por Vehículo</Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 75,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                interval={0}
                style={{ fontSize: '0.9rem' }}
            />
            <YAxis label={{ value: 'Unidades de Capacidad', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar dataKey="Capacidad 1" fill={theme.palette.primary.main}>
                <LabelList dataKey="Capacidad 1" position="top" style={{ fill: theme.palette.primary.main }} />
            </Bar>
            <Bar dataKey="Capacidad 2" fill="#007bff">
                <LabelList dataKey="Capacidad 2" position="top" style={{ fill: '#007bff' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Table Section */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="vehicle performance table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell align="right">Tipo de Carga</TableCell>
              <TableCell align="right">Capacidad 1</TableCell>
              <TableCell align="right">Capacidad 2</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow
                key={vehicle.id}
                sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#e9ecef',
                    }
                }}
              >
                <TableCell component="th" scope="row">{vehicle.id}</TableCell>
                <TableCell>{vehicle.name || 'N/A'}</TableCell>
                <TableCell align="right">{vehicle.type_load || 'N/A'}</TableCell>
                <TableCell align="right">{vehicle.capacity || 'N/A'}</TableCell>
                <TableCell align="right">{vehicle.capacity_2 || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default VehiclePerformanceReport;
