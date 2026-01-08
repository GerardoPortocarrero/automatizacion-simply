import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function VehiclePerformanceReport() {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehiclePerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch vehicles data
        const vehiclesResponse = await api.get('/v1/routes/vehicles/');
        console.log('Respuesta de la API para Rendimiento de Vehículos:', vehiclesResponse.data); // Log para inspección
        setVehicles(vehiclesResponse.data.results || vehiclesResponse.data || []);

        // In a real application, you might need to fetch /v1/routes and /v1/visits
        // to aggregate data like total distance, completed visits, etc.
        // For this example, we'll use dummy data for these metrics or rely on
        // what might be directly available in the vehicle object.

      } catch (err) {
        console.error('Error fetching vehicle performance:', err);
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Data:', err.response.data);
          console.error('Status:', err.response.status);
          console.error('Headers:', err.response.headers);
          setError(`Error ${err.response.status}: ${err.response.data.detail || 'Failed to load vehicle performance data.'}`);
        } else if (err.request) {
          // The request was made but no response was received
          console.error('Request:', err.request);
          setError('No response from server. Check your network connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error', err.message);
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVehiclePerformance();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando Reporte de Rendimiento de Vehículos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Reporte de Rendimiento de Vehículos</Typography>
        <Typography color="error">{error}</Typography>
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

  // Preparar datos para el gráfico con datos REALES de capacidad
  const chartData = vehicles.map((vehicle) => ({
    name: vehicle.name,
    "Capacidad 1": vehicle.capacity,
    "Capacidad 2": vehicle.capacity_2,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reporte de Rendimiento de Vehículos</Typography>

      {/* Chart Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Capacidades por Vehículo</Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
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
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar dataKey="Capacidad 1" fill="#8884d8" />
            <Bar dataKey="Capacidad 2" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Table Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Detalle de Vehículos</Typography>
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
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
