import {
  Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Select,
  Skeleton, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  addProductImages, uploadProductImage, deleteProductImage,
} from '../../api/products';
import { fetchCategories } from '../../api/categories';
import { Product } from '../../types';

interface FormState {
  name: string; description: string; price: string; quantity: string;
  category_id: string; active: boolean;
}

const EMPTY_FORM: FormState = { name: '', description: '', price: '', quantity: '', category_id: '', active: true };

export default function ProductManagementPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => fetchProducts({ activeOnly: false }),
  });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      quantity: String(p.quantity), category_id: p.category_id, active: p.active,
    });
    setOpen(true);
  }

  const setField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
    setForm((f) => ({ ...f, [field]: e.target.value as string }));

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !editing) return;
    setUploadingImages(true);
    try {
      const urls = await Promise.all(files.map(uploadProductImage));
      await addProductImages(editing.id, urls);
      qc.invalidateQueries({ queryKey: ['products', 'all'] });
      toast.success('Images uploaded');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingImages(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price || !form.quantity) { toast.error('Name, price, and quantity are required'); return; }
    const price = parseFloat(form.price);
    const quantity = parseInt(form.quantity, 10);
    if (isNaN(price) || price < 0) { toast.error('Invalid price'); return; }
    if (isNaN(quantity) || quantity < 0) { toast.error('Invalid quantity'); return; }

    setSaving(true);
    try {
      const payload = { name: form.name, description: form.description, price, quantity, category_id: form.category_id || undefined, active: form.active };
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      qc.invalidateQueries({ queryKey: ['products', 'all'] });
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      qc.invalidateQueries({ queryKey: ['products', 'all'] });
      toast.success('Product deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDeleteImage(imageId: string) {
    try {
      await deleteProductImage(imageId);
      qc.invalidateQueries({ queryKey: ['products', 'all'] });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const editingProduct = editing ? products.find((p) => p.id === editing.id) : null;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Product</Button>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>Product</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Price</strong></TableCell>
              <TableCell><strong>Stock</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                  </TableRow>
                ))
              : products.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          src={p.product_images?.[0]?.image_url ?? `https://picsum.photos/seed/${p.id}/50/50`}
                          variant="rounded"
                          sx={{ width: 48, height: 48 }}
                        />
                        <Typography fontWeight={600} noWrap sx={{ maxWidth: 200 }}>{p.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{p.categories?.name ?? '—'}</TableCell>
                    <TableCell><strong>₹{p.price.toLocaleString('en-IN')}</strong></TableCell>
                    <TableCell>
                      <Chip
                        label={p.quantity}
                        color={p.quantity === 0 ? 'error' : p.quantity <= 5 ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={p.active ? 'Active' : 'Inactive'} color={p.active ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="Name" fullWidth required value={form.name} onChange={setField('name')} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline rows={3} value={form.description} onChange={setField('description')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Price (₹)" type="number" fullWidth required value={form.price} onChange={setField('price')} inputProps={{ min: 0, step: 0.01 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Quantity" type="number" fullWidth required value={form.quantity} onChange={setField('quantity')} inputProps={{ min: 0 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={form.category_id} label="Category" onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
                  <MenuItem value="">None</MenuItem>
                  {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />}
                label="Active (visible to customers)"
              />
            </Grid>

            {editing && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>Product Images</Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                  {editingProduct?.product_images?.map((img) => (
                    <Box key={img.id} position="relative">
                      <Box component="img" src={img.image_url} alt="" sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover' }} />
                      <IconButton
                        size="small"
                        color="error"
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', '&:hover': { bgcolor: 'white' } }}
                        onClick={() => handleDeleteImage(img.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImages}
                >
                  {uploadingImages ? 'Uploading...' : 'Upload Images'}
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
