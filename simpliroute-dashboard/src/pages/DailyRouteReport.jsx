import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DailyRouteReport() {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDailyRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().slice(0, 10);

        // 1. Obtener vehículos con sus rutas simplificadas
        const response = await api.get(`/v1/plans/${today}/vehicles/`);
        

        
        let simplifiedRoutes = [];
        if (response.data && Array.isArray(response.data)) {
            response.data.forEach(vehicle => {
                const vehicle_plate = vehicle.name || 'N/A';
                const driver_name = vehicle.driver ? vehicle.driver.name : 'N/A';

                if (vehicle.routes && Array.isArray(vehicle.routes)) { // Iterar sobre el array 'routes' del vehículo
                    vehicle.routes.forEach(route => {
                        simplifiedRoutes.push({
                            ...route, // Propiedades individuales de la ruta (id, plan_id, etc.)
                            vehicle_plate: vehicle_plate, // Placa del vehículo
                            driver_name: driver_name, // Nombre del conductor
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

        // 2. Para cada ruta simplificada, obtener sus detalles completos
        const routeDetailPromises = simplifiedRoutes.map(route =>
            api.get(`/v1/routes/routes/${route.id}/`)
        );
        
        const routeDetailResponses = await Promise.all(routeDetailPromises);

        console.log('Detalles completos de las rutas desde la API:', routeDetailResponses); // Log de los detalles


        // 3. Combinar la información
        const detailedRoutes = routeDetailResponses.map((detailResponse, index) => {
            const simplifiedRoute = simplifiedRoutes[index];
            const routeDetails = detailResponse.data;

            // Convertir total_distance de metros a kilómetros
            const distanceKm = routeDetails.total_distance ? (routeDetails.total_distance / 1000).toFixed(2) : 'N/A';
            
            // Formatear la hora de inicio real
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
                ...simplifiedRoute, // Contiene id, vehicle_plate, driver_name
                ...routeDetails, // Contiene status, reference, comment, etc.
                total_distance_km: distanceKm,
                real_start_time_formatted: realStartTime,
            };
        });
        
        setRoutes(detailedRoutes);

      } catch (err) {
        console.error('Error fetching daily routes:', err);
        if (err.response) {
          console.error('Data:', err.response.data);
          console.error('Status:', err.response.status);
          console.error('Headers:', err.response.headers);
          setError(`Error ${err.response.status}: ${err.response.data.detail || 'Failed to load daily routes.'}`);
        } else if (err.request) {
          console.error('Request:', err.request);
          setError('No response from server. Check your network connection.');
        } else {
          console.error('Error', err.message);
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDailyRoutes();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando Reporte de Ruta Diaria...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Reporte de Ruta Diaria</Typography>
            <Typography color="error">{error}</Typography>
        </Box>
    );
  }
  
  if (routes.length === 0) {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Reporte de Ruta Diaria</Typography>
            <Typography>No se encontraron rutas para la fecha de hoy.</Typography>
      </Box>
    );
  }

  // Crear datos para el gráfico usando los datos reales de la tabla
  const chartData = routes.map((route) => ({
    name: route.vehicle_plate, // Usar la placa del vehículo como etiqueta
    "Visitas": route.total_visits,
    "Distancia (km)": parseFloat(route.total_distance_km), // Asegurarse de que sea un número
  }));


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reporte de Ruta Diaria</Typography>
      
      {/* Chart Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Comparativa de Rutas: Visitas vs. Distancia</Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 75, // Aumentar margen inferior para las etiquetas
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
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Visitas', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Distancia (km)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar yAxisId="left" dataKey="Visitas" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="Distancia (km)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Table Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Detalle de Rutas</Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
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
            {routes.map((route) => (
              <TableRow
                key={route.id} // Mantener el key para React
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
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