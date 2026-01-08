import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, CssBaseline, IconButton, Paper } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { FaTachometerAlt, FaTruck, FaClock, FaSun, FaMoon } from 'react-icons/fa';
import logo from '/src/assets/logo.png'; // Using absolute path verified with glob

const drawerWidth = 240;

const Root = styled(Box)({
  display: 'flex',
});

const DrawerStyled = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  [`& .MuiDrawer-paper`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#1a1a1a',
    borderRight: '1px solid #333333',
  },
});

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
                    },
                    '&:hover': { backgroundColor: 'rgba(244, 0, 9, 0.1)' }
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
        {/* Header using simple sx props for reliability */}
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            paddingY: 1,
            paddingX: 2,
            marginBottom: 3,
            backgroundColor: 'transparent', // FINAL: As requested
            border: `2px solid ${theme.palette.divider}`,
          }}
        >
            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                <img src={logo} alt="Logo Empresa" style={{ height: '40px' }} />
            </Box>
            <IconButton sx={{ position: 'absolute', right: 16 }}>
                <FaSun />
            </IconButton>
        </Paper>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Outlet />
        </Box>
      </Content>
    </Root>
  );
}

export default MainLayout;
