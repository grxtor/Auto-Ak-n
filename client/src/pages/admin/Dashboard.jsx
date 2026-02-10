import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard, Package, ShoppingBag, Users,
    MessageSquare, Settings, LogOut, TrendingUp,
    AlertTriangle, CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ orders: {}, products: {}, chats: {}, users: {} });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:3000/panel/dashboard', { withCredentials: true })
            .then(res => {
                setStats(res.data.stats);
                setRecentOrders(res.data.recentOrders);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                if (err.response?.status === 401) {
                    window.location.href = '/panel-login';
                }
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="admin-layout">Yükleniyor...</div>;

    const cards = [
        { title: 'Toplam Sipariş', value: stats.orders.total || 0, icon: <ShoppingBag />, color: 'var(--black)' },
        { title: 'Bekleyen Sipariş', value: stats.orders.pending || 0, icon: <AlertTriangle />, color: 'var(--orange)' },
        { title: 'Toplam Ciro', value: `${stats.orders.revenue || 0} TL`, icon: <TrendingUp />, color: 'var(--green)' },
        { title: 'Aktif Kullanıcı', value: stats.users.total || 0, icon: <Users />, color: 'var(--red)' },
    ];

    return (
        <div className="admin-layout animate-fade">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="brand" style={{ padding: '0 20px', marginBottom: '40px' }}>
                    <div className="brand-mark">A</div>
                    <div className="brand-name">PANEL</div>
                </div>
                <nav className="admin-nav">
                    <a href="#" className="active"><LayoutDashboard size={20} /> Dashboard</a>
                    <a href="#"><Package size={20} /> Ürünler</a>
                    <a href="#"><ShoppingBag size={20} /> Siparişler</a>
                    <a href="#"><MessageSquare size={20} /> Destek</a>
                    <a href="#"><Settings size={20} /> Ayarlar</a>
                </nav>
                <button className="admin-logout"><LogOut size={20} /> Çıkış Yap</button>
            </aside>

            {/* Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <h1>Dashboard</h1>
                    <div className="admin-user">Admin @ Auto Akın</div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-4" style={{ marginBottom: '40px' }}>
                    {cards.map((card, i) => (
                        <div key={i} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ color: card.color }}>{card.icon}</div>
                                <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 700 }}>AYLIK</span>
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 800 }}>{card.value}</div>
                            <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{card.title}</div>
                        </div>
                    ))}
                </div>

                {/* Tables & More */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ marginBottom: '20px', fontWeight: 800 }}>Son Siparişler</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Sipariş No</th>
                                        <th>Müşteri</th>
                                        <th>Tutar</th>
                                        <th>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.order_no}</td>
                                            <td>{order.customer_name}</td>
                                            <td>{order.total} TL</td>
                                            <td><span className="badge-status">{order.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ marginBottom: '20px', fontWeight: 800 }}>Stok Uyarıları</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {stats.products.low_stock > 0 ? (
                                <div style={{ background: 'var(--orange-bg)', color: 'var(--orange)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <AlertTriangle size={20} />
                                    <span>{stats.products.low_stock} ürün stokta azalıyor.</span>
                                </div>
                            ) : (
                                <div style={{ background: 'var(--green-bg)', color: 'var(--green)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <CheckCircle size={20} />
                                    <span>Stok durumu iyi.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .admin-layout { display: flex; min-height: 100vh; background: #f8f9fa; }
                .admin-sidebar { width: 260px; background: var(--black); color: var(--white); padding: 40px 0; display: flex; flexDirection: column; }
                .admin-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
                .admin-nav a { padding: 12px 24px; color: var(--gray-500); display: flex; alignItems: center; gap: 12px; font-weight: 600; transition: all 0.2s; }
                .admin-nav a.active, .admin-nav a:hover { color: var(--white); background: rgba(255,255,255,0.05); }
                .admin-logout { padding: 12px 24px; background: none; border: none; color: var(--red); display: flex; alignItems: center; gap: 12px; font-weight: 700; cursor: pointer; text-align: left; }
                
                .admin-main { flex: 1; padding: 40px 48px; }
                .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                .admin-header h1 { font-family: 'Anton'; font-size: 32px; }
                .admin-user { font-weight: 700; color: var(--gray-500); }

                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th { text-align: left; padding: 12px 0; border-bottom: 2px solid var(--gray-100); color: var(--gray-500); font-size: 13px; }
                .admin-table td { padding: 16px 0; border-bottom: 1px solid var(--gray-50); font-size: 14px; font-weight: 600; }
                .badge-status { background: var(--gray-100); padding: 4px 10px; borderRadius: 6px; font-size: 12px; text-transform: capitalize; }
            `}} />
        </div>
    );
};

export default AdminDashboard;
