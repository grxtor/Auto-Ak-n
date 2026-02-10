import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import OrderTrack from './pages/OrderTrack';
import Cart from './pages/Cart';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: '1' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/urunler" element={<Products />} />
            <Route path="/urun/:id" element={<ProductDetail />} />
            <Route path="/siparis-takip" element={<OrderTrack />} />
            <Route path="/favoriler" element={<div className="container section"><h1>Favoriler (Yakında)</h1></div>} />
            <Route path="/sepet" element={<Cart />} />
            <Route path="/giris" element={<Login />} />
            <Route path="/panel" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
