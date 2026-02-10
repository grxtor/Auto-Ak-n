// Auto Akın — Client-side JavaScript

// ══════════════════════════════════════
// CART (localStorage)
// ══════════════════════════════════════

function getCart() {
    try { return JSON.parse(localStorage.getItem('autoakin_cart') || '[]'); }
    catch { return []; }
}

function saveCart(items) {
    localStorage.setItem('autoakin_cart', JSON.stringify(items));
    updateCartBadge();
}

function addToCart(id, qty = 1) {
    const items = getCart();
    const existing = items.find(i => i.id === id);
    if (existing) existing.qty += qty;
    else items.push({ id, qty });
    saveCart(items);
    showToast('Ürün sepete eklendi!');
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const count = getCart().reduce((sum, i) => sum + i.qty, 0);
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
}

// ══════════════════════════════════════
// VEHICLE MODEL LOADER
// ══════════════════════════════════════

async function loadModels(brandId, selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Tüm Modeller</option>';
    if (!brandId) return;

    try {
        const r = await fetch('/api/vehicle-models/' + brandId);
        const models = await r.json();
        models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name + (m.year_start ? ` (${m.year_start}-${m.year_end || '...'})` : '');
            select.appendChild(opt);
        });
    } catch (e) { console.error('Model yükleme hatası:', e); }
}

// ══════════════════════════════════════
// TOAST
// ══════════════════════════════════════

function showToast(message, type = '') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.className = 'toast show ' + type;
    setTimeout(() => el.className = 'toast', 2500);
}

// ══════════════════════════════════════
// CHAT WIDGET
// ══════════════════════════════════════

function initChatWidget() {
    const container = document.getElementById('chatWidget');
    if (!container) return;

    let sessionKey = localStorage.getItem('autoakin_chat_session');
    if (!sessionKey) {
        sessionKey = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('autoakin_chat_session', sessionKey);
    }

    container.innerHTML = `
    <button class="chat-toggle" id="chatToggle" onclick="toggleChat()">
      <span class="chat-toggle-icon">💬</span>
      Canlı Destek
    </button>
    <div class="chat-panel" id="chatPopup">
      <div class="chat-header">
        <div class="chat-header-info">
          <span class="chat-header-dot"></span>
          Canlı Destek
        </div>
        <button class="chat-close" onclick="toggleChat()">✕</button>
      </div>
      <div class="chat-messages" id="chatPopupMessages"></div>
      <div class="chat-input">
        <input type="text" id="chatInput" placeholder="Mesajınızı yazın..." onkeydown="if(event.key==='Enter')sendChatMessage()" />
        <button class="chat-send" onclick="sendChatMessage()">Gönder</button>
      </div>
    </div>
  `;

    // Mesajları periyodik olarak yükle
    setInterval(() => {
        const popup = document.getElementById('chatPopup');
        if (popup && popup.style.display !== 'none') loadChatMessages();
    }, 3000);
}

function toggleChat() {
    const popup = document.getElementById('chatPopup');
    if (!popup) return;
    const isOpen = popup.classList.contains('open');
    popup.classList.toggle('open');
    if (!isOpen) loadChatMessages();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadChatMessages() {
    const key = localStorage.getItem('autoakin_chat_session');
    if (!key) return;

    try {
        const r = await fetch('/api/chat/messages/' + key);
        const msgs = await r.json();
        const el = document.getElementById('chatPopupMessages');
        if (!el) return;

        if (!msgs.length) {
            el.innerHTML = '<div class="chat-msg chat-msg--admin">Henüz mesaj yok. Bize yazın!</div>';
            return;
        }

        el.innerHTML = msgs.map(m => {
            const safeMessage = escapeHtml(m.message || '');
            const time = new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            const cls = m.sender === 'customer' ? 'chat-msg--customer' : 'chat-msg--admin';
            return `
        <div class="chat-msg ${cls}">${safeMessage}</div>
        <div style="font-size:9px;color:#999;margin:2px 0 6px;">${time}</div>
      `;
        }).join('');
        el.scrollTop = el.scrollHeight;
    } catch (e) { }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;

    const key = localStorage.getItem('autoakin_chat_session');
    try {
        await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_key: key, message: msg })
        });
        input.value = '';
        loadChatMessages();
    } catch (e) { }
}

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    initChatWidget();

    // Event delegation for add-to-cart buttons (data-id)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (btn) {
            e.preventDefault();
            const id = parseInt(btn.dataset.id);
            if (id) addToCart(id);
        }
    });
});
