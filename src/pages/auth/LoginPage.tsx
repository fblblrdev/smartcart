import {
  Box, Button, Card, CardContent, Divider, TextField, Typography,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Welcome back!');
    navigate('/');
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" px={2}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={1}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Sign in to your SmartCart account
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogle}
            sx={{ mb: 2 }}
          >
            Continue with Google
          </Button>

          <Divider sx={{ mb: 2 }}>or</Divider>

          <form onSubmit={handleLogin}>
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
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Typography variant="body2" textAlign="center" mt={2}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1976d2' }}>Register</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
