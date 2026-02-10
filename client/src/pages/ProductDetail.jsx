import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, ChevronRight } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:3000/urun/${id}`)
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="container section">Yükleniyor...</div>;
    if (!data) return <div className="container section">Ürün bulunamadı.</div>;

    const { product, vehicles, related, isFav } = data;

    return (
        <div className="container section animate-fade">
            <div className="breadcrumb" style={{ marginBottom: '32px' }}>
                <Link to="/">Ana Sayfa</Link> <ChevronRight size={14} />
                <Link to="/urunler">Ürünler</Link> <ChevronRight size={14} />
                <span>{product.name}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '80px' }}>
                {/* Images */}
                <div style={{ display: 'grid', gap: '16px' }}>
                    <div className="product-img-large">
                        {product.image ? <img src={`http://localhost:3000/${product.image}`} alt={product.name} /> : 'Resim Yok'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {product.image2 && <div className="product-img-thumb"><img src={`http://localhost:3000/${product.image2}`} alt="" /></div>}
                        {product.image3 && <div className="product-img-thumb"><img src={`http://localhost:3000/${product.image3}`} alt="" /></div>}
                    </div>
                </div>

                {/* Details */}
                <div>
                    <span className="badge" style={{ marginBottom: '16px' }}>{product.category_name}</span>
                    <h1 style={{ fontFamily: 'Anton', fontSize: '36px', lineHeight: '1.2', marginBottom: '8px' }}>{product.name}</h1>
                    <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '24px' }}>Marka: <span style={{ fontWeight: 700, color: 'var(--black)' }}>{product.brand}</span> | OEM: {product.oem_no}</div>

                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--red)' }}>{product.price} TL</div>
                        {product.old_price && <div style={{ textDecoration: 'line-through', color: 'var(--gray-500)' }}>{product.old_price} TL</div>}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
                        <button className="btn btn-lg" style={{ flex: 1 }}><ShoppingCart size={20} /> Sepete Ekle</button>
                        <button className={`btn-icon btn-outline btn-lg ${isFav ? 'fav-active' : ''}`} style={{ width: '60px' }}><Heart size={24} /></button>
                    </div>

                    <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '24px', display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                            <Truck className="text-red" size={20} />
                            <div>
                                <div style={{ fontWeight: 700 }}>Hızlı Teslimat</div>
                                <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>24 saat içinde kargoya verilir.</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                            <ShieldCheck className="text-red" size={20} />
                            <div>
                                <div style={{ fontWeight: 700 }}>%100 Orijinal Ürün</div>
                                <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Tüm ürünlerimiz garantilidir.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description & Vehicles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '60px' }}>
                <div>
                    <h3 style={{ fontFamily: 'Anton', fontSize: '24px', marginBottom: '20px' }}>Ürün Açıklaması</h3>
                    <div style={{ color: 'var(--gray-700)', lineHeight: '1.8' }}>{product.description || 'Bu ürün için açıklama bulunmuyor.'}</div>
                </div>
                <div>
                    <h3 style={{ fontFamily: 'Anton', fontSize: '24px', marginBottom: '20px' }}>Uyumlu Araçlar</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {vehicles.map(v => (
                            <div key={v.id} className="pill" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                                <span>{v.brand_name} {v.name}</span>
                                <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{v.year_start} - {v.year_end || 'Günümüz'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .product-img-large {
                    aspect-ratio: 4/3;
                    background: var(--gray-100);
                    border-radius: var(--radius-xl);
                    overflow: hidden;
                    display: grid;
                    place-items: center;
                }
                .product-img-large img { width: 100%; height: 100%; object-fit: cover; }
                .product-img-thumb {
                    aspect-ratio: 1;
                    background: var(--gray-100);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }
                .product-img-thumb img { width: 100%; height: 100%; object-fit: cover; }
                .fav-active { color: var(--red); border-color: var(--red); }
            `}} />
        </div>
    );
};

export default ProductDetail;
