// Auto Akın — MySQL2 Veritabanı Modülü
const mysql = require('mysql2/promise');
const fs = require('fs');

// Plesk/Yerel bağlantı bilgileri
const dbHost = process.env.DB_HOST || 'localhost';

// Soket tespiti (Shared hosting veya yerel Mac/Linux için otomatik bulur)
let socketPath = process.env.DB_SOCKET;
if (!socketPath && dbHost === 'localhost') {
  const commonPaths = [
    '/var/lib/mysql/mysql.sock',
    '/tmp/mysql.sock',
    '/var/run/mysqld/mysqld.sock',
    '/Applications/MAMP/tmp/mysql/mysql.sock' // Mac MAMP desteği
  ];
  socketPath = commonPaths.find(p => fs.existsSync(p));
}

const pool = mysql.createPool({
  host: dbHost,
  socketPath: socketPath,
  user: process.env.DB_USER || 'autoakin',
  password: process.env.DB_PASS || '45899213.Te',
  database: process.env.DB_NAME || 'oce97yazilimcom_',
  port: parseInt(process.env.DB_PORT) || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Tablo oluşturma
async function setupDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();

    const queries = [
      `CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(10) DEFAULT '📦',
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS vehicle_brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS vehicle_models (
        id INT AUTO_INCREMENT PRIMARY KEY,
        brand_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        year_start INT,
        year_end INT,
        is_active TINYINT(1) DEFAULT 1,
        FOREIGN KEY (brand_id) REFERENCES vehicle_brands(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id INT,
        brand VARCHAR(100),
        oem_no VARCHAR(100),
        price DECIMAL(10,2) NOT NULL,
        old_price DECIMAL(10,2),
        stock INT DEFAULT 0,
        description TEXT,
        image VARCHAR(255),
        image2 VARCHAR(255),
        image3 VARCHAR(255),
        badge VARCHAR(50),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS product_vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        vehicle_model_id INT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_model_id) REFERENCES vehicle_models(id) ON DELETE CASCADE,
        UNIQUE KEY unique_pv (product_id, vehicle_model_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS orders_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_no VARCHAR(20) UNIQUE NOT NULL,
        user_id INT,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(255),
        customer_address TEXT,
        customer_note TEXT,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('pending','confirmed','preparing','shipped','delivered','cancelled') DEFAULT 'pending',
        payment_status ENUM('waiting','uploaded','approved','rejected') DEFAULT 'waiting',
        receipt_image VARCHAR(255),
        tracking_no VARCHAR(100),
        cargo_company VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders_table(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS chat_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_key VARCHAR(100) UNIQUE NOT NULL,
        visitor_name VARCHAR(100) DEFAULT 'Ziyaretçi',
        user_id INT,
        status ENUM('active','closed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        sender ENUM('customer','admin') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_fav (user_id, product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    ];

    for (const q of queries) {
      await conn.query(q);
    }

    // Varsayılan admin
    const bcrypt = require('bcryptjs');
    const [admins] = await conn.query('SELECT id FROM admins LIMIT 1');
    if (admins.length === 0) {
      const hash = await bcrypt.hash('AutoAkin2026!', 10);
      await conn.query('INSERT INTO admins (email, password, name) VALUES (?, ?, ?)', ['admin@autoakin.com', hash, 'Admin']);
      console.log('✅ Admin oluşturuldu: admin@autoakin.com / AutoAkin2026!');
    }

    // Varsayılan kategoriler
    const [cats] = await conn.query('SELECT COUNT(*) as c FROM categories');
    if (Number(cats[0].c) === 0) {
      const defaultCats = [
        ['Motor & Parçaları', '⚙️', 1], ['Fren Sistemi', '🛑', 2], ['Süspansiyon', '🔧', 3],
        ['Elektrik & Aydınlatma', '💡', 4], ['Kaporta', '🚗', 5], ['Aksesuar', '🎯', 6],
        ['Egzoz Sistemi', '💨', 7], ['Şanzıman & Debriyaj', '⚡', 8], ['Soğutma Sistemi', '❄️', 9], ['İç Aksesuar', '🪑', 10]
      ];
      for (const [name, icon, order] of defaultCats) {
        await conn.query('INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)', [name, icon, order]);
      }
      console.log('✅ 10 kategori eklendi');
    }

    // Varsayılan araç markaları
    const [brands] = await conn.query('SELECT COUNT(*) as c FROM vehicle_brands');
    if (Number(brands[0].c) === 0) {
      const defaultBrands = ['Audi', 'BMW', 'Chevrolet', 'Citroën', 'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Kia',
        'Mercedes-Benz', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Seat', 'Skoda', 'Toyota', 'Volkswagen', 'Volvo'];
      for (let i = 0; i < defaultBrands.length; i++) {
        await conn.query('INSERT INTO vehicle_brands (name, sort_order) VALUES (?, ?)', [defaultBrands[i], i + 1]);
      }
      console.log('✅ 20 araç markası eklendi');
    }

    // Varsayılan ayarlar
    const [sets] = await conn.query('SELECT COUNT(*) as c FROM settings');
    if (Number(sets[0].c) === 0) {
      const defaults = [
        ['company_name', 'Auto Akın Otomotiv'], ['iban', 'TR00 0000 0000 0000 0000 0000 00'],
        ['iban_holder', 'Auto Akın Otomotiv Ltd.'], ['iban_bank', ''],
        ['iban_note', 'Açıklama kısmına sipariş numaranızı ve ad soyadınızı yazınız.'],
        ['phone', ''], ['email', 'info@autoakin.com'], ['address', ''],
        ['whatsapp', ''], ['instagram', ''],
        ['meta_description', 'Otomotiv yedek parça ve aksesuar pazaryeri. Hızlı tedarik, net fiyat, güvenli ödeme.']
      ];
      for (const [k, v] of defaults) {
        await conn.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [k, v]);
      }
      console.log('✅ Varsayılan ayarlar kaydedildi');
    }

    console.log('✅ Veritabanı hazır!');
  } finally {
    if (conn) conn.release();
  }
}

// Ayarları getir
async function getSettings() {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT setting_key, setting_value FROM settings');
    const settings = {};
    for (const r of rows) settings[r.setting_key] = r.setting_value;
    return settings;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { pool, setupDatabase, getSettings };
