import { useState } from 'react';
import axios from 'axios';
import { User, Lock, Mail, Phone, LogIn } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        try {
            const res = await axios.post(`http://localhost:3000${endpoint}`, formData);
            if (res.data.success) {
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Bir hata oluştu.');
        }
    };

    return (
        <div className="container section animate-fade" style={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontFamily: 'Anton', fontSize: '32px', marginBottom: '8px' }}>{isLogin ? 'Hoş Geldiniz' : 'Hesap Oluştur'}</h1>
                    <p style={{ color: 'var(--gray-500)' }}>{isLogin ? 'Devam etmek için giriş yapın.' : 'Aramıza katılmak için formu doldurun.'}</p>
                </div>

                <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', boxShadow: var(--shadow) }}>
                    {error && <div style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
                    
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        {!isLogin && (
                            <div className="input-group">
                                <label><User size={16} /> İsim Soyisim</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Adınız Soyadınız" />
                            </div>
                        )}
                        <div className="input-group">
                            <label><Mail size={16} /> E-Posta</label>
                            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ornek@mail.com" />
                        </div>
                        {!isLogin && (
                            <div className="input-group">
                                <label><Phone size={16} /> Telefon</label>
                                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0555..." />
                            </div>
                        )}
                        <div className="input-group">
                            <label><Lock size={16} /> Şifre</label>
                            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                        </div>

                        <button className="btn btn-block btn-lg" type="submit">
                            <LogIn size={20} /> {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px' }}>
                        {isLogin ? (
                            <span>Hesabınız yok mu? <button className="text-red" onClick={() => setIsLogin(false)}>Kayıt Ol</button></span>
                        ) : (
                            <span>Zaten üye misiniz? <button className="text-red" onClick={() => setIsLogin(true)}>Giriş Yap</button></span>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .input-group { display: grid; gap: 8px; }
                .input-group label { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; color: var(--gray-700); }
                .input-group input { 
                    padding: 12px 16px; 
                    border: 1px solid var(--gray-200); 
                    border-radius: 10px; 
                    font-family: inherit; 
                    outline: none;
                    transition: all var(--transition);
                }
                .input-group input:focus { border-color: var(--red); box-shadow: 0 0 0 4px rgba(225,6,0,0.05); }
                .text-red { background: none; border: none; font-weight: 700; color: var(--red); cursor: pointer; padding: 0; }
            `}} />
        </div >
    );
};

export default Login;
