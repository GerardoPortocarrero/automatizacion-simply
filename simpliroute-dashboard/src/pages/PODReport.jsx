import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Grid, Alert } from '@mui/material';
import api from '../services/api';

function PODReport() {
  const [loading, setLoading] = useState(true);
  const [podData, setPodData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPODData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const visitsResponse = await api.get('/v1/routes/visits/');
        const allVisits = visitsResponse.data.results || visitsResponse.data || [];
        console.log("Todas las visitas obtenidas:", allVisits); // Log para todas las visitas

        // Filtrar y procesar visitas con información de POD
        const processedPODs = allVisits
          .filter(visit => (visit.pictures && visit.pictures.length > 0) || visit.signature)
          .map(visit => ({
            visit_id: visit.id,
            client_name: visit.title || `Visita ${visit.id}`,
            address: visit.address || 'N/A',
            status: visit.status || 'N/A',
            // Tomar la primera imagen del array si existe
            image_url: (visit.pictures && visit.pictures.length > 0) ? visit.pictures[0].url : null,
            signature_url: visit.signature ? visit.signature.url : null,
            notes: visit.notes || 'Sin notas',
          }));
        
        console.log("Visitas con POD procesadas:", processedPODs); // Log para las visitas filtradas
        setPodData(processedPODs);

      } catch (err) {
        console.error('Error fetching POD data:', err);
        if (err.response) {
          console.error('Data:', err.response.data);
          console.error('Status:', err.response.status);
          console.error('Headers:', err.response.headers);
          setError(`Error ${err.response.status}: ${err.response.data.detail || 'Failed to load Proof of Delivery data.'}`);
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

    fetchPODData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando Reporte de Prueba de Entrega (POD)...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Reporte de Prueba de Entrega (POD)</Typography>
            <Alert severity="error">{error}</Alert>
        </Box>
    );
  }

  if (podData.length === 0) {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Reporte de Prueba de Entrega (POD)</Typography>
            <Typography>No se encontraron datos de Pruebas de Entrega.</Typography>
        </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reporte de Prueba de Entrega (POD)</Typography>

      {podData.length === 0 ? (
        <Typography>No se encontraron datos de Pruebas de Entrega.</Typography>
      ) : (
        <React.Fragment> {/* <-- Fragmento añadido aquí */}
          {/* Gallery View for Images */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Imágenes y Firmas de Entrega</Typography>
          <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
            <Grid container spacing={2}>
              {podData.filter(item => item.image_url || item.signature_url).map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.visit_id}>
                  <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 1 }}>
                    <Typography variant="subtitle1">Visita ID: {item.visit_id}</Typography>
                    <Typography variant="body2">Cliente: {item.client_name}</Typography>
                    {item.image_url && (
                      <Box mt={1}>
                        <Typography variant="body2">Imagen de Entrega:</Typography>
                        <img src={item.image_url} alt={`POD ${item.visit_id}`} style={{ maxWidth: '100%', height: 'auto' }} />
                      </Box>
                    )}
                    {item.signature_url && (
                      <Box mt={1}>
                        <Typography variant="body2">Firma:</Typography>
                        <img src={item.signature_url} alt={`Signature ${item.visit_id}`} style={{ maxWidth: '100%', height: 'auto' }} />
                      </Box>
                    )}
                    {item.notes && item.notes !== 'Sin notas' && (
                      <Box mt={1}>
                        <Typography variant="body2">Notas: {item.notes}</Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              ))}
              {podData.filter(item => item.image_url || item.signature_url).length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary">No hay imágenes o firmas de entrega disponibles.</Typography>
                  </Grid>
                )}
            </Grid>
          </Paper>


          {/* Table Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Detalle de Pruebas de Entrega</Typography>
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 650 }} aria-label="pod report table">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente/Visita</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Firma</TableCell>
                  <TableCell>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {podData.map((data) => (
                  <TableRow
                    key={data.visit_id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">{data.client_name}</TableCell>
                    <TableCell>{data.address}</TableCell>
                    <TableCell>{data.status}</TableCell>
                    <TableCell>
                      {data.image_url ? (
                        <Link href={data.image_url} target="_blank" rel="noopener">Ver Imagen</Link>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {data.signature_url ? (
                        <Link href={data.signature_url} target="_blank" rel="noopener">Ver Firma</Link>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>{data.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </React.Fragment>
      )}
    </Box>
  );
}

export default PODReport;
