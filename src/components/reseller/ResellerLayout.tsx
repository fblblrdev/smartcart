import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/reseller', icon: <DashboardIcon /> },
  { label: 'Products', path: '/reseller/products', icon: <InventoryIcon /> },
  { label: 'Categories', path: '/reseller/categories', icon: <CategoryIcon /> },
  { label: 'Orders', path: '/reseller/orders', icon: <ShoppingBagIcon /> },
];

export default function ResellerLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box display="flex">
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', top: 64, height: 'calc(100% - 64px)' },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ px: 1, mb: 1 }}>
            RESELLER PANEL
          </Typography>
          <List dense>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={pathname === item.path}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${DRAWER_WIDTH}px` }}>
        <Outlet />
      </Box>
    </Box>
  );
}
