import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useFleet } from '../context/FleetContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { useTheme } from '@mui/material/styles';
import DetailsModal from '../components/DetailsModal';

function VehiclePerformanceReport() {
  const { vehicles, loading: fleetLoading } = useFleet();
  const theme = useTheme();

  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRecord(null);
  };

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
            <Typography>No se encontraron vehículos.</Typography>
      </Box>
    );
  }

  const chartData = vehicles.map((vehicle) => ({
    name: vehicle.name,
    "Capacidad 1": vehicle.capacity,
    "Capacidad 2": vehicle.capacity_2,
  }));

  return (
    <Box sx={{ p: 2 }}>
      {/* Chart Section */}
      <Paper elevation={3} sx={{ mb: 2, backgroundColor: 'transparent', backgroundImage: 'none' }}>
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
                axisLine={{ stroke: theme.palette.text.primary }} tick={{ fill: theme.palette.text.primary }}
            />
            <YAxis axisLine={{ stroke: theme.palette.text.primary }} tick={{ fill: theme.palette.text.primary }} />
            <Tooltip />
            <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '10px' }} />
            <Bar dataKey="Capacidad 1" fill={theme.palette.primary.main}>
                <LabelList dataKey="Capacidad 1" position="top" style={{ fill: theme.palette.primary.main }} formatter={(value) => value === 0 ? '' : value} />
            </Bar>
            <Bar dataKey="Capacidad 2" fill="#007bff">
                <LabelList dataKey="Capacidad 2" position="top" style={{ fill: '#007bff' }} formatter={(value) => value === 0 ? '' : value} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Table Section */}
      <TableContainer component={Paper} elevation={3} sx={{ backgroundColor: 'transparent', backgroundImage: 'none' }}>
        <Table sx={{ minWidth: 650 }} aria-label="vehicle performance table">
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell align="right">Tipo de Carga</TableCell>
              <TableCell align="right">Capacidad 1</TableCell>
              <TableCell align="right">Capacidad 2</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle, index) => (
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
                <TableCell>{index + 1}</TableCell>
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

      <DetailsModal open={openModal} onClose={handleCloseModal} data={selectedRecord} />
    </Box>
  );
}

export default VehiclePerformanceReport;