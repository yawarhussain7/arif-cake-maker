import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import SidebarSlider from './pages/SidebarSlider'
import { SliderProvider } from './sliderStore'
import { DashboardPage, CustomersPage, OrdersPage, ReportsPage } from './pages/OperationalPages'
import { CategoriesPage, ProductsPage } from './pages/CatalogPages'
import { CouponsPage, ReviewsPage, SettingsPage } from './pages/UtilityPages'
import AdminLogin from './pages/AdminLogin'
import './App.css'

function RoutedAdmin() {
  return (
    <SliderProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="slider" element={<SidebarSlider />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </SliderProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutedAdmin />
    </BrowserRouter>
  )
}
