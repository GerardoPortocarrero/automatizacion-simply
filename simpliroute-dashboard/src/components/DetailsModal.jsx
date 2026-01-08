import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Helper component for recursive rendering of details
const RenderDetailValue = ({ label, value, level = 0 }) => {
  const theme = useTheme();
  const indent = level * 2; // Indentation for nested levels

  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Skip null, undefined, or empty string values for cleaner display
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Handle objects recursively
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // If it's a simple object with a known display property, show that instead of recursing
    if (value.url && typeof value.url === 'string') {
        return (
            <Grid item xs={12} key={label}>
                <Box display="flex" ml={indent}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '120px', color: theme.palette.text.secondary }}>
                        {formatKey(label)}:
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary, flexGrow: 1 }}>
                        <Link href={value.url} target="_blank" rel="noopener">{value.url}</Link>
                    </Typography>
                </Box>
            </Grid>
        );
    }
    // Recursive call for general objects
    return (
      <Grid item xs={12} key={label}>
        <Box ml={indent}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            {formatKey(label)}:
          </Typography>
          <Box sx={{ borderLeft: `1px solid ${theme.palette.divider}`, ml: 1, pl: 1 }}>
            {Object.entries(value).map(([subKey, subValue]) => (
              <RenderDetailValue key={subKey} label={subKey} value={subValue} level={level + 1} />
            ))}
          </Box>
        </Box>
      </Grid>
    );
  }

  // Handle arrays recursively
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <Grid item xs={12} key={label}>
          <Box display="flex" ml={indent}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '120px', color: theme.palette.text.secondary }}>
              {formatKey(label)}:
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, flexGrow: 1 }}>
              [Vacío]
            </Typography>
          </Box>
        </Grid>
      );
    }
    return (
      <Grid item xs={12} key={label}>
        <Box ml={indent}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            {formatKey(label)} ({value.length} elementos):
          </Typography>
          <Box sx={{ borderLeft: `1px solid ${theme.palette.divider}`, ml: 1, pl: 1 }}>
            {value.map((item, index) => (
              <RenderDetailValue key={`${label}-${index}`} label={`[${index}]`} value={item} level={level + 1} />
            ))}
          </Box>
        </Box>
      </Grid>
    );
  }

  // Handle primitive values
  return (
    <Grid item xs={12} key={label}>
      <Box display="flex" ml={indent}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '120px', color: theme.palette.text.secondary }}>
          {formatKey(label)}:
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, flexGrow: 1 }}>
          {String(value)}
        </Typography>
      </Box>
    </Grid>
  );
};

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
      <DialogContent sx={{ paddingY: 2, paddingX: 3 }}>
        {data ? (
          <Grid container spacing={1}>
            {Object.entries(data).map(([key, value]) => (
              <RenderDetailValue key={key} label={key} value={value} />
            ))}
          </Grid>
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