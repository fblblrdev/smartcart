import { Box, Container, Typography } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'white', borderTop: 1, borderColor: 'divider', mt: 'auto', py: 3 }}>
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <StorefrontIcon color="primary" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} SmartCart. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
