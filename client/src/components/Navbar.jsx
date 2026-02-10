import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart } from 'lucide-react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="topbar glass">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', width: '100%' }}>
                <Link to="/" className="brand">
                    <div className="brand-mark">A</div>
                    <div>
                        <div className="brand-name">AUTO AKIN</div>
                        <div className="brand-sub">Yedek Parça Dünyası</div>
                    </div>
                </Link>

                <div className={`top-links ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/" className="link-underline">Ana Sayfa</Link>
                    <Link to="/urunler" className="link-underline">Tüm Ürünler</Link>
                    <Link to="/siparis-takip" className="link-underline">Sipariş Takip</Link>
                </div>

                <div className="top-actions">
                    <button className="btn-icon" title="Arama">
                        <Search size={20} />
                    </button>
                    <Link to="/favoriler" className="btn-icon" title="Favoriler">
                        <Heart size={20} />
                    </Link>
                    <Link to="/sepet" className="cart-btn btn-outline btn-small" style={{ border: 'none', background: 'var(--gray-100)' }}>
                        <ShoppingCart size={20} />
                        <span className="cart-badge">0</span>
                    </Link>
                    <Link to="/giris" className="btn btn-small">
                        <User size={18} />
                        Giriş
                    </Link>
                    <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .btn-icon {
                    background: none;
                    border: none;
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    color: var(--black);
                    transition: all var(--transition);
                }
                .btn-icon:hover {
                    background: var(--gray-100);
                    color: var(--red);
                }
                .menu-toggle {
                    display: none;
                    background: none;
                    border: none;
                    cursor: pointer;
                }
                @media (max-width: 768px) {
                    .top-links {
                        position: fixed;
                        top: 72px;
                        left: 0;
                        width: 100%;
                        background: var(--white);
                        flex-direction: column;
                        padding: 24px;
                        gap: 16px;
                        transform: translateY(-100%);
                        opacity: 0;
                        transition: all 0.3s ease;
                        z-index: -1;
                        box-shadow: var(--shadow);
                    }
                    .top-links.open {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    .menu-toggle { display: block; }
                    .top-links .link-underline { font-size: 18px; }
                }
            `}} />
        </nav>
    );
};

export default Navbar;
