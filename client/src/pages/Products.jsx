import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Filter, Search, ChevronRight } from 'lucide-react';

const Products = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const search = location.search;
                const [prodRes, catRes, brandRes] = await Promise.all([
                    axios.get(`http://localhost:3000/api/products${search}`),
                    axios.get('http://localhost:3000/api/categories'),
                    axios.get('http://localhost:3000/api/vehicle-brands')
                ]);
                setProducts(prodRes.data);
                setCategories(catRes.data);
                setBrands(brandRes.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProducts();
    }, [location.search]);

    if (loading) return <div className="container section">Yükleniyor...</div>;

    return (
        <div className="container section animate-fade">
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' }}>
                {/* Sidebar Filters */}
                <aside>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontFamily: 'Anton', fontSize: '20px' }}>
                            <Filter size={20} /> Filtreler
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <h4 style={{ marginBottom: '16px', fontWeight: 800 }}>Kategoriler</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {categories.map(cat => (
                                    <Link key={cat.id} to={`/urunler?category_id=${cat.id}`} className="filter-link">
                                        {cat.name} <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>({cat.product_count})</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <h4 style={{ marginBottom: '16px', fontWeight: 800 }}>Araç Markaları</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {brands.map(brand => (
                                    <Link key={brand.id} to={`/urunler?vehicle_brand_id=${brand.id}`} className="pill" style={{ justifyContent: 'space-between' }}>
                                        {brand.name} <ChevronRight size={14} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main>
                    <div className="section-header">
                        <h2 style={{ fontSize: '24px' }}>Tüm Ürünler <span style={{ color: 'var(--gray-500)', fontSize: '16px', fontFamily: 'Manrope' }}>({products.length} Sonuç)</span></h2>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <select className="btn btn-outline btn-small" style={{ background: 'var(--white)' }}>
                                <option value="">Sıralama</option>
                                <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                                <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                                <option value="name">İsim (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-4">
                        {products.map(prod => (
                            <Link key={prod.id} to={`/urun/${prod.id}`} className="product-card">
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
                                <button className="btn btn-small">Detay</button>
                            </Link>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--gray-500)' }}>
                            <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
                        </div>
                    )}
                </main>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .filter-link {
                    color: var(--gray-700);
                    font-size: 14px;
                    padding: 4px 0;
                    transition: color var(--transition);
                }
                .filter-link:hover { color: var(--red); }
                .grid-4 { grid-template-columns: repeat(3, 1fr); }
                @media (max-width: 1200px) {
                    .grid-4 { grid-template-columns: repeat(2, 1fr); }
                }
            `}} />
        </div>
    );
};

export default Products;
