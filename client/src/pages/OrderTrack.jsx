import { useState } from 'react';
import axios from 'axios';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';

const OrderTrack = () => {
    const [orderNo, setOrderNo] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!orderNo) return;
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`http://localhost:3000/api/orders/track/${orderNo}`);
            setOrder(res.data);
        } catch (err) {
            setError('Sipariş bulunamadı. Lütfen sipariş numaranızı kontrol edin.');
            setOrder(null);
        }
        setLoading(false);
    };

    const steps = [
        { key: 'pending', label: 'Alındı', icon: <Package size={20} /> },
        { key: 'confirmed', label: 'Onaylandı', icon: <Clock size={20} /> },
        { key: 'shipped', label: 'Kargoda', icon: <Truck size={20} /> },
        { key: 'delivered', label: 'Teslim Edildi', icon: <CheckCircle size={20} /> },
    ];

    return (
        <div className="container section animate-fade">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontFamily: 'Anton', fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>Sipariş Takip</h1>
                <p style={{ color: 'var(--gray-500)', textAlign: 'center', marginBottom: '40px' }}>Siparişinizin durumunu öğrenmek için sipariş numaranızı girin.</p>

                <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', marginBottom: '60px' }}>
                    <form onSubmit={handleTrack} style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            className="btn-outline"
                            style={{ flex: 1, padding: '14px 20px', borderRadius: '12px', background: 'var(--white)' }}
                            placeholder="Örn: SA-12345"
                            value={orderNo}
                            onChange={e => setOrderNo(e.target.value)}
                        />
                        <button className="btn btn-lg" type="submit" disabled={loading}>
                            {loading ? 'Sorgulanıyor...' : <><Search size={20} /> Sorgula</>}
                        </button>
                    </form>
                    {error && <p style={{ color: 'var(--red)', marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
                </div>

                {order && (
                    <div className="animate-fade">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 800 }}># {order.order_no}</h2>
                                <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Sipariş Tarihi: {new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                            </div>
                            <div className="badge" style={{ fontSize: '14px', padding: '8px 20px' }}>
                                {order.status === 'pending' ? 'Beklemede' : order.status}
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '60px', padding: '0 20px' }}>
                            <div style={{ position: 'absolute', top: '20px', left: '40px', right: '40px', height: '2px', background: 'var(--gray-200)', zIndex: -1 }}></div>
                            {steps.map((step, index) => {
                                const isActive = true; // Gerçek mantık eklenebilir
                                return (
                                    <div key={step.key} style={{ textAlign: 'center', display: 'grid', placeItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: index === 0 ? 'var(--red)' : 'var(--white)',
                                            color: index === 0 ? 'var(--white)' : 'var(--gray-300)',
                                            border: `2px solid ${index === 0 ? 'var(--red)' : 'var(--gray-200)'}`,
                                            display: 'grid',
                                            placeItems: 'center'
                                        }}>
                                            {step.icon}
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: index === 0 ? 'var(--black)' : 'var(--gray-500)' }}>{step.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                            <h3 style={{ fontWeight: 800, marginBottom: '20px' }}>Sipariş Detayları</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {order.items.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span>{item.quantity}x {item.product_name}</span>
                                        <span style={{ fontWeight: 700 }}>{item.price * item.quantity} TL</span>
                                    </div>
                                ))}
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px' }}>
                                    <span>Toplam</span>
                                    <span className="text-red">{order.total} TL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTrack;
