// Auto Akın — Express Server
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { setupDatabase, pool, getSettings } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Persistent Session (MySQL2 Store)
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({}, pool);

app.use(session({
    secret: process.env.SESSION_SECRET || 'autoakin_secret_key_2026',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 gün
}));

// Ortak değişkenler
app.use(async (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null;
    try {
        res.locals.settings = await getSettings();
    } catch { res.locals.settings = {}; }
    next();
});

// ── Routes ──
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const pageRoutes = require('./routes/pages');

app.use('/api', apiRoutes);
app.use('/panel', adminRoutes);
app.use('/', pageRoutes);

// ── robots.txt ──
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nSitemap: ${process.env.SITE_URL || 'https://autoakin.com.tr'}/sitemap.xml`);
});

// ── 404 ──
app.use((req, res) => {
    res.status(404).render('404', { pageTitle: 'Sayfa Bulunamadı | Auto Akın' });
});

// ── Start ──
async function start() {
    try {
        await setupDatabase();
        app.listen(PORT, () => {
            console.log(`\n🚗 Auto Akın çalışıyor: http://localhost:${PORT}\n`);
            console.log(`📋 Admin Panel: http://localhost:${PORT}/panel`);
            console.log(`👤 Admin: admin@autoakin.com / AutoAkin2026!\n`);
        });
    } catch (err) {
        console.error('❌ Başlatma hatası:', err);
        console.error('💡 config/db.js dosyasında MySQL bilgilerini kontrol edin.');
        process.exit(1);
    }
}

start();
