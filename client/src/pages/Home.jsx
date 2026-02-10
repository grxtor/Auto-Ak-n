import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronRight, Package, ShieldCheck, Zap } from 'lucide-react';

const Home = () => {
    const [data, setData] = useState({ categories: [], featured: [], discounted: [], vehicleBrands: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:3000/')
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Data cost error:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="container section">Yükleniyor...</div>;

    return (
        <div className="animate-fade">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-left">
                    <span className="badge">Türkiye'nin Parça Marketi</span>
                    <h1>Aradığın Yedek Parça <br /><span style={{ color: 'var(--red)' }}>Bir Tık Uzağında</span></h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '18px', maxWidth: '500px', marginBottom: '32px' }}>
                        Auto Akın ile binlerce çeşit yedek parça arasından aracına en uygun olanı hemen bul, güvenle kapına gelsin.
                    </p>

                    <div className="searchbar">
                        <input type="text" placeholder="Parça adı, OEM No veya Marka ara..." />
                        <button className="btn"><Search size={20} /> Ara</button>
                    </div>

                    <div className="hero-cta">
                        <div className="pill pill-red"><Zap size={14} /> Hızlı Teslimat</div>
                        <div className="pill"><ShieldCheck size={14} /> %100 Orijinal</div>
                        <div className="pill"><Package size={14} /> Kapıda Ödeme</div>
                    </div>
                </div>

                <div className="hero-right">
                    <div className="hero-card">
                        <div className="hero-card-header">Popüler Kategoriler</div>
                        <ul className="hero-list">
                            {data.categories.slice(0, 5).map(cat => (
                                <li key={cat.id}>
                                    <a href={`/urunler?category_id=${cat.id}`}>
                                        <span>{cat.icon} {cat.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <button className="btn btn-black btn-block" style={{ marginTop: '10px' }}>Tümünü Gör</button>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container section">
                <div className="section-header">
                    <h2>Kategoriler</h2>
                    <button className="btn-icon text-red">Tümünü Gör <ChevronRight size={18} /></button>
                </div>
                <div className="grid grid-6">
                    {data.categories.map(cat => (
                        <a key={cat.id} href={`/urunler?category_id=${cat.id}`} className="cat-card">
                            <div className="cat-icon">{cat.icon}</div>
                            <div className="cat-name">{cat.name}</div>
                            <div className="cat-count">{cat.product_count} Ürün</div>
                        </a>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="section light">
                <div className="container">
                    <div className="section-header">
                        <h2>Öne Çıkan Ürünler</h2>
                    </div>
                    <div className="grid grid-5">
                        {data.featured.map(prod => (
                            <div key={prod.id} className="product-card">
                                <div className="product-img">
                                    {prod.image ? <img src={`http://localhost:3000/${prod.image}`} alt={prod.name} /> : 'Resim Yok'}
                                    {prod.badge && <span className="product-badge">{prod.badge}</span>}
                                </div>
                                <div className="product-brand">{prod.brand}</div>
                                <div className="product-title">{prod.name}</div>
                                <div className="product-prices">
                                    <span className="product-price">{prod.price} TL</span>
                                    {prod.old_price && <span className="product-old-price">{prod.old_price} TL</span>}
                                </div>
                                <button className="btn btn-small">Sepete Ekle</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hero-list { list-style: none; }
                .hero-list li { margin-bottom: 8px; border-bottom: 1px solid var(--gray-50); padding-bottom: 8px; }
                .hero-list li:last-child { border: none; }
                .text-red { color: var(--red); font-weight: 700; display: flex; align-items: center; gap: 4px; }
                
                @media (max-width: 1024px) {
                    .hero { grid-template-columns: 1fr; }
                    .grid-6 { grid-template-columns: repeat(3, 1fr); }
                    .grid-5 { grid-template-columns: repeat(2, 1fr); }
                }
            `}} />
        </div>
    );
};

export default Home;
