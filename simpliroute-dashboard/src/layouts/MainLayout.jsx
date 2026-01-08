import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, Box, CssBaseline } from '@mui/material';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const Root = styled(Box)({
  display: 'flex',
});

const AppBarStyled = styled(AppBar)({
  zIndex: (theme) => theme.zIndex.drawer + 1,
});

const DrawerStyled = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  [`& .MuiDrawer-paper`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

const DrawerContainer = styled(Box)({
  overflow: 'auto',
});

const Content = styled(Box)({
  flexGrow: 1,
  padding: (theme) => theme.spacing(3),
});

function MainLayout() {
  return (
    <Root>
      <CssBaseline />
      <AppBarStyled position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            SimpliRoute Dashboard
          </Typography>
        </Toolbar>
      </AppBarStyled>
      <DrawerStyled variant="permanent" open>
        <Toolbar />
        <DrawerContainer>
          <List>
            {[
              { text: 'Ruta Diaria', path: '/daily-route' },
              { text: 'Rendimiento de Vehículos', path: '/vehicle-performance' },
              { text: 'Entregas a Tiempo', path: '/on-time-delivery' },
            ].map((item) => (
              <ListItemButton key={item.text} component={Link} to={item.path}>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </DrawerContainer>
      </DrawerStyled>
      <Content component="main">
        <Toolbar />
        <Outlet />
      </Content>
    </Root>
  );
}

export default MainLayout;
