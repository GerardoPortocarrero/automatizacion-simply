import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from '@mui/material';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ClientVisitHistoryReport() {
  const [loading, setLoading] = useState(true);
  const [clientVisitData, setClientVisitData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientVisitHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch clients and visits data from the correct endpoints
        const [clientsResponse, visitsResponse] = await Promise.all([
          api.get('/v1/accounts/clients/'),
          api.get('/v1/routes/visits/')
        ]);

        const clients = clientsResponse.data.results || clientsResponse.data || [];
        const visits = visitsResponse.data.results || visitsResponse.data || [];

        // Map visits to clients
        const clientVisits = visits.map(visit => {
          // El ID del cliente en el objeto de visita no está claro en el log.
          // Intentaremos con visit.client o visit.account, o usaremos el title.
          const client = clients.find(c => c.id === (visit.client_id || visit.client || visit.account));
          
          return {
            visit_id: visit.id,
            client_name: client ? client.name : (visit.title || `Cliente Desconocido`),
            visit_date: visit.planned_date || 'N/A',
            items_delivered: visit.items ? visit.items.length : 0, // Esto sigue siendo una suposición
            driver_name: visit.driver ? `Driver ${visit.driver}` : 'N/A', // Usando el ID si no hay nombre
            address: visit.address || 'N/A',
            status: visit.status || 'N/A',
          };
        });

        setClientVisitData(clientVisits);

      } catch (err) {
        console.error('Error fetching client visit history:', err);
        if (err.response && err.response.status === 401) {
            setError('Error de Permiso: Tu token de API no tiene los permisos necesarios para acceder a los datos de clientes.');
        } else if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.data.detail || 'Failed to load client visit history.'}`);
        } else if (err.request) {
          setError('No response from server. Check your network connection.');
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClientVisitHistory();
  }, []);

  if (loading) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>Cargando Historial de Visitas por Cliente...</Typography>
        </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Historial de Visitas por Cliente</Typography>
            <Alert severity="error">
                {error}
            </Alert>
      </Box>
    );
  }

  // Aggregate data for the chart: visits per client
  const visitsPerClient = clientVisitData.reduce((acc, visit) => {
    acc[visit.client_name] = (acc[visit.client_name] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(visitsPerClient).map(([name, visits]) => ({
    name,
    visits,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Historial de Visitas por Cliente</Typography>

      {clientVisitData.length === 0 ? (
        <Typography>No se encontraron datos de visitas de clientes.</Typography>
      ) : (
        <>
          {/* Chart Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Número de Visitas por Cliente</Typography>
          <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visits" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Table Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Detalle del Historial de Visitas</Typography>
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 650 }} aria-label="client visit history table">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Fecha de Visita</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Conductor (ID)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientVisitData.map((data) => (
                  <TableRow
                    key={data.visit_id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{data.client_name}</TableCell>
                    <TableCell>{data.address}</TableCell>
                    <TableCell>{data.visit_date}</TableCell>
                    <TableCell>{data.status}</TableCell>
                    <TableCell align="right">{data.driver_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}

export default ClientVisitHistoryReport;
