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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  LabelList,
} from "recharts";
import api from "../services/api";
import { useFleet } from "../context/FleetContext";
import DetailsModal from '../components/DetailsModal';
import { useTheme } from '@mui/material/styles'; // Import useTheme

// Define colors for the statuses
const STATUS_COLORS = {
  'Satisfactorio': '#00C49F',
  'Pendiente': '#FFBB28',
  'Fallida': '#FF0000',
};

function OnTimeDeliveryReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visits, setVisits] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const theme = useTheme(); // Use theme here

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

        if (words.length >= 3) {
          const lastName = words[0];
          const firstName = words[2];
          chartDriverName = `${firstName} ${lastName}`;
        } else if (words.length === 2) {
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

  const filteredDetails = useMemo(() => {
    if (!reportData) return [];
    return reportData.details.filter(detail => {
      const searchTermLower = searchTerm.toLowerCase();
      const clientMatch = detail.title.toLowerCase().includes(searchTermLower);
      const addressMatch = detail.address.toLowerCase().includes(searchTermLower);
      const driverMatch = detail.driverName.toLowerCase().includes(searchTermLower);
      const vehicleMatch = detail.vehiclePlate.toLowerCase().includes(searchTermLower);
      const statusMatch = statusFilter === '' || detail.status === statusFilter;
      
      return (clientMatch || addressMatch || driverMatch || vehicleMatch) && statusMatch;
    });
  }, [reportData, searchTerm, statusFilter]);

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRecord(null); // Clear selected record on close
  };

  if (loading || fleetLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: '100%', height: '100%' }}>
        <CircularProgress />
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
  
  const uniqueStatuses = Object.keys(STATUS_COLORS);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Summary Statistics */}
      <Paper elevation={3} sx={{ mb: 2, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', backgroundColor: 'transparent', backgroundImage: 'none', flexShrink: 0 }}>
        <Box textAlign="center" m={1}><Typography variant="h6">Total</Typography><Typography variant="h5">{reportData.totalVisits}</Typography></Box>
        <Box textAlign="center" m={1}><Typography variant="h6">Satisfactorio</Typography><Typography variant="h5" sx={{ color: STATUS_COLORS['Satisfactorio'] }}>{reportData.satisfactoryVisits}</Typography></Box>
        <Box textAlign="center" m={1}><Typography variant="h6">Pendiente</Typography><Typography variant="h5" sx={{ color: STATUS_COLORS['Pendiente'] }}>{reportData.pendingVisits}</Typography></Box>
        <Box textAlign="center" m={1}><Typography variant="h6">Fallida</Typography><Typography variant="h5" sx={{ color: STATUS_COLORS['Fallida'] }}>{reportData.failedVisits}</Typography></Box>
      </Paper>
      
      {/* Charts Section */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} mb={2} sx={{ flex: '0 1 40%' }}>
        <Paper elevation={3} sx={{ p: 2, flex: 1, backgroundColor: 'transparent', backgroundImage: 'none' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 40 }}>
              <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '10px' }} />
              <Pie 
                data={pieChartData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                labelLine={false}
                label={({ value }) => value === 0 ? '' : value}
              >
                {pieChartData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
        <Paper elevation={3} sx={{ p: 2, flex: 2, backgroundColor: 'transparent', backgroundImage: 'none' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData.driverPerformance} layout="vertical" margin={{ top: 40, right: 30, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                unit=" visitas" 
                axisLine={{ stroke: theme.palette.text.primary }} 
                tick={{ fill: theme.palette.text.primary }} 
                domain={[0, dataMax => Math.round(dataMax * 1.1)]}
              />
              <YAxis type="category" dataKey="driver" width={180} interval={0} axisLine={{ stroke: theme.palette.text.primary }} tick={{ fill: theme.palette.text.primary }} />
              <Tooltip />
              <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '10px' }} />
              <Bar dataKey="Satisfactorio" stackId="a" fill={STATUS_COLORS['Satisfactorio']}>
                <LabelList dataKey="Satisfactorio" position="center" style={{ fill: 'white' }} formatter={(value) => value === 0 ? '' : value} />
              </Bar>
              <Bar dataKey="Pendiente" stackId="a" fill={STATUS_COLORS['Pendiente']}>
                <LabelList dataKey="Pendiente" position="center" style={{ fill: 'black' }} formatter={(value) => value === 0 ? '' : value} />
              </Bar>
              <Bar dataKey="Fallida" stackId="a" fill={STATUS_COLORS['Fallida']}>
                <LabelList dataKey="Fallida" position="center" style={{ fill: 'white' }} formatter={(value) => value === 0 ? '' : value} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Table Section */}
      <Box sx={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Filter and Search Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexShrink: 0 }}>
            <TextField
                label="Buscar por Cliente, Dirección, Conductor o Vehículo"
                variant="outlined"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Estado</InputLabel>
                <Select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    label="Filtrar por Estado"
                >
                    <MenuItem value="">Todos</MenuItem>
                    {uniqueStatuses.map(status => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>

        <TableContainer component={Paper} elevation={3} sx={{ flexGrow: 1, overflow: 'auto', backgroundColor: 'transparent', backgroundImage: 'none' }}>
            <Table sx={{ minWidth: 650 }} stickyHeader>
            <TableHead>
                <TableRow>
                <TableCell>N°</TableCell>
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
                {filteredDetails.map((detail, index) => (
                <TableRow key={detail.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }} onClick={() => handleRowClick(detail)}>
                    <TableCell>{index + 1}</TableCell>
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
      <DetailsModal open={openModal} onClose={handleCloseModal} data={selectedRecord} />
    </Box>
  );
}

export default OnTimeDeliveryReport;
