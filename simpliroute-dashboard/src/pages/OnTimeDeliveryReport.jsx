import React from "react";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import api from "../services/api";

const COLORS = ['#00C49F', '#FFBB28', '#FF8042']; // Green for On-Time, Yellow for Pending, Orange for Late

function OnTimeDeliveryReport() {
  const [loading, setLoading] = useState(true);
  const [deliveryStats, setDeliveryStats] = useState({
    totalVisits: 0,
    onTimeVisits: 0,
    lateVisits: 0,
    pendingVisits: 0,
    onTimePercentage: 0,
    details: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const visitsResponse = await api.get('/v1/routes/visits/');
        console.log('Respuesta de la API para Entregas a Tiempo:', visitsResponse.data); // Log para inspección
        const allVisits = visitsResponse.data.results || visitsResponse.data || [];

        let onTimeCount = 0;
        let lateCount = 0;
        let pendingCount = 0;
        const processedDetails = allVisits.map(visit => {
          let visitStatus = 'Pendiente'; // Estado por defecto
          
          if (visit.status === 'completed' && visit.checkout_time) {
            const plannedDate = visit.planned_date; // 'YYYY-MM-DD'
            const windowStart = visit.window_start; // 'HH:MM:SS'
            const windowEnd = visit.window_end; // 'HH:MM:SS'
            const checkoutTime = new Date(visit.checkout_time); // ISO string

            // Construir fechas completas para comparación
            const plannedStart = new Date(`${plannedDate}T${windowStart}`);
            const plannedEnd = new Date(`${plannedDate}T${windowEnd}`);
            
            if (checkoutTime <= plannedEnd) { // Asumiendo que start_time es informativo, el criterio es antes o en window_end
                visitStatus = 'A Tiempo';
            } else {
                visitStatus = 'Tarde';
            }
          } else if (visit.status === 'pending') {
              visitStatus = 'Pendiente';
          } else { // Si el status no es pending pero no está completed o no tiene checkout_time
              visitStatus = 'Desconocido'; // O "Pendiente" si no hay más info
          }

          if (visitStatus === 'A Tiempo') onTimeCount++;
          else if (visitStatus === 'Tarde') lateCount++;
          else pendingCount++;

          // Construir URL de Google Maps
          const googleMapsUrl = (visit.latitude && visit.longitude) 
            ? `https://www.google.com/maps/search/?api=1&query=${visit.latitude},${visit.longitude}`
            : null;

          return {
            id: visit.id,
            title: visit.title || `Visita ${visit.id}`,
            address: visit.address || 'N/A',
            driver_id: visit.driver || 'N/A', // Mostrar ID del driver por ahora
            vehicle_id: visit.vehicle || 'N/A', // Mostrar ID del vehículo por ahora
            load_3: visit.load_3 || 0,
            latitude: visit.latitude || 'N/A',
            longitude: visit.longitude || 'N/A',
            googleMapsUrl: googleMapsUrl,
            status: visitStatus, // Usar el status calculado
            planned_date: visit.planned_date || 'N/A',
            planned_window: `${visit.window_start || 'N/A'} - ${visit.window_end || 'N/A'}`,
            checkout_time: visit.checkout_time ? new Date(visit.checkout_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          };
        });

        const total = allVisits.length;
        const onTimePct = total > 0 ? (onTimeCount / total) * 100 : 0;

        setDeliveryStats({
          totalVisits: total,
          onTimeVisits: onTimeCount,
          lateVisits: lateCount,
          pendingVisits: pendingCount,
          onTimePercentage: onTimePct,
          details: processedDetails,
        });

      } catch (err) {
        console.error('Error fetching delivery data:', err);
        if (err.response) {
          console.error('Data:', err.response.data);
          console.error('Status:', err.response.status);
          console.error('Headers:', err.response.headers);
          setError(`Error ${err.response.status}: ${err.response.data.detail || 'Failed to load on-time delivery data.'}`);
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

    fetchDeliveryData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando Reporte de Entregas a Tiempo...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Reporte de Entregas a Tiempo</Typography>
            <Alert severity="error">{error}</Alert>
        </Box>
    );
  }

  const chartData = [
    { name: 'A Tiempo', value: deliveryStats.onTimeVisits, color: COLORS[0] },
    { name: 'Tarde', value: deliveryStats.lateVisits, color: COLORS[2] },
    { name: 'Pendiente', value: deliveryStats.pendingVisits, color: COLORS[1] },
  ];

  if (deliveryStats.details.length === 0) {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Reporte de Entregas a Tiempo</Typography>
            <Typography>No se encontraron datos de visitas.</Typography>
        </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reporte de Entregas a Tiempo</Typography>

      {/* Summary Statistics */}
      <Paper elevation={3} sx={{ p: 2, mb: 4, display: 'flex', justifyContent: 'space-around' }}>
        <Box textAlign="center">
          <Typography variant="h6">Total de Visitas</Typography>
          <Typography variant="h5" color="primary">{deliveryStats.totalVisits}</Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6">A Tiempo</Typography>
          <Typography variant="h5" sx={{ color: COLORS[0] }}>{deliveryStats.onTimeVisits}</Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6">Tarde</Typography>
          <Typography variant="h5" sx={{ color: COLORS[2] }}>{deliveryStats.lateVisits}</Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6">Pendiente</Typography>
          <Typography variant="h5" sx={{ color: COLORS[1] }}>{deliveryStats.pendingVisits}</Typography>
        </Box>
      </Paper>
      
      {/* Chart Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Distribución de Entregas</Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>

      {/* Table Section */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Detalle de Visitas</Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="on-time delivery table">
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Conductor (ID)</TableCell>
              <TableCell>Vehículo (ID)</TableCell>
              <TableCell align="right">Carga</TableCell>
              <TableCell>Ver en Mapa</TableCell>
              <TableCell align="right">Estado</TableCell>
              <TableCell>Ventana Horaria</TableCell>
              <TableCell>Hora Checkout</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveryStats.details.map((detail) => (
              <TableRow
                key={detail.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">{detail.title}</TableCell>
                <TableCell>{detail.address}</TableCell>
                <TableCell>{detail.driver_id}</TableCell>
                <TableCell>{detail.vehicle_id}</TableCell>
                <TableCell align="right">{detail.load_3}</TableCell>
                <TableCell>
                  {detail.googleMapsUrl ? (
                    <Link href={detail.googleMapsUrl} target="_blank" rel="noopener">Abrir Mapa</Link>
                  ) : 'N/A'}
                </TableCell>
                <TableCell align="right">{detail.status}</TableCell>
                <TableCell>{detail.planned_window}</TableCell>
                <TableCell>{detail.checkout_time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default OnTimeDeliveryReport;
