// Auto Akın — Page Routes (MariaDB)
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Helper
async function withConn(fn) {
    let conn;
    try { conn = await pool.getConnection(); return await fn(conn); }
    finally { if (conn) conn.release(); }
}

// Ana Sayfa Data
router.get('/', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const [categories] = await conn.query('SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as product_count FROM categories c WHERE c.is_active = 1 ORDER BY c.sort_order');
            const [featured] = await conn.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 ORDER BY p.created_at DESC LIMIT 10');
            const [discounted] = await conn.query('SELECT * FROM products WHERE old_price IS NOT NULL AND old_price > price AND is_active = 1 LIMIT 4');
            const [vehicleBrands] = await conn.query('SELECT * FROM vehicle_brands WHERE is_active = 1 ORDER BY sort_order, name');

            res.json({
                categories, featured, discounted, vehicleBrands
            });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Ürünler Filtrele/Listele Data
router.get('/urunler', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const [categories] = await conn.query('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order');
            const [vehicleBrands] = await conn.query('SELECT * FROM vehicle_brands WHERE is_active = 1 ORDER BY name');
            res.json({
                categories, vehicleBrands, query: req.query
            });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Ürün Detay Data
router.get('/urun/:id', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const [rows] = await conn.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [req.params.id]);
            if (!rows.length) return res.status(404).json({ error: 'Ürün bulunamadı' });
            const product = rows[0];

            const [vehicles] = await conn.query('SELECT vm.*, vb.name as brand_name FROM product_vehicles pv JOIN vehicle_models vm ON pv.vehicle_model_id = vm.id JOIN vehicle_brands vb ON vm.brand_id = vb.id WHERE pv.product_id = ?', [req.params.id]);
            const [related] = await conn.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1 LIMIT 4', [product.category_id, req.params.id]);

            let isFav = false;
            if (req.session.user) {
                const [favs] = await conn.query('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?', [req.session.user.id, req.params.id]);
                isFav = favs.length > 0;
            }

            res.json({
                product, vehicles, related, isFav
            });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Sepet - Frontend tarafında yönetilecek, boş response dönüyoruz
router.get('/sepet', (req, res) => {
    res.json({ message: 'Cart page data requested' });
});

// Ödeme
router.get('/odeme', (req, res) => {
    res.json({ message: 'Checkout page data requested' });
});

// Giriş Durumu
router.get('/giris', (req, res) => {
    if (req.session.user) {
        return res.json({ loggedIn: true, user: req.session.user });
    }
    res.json({ loggedIn: false });
});

// Sipariş Takip
router.get('/siparis-takip', (req, res) => {
    res.json({ message: 'Order track page data requested' });
});

// Favoriler
router.get('/favoriler', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    try {
        await withConn(async (conn) => {
            const [favs] = await conn.query('SELECT p.* FROM favorites f JOIN products p ON f.product_id = p.id WHERE f.user_id = ? ORDER BY f.created_at DESC', [req.session.user.id]);
            res.json({ favorites: favs });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

module.exports = router;
