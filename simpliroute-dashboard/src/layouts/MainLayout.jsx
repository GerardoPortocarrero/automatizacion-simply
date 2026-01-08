import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, CssBaseline, IconButton, Paper } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { FaTachometerAlt, FaTruck, FaClock } from 'react-icons/fa'; // Example icons

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
    backgroundColor: '#1a1a1a', // Fondo Secundario/Alternativo for sidebar
    borderRight: '1px solid #333333',
  },
});

const Content = styled(Box)({
  flexGrow: 1,
  padding: (theme) => theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
});

const Header = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.background.paper, // Uses theme background for paper
    border: `1px solid ${theme.palette.divider}`,
}));


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
            <Typography variant="h5" noWrap>
                SimplyAYA
            </Typography>
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
                        '& .MuiListItemIcon-root': {
                            color: theme.palette.primary.contrastText,
                        },
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(244, 0, 9, 0.1)',
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
        {/* The new thin header inside the content area */}
        <Header>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                Logo Empresa
            </Typography>
            {/* Placeholder for Theme Toggle Button */}
            <IconButton sx={{ position: 'absolute', right: 16 }}>
                {/* <FaSun /> or <FaMoon /> would go here */}
            </IconButton>
        </Header>
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Outlet />
        </Box>
      </Content>
    </Root>
  );
}

export default MainLayout;