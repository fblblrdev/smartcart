import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ResellerLayout from './components/reseller/ResellerLayout';

// Pages
import HomePage from './pages/customer/HomePage';
import ProductListingPage from './pages/customer/ProductListingPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/reseller/DashboardPage';
import ProductManagementPage from './pages/reseller/ProductManagementPage';
import CategoryManagementPage from './pages/reseller/CategoryManagementPage';
import OrderManagementPage from './pages/reseller/OrderManagementPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <Toaster position="top-right" />
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductListingPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/my-orders"
                    element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>}
                  />
                  <Route
                    path="/reseller"
                    element={<ProtectedRoute role="RESELLER"><ResellerLayout /></ProtectedRoute>}
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="products" element={<ProductManagementPage />} />
                    <Route path="categories" element={<CategoryManagementPage />} />
                    <Route path="orders" element={<OrderManagementPage />} />
                  </Route>
                </Route>
              </Routes>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
