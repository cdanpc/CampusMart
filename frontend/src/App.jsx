import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import AppHeader from './components/layout/AppHeader';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductDetailPage from './pages/ProductDetailPage';
import MessagesPage from './pages/app/MessagesPage';
import ProfilePage from './pages/app/ProfilePage';
import OrderDetailsPage from './pages/app/OrderDetailsPage';
import OrdersHistoryPage from './pages/app/OrdersHistoryPage';
import TradeOffersPage from './pages/app/TradeOffersPage';
import SellerProfilePage from './pages/public/SellerProfilePage';
import SettingsPage from './pages/app/SettingsPage';
import NotificationsPage from './pages/app/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/product') ||
                      location.pathname.startsWith('/messages') ||
                      location.pathname.startsWith('/profile') ||
                      location.pathname.startsWith('/order') ||
                      location.pathname.startsWith('/trade-offers') ||
                      location.pathname.startsWith('/seller') ||
                      location.pathname.startsWith('/settings') ||
                      location.pathname.startsWith('/notifications');

  return (
    <>
      {isDashboard ? <AppHeader /> : <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/product/:id" 
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller/:sellerId" 
          element={
            <ProtectedRoute>
              <SellerProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order/:orderId" 
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/history" 
          element={
            <ProtectedRoute>
              <OrdersHistoryPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trade-offers" 
          element={
            <ProtectedRoute>
              <TradeOffersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
