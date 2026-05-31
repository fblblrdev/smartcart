import {
  Box, Container, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, Skeleton, TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../../api/categories';
import { fetchProducts } from '../../api/products';
import ProductCard from '../../components/common/ProductCard';

type SortOption = 'newest' | 'price_asc' | 'price_desc';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') ?? '');
  const [sort, setSort] = useState<SortOption>('newest');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (categoryId) params.categoryId = categoryId;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, categoryId, setSearchParams]);

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', debouncedSearch, categoryId, sort],
    queryFn: () => fetchProducts({ search: debouncedSearch, categoryId: categoryId || undefined, sort, activeOnly: true }),
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Products</Typography>

      {/* Filters */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <TextField
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 260 }}
        />
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryId} label="Category" onChange={(e) => setCategoryId(e.target.value)}>
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value as SortOption)}>
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price_asc">Price: Low to High</MenuItem>
            <MenuItem value="price_desc">Price: High to Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results count */}
      {!isLoading && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </Typography>
      )}

      <Grid container spacing={3}>
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : products.length === 0
          ? (
              <Grid item xs={12}>
                <Box textAlign="center" py={8}>
                  <Typography variant="h6" color="text.secondary">No products found</Typography>
                </Box>
              </Grid>
            )
          : products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
      </Grid>
    </Container>
  );
}
