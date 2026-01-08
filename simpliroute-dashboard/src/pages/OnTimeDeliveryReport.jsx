import React, { useEffect, useState, useMemo } from "react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import api from "../services/api";
import { useFleet } from "../context/FleetContext";

// Define colors for the statuses
const STATUS_COLORS = {
  'Satisfactorio': '#00C49F', // Green for satisfactory
  'Pendiente': '#FFBB28',
  'Fallida': '#FF0000',
};

function OnTimeDeliveryReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visits, setVisits] = useState([]);

  // Get driver and vehicle maps from the global context
  const { driverMap, vehicleMap, loading: fleetLoading } = useFleet();

  useEffect(() => {
    const fetchVisitsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/v1/routes/visits/');
        setVisits(response.data.results || response.data || []);
      } catch (err) {
        console.error("Error fetching visits data:", err);
        setError("Failed to load visit data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchVisitsData();
  }, []);

  // useMemo will re-calculate the report data only when visits, driverMap, or vehicleMap change.
  const reportData = useMemo(() => {
    if (fleetLoading) {
      return null;
    }

    let satisfactoryCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    const processedDetails = visits.map(visit => {
      let visitStatus = 'Fallida';

      if (visit.status === 'completed' && visit.checkout_time) {
        visitStatus = 'Satisfactorio';
      } else if (visit.status === 'pending') {
        visitStatus = 'Pendiente';
      }

      if (visitStatus === 'Satisfactorio') satisfactoryCount++;
      else if (visitStatus === 'Pendiente') pendingCount++;
      else failedCount++;

      const driverName = driverMap.get(visit.driver) || `ID: ${visit.driver}`;
      
      let chartDriverName = driverName;
      if (!driverName.startsWith('ID:')) {
        const nameParts = driverName.split('-');
        const nameOnly = (nameParts.length > 1 ? nameParts.slice(1).join('-') : nameParts[0]).trim();
        const words = nameOnly.split(' ').filter(Boolean);

        if (words.length >= 3) { // e.g., YUCRA SOTO ROBIN
          const lastName = words[0];
          const firstName = words[2];
          chartDriverName = `${firstName} ${lastName}`;
        } else if (words.length === 2) { // e.g., JOHN DOE
            chartDriverName = `${words[0]} ${words[1]}`;
        }
         else {
          chartDriverName = nameOnly;
        }
      }
      
      return {
        id: visit.id,
        title: visit.title || `Visita ${visit.id}`,
        address: visit.address || 'N/A',
        driverName: driverName,
        chartDriverName: chartDriverName,
        vehiclePlate: vehicleMap.get(visit.vehicle) || `ID: ${visit.vehicle}`,
        load: visit.load_3 || 0,
        googleMapsUrl: (visit.latitude && visit.longitude) 
          ? `https://www.google.com/maps/search/?api=1&query=${visit.latitude},${visit.longitude}`
          : null,
        status: visitStatus,
        checkout_time: visit.checkout_time ? new Date(visit.checkout_time).toLocaleTimeString('es-ES') : 'N/A',
      };
    });

    const performanceByDriver = processedDetails.reduce((acc, detail) => {
      const driver = detail.chartDriverName;
      if (!driver.startsWith('ID:')) { 
          if (!acc[driver]) {
            acc[driver] = { driver, 'Satisfactorio': 0, 'Pendiente': 0, 'Fallida': 0 };
          }
          if(acc[driver][detail.status] !== undefined) {
             acc[driver][detail.status]++;
          }
      }
      return acc;
    }, {});

    return {
      totalVisits: visits.length,
      satisfactoryVisits: satisfactoryCount,
      pendingVisits: pendingCount,
      failedVisits: failedCount,
      details: processedDetails,
      driverPerformance: Object.values(performanceByDriver),
    };
  }, [visits, driverMap, vehicleMap, fleetLoading]);

  if (loading || fleetLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando Datos del Reporte...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  
  if (!reportData || reportData.details.length === 0) {
    return <Typography>No se encontraron datos de visitas.</Typography>;
  }

  const pieChartData = [
    { name: 'Satisfactorio', value: reportData.satisfactoryVisits },
    { name: 'Pendiente', value: reportData.pendingVisits },
    { name: 'Fallida', value: reportData.failedVisits },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reporte de Entregas</Typography>

      {/* Summary Statistics */}
      <Paper elevation={3} sx={{ p: 2, mb: 4, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <Box textAlign="center" m={1}><Typography variant="h6">Total</Typography><Typography variant="h5">{reportData.totalVisits}</Typography></Box>
        <Box textAlign="center" m={1}><Typography variant="h6">Satisfactorio</Typography><Typography variant="h5" sx={{ color: STATUS_COLORS['Satisfactorio'] }}>{reportData.satisfactoryVisits}</Typography></Box>
        <Box textAlign="center" m={1}><Typography variant="h6">Pendiente</Typography><Typography variant="h5" sx={{ color: STATUS_COLORS['Pendiente'] }}>{reportData.pendingVisits}</Typography></Box>
        <Box textAlign="center" m={1}><Typography variant="h6">Fallida</Typography><Typography variant="h5" sx={{ color: STATUS_COLORS['Fallida'] }}>{reportData.failedVisits}</Typography></Box>
      </Paper>
      
      {/* Charts Section */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} mb={4}>
        <Paper elevation={3} sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom align="center">Distribución de Entregas</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                {pieChartData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
        <Paper elevation={3} sx={{ p: 2, flex: 2 }}>
          <Typography variant="h6" gutterBottom align="center">Rendimiento por Conductor</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.driverPerformance} layout="vertical" margin={{ right: 30, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="driver" width={180} interval={0} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Satisfactorio" stackId="a" fill={STATUS_COLORS['Satisfactorio']} />
              <Bar dataKey="Pendiente" stackId="a" fill={STATUS_COLORS['Pendiente']} />
              <Bar dataKey="Fallida" stackId="a" fill={STATUS_COLORS['Fallida']} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Table Section */}
      <Typography variant="h6" gutterBottom>Detalle de Visitas</Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Conductor</TableCell>
              <TableCell>Vehículo</TableCell>
              <TableCell align="right">Carga</TableCell>
              <TableCell>Ver en Mapa</TableCell>
              <TableCell align="right">Estado</TableCell>
              <TableCell>Hora Checkout</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.details.map((detail) => (
              <TableRow key={detail.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>{detail.title}</TableCell>
                <TableCell>{detail.address}</TableCell>
                <TableCell>{detail.driverName}</TableCell>
                <TableCell>{detail.vehiclePlate}</TableCell>
                <TableCell align="right">{detail.load}</TableCell>
                <TableCell>
                  {detail.googleMapsUrl ? <Link href={detail.googleMapsUrl} target="_blank">Ver Mapa</Link> : 'N/A'}
                </TableCell>
                <TableCell align="right"><span style={{ color: STATUS_COLORS[detail.status], fontWeight: 'bold' }}>{detail.status}</span></TableCell>
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
