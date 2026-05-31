import {
  Box, Button, Card, CardActionArea, CardContent, Container, Grid, InputAdornment, Skeleton, TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../../api/categories';
import { fetchProducts } from '../../api/products';
import ProductCard from '../../components/common/ProductCard';

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: featured = [], isLoading: prodLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => fetchProducts({ activeOnly: true, sort: 'newest' }),
    select: (data) => data.slice(0, 8),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Shop Smarter with SmartCart
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Discover thousands of products at unbeatable prices
          </Typography>
          <form onSubmit={handleSearch}>
            <Box display="flex" gap={1} maxWidth={560} mx="auto">
              <TextField
                fullWidth
                placeholder="Search for products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon /></InputAdornment>
                  ),
                  sx: { bgcolor: 'white', borderRadius: 2 },
                }}
              />
              <Button type="submit" variant="contained" color="secondary" size="large" sx={{ px: 3, borderRadius: 2 }}>
                Search
              </Button>
            </Box>
          </form>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Categories */}
        <Typography variant="h5" fontWeight={700} mb={3}>Shop by Category</Typography>
        <Grid container spacing={2} mb={6}>
          {catLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Grid item xs={6} sm={4} md={2} key={i}>
                  <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            : categories.map((cat) => (
                <Grid item xs={6} sm={4} md={2} key={cat.id}>
                  <Card>
                    <CardActionArea
                      onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                      sx={{ p: 2, textAlign: 'center' }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={600}>{cat.name}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>{cat.description}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
        </Grid>

        {/* Featured Products */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>Featured Products</Typography>
          <Button onClick={() => navigate('/products')} color="primary">View All</Button>
        </Box>
        <Grid container spacing={3}>
          {prodLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            : featured.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
        </Grid>
      </Container>
    </Box>
  );
}
