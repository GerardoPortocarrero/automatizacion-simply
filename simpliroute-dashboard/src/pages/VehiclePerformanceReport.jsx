import React, { useState, useMemo, useEffect } from 'react'; // Added comment to force re-compilation
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Alert } from '@mui/material';
import { useFleet } from '../context/FleetContext';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '@mui/material/styles';
import DetailsModal from '../components/DetailsModal';

function VehiclePerformanceReport() {
  const { vehicles, loading: fleetLoading } = useFleet();
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVisitsData = async () => {
      try {
        setVisitsLoading(true);
        const response = await api.get('/v1/routes/visits/');
        setVisits(response.data.results || response.data || []);
      } catch (err) {
        setError('Failed to load visit data.');
      } finally {
        setVisitsLoading(false);
      }
    };
    fetchVisitsData();
  }, []);

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRecord(null);
  };

  const performanceData = useMemo(() => {
    if (fleetLoading || visitsLoading) {
      return [];
    }

    const load3ByVehicle = visits.reduce((acc, visit) => {
      if (visit.vehicle && visit.load_3) {
        acc[visit.vehicle] = (acc[visit.vehicle] || 0) + visit.load_3;
      }
      return acc;
    }, {});

    const loadByVehicle = visits.reduce((acc, visit) => {
      if (visit.vehicle && visit.load) { 
        acc[visit.vehicle] = (acc[visit.vehicle] || 0) + (visit.load);
      }
      return acc;
    }, {});

    return vehicles.map(vehicle => ({
      ...vehicle,
      name: vehicle.name || 'N/A',
      Capacidad: vehicle.capacity || 0,
      CF: parseFloat((load3ByVehicle[vehicle.id] || 0).toFixed(2)),
      PESO: parseFloat((loadByVehicle[vehicle.id] || 0).toFixed(2)),
    }));
  }, [vehicles, visits, fleetLoading, visitsLoading]);

  // Added console.log for debugging purposes. Will be removed once the ReferenceError is resolved.
  const filteredPerformanceData = useMemo(() => {
    return performanceData.filter(vehicle =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [performanceData, searchTerm]);

  const pieChartData = useMemo(() => {
    const vehiclesWithCU = filteredPerformanceData.filter(v => v.PESO > 0); // Filter for PESO > 0

    const totalCU = vehiclesWithCU.reduce((sum, v) => sum + v.PESO, 0);
    const totalCapacity = vehiclesWithCU.reduce((sum, v) => sum + v.Capacidad, 0);

    if (totalCapacity === 0) {
        return [{ name: 'Sin Datos', value: 100, color: '#cccccc' }]; // Grey for no data
    }

    const usedPercentage = (totalCU / totalCapacity) * 100;
    const remainingPercentage = 100 - usedPercentage;

    return [
        { name: 'Capacidad Usada (PESO)', value: parseFloat(usedPercentage.toFixed(2)), color: '#ffc107' }, // Orange for PESO
        { name: 'Capacidad Disponible', value: parseFloat(remainingPercentage.toFixed(2)), color: '#36A2EB' }, // Blue for remaining
    ];
  }, [filteredPerformanceData]);


  if (fleetLoading || visitsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: '100%', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (vehicles.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No se encontraron vehículos.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chart Section */}
      <Box sx={{ flex: '0 1 45%', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Paper elevation={3} sx={{ flex: '0 1 30%', backgroundColor: 'transparent', backgroundImage: 'none' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20 }}>
              <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '10px' }} />
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
        <Paper elevation={3} sx={{ flex: '0 1 70%', backgroundColor: 'transparent', backgroundImage: 'none' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredPerformanceData}
              margin={{ top: 20, right: 20, left: 20, bottom: 75 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0}
                  style={{ fontSize: '0.9rem' }}
                  axisLine={{ stroke: theme.palette.text.primary }} tick={{ fill: theme.palette.text.primary }}
              />
              <YAxis
                  axisLine={{ stroke: theme.palette.text.primary }} 
                  tick={{ fill: theme.palette.text.primary }} 
                  domain={[0, dataMax => Math.round(dataMax * 1.1)]} 
              />
              <Tooltip />
              <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '10px' }} />
              <Bar dataKey="Capacidad" fill={theme.palette.primary.main}>
                  <LabelList dataKey="Capacidad" position="top" style={{ fill: theme.palette.primary.main }} formatter={(value) => value === 0 ? '' : value} />
              </Bar>
              <Bar dataKey="CF" fill="#28a745"> {/* Green for CF */}
                  <LabelList dataKey="CF" position="top" style={{ fill: '#28a745' }} formatter={(value) => value === 0 ? '' : value} />
              </Bar>
              <Bar dataKey="PESO" fill="#ffc107"> {/* Orange for PESO */}
                  <LabelList dataKey="PESO" position="top" style={{ fill: '#ffc107' }} formatter={(value) => value === 0 ? '' : value} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Table Section */}
      <Box sx={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Filter and Search Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 2, flexShrink: 0 }}>
            <TextField
                label="Buscar por Placa"
                variant="outlined"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                sx={{ flexGrow: 1 }}
            />
        </Box>

        <TableContainer component={Paper} elevation={3} sx={{ flexGrow: 1, overflow: 'auto', backgroundColor: 'transparent', backgroundImage: 'none' }}>
            <Table sx={{ minWidth: 650 }} aria-label="vehicle performance table" stickyHeader>
            <TableHead>
                <TableRow>
                <TableCell>Placa</TableCell>
                <TableCell align="right">Capacidad</TableCell>
                <TableCell align="right">CF</TableCell>
                <TableCell align="right">PESO</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredPerformanceData.map((vehicle, index) => (
                <TableRow
                    key={vehicle.id}
                    sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1a1a1a' : '#e9ecef',
                        }
                    }}
                    onClick={() => handleRowClick(vehicle)}
                >
                    <TableCell component="th" scope="row">{vehicle.name}</TableCell>
                    <TableCell align="right">{vehicle.Capacidad}</TableCell>
                    <TableCell align="right">{vehicle.CF}</TableCell>
                    <TableCell align="right">{vehicle.PESO}</TableCell>
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

export default VehiclePerformanceReport;