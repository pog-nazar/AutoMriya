// Admin.js - Головна логіка адмін-панелі

// Глобальні змінні
let currentEditId = null;
let currentPhotoBase64 = '';

// DOM елементи
const loginPage = document.getElementById('loginPage');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addCarBtn = document.getElementById('addCarBtn');
const carModal = document.getElementById('carModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const carForm = document.getElementById('carForm');
const cancelBtn = document.getElementById('cancelBtn');
const carsTableBody = document.getElementById('carsTableBody');
const mobileCars = document.getElementById('mobileCars');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const priceFromInput = document.getElementById('priceFrom');
const priceToInput = document.getElementById('priceTo');
const resetFiltersBtn = document.getElementById('resetFilters');
const photoInput = document.getElementById('carPhoto');
const photoPreview = document.getElementById('photoPreview');
const previewImage = document.getElementById('previewImage');
const removePhotoBtn = document.getElementById('removePhoto');
const descriptionTextarea = document.getElementById('carDescription');
const charCount = document.getElementById('charCount');

// ===== АВТЕНТИФІКАЦІЯ =====
function checkAuth() {
    if (Auth.isAuthenticated()) {
        showAdminPanel();
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    loginPage.style.display = 'flex';
    adminPanel.style.display = 'none';
}

function showAdminPanel() {
    loginPage.style.display = 'none';
    adminPanel.style.display = 'block';
    loadCars();
    updateStats();
}

// Login форма
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    Auth.login('admin', password).then((ok) => {
        if (submitBtn) submitBtn.disabled = false;
        if (ok) {
            showAdminPanel();
            document.getElementById('loginPassword').value = '';
        } else {
            alert('❌ Невірний пароль!');
        }
    }).catch((err) => {
        if (submitBtn) submitBtn.disabled = false;
        alert('❌ ' + err.message);
    });
});

// Logout
logoutBtn.addEventListener('click', () => {
    if (confirm('Ви впевнені, що хочете вийти?')) {
        Auth.logout();
        showLoginPage();
    }
});

// ===== ВІДОБРАЖЕННЯ АВТО =====
// reload=true - підвантажити свіжі дані з Firestore; false - взяти з кешу
// (кеш вже заповнений після попереднього виклику getCars())
function loadCars(filters = {}, reload = true) {
    const render = () => {
        const cars = filters.search || filters.priceFrom || filters.priceTo
            ? CarStorage.filterCars(filters)
            : CarStorage._cache.slice();

        cars.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (cars.length === 0) {
            showEmptyState();
        } else {
            hideEmptyState();
            renderTable(cars);
            renderMobileCards(cars);
        }

        updateStats();
    };

    if (reload) {
        CarStorage.getCars().then(render);
    } else {
        render();
    }
}

function renderTable(cars) {
    carsTableBody.innerHTML = cars.map(car => `
        <tr>
            <td>#${car.id.substr(0, 6)}</td>
            <td>
                <img src="${car.photo || '../images/placeholder.svg'}" 
                     alt="${car.brand} ${car.model}" 
                     class="car-photo">
            </td>
            <td>
                <div class="car-brand">${car.brand} ${car.model}</div>
                <div class="car-model">${getBodyTypeLabel(car.bodyType)}</div>
            </td>
            <td>${car.year}</td>
            <td>${formatNumber(car.mileage)} км</td>
            <td>${formatNumber(car.price)} ₴</td>
            <td><span class="status-badge status-${car.status}">${getStatusLabel(car.status)}</span></td>
            <td>${formatDate(car.createdAt)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-edit" onclick="editCar('${car.id}')" title="Редагувати">✏️</button>
                    <button class="btn-icon btn-delete" onclick="deleteCar('${car.id}')" title="Видалити">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderMobileCards(cars) {
    mobileCars.innerHTML = cars.map(car => `
        <div class="mobile-car-card">
            <div class="mobile-car-header">
                <img src="${car.photo || '../images/placeholder.svg'}" 
                     alt="${car.brand} ${car.model}" 
                     class="mobile-car-photo">
                <div class="mobile-car-info">
                    <h3>${car.brand} ${car.model}</h3>
                    <span class="status-badge status-${car.status}">${getStatusLabel(car.status)}</span>
                </div>
            </div>
            <div class="mobile-car-details">
                <div><strong>Рік:</strong> ${car.year}</div>
                <div><strong>Пробіг:</strong> ${formatNumber(car.mileage)} км</div>
                <div><strong>Ціна:</strong> ${formatNumber(car.price)} ₴</div>
                <div><strong>Дата:</strong> ${formatDate(car.createdAt)}</div>
            </div>
            <div class="mobile-car-actions">
                <button class="btn btn-primary" onclick="editCar('${car.id}')">Редагувати</button>
                <button class="btn btn-outline" onclick="deleteCar('${car.id}')">Видалити</button>
            </div>
        </div>
    `).join('');
}

// ===== МОДАЛЬНЕ ВІКНО =====
function openModal(title = 'Додати автомобіль') {
    document.getElementById('modalTitle').textContent = title;
    carModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    carModal.classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
}

// Відкриття модалки для додавання
addCarBtn.addEventListener('click', () => {
    currentEditId = null;
    currentPhotoFile = null;
    openModal('Додати автомобіль');
});

// Закриття модалки
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// ===== ФОРМА =====
carForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = carForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const baseData = {
        brand: document.getElementById('carBrand').value,
        model: document.getElementById('carModel').value,
        year: parseInt(document.getElementById('carYear').value),
        bodyType: document.getElementById('carBody').value,
        engine: parseFloat(document.getElementById('carEngine').value),
        fuelType: document.getElementById('carFuel').value,
        mileage: parseInt(document.getElementById('carMileage').value),
        price: parseInt(document.getElementById('carPrice').value),
        description: document.getElementById('carDescription').value,
        status: document.getElementById('carStatus').value
    };

    const finishSave = (photoUrl) => {
        const carData = Object.assign({}, baseData, { photo: photoUrl || '' });

        const request = currentEditId
            ? CarStorage.updateCar(currentEditId, carData)
            : CarStorage.addCar(carData);

        request
            .then(() => {
                showNotification(currentEditId ? '✅ Автомобіль оновлено!' : '✅ Автомобіль додано!');
                closeModal();
                loadCars();
            })
            .catch((err) => {
                alert('❌ Помилка збереження: ' + (err && err.message ? err.message : err));
            })
            .finally(() => {
                if (submitBtn) submitBtn.disabled = false;
            });
    };

    if (currentPhotoFile) {
        // Обрано нове фото - стискаємо у base64 з автопідбором якості
        compressImageToLimit(currentPhotoFile)
            .then(finishSave)
            .catch((err) => {
                alert('❌ Помилка обробки фото: ' + (err && err.message ? err.message : err));
                if (submitBtn) submitBtn.disabled = false;
            });
    } else {
        // Фото не змінювалось - лишаємо старе посилання (або порожньо)
        finishSave(currentPhotoBase64);
    }
});

// Редагування
window.editCar = function(id) {
    const car = CarStorage.getCarById(id);
    if (!car) return;
    
    currentEditId = id;
    currentPhotoFile = null;
    currentPhotoBase64 = car.photo || '';
    
    // Заповнення форми
    document.getElementById('carId').value = car.id;
    document.getElementById('carBrand').value = car.brand;
    document.getElementById('carModel').value = car.model;
    document.getElementById('carYear').value = car.year;
    document.getElementById('carBody').value = car.bodyType;
    document.getElementById('carEngine').value = car.engine;
    document.getElementById('carFuel').value = car.fuelType;
    document.getElementById('carMileage').value = car.mileage;
    document.getElementById('carPrice').value = car.price;
    document.getElementById('carDescription').value = car.description;
    document.getElementById('carStatus').value = car.status;
    
    // Показати фото якщо є
    if (car.photo) {
        previewImage.src = car.photo;
        photoPreview.style.display = 'block';
    }
    
    updateCharCount();
    openModal('Редагувати автомобіль');
};

// Видалення
window.deleteCar = function(id) {
    const car = CarStorage.getCarById(id);
    if (!car) return;
    
    if (confirm(`Ви впевнені, що хочете видалити ${car.brand} ${car.model}?`)) {
        CarStorage.deleteCar(id)
            .then(() => {
                showNotification('✅ Автомобіль видалено!');
                loadCars();
            })
            .catch((err) => {
                alert('❌ Помилка видалення: ' + (err && err.message ? err.message : err));
            });
    }
};

// Скидання форми
function resetForm() {
    carForm.reset();
    currentEditId = null;
    currentPhotoFile = null;
    currentPhotoBase64 = '';
    photoPreview.style.display = 'none';
    previewImage.src = '';
    charCount.textContent = '0';
}

// ===== ЗАВАНТАЖЕННЯ ФОТО (стиснення в base64 для Firestore, без Storage) =====
let currentPhotoFile = null; // обраний файл, ще не стиснутий

// Ліміт документа Firestore - 1MB. Лишаємо запас під інші поля,
// тому цільовий розмір base64-рядка фото - не більше ~700KB (символів).
const MAX_PHOTO_BASE64_LENGTH = 700000;

// Стискає зображення через canvas у base64 JPEG заданої якості/ширини
function compressImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Не вдалося прочитати файл'));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error('Не вдалося обробити зображення'));
            img.onload = () => {
                let { width, height } = img;
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Пробує стиснути фото послідовно жорсткіше, поки base64 не влізе в ліміт
function compressImageToLimit(file) {
    const attempts = [
        { maxWidth: 1280, quality: 0.75 },
        { maxWidth: 1000, quality: 0.6 },
        { maxWidth: 800, quality: 0.5 },
        { maxWidth: 640, quality: 0.4 },
        { maxWidth: 480, quality: 0.35 }
    ];

    function tryStep(i) {
        if (i >= attempts.length) {
            return Promise.reject(new Error('Фото занадто велике навіть після стиснення. Спробуйте інше зображення.'));
        }
        const { maxWidth, quality } = attempts[i];
        return compressImage(file, maxWidth, quality).then((dataUrl) => {
            if (dataUrl.length <= MAX_PHOTO_BASE64_LENGTH) return dataUrl;
            return tryStep(i + 1);
        });
    }

    return tryStep(0);
}

photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('❌ Будь ласка, оберіть зображення!');
        return;
    }

    if (file.size > 15 * 1024 * 1024) {
        alert('❌ Розмір файлу не повинен перевищувати 15MB!');
        return;
    }

    currentPhotoFile = file;

    // Миттєвий прев'ю (без стиснення - тільки для показу в формі)
    const reader = new FileReader();
    reader.onload = (event) => {
        previewImage.src = event.target.result;
        photoPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
});

// Видалення фото
removePhotoBtn.addEventListener('click', () => {
    currentPhotoFile = null;
    currentPhotoBase64 = '';
    photoInput.value = '';
    photoPreview.style.display = 'none';
    previewImage.src = '';
});

// ===== ЛІЧИЛЬНИК СИМВОЛІВ =====
descriptionTextarea.addEventListener('input', updateCharCount);

function updateCharCount() {
    const count = descriptionTextarea.value.length;
    charCount.textContent = count;
    
    if (count < 50) {
        charCount.style.color = 'var(--status-sold)';
    } else if (count > 400) {
        charCount.style.color = 'var(--status-sold)';
    } else {
        charCount.style.color = 'var(--text-light)';
    }
}

// ===== ПОШУК ТА ФІЛЬТРИ =====
searchInput.addEventListener('input', applyFilters);
priceFromInput.addEventListener('input', applyFilters);
priceToInput.addEventListener('input', applyFilters);

function applyFilters() {
    const filters = {
        search: searchInput.value.trim(),
        priceFrom: priceFromInput.value,
        priceTo: priceToInput.value
    };
    loadCars(filters, false);
}

// Скидання фільтрів
resetFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    priceFromInput.value = '';
    priceToInput.value = '';
    loadCars({}, false);
});

// ===== СТАТИСТИКА =====
function updateStats() {
    const stats = CarStorage.getStats();
    document.getElementById('totalCars').textContent = stats.total;
    document.getElementById('availableCars').textContent = stats.available;
    document.getElementById('reservedCars').textContent = stats.reserved;
    document.getElementById('soldCars').textContent = stats.sold;
}

// ===== ДОПОМІЖНІ ФУНКЦІЇ =====
function showEmptyState() {
    emptyState.style.display = 'block';
    document.querySelector('.table-container').style.display = 'none';
    mobileCars.style.display = 'none';
}

function hideEmptyState() {
    emptyState.style.display = 'none';
    document.querySelector('.table-container').style.display = 'block';
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getStatusLabel(status) {
    const labels = {
        available: 'Вільний',
        reserved: 'Зарезервований',
        sold: 'Продано'
    };
    return labels[status] || status;
}

function getBodyTypeLabel(type) {
    const labels = {
        sedan: 'Седан',
        suv: 'Позашляховик',
        coupe: 'Купе',
        hatchback: 'Хетчбек',
        wagon: 'Універсал',
        minivan: 'Мінівен'
    };
    return labels[type] || type;
}

function showNotification(message) {
    // Простий alert, можна замінити на toast
    alert(message);
}

// ===== ІНІЦІАЛІЗАЦІЯ =====
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Закриття модалки клавішею Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && carModal.classList.contains('active')) {
        closeModal();
    }
});
