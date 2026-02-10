// Auto Akın — API Routes (MariaDB)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { pool } = require('../db');

// Multer ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads');
        const fs = require('fs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + '_' + Math.random().toString(36).substr(2, 6) + ext);
    }
});
const upload = multer({
    storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Sadece resim dosyaları!'), false);
    }
});

// Helper: connection wrapper
async function withConn(fn) {
    let conn;
    try { conn = await pool.getConnection(); return await fn(conn); }
    finally { if (conn) conn.release(); }
}

// ══════════════════════════════════════
// AUTH
// ══════════════════════════════════════

router.post('/auth/register', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { name, email, phone, password } = req.body;
            if (!name || !email || !password) return res.status(400).json({ error: 'Tüm alanlar gerekli.' });
            if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter.' });

            const exists = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
            if (exists.length) return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı.' });

            const hash = await bcrypt.hash(password, 10);
            const result = await conn.query('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)', [name, email, phone || '', hash]);

            req.session.user = { id: Number(result.insertId), name, email };
            res.json({ success: true, name });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/auth/login', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { email, password } = req.body;
            const users = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
            if (!users.length) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
            const user = users[0];
            const storedHash = user.password.toString();

            if (!(await bcrypt.compare(password, storedHash))) {
                return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
            }
            req.session.user = { id: user.id, name: user.name, email: user.email };
            res.json({ success: true, name: users[0].name });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/auth/logout', (req, res) => {
    req.session.user = null;
    res.json({ success: true });
});

router.post('/auth/admin-login', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { email, password } = req.body;
            const admins = await conn.query('SELECT * FROM admins WHERE email = ?', [email]);
            if (!admins.length) return res.status(401).json({ error: 'Admin bilgileri hatalı.' });
            const admin = admins[0];
            const storedHash = admin.password.toString(); // Buffer -> String conversion if needed

            if (!(await bcrypt.compare(password, storedHash))) {
                return res.status(401).json({ error: 'Admin bilgileri hatalı.' });
            }
            req.session.admin = { id: admin.id, name: admin.name, email: admin.email };
            res.json({ success: true });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/auth/admin-logout', (req, res) => {
    req.session.admin = null;
    res.json({ success: true });
});

// ══════════════════════════════════════
// PRODUCTS (Public)
// ══════════════════════════════════════

router.get('/products', async (req, res) => {
    try {
        await withConn(async (conn) => {
            let where = ['p.is_active = 1'];
            let params = [];

            if (req.query.q) {
                where.push('(p.name LIKE ? OR p.brand LIKE ? OR p.oem_no LIKE ?)');
                const q = `%${req.query.q}%`;
                params.push(q, q, q);
            }
            if (req.query.category_id) {
                where.push('p.category_id = ?');
                params.push(parseInt(req.query.category_id));
            }
            if (req.query.vehicle_model_id) {
                where.push('p.id IN (SELECT product_id FROM product_vehicles WHERE vehicle_model_id = ?)');
                params.push(parseInt(req.query.vehicle_model_id));
            } else if (req.query.vehicle_brand_id) {
                where.push('p.id IN (SELECT pv.product_id FROM product_vehicles pv JOIN vehicle_models vm ON pv.vehicle_model_id = vm.id WHERE vm.brand_id = ?)');
                params.push(parseInt(req.query.vehicle_brand_id));
            }

            let orderBy = 'p.created_at DESC';
            if (req.query.sort === 'price-asc') orderBy = 'p.price ASC';
            if (req.query.sort === 'price-desc') orderBy = 'p.price DESC';
            if (req.query.sort === 'name') orderBy = 'p.name ASC';

            const rows = await conn.query(
                `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE ${where.join(' AND ')} ORDER BY ${orderBy}`,
                params
            );
            res.json(rows);
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/products/:id', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const rows = await conn.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [req.params.id]);
            if (!rows.length) return res.status(404).json({ error: 'Ürün bulunamadı' });
            const product = rows[0];

            const vehicles = await conn.query(
                'SELECT vm.*, vb.name as brand_name FROM product_vehicles pv JOIN vehicle_models vm ON pv.vehicle_model_id = vm.id JOIN vehicle_brands vb ON vm.brand_id = vb.id WHERE pv.product_id = ?',
                [req.params.id]
            );
            product.vehicles = vehicles;
            res.json(product);
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/categories', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const rows = await conn.query('SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as product_count FROM categories c WHERE c.is_active = 1 ORDER BY c.sort_order');
            res.json(rows);
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/vehicle-brands', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const rows = await conn.query('SELECT * FROM vehicle_brands WHERE is_active = 1 ORDER BY sort_order, name');
            res.json(rows);
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/vehicle-models/:brandId', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const rows = await conn.query('SELECT * FROM vehicle_models WHERE brand_id = ? AND is_active = 1 ORDER BY name', [req.params.brandId]);
            res.json(rows);
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Favori toggle
router.post('/favorites/toggle', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Giriş yapın' });
    try {
        await withConn(async (conn) => {
            const { product_id } = req.body;
            const exists = await conn.query('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?', [req.session.user.id, product_id]);
            if (exists.length) {
                await conn.query('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [req.session.user.id, product_id]);
                res.json({ status: 'removed' });
            } else {
                await conn.query('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [req.session.user.id, product_id]);
                res.json({ status: 'added' });
            }
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// ORDERS
// ══════════════════════════════════════

router.post('/orders', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { name, phone, email, address, note, items } = req.body;
            if (!name || !phone || !items || !items.length) return res.status(400).json({ error: 'Eksik bilgi.' });

            const orderNo = 'SA-' + String(Math.floor(10000 + Math.random() * 90000));
            let total = 0;
            const orderItems = [];

            for (const item of items) {
                const prods = await conn.query('SELECT id, name, price FROM products WHERE id = ?', [item.id]);
                if (prods.length) {
                    const qty = Math.max(1, parseInt(item.qty) || 1);
                    total += prods[0].price * qty;
                    orderItems.push({ product_id: prods[0].id, product_name: prods[0].name, quantity: qty, price: prods[0].price });
                }
            }

            const userId = req.session.user?.id || null;
            const result = await conn.query(
                'INSERT INTO orders_table (order_no, user_id, customer_name, customer_phone, customer_email, customer_address, customer_note, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [orderNo, userId, name, phone, email || '', address || '', note || '', total]
            );

            for (const oi of orderItems) {
                await conn.query('INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
                    [Number(result.insertId), oi.product_id, oi.product_name, oi.quantity, oi.price]);
            }

            res.json({ success: true, order_no: orderNo, total });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/orders/track/:orderNo', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const rows = await conn.query('SELECT order_no, customer_name, total, status, payment_status, tracking_no, cargo_company, created_at FROM orders_table WHERE order_no = ?', [req.params.orderNo]);
            if (!rows.length) return res.status(404).json({ error: 'Sipariş bulunamadı' });
            const order = rows[0];
            const items = await conn.query('SELECT product_name, quantity, price FROM order_items WHERE order_id = (SELECT id FROM orders_table WHERE order_no = ?)', [req.params.orderNo]);
            order.items = items;
            res.json(order);
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/orders/upload-receipt', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Dosya yüklenemedi' });
        await withConn(async (conn) => {
            await conn.query("UPDATE orders_table SET receipt_image = ?, payment_status = 'uploaded' WHERE order_no = ?",
                ['uploads/' + req.file.filename, req.body.order_no]);
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// CHAT
// ══════════════════════════════════════

router.post('/chat/send', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const { session_key, message, sender = 'customer', visitor_name = 'Ziyaretçi' } = req.body;
            if (!session_key || !message) return res.status(400).json({ error: 'Eksik veri' });

            let sessions = await conn.query('SELECT id FROM chat_sessions WHERE session_key = ?', [session_key]);
            let sessionId;

            if (!sessions.length) {
                const result = await conn.query('INSERT INTO chat_sessions (session_key, visitor_name, user_id) VALUES (?, ?, ?)',
                    [session_key, visitor_name, req.session.user?.id || null]);
                sessionId = Number(result.insertId);
            } else {
                sessionId = sessions[0].id;
                await conn.query('UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?', [sessionId]);
            }

            await conn.query('INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)', [sessionId, sender, message]);
            res.json({ success: true });
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/chat/messages/:sessionKey', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const rows = await conn.query(
                'SELECT cm.sender, cm.message, cm.created_at FROM chat_messages cm JOIN chat_sessions cs ON cm.session_id = cs.id WHERE cs.session_key = ? ORDER BY cm.created_at ASC',
                [req.params.sessionKey]
            );
            res.json(rows);
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════
// SETTINGS (Public)
// ══════════════════════════════════════

router.get('/settings/public', async (req, res) => {
    try {
        await withConn(async (conn) => {
            const keys = ['company_name', 'iban', 'iban_holder', 'iban_bank', 'iban_note', 'phone', 'email', 'address', 'whatsapp', 'instagram', 'meta_description'];
            const rows = await conn.query(`SELECT setting_key, setting_value FROM settings WHERE setting_key IN (${keys.map(() => '?').join(',')})`, keys);
            const settings = {};
            for (const r of rows) settings[r.setting_key] = r.setting_value;
            res.json(settings);
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
