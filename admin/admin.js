// --- Firebase Configuration (Same as app.js) ---
const firebaseConfig = {
  apiKey: "AIzaSyDqQwodX15LJDGAMQF57hs0S3n68_HgotM",
  authDomain: "eskuvo-ajandekok.firebaseapp.com",
  databaseURL: "https://eskuvo-ajandekok-default.rtdb.europe-west1.firebasedatabase.app",
  projectId: "eskuvo-ajandekok",
  storageBucket: "eskuvo-ajandekok.firebasestorage.app",
  messagingSenderId: "293774014874",
  appId: "1:293774014874:web:03e3b16308e30fdc0b6223",
  measurementId: "G-SFE77Q5T3S"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// --- Currency helpers ---
const langCurrencyMap = { hu: 'HUF', en: 'USD', de: 'EUR', es: 'EUR' };

window.autoSetCurrency = (lang) => {
    const currencySelect = document.getElementById('reg-currency');
    if (currencySelect) currencySelect.value = langCurrencyMap[lang] || 'HUF';
};

const getAdminCurrency = () => {
    const el = document.getElementById('reg-currency');
    return el ? el.value : (currentRegistrySettings && currentRegistrySettings.currency) || 'HUF';
};

const formatAdminCurrency = (amount, currency) => {
    const localeMap = { HUF: 'hu-HU', EUR: 'de-DE', USD: 'en-US', GBP: 'en-GB', CHF: 'de-CH', PLN: 'pl-PL', CZK: 'cs-CZ', RON: 'ro-RO', HRK: 'hr-HR', SEK: 'sv-SE' };
    const locale = localeMap[currency] || 'hu-HU';
    const decimals = ['HUF', 'HRK', 'SEK', 'CZK', 'PLN'].includes(currency) ? 0 : 2;
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency || 'HUF', maximumFractionDigits: decimals }).format(amount);
};

// Show/hide link field based on gift type
window.toggleGiftLinkField = (type) => {
    const linkGroup = document.getElementById('gift-link-group');
    if (linkGroup) {
        linkGroup.style.display = type === 'fund' ? 'none' : 'block';
    }
};

// DOM Elements
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const adminGiftsList = document.getElementById("admin-gifts-list");
const userDisplayName = document.getElementById("user-display-name");
const myPublicLink = document.getElementById("my-public-link");
let currentRegistrySettings = null; 
const addGiftModal = document.getElementById("add-gift-modal");
const openAddGiftBtn = document.getElementById("open-add-gift-modal");
const closeAddModalBtn = document.getElementById("close-add-modal");
const addGiftForm = document.getElementById("add-gift-form");
const profileSettingsForm = document.getElementById("profile-settings-form");
const integrationSettingsForm = document.getElementById("integration-settings-form");

// --- Auth Tabs Toggling ---
const showLoginBtn = document.getElementById("show-login");
const showRegisterBtn = document.getElementById("show-register");
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const authSubmitBtn = document.getElementById("auth-submit-btn");

    // Handle Add Gift form submission (including multi-category)
    if (addGiftForm) {
        addGiftForm.onsubmit = (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) return alert('Bejelentkezés szükséges');
            const title = document.getElementById('gift-title').value.trim();
            const type = document.getElementById('gift-type').value;
            const price = parseInt(document.getElementById('gift-price').value, 10) || 0;
            const image = document.getElementById('gift-image').value.trim();
            const description = document.getElementById('gift-description').value.trim();
            const link = document.getElementById('gift-link').value.trim();
            const checkboxes = document.querySelectorAll('#category-checkboxes-container input[type=checkbox]');
            const categoryIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
            const newRef = database.ref(`users/${user.uid}/gifts`).push();
            const giftData = {
                id: newRef.key,
                title,
                type,
                price,
                image,
                description,
                link,
                categoryIds,
                funded: 0,
                order: Date.now()
            };
            newRef.set(giftData).then(() => {
                addGiftForm.reset();
                checkboxes.forEach(cb => cb.checked = false);
                if (typeof closeAddModalBtn !== 'undefined') closeAddModalBtn.click();
                loadAdminGifts();
            }).catch(err => alert('Hiba a mentés során: ' + err.message));
        };
    }

    // Migration button for old gifts (categoryId -> categoryIds)
    const migrateGiftsBtn = document.getElementById('migrate-gifts-btn');
    if (migrateGiftsBtn) {
        migrateGiftsBtn.onclick = () => {
            const user = auth.currentUser;
            if (!user) return alert('Bejelentkezés szükséges');
            if (!confirm('Biztosan migrálni szeretnéd az összes ajándékot?')) return;
            database.ref(`users/${user.uid}/gifts`).once('value').then(snap => {
                const gifts = snap.val() || {};
                const updates = {};
                Object.values(gifts).forEach(g => {
                    if (g.categoryId && (!g.categoryIds || !g.categoryIds.length)) {
                        // Convert to string for consistency
                        const catIdStr = String(g.categoryId);
                        updates[`users/${user.uid}/gifts/${g.id}/categoryIds`] = [catIdStr];
                        updates[`users/${user.uid}/gifts/${g.id}/categoryId`] = null;
                    }
                });
                return database.ref().update(updates);
            }).then(() => {
                alert('Migráció kész!');
                loadAdminGifts();
            }).catch(err => alert('Migráció hiba: ' + err.message));
        };
    }

let isLoggingIn = true;

showLoginBtn.onclick = () => {
    isLoggingIn = true;
    showLoginBtn.style.fontWeight = "bold";
    showLoginBtn.style.borderBottom = "2px solid var(--accent-color)";
    showLoginBtn.style.color = "var(--text-primary)";
    showRegisterBtn.style.fontWeight = "normal";
    showRegisterBtn.style.borderBottom = "none";
    showRegisterBtn.style.color = "#888";
    authTitle.textContent = "Szia, Menyasszony! 💍";
    authSubtitle.textContent = "Lépj be a kezelőfelületre";
    authSubmitBtn.textContent = "Bejelentkezés";
    document.getElementById("activation-group").classList.add("hidden");
};

showRegisterBtn.onclick = () => {
    isLoggingIn = false;
    showRegisterBtn.style.fontWeight = "bold";
    showRegisterBtn.style.borderBottom = "2px solid var(--accent-color)";
    showRegisterBtn.style.color = "var(--text-primary)";
    showLoginBtn.style.fontWeight = "normal";
    showLoginBtn.style.borderBottom = "none";
    showLoginBtn.style.color = "#888";
    authTitle.textContent = "Új lista indítása ✨";
    authSubtitle.textContent = "Regisztrálj és készítsd el saját ajándéklistád";
    authSubmitBtn.textContent = "Regisztráció";
    document.getElementById("activation-group").classList.remove("hidden");
};

// --- Auth State Observer ---
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        showDashboard(user);
    } else {
        // User is signed out
        showLogin();
    }
});

// --- Actions ---
const showDashboard = (user) => {
    loginSection.classList.add("hidden");
    dashboardSection.style.display = "block";
    userDisplayName.textContent = `${user.email} Kezelőfelülete`;

    // Show Public Link
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);

    // We'll update the link text once we load the settings (slug)
    myPublicLink.innerHTML = "Betöltés...";

    loadProfileSettings(user.uid);
    loadAdminGifts();

    const OWNER_EMAILS = ["tiethegifts@gmail.com"]; // Csak a meglévő tulajdonosi e-mail marad
    const superAdminTabBtn = document.getElementById("tab-btn-superadmin");

    if (registrationsInfo) {
        if (user.email && OWNER_EMAILS.includes(user.email.toLowerCase())) {
            database.ref('users').once('value', (snapshot) => {
                const count = snapshot.numChildren();
                registrationsInfo.textContent = `Jelenleg ${count} menyasszony használja az oldalt 🤍`;
                registrationsInfo.style.display = "block";
            });
            if (superAdminTabBtn) superAdminTabBtn.classList.remove("hidden");
            loadSuperAdminUsers();
        } else {
            registrationsInfo.style.display = "none";
            if (superAdminTabBtn) superAdminTabBtn.classList.add("hidden");
        }
    }
};

const showLogin = () => {
    loginSection.classList.remove("hidden");
    dashboardSection.style.display = "none";
};

// Login or Register Logic
loginForm.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (isLoggingIn) {
        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => {
                alert("Hoppá! Hibás e-mail vagy jelszó. 🤍 " + error.message);
            });
    } else {
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Initialize user profile in DB
                const user = userCredential.user;
                database.ref('users/' + user.uid + '/settings').set({
                    email: user.email,
                    registryName: "Az én esküvőm",
                    registryDate: "2026. 06. 20.",
                    welcomeTitle: "Kedves Családunk és Barátaink!",
                    welcomeText: "A legnagyobb ajándék számunkra, hogy velünk ünnepeltek! ✨",
                    slug: user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-')
                }).then(() => {
                    alert("Sikeres regisztráció! 💍 Üdvözöllek a platformon! 🎉 Most már be tudsz jelentkezni.");
                    // Switch back to login view after registration
                    showLoginBtn.onclick();
                }).catch(err => {
                    console.error("Adatbázis hiba:", err);
                    alert("A regisztráció sikerült, de a profilod alapbeállításaiban hiba történt: " + err.message);
                });
            })
            .catch((error) => {
                console.error("Auth hiba:", error);
                if (error.code === 'auth/operation-not-allowed') {
                    alert("Hiba: Az Email/Jelszó bejelentkezés még nincs bekapcsolva a Firebase konzolodon! 🗝️ Kérlek, kövesd az útmutatóm.");
                } else {
                    alert("Hiba a regisztráció során: " + error.message);
                }
            });
    }
};

// Logout Logic
logoutBtn.onclick = () => {
    auth.signOut();
};

// Load Gifts for Admin
const loadAdminGifts = () => {
    const user = auth.currentUser;
    if (!user) return;

    database.ref(`users/${user.uid}/gifts`).on('value', (snapshot) => {
        const gifts = snapshot.val();
        renderAdminGifts(gifts);
    });
};

const renderAdminGifts = (gifts) => {
    if (!adminGiftsList) return;
    adminGiftsList.innerHTML = "";
        // Ensure categories are loaded before rendering gifts
        if (!Object.keys(allCategories).length) {
            loadCategories(() => renderAdminGifts(gifts));
            return;
        }
    
    if (!gifts) {
        adminGiftsList.innerHTML = "<p>Még nincs ajándék a listádon.</p>";
        return;
    }

    const currency = (currentRegistrySettings && currentRegistrySettings.currency) || 'HUF';
    const giftList = Object.values(gifts).sort((a, b) => (a.order || 0) - (b.order || 0));
    const total = giftList.length;

    // --- Összesítő doboz ---
    const totalGoal = giftList.reduce((sum, g) => sum + (g.price || 0), 0);
    const totalFunded = giftList.reduce((sum, g) => sum + (g.funded || 0), 0);
    const totalPercent = totalGoal > 0 ? Math.min(Math.round((totalFunded / totalGoal) * 100), 100) : 0;
    const summaryBox = document.createElement('div');
    summaryBox.style.cssText = 'background: linear-gradient(135deg, #f0f4ec, #e8f0e4); border: 1px solid #c8dabd; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;';
    summaryBox.innerHTML = `
        <div>
            <strong style="font-size: 1.1rem;">📊 Összesített gyűjtés</strong><br>
            <span style="color: #5a7a50; font-size: 1.2rem; font-weight: bold;">${formatAdminCurrency(totalFunded, currency)}</span>
            <span style="color: #888;"> / ${formatAdminCurrency(totalGoal, currency)}</span>
        </div>
        <div style="text-align: right;">
            <span style="font-size: 1.8rem; font-weight: bold; color: #5a7a50;">${totalPercent}%</span><br>
            <small style="color: #888;">összegyűlve</small>
        </div>
    `;
    adminGiftsList.appendChild(summaryBox);

    giftList.forEach((gift, index) => {
        const item = document.createElement("div");
        item.className = "gift-manager-item";
        const typeLabel = gift.type === 'fund' ? '💰 Alap' : '📦 Tárgyi';
        item.innerHTML = `
            <img src="${gift.image || ''}" alt="${gift.title}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;" onerror="this.style.display='none'">
            <div class="gift-manager-info" style="flex:1;">
                <h3>${gift.title} <small style="font-size:0.75rem;color:#888;">${typeLabel}</small></h3>
                <p>${formatAdminCurrency(gift.price, currency)}</p>
                <!-- Category badges -->
                <div class="category-badges" style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">
                    ${gift.categoryIds && gift.categoryIds.map(catId => {
                        const cat = allCategories[String(catId)];
                        return cat ? `<div class="category-badge-wrapper" style="display:flex;flex-direction:column;align-items:center;">
    <div class="category-icon" style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${cat.icon ? `<img src="${cat.icon}" style="width:100%!important;height:100%!important;object-fit:contain!important;">` : ''}
    </div>
    <span class="category-name" style="margin-top:4px;font-size:0.75rem;color:#fff;">${cat.name}</span>
</div>` : '';
                    }).join('')}
                </div>
                <small>Összegyűlt: <strong id="funded-display-${gift.id}">${formatAdminCurrency(gift.funded || 0, currency)}</strong></small>
            </div>
            <div class="gift-manager-actions" style="display:flex;flex-direction:column;gap:4px;align-items:center;">
                <div style="display:flex;gap:4px;">
                    <button class="btn" style="background:#f0f4ee;font-size:1rem;padding:4px 8px;" onclick="reorderGift('${gift.id}', 'up')" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button class="btn" style="background:#f0f4ee;font-size:1rem;padding:4px 8px;" onclick="reorderGift('${gift.id}', 'down')" ${index === total - 1 ? 'disabled' : ''}>↓</button>
                </div>
                <button class="btn" style="background:#e8f0e4; color:#3a5a30; font-size:0.8rem;" onclick="editGift('${gift.id}')">✏️ Szerk.</button>
                <button class="btn" style="background:#fff3cd; color:#856404; font-size:0.8rem;" onclick="fixFundedAmount('${gift.id}', '${gift.title}', ${gift.funded || 0})">💰 Összeg javítása</button>
                <button class="btn" style="background: #fdf2f2; color: #cc3333; font-size: 0.8rem;" onclick="deleteGift('${gift.id}')">Törlés</button>
            </div>
        `;
        adminGiftsList.appendChild(item);
    });
};

// Reorder logic
window.reorderGift = (giftId, direction) => {
    const user = auth.currentUser;
    if (!user) return;
    database.ref(`users/${user.uid}/gifts`).once('value', (snapshot) => {
        const gifts = snapshot.val();
        if (!gifts) return;
        const sorted = Object.values(gifts).sort((a, b) => (a.order || 0) - (b.order || 0));
        const idx = sorted.findIndex(g => g.id === giftId);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return;
        const updates = {};
        updates[`users/${user.uid}/gifts/${sorted[idx].id}/order`] = swapIdx;
        updates[`users/${user.uid}/gifts/${sorted[swapIdx].id}/order`] = idx;
        database.ref().update(updates);
    });
};

// Global Delete Function
window.deleteGift = (giftId) => {
    const user = auth.currentUser;
    if (user && confirm("Biztosan törölni szeretnéd ezt az ajándékot?")) {
        database.ref(`users/${user.uid}/gifts/${giftId}`).remove();
    }
};

// Fix funded amount - allows manual correction of the collected amount
window.fixFundedAmount = (giftId, giftTitle, currentFunded) => {
    const user = auth.currentUser;
    if (!user) return;

    const currency = (currentRegistrySettings && currentRegistrySettings.currency) || 'HUF';
    const newValueStr = prompt(
        `${giftTitle}\n\nJelenleg összegyűlt: ${formatAdminCurrency(currentFunded, currency)}\n\nAdd meg a HELYES összeget (számként, pl. 25000):`,
        currentFunded
    );

    if (newValueStr === null) return; // user cancelled

    const newValue = parseInt(newValueStr, 10);
    if (isNaN(newValue) || newValue < 0) {
        alert('Érvénytelen összeg! Kérlek, csak pozitív számot adj meg.');
        return;
    }

    database.ref(`users/${user.uid}/gifts/${giftId}/funded`).set(newValue)
        .then(() => {
            alert(`✅ Sikeresen javítva! Az összegyűlt összeg most: ${formatAdminCurrency(newValue, currency)}`);
        })
        .catch(err => {
            alert('❌ Hiba történt a mentés során: ' + err.message);
        });
};

// Edit gift - pre-fill modal
let editingGiftId = null; // currently edited gift ID
let allCategories = {}; // map of categoryId -> category object
let editingCategoryId = null;
let enamelColors = [];

// Load categories from Firebase
function loadCategories(callback) {
    const user = auth.currentUser;
    if (!user) return;
    database.ref(`users/${user.uid}/categories`).once('value').then((snap) => {
        const data = snap.val() || {};
        allCategories = data;
        renderCategoriesList();
        populateCategoryCheckboxes();
        if (callback) callback();
    });
}

// Render categories list in admin tab
function renderCategoriesList() {
    const listEl = document.getElementById('categories-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    // Sort by order then name
    const sorted = Object.values(allCategories).sort((a, b) => (a.order || 0) - (b.order || 0));
    sorted.forEach((cat) => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.justifyContent = 'space-between';
        item.style.marginBottom = '8px';
        item.innerHTML = `
            <div>
                <img src="${cat.icon || ''}" alt="" style="width:24px;height:24px;margin-right:6px;vertical-align:middle;" onerror="this.style.display='none'"/>
                <strong>${cat.name}</strong> (order: <input type="number" min="0" value="${cat.order || 0}" style="width:60px;" data-id="${cat.id}" class="cat-order-input"/>)
            </div>
            <div>
                <button class="btn" style="background:#009cde;color:white;margin-right:4px;" onclick="editCategory('${cat.id}')">✏️</button>
                <button class="btn" style="background:#f8d7da;color:#721c24;" onclick="deleteCategory('${cat.id}')">🗑️</button>
            </div>`;
        listEl.appendChild(item);
    });
    // Attach order change listeners
    document.querySelectorAll('.cat-order-input').forEach(inp => {
        inp.onchange = function() {
            const id = this.dataset.id;
            const newOrder = parseInt(this.value, 10) || 0;
            database.ref(`users/${auth.currentUser.uid}/categories/${id}/order`).set(newOrder);
        };
    });
}

// Open category modal for adding
const openAddCategoryModalBtn = document.getElementById('open-add-category-modal');
if (openAddCategoryModalBtn) {
    openAddCategoryModalBtn.onclick = () => {
        editingCategoryId = null;
        document.getElementById('category-modal-title').textContent = 'Új kategória';
        document.getElementById('category-name').value = '';
        document.getElementById('category-order').value = '';
        document.getElementById('category-icon').value = '';
        categoryModal.classList.add('active');
    };
}

// Close category modal
const closeCategoryModalBtn = document.getElementById('close-category-modal');
if (closeCategoryModalBtn) {
    closeCategoryModalBtn.onclick = () => categoryModal.classList.remove('active');
}

// Save (add/edit) category
function saveCategory(e) {
    e.preventDefault();
    const name = document.getElementById('category-name').value.trim();
    const order = parseInt(document.getElementById('category-order').value, 10) || 0;
    const icon = document.getElementById('category-icon').value.trim();
    if (!name) return alert('Név kötelező');
    const user = auth.currentUser;
    if (!user) return;
    if (editingCategoryId) {
        const updates = { name, order, icon };
        database.ref(`users/${user.uid}/categories/${editingCategoryId}`).update(updates).then(() => {
            editingCategoryId = null;
            categoryModal.classList.remove('active');
            loadCategories();
        });
    } else {
        const newRef = database.ref(`users/${user.uid}/categories`).push();
        const id = newRef.key;
        newRef.set({ id, name, order, icon }).then(() => {
            categoryModal.classList.remove('active');
            loadCategories();
        });
    }
}

const categoryForm = document.getElementById('category-form');
if (categoryForm) categoryForm.onsubmit = saveCategory;

function editCategory(catId) {
    const cat = allCategories[catId];
    if (!cat) return;
    editingCategoryId = catId;
    document.getElementById('category-modal-title').textContent = 'Kategória szerkesztése';
    document.getElementById('category-name').value = cat.name || '';
    document.getElementById('category-order').value = cat.order || '';
    document.getElementById('category-icon').value = cat.icon || '';
    categoryModal.classList.add('active');
}

function deleteCategory(catId) {
    if (!confirm('Biztosan törölni akarod ezt a kategóriát?')) return;
    const user = auth.currentUser;
    if (!user) return;
    database.ref(`users/${user.uid}/categories/${catId}`).remove().then(() => {
        loadCategories();
    });
}

// Populate category checkboxes in Add Gift modal
function populateCategoryCheckboxes() {
    const container = document.getElementById('category-checkboxes-container');
    if (!container) return;
    container.innerHTML = '';
    Object.values(allCategories).forEach(cat => {
        const cbId = `cat-${cat.id}`;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = cbId;
        cb.value = cat.id;
        const label = document.createElement('label');
        label.htmlFor = cbId;
        label.style.marginLeft = '4px';
        label.textContent = cat.name;
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.appendChild(cb);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    });
}

// Enamel colors management
function loadEnamelColors(callback) {
    const user = auth.currentUser;
    if (!user) return;
    database.ref(`users/${user.uid}/enamelColors`).once('value').then(snap => {
        enamelColors = snap.val() || {};
        renderEnamelColorsList();
        if (callback) callback();
    });
}

function renderEnamelColorsList() {
    const list = document.getElementById('enamel-colors-list');
    if (!list) return;
    list.innerHTML = '';
    enamelColors.forEach((colorObj, idx) => {
        const color = typeof colorObj === 'string' ? colorObj : colorObj.value;
        const id = typeof colorObj === 'object' && colorObj.id ? colorObj.id : idx;
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.justifyContent = 'space-between';
        item.style.marginBottom = '6px';
        item.innerHTML = `<span style="display:inline-block;width:24px;height:24px;background:${color};border:1px solid #ccc;"></span>
                          <span>${color}</span>
                          <button class="btn" style="background:#f8d7da;color:#721c24;" onclick="deleteEnamelColor('${id}')">🗑️</button>`;
        list.appendChild(item);
    });
}

function addEnamelColor() {
    const input = document.getElementById('new-enamel-color');
    const val = input.value.trim();
    if (!val) return;
    const user = auth.currentUser;
    if (!user) return;
    const newRef = database.ref(`users/${user.uid}/enamelColors`).push();
    newRef.set({ id: newRef.key, value: val }).then(() => {
        input.value = '';
        loadEnamelColors();
    });
}

const addEnamelBtn = document.getElementById('add-enamel-color-btn');
if (addEnamelBtn) addEnamelBtn.onclick = addEnamelColor;

function deleteEnamelColor(colorId) {
    const user = auth.currentUser;
    if (!user) return;
    database.ref(`users/${user.uid}/enamelColors/${colorId}`).remove().then(() => {
        loadEnamelColors();
    });
}

// Open enamel colors modal
const openEnamelModalBtn = document.getElementById('open-enamel-colors-modal');
if (openEnamelModalBtn) {
    openEnamelModalBtn.onclick = () => {
        loadEnamelColors();
        enamelColorsModal.classList.add('active');
    };
}

const closeEnamelModalBtn = document.getElementById('close-enamel-modal');
if (closeEnamelModalBtn) closeEnamelModalBtn.onclick = () => enamelColorsModal.classList.remove('active');

// Ensure categories are loaded on app start
document.addEventListener('DOMContentLoaded', () => {
    const user = auth.currentUser;
    if (user) {
        loadCategories();
    }
});

let editingCategoryId = null;
let enamelColors = [];
 window.editGift = (giftId) => {
    const user = auth.currentUser;
    if (!user) return;
    // implementation omitted for brevity
};

// Full editGift implementation with multi-category support
window.editGift = (giftId) => {
    const user = auth.currentUser;
    if (!user) return;
    // Load existing gift data
    database.ref(`users/${user.uid}/gifts/${giftId}`).once('value').then(snap => {
        const gift = snap.val();
        if (!gift) return alert('Ajándék nem található');
        // Populate modal fields
        document.getElementById('gift-title').value = gift.title || '';
        document.getElementById('gift-type').value = gift.type || 'physical';
        document.getElementById('gift-price').value = gift.price || '';
        document.getElementById('gift-image').value = gift.image || '';
        document.getElementById('gift-description').value = gift.description || '';
        document.getElementById('gift-link').value = gift.link || '';
        // Set category checkboxes
        const checkboxes = document.querySelectorAll('#category-checkboxes-container input[type=checkbox]');
        checkboxes.forEach(cb => {
            // Ensure IDs are compared as strings
            const catIds = gift.categoryIds ? gift.categoryIds.map(id => String(id)) : [];
            cb.checked = catIds.includes(cb.value);
        });
        // Change modal title
        const modalTitle = document.querySelector('#add-gift-modal h2');
        if (modalTitle) modalTitle.textContent = 'Ajándék szerkesztése';
        // Open modal
        if (typeof openAddGiftBtn !== 'undefined') openAddGiftBtn.onclick();
        // Override submit handler for update
        if (addGiftForm) {
            addGiftForm.onsubmit = (e) => {
                e.preventDefault();
                const title = document.getElementById('gift-title').value.trim();
                const type = document.getElementById('gift-type').value;
                const price = parseInt(document.getElementById('gift-price').value, 10) || 0;
                const image = document.getElementById('gift-image').value.trim();
                const description = document.getElementById('gift-description').value.trim();
                const link = document.getElementById('gift-link').value.trim();
                const checkboxes = document.querySelectorAll('#category-checkboxes-container input[type=checkbox]');
                const categoryIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
                const updates = { title, type, price, image, description, link, categoryIds };
                database.ref(`users/${user.uid}/gifts/${giftId}`).update(updates).then(() => {
                    // Reset to add mode
                    addGiftForm.reset();
                    checkboxes.forEach(cb => cb.checked = false);
                    const modalTitle = document.querySelector('#add-gift-modal h2');
                    if (modalTitle) modalTitle.textContent = 'Új ajándék';
                    loadAdminGifts();
                    if (typeof closeAddModalBtn !== 'undefined') closeAddModalBtn.click();
                }).catch(err => alert('Hiba a mentés során: ' + err.message));
            };
        }
    });
};
