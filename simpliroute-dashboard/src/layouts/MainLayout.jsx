import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, CssBaseline, IconButton } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { FaTachometerAlt, FaTruck, FaClock, FaSun, FaMoon } from 'react-icons/fa';
import logo from '/src/assets/logo.png';

const drawerWidth = 240;

const Root = styled(Box)({
  display: 'flex',
});

const DrawerStyled = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  [`& .MuiDrawer-paper`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.default,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const Content = styled(Box)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
});

const menuItems = [
  { text: 'Ruta Diaria', path: '/daily-route', icon: <FaTachometerAlt /> },
  { text: 'Rendimiento de Vehículos', path: '/vehicle-performance', icon: <FaTruck /> },
  { text: 'Reporte de Entregas', path: '/on-time-delivery', icon: <FaClock /> },
];

function MainLayout() {
  const theme = useTheme();

  return (
    <Root>
      <CssBaseline />
      <DrawerStyled variant="permanent">
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h5" noWrap>SimplyAYA</Typography>
        </Toolbar>
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton 
                key={item.text} 
                component={NavLink} 
                to={item.path}
                sx={{
                    '&.active': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '& .MuiListItemIcon-root': { color: theme.palette.primary.contrastText },
                        // Ensure active state hover doesn't change color
                        '&:hover': {
                            backgroundColor: theme.palette.primary.main, // Keep active background on hover
                            color: theme.palette.primary.contrastText, // Keep active text color on hover
                            '& .MuiListItemIcon-root': { color: theme.palette.primary.contrastText }, // Keep active icon color on hover
                        }
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: theme.palette.text.primary,
                        '& .MuiListItemIcon-root': { color: theme.palette.text.primary },
                    }
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.text.secondary }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </DrawerStyled>
      <Content component="main">
        {/* Header now uses a simple Box component as requested */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            paddingY: 1,
            paddingX: 2,
            borderBottom: `2px solid ${theme.palette.divider}`, // Separation with border
          }}
        >
            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                <img src={logo} alt="Logo Empresa" style={{ height: '40px' }} />
            </Box>
            <IconButton sx={{ position: 'absolute', right: 16 }}>
                <FaSun />
            </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto', padding: 3 }}>
            <Outlet />
        </Box>
      </Content>
    </Root>
  );
}

export default MainLayout;
