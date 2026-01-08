import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from '@mui/material';
import api from '../services/api';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function FinancialReport() {
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create a new axios instance for the datamart endpoint
        const datamartApi = axios.create({
            baseURL: 'https://api-gateway.simpliroute.com/datamart',
            headers: {
                'Authorization': `Token d2b82e15b3671a6038ccbf76e582c3f755355684`, // The API Key
                'Content-Type': 'application/json',
            },
        });

        // Fetch financial data (e.g., invoices).
        const invoicesResponse = await datamartApi.get('/v1/invoices');
        const allInvoices = invoicesResponse.data.results || invoicesResponse.data || [];

        const processedInvoices = allInvoices.map(invoice => ({
          id: invoice.id,
          date: invoice.date || 'N/A',
          amount: invoice.total_amount || 0,
          status: invoice.status || 'N/A',
        }));

        setFinancialData(processedInvoices);

      } catch (err) {
        console.error('Error fetching financial data:', err);
        if (err.response && err.response.status === 401) {
            setError('Error de Permiso: Tu token de API no tiene los permisos necesarios para acceder a los datos financieros del Datamart.');
        } else if (err.response) {
          setError(`Error ${err.response.status}: ${err.response.data.detail || 'Failed to load financial data.'}`);
        } else if (err.request) {
          setError('No response from server. Check your network connection.');
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando Reporte Financiero...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Reporte Financiero</Typography>
            <Alert severity="error">
                {error}
            </Alert>
      </Box>
    );
  }

  // Aggregate data for the chart: total amount over time
  const chartData = financialData.sort((a, b) => new Date(a.date) - new Date(b.date)).map((invoice, index) => ({
    name: invoice.date,
    'Monto Total': invoice.amount,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reporte Financiero</Typography>
      
      {financialData.length === 0 ? (
        <Typography>No se encontraron datos financieros.</Typography>
      ) : (
        <>
          {/* Chart Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Monto Total de Facturas a lo largo del Tiempo</Typography>
          <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
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
                <Line type="monotone" dataKey="Monto Total" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Table Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Detalle de Facturas</Typography>
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 650 }} aria-label="financial report table">
              <TableHead>
                <TableRow>
                  <TableCell>ID Factura</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="right">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {financialData.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell align="right">${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell align="right">{invoice.status}</TableCell>
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

export default FinancialReport;
