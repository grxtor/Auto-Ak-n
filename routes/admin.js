// Auto Akın — Admin Panel Routes (MariaDB)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool, getSettings } = require('../db');

// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, 'product_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + ext);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Helper
async function withConn(fn) {
    let conn;
    try { conn = await pool.getConnection(); return await fn(conn); }
    finally { if (conn) conn.release(); }
}

// Admin auth middleware
function requireAdmin(req, res, next) {
    if (!req.session.admin) {
        if (req.xhr || req.headers.accept?.includes('json')) return res.status(401).json({ error: 'Yetkisiz' });
        return res.redirect('/panel');
    }
    next();
}

// ── Admin Login Status ──
router.get('/', (req, res) => {
    if (req.session.admin) return res.json({ loggedIn: true, admin: req.session.admin });
    res.json({ loggedIn: false });
});

// ── Dashboard Data ──
router.get('/dashboard', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const [orderStats] = await conn.query("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN payment_status = 'uploaded' THEN 1 ELSE 0 END) as payment_waiting, SUM(total) as revenue FROM orders_table");
            const [productStats] = await conn.query("SELECT COUNT(*) as total, SUM(CASE WHEN stock < 5 THEN 1 ELSE 0 END) as low_stock FROM products");
            const [chatStats] = await conn.query("SELECT COUNT(*) as active FROM chat_sessions WHERE status = 'active'");
            const [recentOrders] = await conn.query("SELECT * FROM orders_table ORDER BY created_at DESC LIMIT 5");
            const [userCount] = await conn.query("SELECT COUNT(*) as total FROM users");

            res.json({
                stats: { orders: orderStats[0], products: productStats[0], chats: chatStats[0], users: userCount[0] },
                recentOrders
            });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Products List Data ──
router.get('/urunler', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const [products] = await conn.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC');
            const [categories] = await conn.query('SELECT * FROM categories ORDER BY sort_order');
            const [vehicleBrands] = await conn.query('SELECT * FROM vehicle_brands WHERE is_active = 1 ORDER BY name');
            res.json({ products, categories, vehicleBrands });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Ürün ekle
router.post('/urunler/add', requireAdmin, upload.fields([
    { name: 'image', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }
]), async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { name, category_id, brand, oem_no, price, old_price, stock, description, badge, vehicle_models } = req.body;
            const image = req.files?.image?.[0] ? 'uploads/' + req.files.image[0].filename : null;
            const image2 = req.files?.image2?.[0] ? 'uploads/' + req.files.image2[0].filename : null;
            const image3 = req.files?.image3?.[0] ? 'uploads/' + req.files.image3[0].filename : null;

            const [result] = await conn.query(
                'INSERT INTO products (name, category_id, brand, oem_no, price, old_price, stock, description, image, image2, image3, badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, category_id || null, brand || '', oem_no || '', parseFloat(price), old_price ? parseFloat(old_price) : null, parseInt(stock) || 0, description || '', image, image2, image3, badge || '']
            );

            if (vehicle_models) {
                const models = Array.isArray(vehicle_models) ? vehicle_models : [vehicle_models];
                for (const modelId of models) {
                    await conn.query('INSERT IGNORE INTO product_vehicles (product_id, vehicle_model_id) VALUES (?, ?)', [Number(result.insertId), parseInt(modelId)]);
                }
            }
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Ürün düzenle
router.post('/urunler/edit/:id', requireAdmin, upload.fields([
    { name: 'image', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }
]), async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { name, category_id, brand, oem_no, price, old_price, stock, description, badge, is_active, vehicle_models } = req.body;
            const fields = ['name=?', 'category_id=?', 'brand=?', 'oem_no=?', 'price=?', 'old_price=?', 'stock=?', 'description=?', 'badge=?', 'is_active=?'];
            const params = [name, category_id || null, brand || '', oem_no || '', parseFloat(price), old_price ? parseFloat(old_price) : null, parseInt(stock) || 0, description || '', badge || '', is_active ? 1 : 0];

            if (req.files?.image?.[0]) { fields.push('image=?'); params.push('uploads/' + req.files.image[0].filename); }
            if (req.files?.image2?.[0]) { fields.push('image2=?'); params.push('uploads/' + req.files.image2[0].filename); }
            if (req.files?.image3?.[0]) { fields.push('image3=?'); params.push('uploads/' + req.files.image3[0].filename); }

            params.push(req.params.id);
            await conn.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);

            await conn.query('DELETE FROM product_vehicles WHERE product_id = ?', [req.params.id]);
            if (vehicle_models) {
                const models = Array.isArray(vehicle_models) ? vehicle_models : [vehicle_models];
                for (const modelId of models) {
                    await conn.query('INSERT IGNORE INTO product_vehicles (product_id, vehicle_model_id) VALUES (?, ?)', [req.params.id, parseInt(modelId)]);
                }
            }
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Ürün sil
router.post('/urunler/delete/:id', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            await conn.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Orders List Data ──
router.get('/siparisler', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const [orders] = await conn.query('SELECT * FROM orders_table ORDER BY created_at DESC');
            res.json({ orders });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/siparisler/:id', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const [orders] = await conn.query('SELECT * FROM orders_table WHERE id = ?', [req.params.id]);
            if (!orders.length) return res.status(404).json({ error: 'Sipariş bulunamadı' });
            const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
            res.json({ order: orders[0], items });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/siparisler/update/:id', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { status, payment_status, tracking_no, cargo_company } = req.body;
            await conn.query('UPDATE orders_table SET status=?, payment_status=?, tracking_no=?, cargo_company=? WHERE id=?',
                [status, payment_status, tracking_no || '', cargo_company || '', req.params.id]);
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Chat (Admin) Data ──
router.get('/destek', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const [sessions] = await conn.query("SELECT cs.*, (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as msg_count, (SELECT message FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message FROM chat_sessions cs ORDER BY cs.updated_at DESC");
            res.json({ sessions });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/destek/messages/:sessionId', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const [msgs] = await conn.query('SELECT sender, message, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC', [req.params.sessionId]);
            res.json(msgs);
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/destek/reply', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { session_id, message } = req.body;
            await conn.query("INSERT INTO chat_messages (session_id, sender, message) VALUES (?, 'admin', ?)", [session_id, message]);
            await conn.query('UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?', [session_id]);
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Vehicles (Admin) Data ──
router.get('/araclar', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const [brands] = await conn.query('SELECT * FROM vehicle_brands ORDER BY sort_order, name');
            const [models] = await conn.query('SELECT vm.*, vb.name as brand_name FROM vehicle_models vm JOIN vehicle_brands vb ON vm.brand_id = vb.id ORDER BY vb.name, vm.name');
            res.json({ brands, models });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/araclar/add-brand', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            await conn.query('INSERT INTO vehicle_brands (name) VALUES (?)', [req.body.name]);
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/araclar/add-model', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { brand_id, name, year_start, year_end } = req.body;
            await conn.query('INSERT INTO vehicle_models (brand_id, name, year_start, year_end) VALUES (?, ?, ?, ?)',
                [brand_id, name, year_start || null, year_end || null]);
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/araclar/delete-brand/:id', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => { await conn.query('DELETE FROM vehicle_brands WHERE id = ?', [req.params.id]); });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/araclar/delete-model/:id', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => { await conn.query('DELETE FROM vehicle_models WHERE id = ?', [req.params.id]); });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Categories (Admin) Data ──
router.post('/kategoriler/add', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            await conn.query('INSERT INTO categories (name, icon) VALUES (?, ?)', [req.body.name, req.body.icon || '📦']);
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/kategoriler/delete/:id', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => { await conn.query('DELETE FROM categories WHERE id = ?', [req.params.id]); });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Settings Data ──
router.get('/ayarlar', requireAdmin, async (req, res) => {
    try {
        const settings = await getSettings();
        res.json({ settings });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/ayarlar/save', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            for (const [key, value] of Object.entries(req.body)) {
                await conn.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)', [key, value]);
            }
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/ayarlar/change-password', requireAdmin, async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { current_password, new_password } = req.body;
            const [admins] = await conn.query('SELECT * FROM admins WHERE id = ?', [req.session.admin.id]);
            if (!admins.length || !(await bcrypt.compare(current_password, admins[0].password))) {
                return res.status(400).json({ error: 'Mevcut şifre hatalı' });
            }
            const hash = await bcrypt.hash(new_password, 10);
            await conn.query('UPDATE admins SET password = ? WHERE id = ?', [hash, req.session.admin.id]);
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
