import { Box, Button, Container, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Order Placed Successfully!
        </Typography>
        {order && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            Order ID: <strong>{order.id}</strong>
          </Typography>
        )}
        <Typography variant="body1" color="text.secondary" mb={4}>
          Your order has been placed successfully. The reseller will contact you regarding payment and delivery.
        </Typography>
        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          <Button variant="contained" onClick={() => navigate('/')}>Continue Shopping</Button>
          <Button variant="outlined" onClick={() => navigate('/my-orders')}>View My Orders</Button>
        </Box>
      </Paper>
    </Container>
  );
}
