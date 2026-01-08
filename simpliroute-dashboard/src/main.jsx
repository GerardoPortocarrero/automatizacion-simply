import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { FleetProvider } from './context/FleetContext.jsx';

// Define the new color palette based on the design guide
const theme = createTheme({
  palette: {
    mode: 'dark', // Set dark theme as default
    primary: {
      main: '#F40009', // Rojo Primario
      dark: '#c00007', // Rojo Oscuro (Hover)
    },
    secondary: {
      main: '#6c757d', // Gris Medio
    },
    background: {
      default: '#111111',
      paper: '#111111', // Set paper to the same as default
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#a0a0a0',
    },
    divider: '#333333', // Used for borders
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontWeightRegular: 400,
    lineHeight: 1.5,
  },
  components: {
    // Global override for sharp edges and no shadows
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          textTransform: 'none', // Keep button text casing as is
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                borderRadius: 0,
                boxShadow: 'none',
            }
        }
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                borderRadius: 0,
                boxShadow: 'none',
            }
        }
    },
    // Style for form inputs (TextFields)
    MuiInputBase: {
        styleOverrides: {
            root: {
                backgroundColor: '#1a1a1a', // Fondo Secundario/Alternativo
                '&:before': {
                    borderBottom: '1px solid #333333 !important',
                },
                '&:hover:not(.Mui-disabled):before': {
                    borderBottom: '1px solid #F40009 !important',
                },
                '&.Mui-focused:after': {
                    borderBottom: '2px solid #F40009',
                }
            }
        }
    },
     MuiInput: { // Specifically for standard variant
        styleOverrides: {
            root: {
                '&:before': {
                    borderBottom: '1px solid #333333',
                },
                 '&:hover:not(.Mui-disabled):before': {
                    borderBottom: '1px solid #F40009',
                },
            }
        }
     },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FleetProvider>
        <App />
      </FleetProvider>
    </ThemeProvider>
  </React.StrictMode>,
);