import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Home from '@/pages/Home';
import Hampers from '@/pages/Hampers';
import NotFound from '@/pages/NotFound';
import OrderConfirmation from '@/pages/OrderConfirmation';
import OrderHistory from '@/pages/OrderHistory';
import ProductDetail from '@/pages/ProductDetail';
import Products from '@/pages/Products';
import SignIn from '@/pages/SignIn';
import AdminOrders from '@/pages/AdminOrders';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import ChatWidget from '@/components/common/ChatWidget';
import ScrollToTop from '@/components/common/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/hampers" element={<Hampers />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderConfirmation />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget />
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
