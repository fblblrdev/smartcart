import {
  Box, Button, Chip, Container, Divider, Grid, IconButton, Skeleton, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchProductById } from '../../api/products';
import { useCart } from '../../contexts/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  const images = product?.product_images?.length
    ? product.product_images.map((i) => i.image_url)
    : [`https://picsum.photos/seed/${id}/800/600`];

  async function handleAddToCart() {
    if (!product) return;
    if (qty > product.quantity) { toast.error('Not enough stock'); return; }
    setAdding(true);
    await addItem(product, qty);
    setAdding(false);
    toast.success('Added to cart!');
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} /></Grid>
          <Grid item xs={12} md={6}><Skeleton variant="text" height={60} /><Skeleton variant="text" height={40} /><Skeleton variant="rectangular" height={120} /></Grid>
        </Grid>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Product not found</Typography>
        <Button onClick={() => navigate('/products')} sx={{ mt: 2 }}>Back to Products</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Images */}
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={images[activeImg]}
            alt={product.name}
            sx={{ width: '100%', borderRadius: 2, objectFit: 'cover', maxHeight: 460 }}
          />
          {images.length > 1 && (
            <Box display="flex" gap={1} mt={2} flexWrap="wrap">
              {images.map((url, i) => (
                <Box
                  key={i}
                  component="img"
                  src={url}
                  alt=""
                  onClick={() => setActiveImg(i)}
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 1,
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: activeImg === i ? '2px solid #1976d2' : '2px solid transparent',
                  }}
                />
              ))}
            </Box>
          )}
        </Grid>

        {/* Details */}
        <Grid item xs={12} md={6}>
          <Chip label={product.categories?.name} color="primary" variant="outlined" size="small" sx={{ mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>{product.name}</Typography>
          <Typography variant="h4" color="primary" fontWeight={800} gutterBottom>
            ₹{product.price.toLocaleString('en-IN')}
          </Typography>

          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>{product.description}</Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Availability:{' '}
            {product.quantity > 0 ? (
              <Chip label={`${product.quantity} in stock`} color="success" size="small" />
            ) : (
              <Chip label="Out of stock" color="error" size="small" />
            )}
          </Typography>

          {product.quantity > 0 && (
            <>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <IconButton onClick={() => setQty((q) => Math.max(1, q - 1))} size="small" sx={{ border: 1, borderColor: 'divider' }}>
                  <RemoveIcon />
                </IconButton>
                <Typography variant="h6" width={40} textAlign="center">{qty}</Typography>
                <IconButton onClick={() => setQty((q) => Math.min(product.quantity, q + 1))} size="small" sx={{ border: 1, borderColor: 'divider' }}>
                  <AddIcon />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={adding}
                fullWidth
                sx={{ py: 1.5 }}
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </Button>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
