import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
