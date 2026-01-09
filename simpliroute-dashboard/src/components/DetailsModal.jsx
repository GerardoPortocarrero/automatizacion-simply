import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box , Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';


function DetailsModal({ open, onClose, data }) {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: theme.palette.background.default, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingY: 1,
        paddingX: 2,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 400, lineHeight: 1.5, color: theme.palette.text.primary }}>
          Detalles del Registro
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ paddingY: 2, paddingX: 3, backgroundColor: theme.palette.background.default }}>
        {data ? (
          <Box sx={{ overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <pre style={{ margin: 0, color: theme.palette.text.primary }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </Box>
        ) : (
          <Typography>No hay datos para mostrar.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ 
        backgroundColor: theme.palette.background.default, 
        borderTop: `1px solid ${theme.palette.divider}`,
        padding: 1,
      }}>
        <Button onClick={onClose} color="primary" variant="contained">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default DetailsModal;