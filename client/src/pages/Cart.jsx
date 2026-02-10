import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag } from 'lucide-react';

const Cart = () => {
    // Demo sepeti
    const [cartItems, setCartItems] = useState([
        { id: 1, name: 'Fren Balatası - Ön (Takım)', brand: 'BOSCH', price: 950, quantity: 1, image: '' }
    ]);

    const updateQty = (id, delta) => {
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="container section animate-fade">
            <h1 style={{ fontFamily: 'Anton', fontSize: '32px', marginBottom: '32px' }}>Sepetim</h1>

            {cartItems.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>
                    {/* Items List */}
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {cartItems.map(item => (
                            <div key={item.id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: 'var(--gray-100)', borderRadius: '12px' }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>{item.brand}</div>
                                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{item.name}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--gray-100)', borderRadius: '8px', padding: '4px' }}>
                                    <button onClick={() => updateQty(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Minus size={16} /></button>
                                    <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateQty(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Plus size={16} /></button>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--red)', width: '100px', textAlign: 'right' }}>
                                    {item.price * item.quantity} TL
                                </div>
                                <button onClick={() => removeItem(item.id)} className="btn-icon" style={{ color: 'var(--gray-500)' }}><Trash2 size={20} /></button>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <aside>
                        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'sticky', top: '100px' }}>
                            <h3 style={{ fontWeight: 800, marginBottom: '20px' }}>Sipariş Özeti</h3>
                            <div style={{ display: 'grid', gap: '12px', fontSize: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--gray-100)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Ara Toplam</span>
                                    <span>{total} TL</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Kargo</span>
                                    <span className="text-red">Ücretsiz</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '20px', marginBottom: '32px' }}>
                                <span>Toplam</span>
                                <span className="text-red">{total} TL</span>
                            </div>
                            <Link to="/odeme" className="btn btn-block btn-lg">
                                <CreditCard size={20} /> Ödemeye Geç
                            </Link>
                        </div>
                    </aside>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <ShoppingBag size={64} style={{ marginBottom: '24px', opacity: 0.2 }} />
                    <h2 style={{ marginBottom: '16px' }}>Sepetiniz Boş</h2>
                    <p style={{ color: 'var(--gray-500)', marginBottom: '32px' }}>Aracınız için en kaliteli parçaları seçmeye başlayın.</p>
                    <Link to="/urunler" className="btn">Ürünlere Göz At</Link>
                </div>
            )}
        </div>
    );
};

export default Cart;
