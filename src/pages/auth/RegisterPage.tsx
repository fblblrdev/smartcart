import {
  Box, Button, Card, CardContent, Divider, FormControl, InputLabel, MenuItem, Select, TextField, Typography,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (error) { toast.error(error.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
      });
    }

    setLoading(false);
    toast.success('Account created! Please check your email to confirm.');
    navigate('/login');
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" px={2} py={4}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={1}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Join SmartCart today
          </Typography>

          <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogle} sx={{ mb: 2 }}>
            Sign up with Google
          </Button>

          <Divider sx={{ mb: 2 }}>or</Divider>

          <form onSubmit={handleRegister}>
            <TextField
              label="Full Name"
              fullWidth
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Account Type</InputLabel>
              <Select value={role} label="Account Type" onChange={(e) => setRole(e.target.value as UserRole)}>
                <MenuItem value="CUSTOMER">Customer</MenuItem>
                <MenuItem value="RESELLER">Reseller</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <Typography variant="body2" textAlign="center" mt={2}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1976d2' }}>Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
