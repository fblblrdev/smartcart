import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import WarningIcon from '@mui/icons-material/Warning';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/products';
import { fetchOrders } from '../../api/orders';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function StatCard({ title, value, icon, color, loading }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>{title}</Typography>
            {loading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography variant="h4" fontWeight={700}>{value}</Typography>
            )}
          </Box>
          <Box sx={{ bgcolor: color, borderRadius: 2, p: 1.5, display: 'flex' }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: products = [], isLoading: pl } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => fetchProducts({ activeOnly: false }),
  });

  const { data: orders = [], isLoading: ol } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 5);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={4}>Dashboard</Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={products.length}
            icon={<InventoryIcon sx={{ color: 'white' }} />}
            color="#1976d2"
            loading={pl}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon={<ShoppingBagIcon sx={{ color: 'white' }} />}
            color="#2e7d32"
            loading={ol}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString('en-IN')}`}
            icon={<TrendingUpIcon sx={{ color: 'white' }} />}
            color="#ed6c02"
            loading={ol}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={lowStock.length}
            icon={<WarningIcon sx={{ color: 'white' }} />}
            color="#d32f2f"
            loading={pl}
          />
        </Grid>
      </Grid>

      {lowStock.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2} color="warning.main">
              ⚠ Low Stock Products
            </Typography>
            {lowStock.map((p) => (
              <Box key={p.id} display="flex" justifyContent="space-between" py={1} borderBottom="1px solid" borderColor="divider">
                <Typography>{p.name}</Typography>
                <Typography color="warning.main" fontWeight={600}>{p.quantity} left</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
