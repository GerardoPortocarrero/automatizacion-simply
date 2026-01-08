import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

function DailyRouteReport() {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDailyRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const today = new Date().toISOString().slice(0, 10);
        const response = await api.get(`/v1/plans/${today}/vehicles/`);
        
        let simplifiedRoutes = [];
        if (response.data && Array.isArray(response.data)) {
            response.data.forEach(vehicle => {
                const vehicle_plate = vehicle.name || 'N/A';
                const driver_name = vehicle.driver ? vehicle.driver.name : 'N/A';

                if (vehicle.routes && Array.isArray(vehicle.routes)) {
                    vehicle.routes.forEach(route => {
                        simplifiedRoutes.push({
                            ...route,
                            vehicle_plate: vehicle_plate,
                            driver_name: driver_name,
                        });
                    });
                }
            });
        }

        if (simplifiedRoutes.length === 0) {
            setRoutes([]);
            setLoading(false);
            return;
        }

        const routeDetailPromises = simplifiedRoutes.map(route =>
            api.get(`/v1/routes/routes/${route.id}/`)
        );
        
        const routeDetailResponses = await Promise.all(routeDetailPromises);

        const detailedRoutes = routeDetailResponses.map((detailResponse, index) => {
            const simplifiedRoute = simplifiedRoutes[index];
            const routeDetails = detailResponse.data;

            const distanceKm = routeDetails.total_distance ? (routeDetails.total_distance / 1000).toFixed(2) : 'N/A';
            
            let realStartTime = 'N/A';
            if (routeDetails.start_time) {
                try {
                    const date = new Date(routeDetails.start_time);
                    realStartTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                } catch (e) {
                    console.error('Error al formatear start_time:', e);
                }
            }

            return {
                ...simplifiedRoute,
                ...routeDetails,
                total_distance_km: distanceKm,
                real_start_time_formatted: realStartTime,
            };
        });
        
        setRoutes(detailedRoutes);

      } catch (err) {
        console.error('Error fetching daily routes:', err);
        setError('Failed to load daily routes.');
      } finally {
        setLoading(false);
      }
    };

    fetchDailyRoutes();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: '100%', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  
  if (routes.length === 0) {
    return (
        <Box sx={{ p: 3 }}>
            <Typography>No se encontraron rutas para la fecha de hoy.</Typography>
      </Box>
    );
  }

  const chartData = routes.map((route) => ({
    name: route.vehicle_plate,
    "Visitas": route.total_visits,
    "Distancia (km)": parseFloat(route.total_distance_km),
  }));

  return (
    <Box sx={{ p: 2 }}>
      {/* Chart Section */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 75 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                interval={0}
                style={{ fontSize: '0.9rem' }}
            />
            <YAxis yAxisId="left" orientation="left" stroke="#F40009" />
            <YAxis yAxisId="right" orientation="right" stroke="#007bff" />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar yAxisId="left" dataKey="Visitas" fill="#F40009">
                <LabelList dataKey="Visitas" position="top" style={{ fill: '#F40009' }} formatter={(value) => value === 0 ? '' : value} />
            </Bar>
            <Bar yAxisId="right" dataKey="Distancia (km)" fill="#007bff">
                <LabelList dataKey="Distancia (km)" position="top" style={{ fill: '#007bff' }} formatter={(value) => value === 0 ? '' : value} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Table Section */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Vehículo</TableCell>
              <TableCell align="right">Conductor</TableCell>
              <TableCell align="right">Estado</TableCell>
              <TableCell align="right">Visitas</TableCell>
              <TableCell align="right">Distancia (km)</TableCell>
              <TableCell align="right">Duración Est.</TableCell>
              <TableCell align="right">Hora Inicio Real</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map((route, index) => (
              <TableRow
                key={route.id}
                sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1a1a1a' : '#e9ecef',
                    }
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell component="th" scope="row">
                  {route.vehicle_plate || 'N/A'}
                </TableCell>
                <TableCell align="right">{route.driver_name || 'N/A'}</TableCell>
                <TableCell align="right">{route.status || 'N/A'}</TableCell>
                <TableCell align="right">{route.total_visits || 0}</TableCell>
                <TableCell align="right">{route.total_distance_km}</TableCell>
                <TableCell align="right">{route.total_duration || 'N/A'}</TableCell>
                <TableCell align="right">{route.real_start_time_formatted}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default DailyRouteReport;