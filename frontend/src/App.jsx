import { Routes, Route, useLocation } from 'react-router-dom'
import AdminRoute     from './components/AdminRoute'
import AdminLayout    from './pages/admin/AdminLayout'
import Navbar         from './components/Navbar'
import CartDrawer     from './components/CartDrawer'
import Footer         from './components/Footer'
import ContactButton  from './components/ContactButton.jsx'
import Home           from './pages/Home'
import Shop           from './pages/Shop'
import StorePage      from './pages/StorePage'
import ProductDetail  from './pages/ProductDetail'
import Cart           from './pages/Cart'
import Checkout       from './pages/Checkout'
import About          from './pages/About'
import CheckoutSuccess from './pages/CheckoutSuccess'
import CheckoutCancel from './pages/CheckoutCancel'
import OrderTracking  from './pages/OrderTracking'
import MyOrders       from './pages/MyOrders'
import NotFound       from './pages/NotFound'
import AdminAccess    from './pages/AdminAccess'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts  from './pages/admin/AdminProducts'
import AdminOrders    from './pages/admin/AdminOrders'
import AdminManage    from './pages/admin/AdminManage'
import ProductForm    from './pages/admin/ProductForm'
import AdminSupport   from './pages/admin/AdminSupport'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminSettings  from './pages/admin/AdminSettings'
import AdminCategories from './pages/admin/AdminCategories'
import Contact        from './pages/Contact'
import ScrollToTop    from './components/ScrollToTop'


function StorefrontLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function ContactWrapper() {
  const { pathname } = useLocation()

  if (pathname.startsWith('/admin')) return null

  return <ContactButton />
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
        <Route path="/shop" element={<StorefrontLayout><Shop /></StorefrontLayout>} />
        <Route path="/shop/:store" element={<StorefrontLayout><StorePage /></StorefrontLayout>} />
        <Route path="/product/:id" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
        <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
        <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
        <Route path="/about" element={<StorefrontLayout><About /></StorefrontLayout>} />
        <Route path="/checkout/success" element={<StorefrontLayout><CheckoutSuccess /></StorefrontLayout>} />
        <Route path="/checkout/cancel" element={<StorefrontLayout><CheckoutCancel /></StorefrontLayout>} />
        <Route path="/order/:id" element={<StorefrontLayout><OrderTracking /></StorefrontLayout>} />
        <Route path="/my-orders" element={<StorefrontLayout><MyOrders /></StorefrontLayout>} />
        <Route path="/contact" element={<StorefrontLayout><Contact /></StorefrontLayout>} />
        <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />

        <Route path="/admin-access" element={<AdminAccess />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="manage" element={<AdminManage />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="shipping" element={<AdminSettings />} />
        </Route>
      </Routes>

      <ContactWrapper />
    </>
  )
}