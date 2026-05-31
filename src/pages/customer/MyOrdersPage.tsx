import {
  Accordion, AccordionDetails, AccordionSummary, Box, Chip, Container, Skeleton, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useQuery } from '@tanstack/react-query';
import { fetchOrdersByEmail } from '../../api/orders';
import { useAuth } from '../../contexts/AuthContext';
import { OrderStatus } from '../../types';

const STATUS_COLOR: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

export default function MyOrdersPage() {
  const { appUser } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders', appUser?.email],
    queryFn: () => fetchOrdersByEmail(appUser!.email),
    enabled: !!appUser,
  });

  if (isLoading) return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={80} sx={{ mb: 1, borderRadius: 2 }} />)}
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>My Orders</Typography>
      {orders.length === 0 ? (
        <Box textAlign="center" py={8}>
          <ShoppingBagIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No orders yet</Typography>
        </Box>
      ) : (
        orders.map((order) => (
          <Accordion key={order.id} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={2} flex={1} flexWrap="wrap">
                <Typography fontWeight={600} sx={{ flexGrow: 1 }}>
                  Order #{order.id.slice(0, 8)}...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </Typography>
                <Typography fontWeight={700} color="primary">
                  ₹{order.total_amount.toLocaleString('en-IN')}
                </Typography>
                <Chip label={order.status} color={STATUS_COLOR[order.status]} size="small" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Delivery to: {order.address}, {order.city}, {order.state} - {order.pincode}
              </Typography>
              {order.order_items?.map((item) => (
                <Box key={item.id} display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2">{item.products?.name} × {item.quantity}</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Typography>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
}
