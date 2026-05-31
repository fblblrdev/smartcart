import {
  Box, Button, Card, CardContent, Container, Divider, Grid, TextField, Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createOrder } from '../../api/orders';
import { useCart } from '../../contexts/CartContext';
import { CheckoutFormData } from '../../types';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh',
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CheckoutFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const setField = (field: keyof CheckoutFormData) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
    setForm((f) => ({ ...f, [field]: e.target.value as string }));

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.customer_phone)) { toast.error('Enter a valid 10-digit phone number'); return; }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error('Enter a valid 6-digit pincode'); return; }

    setLoading(true);
    try {
      const order = await createOrder(form, items);
      await clearCart();
      navigate('/order-success', { state: { order } });
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to place order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Checkout</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Shipping Information</Typography>
              <form onSubmit={handlePlaceOrder} id="checkout-form">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField label="Full Name" fullWidth required value={form.customer_name} onChange={setField('customer_name')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Email" type="email" fullWidth required value={form.customer_email} onChange={setField('customer_email')} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Phone Number" fullWidth required value={form.customer_phone} onChange={setField('customer_phone')} inputProps={{ maxLength: 10 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Address" fullWidth required multiline rows={2} value={form.address} onChange={setField('address')} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="City" fullWidth required value={form.city} onChange={setField('city')} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="State"
                      fullWidth
                      required
                      select
                      value={form.state}
                      onChange={setField('state')}
                      SelectProps={{ native: true }}
                    >
                      <option value=""></option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label="Pincode" fullWidth required value={form.pincode} onChange={setField('pincode')} inputProps={{ maxLength: 6 }} />
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>Order Summary</Typography>
              {items.map((item) => (
                <Box key={item.product_id} display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                    {item.product?.name} × {item.quantity}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{((item.product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700} color="primary">₹{total.toLocaleString('en-IN')}</Typography>
              </Box>
              <Button
                type="submit"
                form="checkout-form"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
                The reseller will contact you for payment & delivery
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
