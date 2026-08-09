// Storage.js - Firestore-хмара для авто (з локальним кешем як fallback)
// Схема така сама, як у nyam-pizza: Firestore = джерело правди,
// localStorage = офлайн-кеш, вхід в адмінку = SHA-256 хеш пароля
// + "тиха" авторизація у Firebase Auth (потрібна для прав запису).

const STORAGE_KEY = 'auto_mriya_cars';
const AUTH_KEY    = 'auto_mriya_auth';

// ЗМІНІТЬ логін/хеш пароля під себе (як згенерувати новий хеш - дивись
// інструкцію в кінці файлу). Поточний пароль за замовчуванням: admin123
const ADMIN_LOGIN          = 'admin';
const ADMIN_PASSWORD_HASH  = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

// Пошта користувача, якого потрібно створити в Firebase Authentication
// (Email/Password) з паролем ідентичним ADMIN_PASSWORD_HASH вище.
// Це потрібно лише для того, щоб Firestore Security Rules пропускали запис.
const FIREBASE_ADMIN_EMAIL = 'admin@auto-mriya.local';

// ===== АВТЕНТИФІКАЦІЯ =====
const Auth = {
    // Повертає Promise<boolean>
    login(login, password) {
        return new Promise((resolve) => {
            if (login !== ADMIN_LOGIN) { resolve(false); return; }

            const encoder = new TextEncoder();
            crypto.subtle.digest('SHA-256', encoder.encode(password)).then((buf) => {
                const hash = Array.from(new Uint8Array(buf))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');

                if (hash !== ADMIN_PASSWORD_HASH) { resolve(false); return; }

                if (window.auth) {
                    window.auth.signInWithEmailAndPassword(FIREBASE_ADMIN_EMAIL, password)
                        .catch(() => { /* Firebase Auth недоступний - продовжуємо офлайн */ })
                        .finally(() => {
                            sessionStorage.setItem(AUTH_KEY, '1');
                            resolve(true);
                        });
                } else {
                    sessionStorage.setItem(AUTH_KEY, '1');
                    resolve(true);
                }
            });
        });
    },

    logout() {
        sessionStorage.removeItem(AUTH_KEY);
        if (window.auth) window.auth.signOut();
    },

    isAuthenticated() {
        return sessionStorage.getItem(AUTH_KEY) === '1';
    }
};

// ===== CRUD ДЛЯ АВТО (Firestore + localStorage fallback) =====
const CarStorage = {
    _cache: [],

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    _readLocal() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    _saveLocal(cars) {
        this._cache = cars;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
        } catch (e) { /* QuotaExceededError - Firestore лишається джерелом правди */ }
    },

    // Повертає Promise<Array>. Порядок: Firestore -> localStorage -> []
    getCars() {
        if (!window.db) {
            const cars = this._readLocal();
            this._cache = cars;
            return Promise.resolve(cars);
        }
        return window.db.collection('cars').orderBy('createdAt', 'desc').get()
            .then((snapshot) => {
                const cars = snapshot.docs.map(doc => Object.assign({ id: doc.id }, doc.data()));
                this._saveLocal(cars);
                return cars;
            })
            .catch(() => {
                const cars = this._readLocal();
                this._cache = cars;
                return cars;
            });
    },

    // Синхронний пошук по вже завантаженому кешу (виклич getCars() раніше)
    getCarById(id) {
        return this._cache.find(car => car.id === id) || null;
    },

    // Повертає Promise<Object> з новим авто
    addCar(carData) {
        const payload = Object.assign({}, carData, { createdAt: new Date().toISOString() });

        if (!window.db) {
            const newCar = Object.assign({ id: this.generateId() }, payload);
            const cars = this._readLocal();
            cars.unshift(newCar);
            this._saveLocal(cars);
            return Promise.resolve(newCar);
        }

        return window.db.collection('cars').add(payload).then((ref) => {
            const newCar = Object.assign({ id: ref.id }, payload);
            this._cache.unshift(newCar);
            this._saveLocal(this._cache);
            return newCar;
        });
    },

    // Повертає Promise<Object|null> з оновленим авто
    updateCar(id, carData) {
        const payload = Object.assign({}, carData, { updatedAt: new Date().toISOString() });

        if (!window.db) {
            const cars = this._readLocal();
            const i = cars.findIndex(car => car.id === id);
            if (i === -1) return Promise.resolve(null);
            cars[i] = Object.assign({}, cars[i], payload);
            this._saveLocal(cars);
            return Promise.resolve(cars[i]);
        }

        return window.db.collection('cars').doc(id).update(payload).then(() => {
            const i = this._cache.findIndex(car => car.id === id);
            if (i !== -1) {
                this._cache[i] = Object.assign({}, this._cache[i], payload);
                this._saveLocal(this._cache);
                return this._cache[i];
            }
            return null;
        });
    },

    // Повертає Promise<boolean>
    deleteCar(id) {
        if (!window.db) {
            const cars = this._readLocal().filter(car => car.id !== id);
            this._saveLocal(cars);
            return Promise.resolve(true);
        }

        return window.db.collection('cars').doc(id).delete().then(() => {
            this._cache = this._cache.filter(car => car.id !== id);
            this._saveLocal(this._cache);
            return true;
        });
    },

    // Фільтрація вже завантаженого кешу (синхронно, для адмінки)
    filterCars({ search, priceFrom, priceTo }) {
        let cars = this._cache;
        if (search) {
            const s = search.toLowerCase();
            cars = cars.filter(car =>
                car.brand.toLowerCase().includes(s) ||
                car.model.toLowerCase().includes(s)
            );
        }
        if (priceFrom) cars = cars.filter(car => car.price >= parseInt(priceFrom));
        if (priceTo) cars = cars.filter(car => car.price <= parseInt(priceTo));
        return cars;
    },

    // Статистика по вже завантаженому кешу
    getStats() {
        const cars = this._cache;
        return {
            total: cars.length,
            available: cars.filter(c => c.status === 'available').length,
            reserved: cars.filter(c => c.status === 'reserved').length,
            sold: cars.filter(c => c.status === 'sold').length
        };
    }
};

window.Auth = Auth;
window.CarStorage = CarStorage;

/*
  ЯК ЗГЕНЕРУВАТИ НОВИЙ ХЕШ ПАРОЛЯ (у консолі браузера, F12):

  crypto.subtle.digest('SHA-256', new TextEncoder().encode('ваш_новий_пароль'))
    .then(buf => console.log(Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2,'0')).join('')));

  Скопіюйте результат у ADMIN_PASSWORD_HASH вище, і не забудьте створити
  в Firebase Authentication → Users користувача з поштою FIREBASE_ADMIN_EMAIL
  і ТАКИМ САМИМ паролем (не хешем, а сирим текстом) - інакше запис у
  Firestore буде відхилено правилами безпеки.
*/
