import {
  Box, Card, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, Skeleton,
  Table, TableBody, TableCell, TableHead, TableRow, Typography, Collapse,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchOrders, updateOrderStatus } from '../../api/orders';
import { Order, OrderStatus } from '../../types';

const STATUS_COLOR: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning', confirmed: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error',
};

function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  async function handleStatusChange(status: string) {
    try {
      await updateOrderStatus(order.id, status);
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status updated');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell><Typography variant="body2" fontFamily="monospace">{order.id.slice(0, 8)}...</Typography></TableCell>
        <TableCell>
          <Typography fontWeight={600}>{order.customer_name}</Typography>
          <Typography variant="caption" color="text.secondary">{order.customer_email}</Typography>
        </TableCell>
        <TableCell>{order.customer_phone}</TableCell>
        <TableCell><Typography fontWeight={700} color="primary">₹{order.total_amount.toLocaleString('en-IN')}</Typography></TableCell>
        <TableCell>{new Date(order.created_at).toLocaleDateString('en-IN')}</TableCell>
        <TableCell>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={order.status} onChange={(e) => handleStatusChange(e.target.value)}>
              {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
                <MenuItem key={s} value={s}><Chip label={s} color={STATUS_COLOR[s]} size="small" /></MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0 }}>
          <Collapse in={open}>
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>Delivery Address</Typography>
              <Typography variant="body2" mb={2} color="text.secondary">
                {order.address}, {order.city}, {order.state} - {order.pincode}
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>Items</Typography>
              {order.order_items?.map((item) => (
                <Box key={item.id} display="flex" gap={2} alignItems="center" mb={0.5}>
                  <Typography variant="body2" flex={1}>{item.products?.name}</Typography>
                  <Typography variant="body2">Qty: {item.quantity}</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function OrderManagementPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: orders = [], isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Orders</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select value={statusFilter} label="Filter by Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All Orders</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell />
              <TableCell><strong>Order ID</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                  </TableRow>
                ))
              : filtered.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No orders found</Typography>
                    </TableCell>
                  </TableRow>
                )
              : filtered.map((order) => <OrderRow key={order.id} order={order} />)}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
