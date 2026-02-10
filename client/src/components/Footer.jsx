import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Youtube, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer container section" style={{ borderTop: '1px solid var(--gray-200)', marginTop: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', width: '100%' }}>
                <div>
                    <Link to="/" className="brand" style={{ marginBottom: '20px' }}>
                        <div className="brand-mark">A</div>
                        <div className="brand-name">AUTO AKIN</div>
                    </Link>
                    <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '24px' }}>
                        Otomotiv yedek parça ve aksesuar dünyasında güvenilir adresiniz. Aradığınız her parçayı en uygun fiyata bulun.
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <a href="#" className="btn-icon"><Instagram size={20} /></a>
                        <a href="#" className="btn-icon"><Youtube size={20} /></a>
                        <a href="#" className="btn-icon"><Facebook size={20} /></a>
                    </div>
                </div>

                <div>
                    <h3 style={{ fontFamily: 'Anton', fontSize: '18px', marginBottom: '20px' }}>Hızlı Linkler</h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                        <li><Link to="/" className="link-underline">Ana Sayfa</Link></li>
                        <li><Link to="/urunler" className="link-underline">Ürünler</Link></li>
                        <li><Link to="/siparis-takip" className="link-underline">Sipariş Takip</Link></li>
                        <li><Link to="/iletisim" className="link-underline">İletişim</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 style={{ fontFamily: 'Anton', fontSize: '18px', marginBottom: '20px' }}>İletişim</h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                        <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Phone size={18} className="text-red" />
                            <span>+90 (555) 000 00 00</span>
                        </li>
                        <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Mail size={18} className="text-red" />
                            <span>info@autoakin.com.tr</span>
                        </li>
                        <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <MapPin size={18} className="text-red" />
                            <span>İstanbul, Türkiye</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div style={{ marginTop: '60px', paddingTop: '24px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--gray-500)' }}>
                <p>© 2026 Auto Akın. Tüm hakları saklıdır.</p>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <a href="#">Mesafeli Satış Sözleşmesi</a>
                    <a href="#">KVKK Aydınlatma Metni</a>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .text-red { color: var(--red); }
            `}} />
        </footer>
    );
};

export default Footer;
