import {
  AppBar, Badge, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Typography,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function Navbar() {
  const { appUser, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSignOut = async () => {
    handleClose();
    await signOut();
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <StorefrontIcon color="primary" sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            color="primary"
            fontWeight={800}
            sx={{ cursor: 'pointer', flexGrow: { xs: 1, md: 0 }, mr: 4 }}
            onClick={() => navigate('/')}
          >
            SmartCart
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button onClick={() => navigate('/products')} color="inherit">Products</Button>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => navigate('/cart')} color="inherit">
              <Badge badgeContent={itemCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {appUser ? (
              <>
                <IconButton onClick={handleMenu} color="inherit">
                  <AccountCircleIcon />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">{appUser.full_name}</Typography>
                  </MenuItem>
                  {appUser.role === 'RESELLER' ? (
                    <MenuItem onClick={() => { handleClose(); navigate('/reseller'); }}>Dashboard</MenuItem>
                  ) : (
                    <MenuItem onClick={() => { handleClose(); navigate('/my-orders'); }}>My Orders</MenuItem>
                  )}
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} variant="outlined" size="small">Login</Button>
                <Button onClick={() => navigate('/register')} variant="contained" size="small">Register</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
