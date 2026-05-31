import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { Category } from '../../types';

interface FormState { name: string; description: string; }

export default function CategoryManagementPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const { data: categories = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, form);
        toast.success('Category updated');
      } else {
        await createCategory(form);
        toast.success('Category created');
      }
      qc.invalidateQueries({ queryKey: ['categories'] });
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Products in this category will be uncategorized.')) return;
    try {
      await deleteCategory(id);
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Category</Button>
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                  </TableRow>
                ))
              : categories.map((cat) => (
                  <TableRow key={cat.id} hover>
                    <TableCell><Typography fontWeight={600}>{cat.name}</Typography></TableCell>
                    <TableCell>{cat.description}</TableCell>
                    <TableCell>{new Date(cat.created_at).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(cat)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name" fullWidth required value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Description" fullWidth multiline rows={3} value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
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
