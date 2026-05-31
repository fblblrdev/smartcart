import {
  Box, Button, Card, CardContent, Container, Divider, Grid, IconButton, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

export default function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>Your cart is empty</Typography>
        <Typography color="text.secondary" mb={3}>Add some products to get started</Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>Browse Products</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Shopping Cart</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {items.map((item) => {
            const product = item.product;
            const imageUrl = product?.product_images?.[0]?.image_url ?? `https://picsum.photos/seed/${item.product_id}/200/150`;
            return (
              <Card key={item.product_id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" gap={2} alignItems="center">
                    <Box
                      component="img"
                      src={imageUrl}
                      alt={product?.name}
                      sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <Box flex={1} minWidth={0}>
                      <Typography fontWeight={600} noWrap>{product?.name}</Typography>
                      <Typography color="primary" fontWeight={700}>₹{product?.price?.toLocaleString('en-IN')}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton size="small" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography width={32} textAlign="center" fontWeight={600}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography fontWeight={700} minWidth={80} textAlign="right">
                      ₹{((product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                    </Typography>
                    <IconButton color="error" onClick={() => removeItem(item.product_id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Order Summary</Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Subtotal ({items.length} items)</Typography>
                <Typography>₹{total.toLocaleString('en-IN')}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="text.secondary">Delivery</Typography>
                <Typography color="success.main">Free</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography fontWeight={700} variant="h6">Total</Typography>
                <Typography fontWeight={700} variant="h6" color="primary">₹{total.toLocaleString('en-IN')}</Typography>
              </Box>
              <Button variant="contained" fullWidth size="large" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
              <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
