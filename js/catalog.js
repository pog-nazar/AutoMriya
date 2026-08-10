// Catalog.js - JavaScript для сторінки каталогу

let allCars = [];
let filteredCars = [];

document.addEventListener('DOMContentLoaded', function() {
    // Ініціалізація
    loadCars();
    setupEventListeners();
});

// Завантажити автомобілі (Firestore, з fallback на localStorage)
function loadCars() {
    const catalogGrid = document.getElementById('catalogGrid');
    catalogGrid.innerHTML = '<p class="loading-state">Завантаження...</p>';

    CarStorage.getCars().then(cars => {
        allCars = cars;
        filteredCars = [...allCars];
        displayCars(filteredCars);
        updateResultsCount();
    });
}

// Відобразити автомобілі
function displayCars(cars) {
    const catalogGrid = document.getElementById('catalogGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (cars.length === 0) {
        catalogGrid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    catalogGrid.innerHTML = cars.map(car => `
        <article class="car-card" data-car-id="${car.id}">
            <div class="car-image">
                <img src="${car.photo || 'images/placeholder.jpg'}" alt="${car.brand} ${car.model}">
            </div>
            <div class="car-info">
                <h3 class="car-title">${car.brand} ${car.model}</h3>
                <p class="car-details">${car.year} • ${formatNumber(car.mileage)} км</p>
                <div class="car-footer">
                    <span class="car-price">${formatNumber(car.price)} грн</span>
                    <button class="btn btn-small" onclick="openCarModal('${car.id}')">Детальніше</button>
                </div>
            </div>
        </article>
    `).join('');
}

// Відкрити модальне вікно з деталями
function openCarModal(carId) {
    const car = CarStorage.getCarById(carId);
    if (!car) return;
    
    const modal = document.getElementById('carModal');
    document.getElementById('modalImage').src = car.photo || 'images/placeholder.jpg';
    document.getElementById('modalTitle').textContent = `${car.brand} ${car.model}`;
    document.getElementById('modalYear').textContent = car.year;
    document.getElementById('modalMileage').textContent = `${formatNumber(car.mileage)} км`;
    document.getElementById('modalBrand').textContent = car.brand;
    document.getElementById('modalModel').textContent = car.model;
    document.getElementById('modalDescription').textContent = car.description || 'Опис відсутній';
    document.getElementById('modalPrice').textContent = `${formatNumber(car.price)} грн`;
    
    modal.classList.add('active');
}

// Закрити модальне вікно
function closeModal() {
    const modal = document.getElementById('carModal');
    modal.classList.remove('active');
}

// Налаштування слухачів подій
function setupEventListeners() {
    // Пошук
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Фільтри
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    // Сортування
    document.getElementById('sortSelect').addEventListener('change', function() {
        sortCars(this.value);
    });
    
    // Модальне вікно
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', closeModal);
    document.getElementById('clearSearchBtn').addEventListener('click', resetFilters);
    
    // Мобільне меню
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
}

// Застосувати фільтри
function applyFilters() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const brand = document.getElementById('brandFilter').value;
    const yearFrom = parseInt(document.getElementById('yearFromFilter').value) || 0;
    const yearTo = parseInt(document.getElementById('yearToFilter').value) || 9999;
    const priceFrom = parseInt(document.getElementById('priceFromFilter').value) || 0;
    const priceTo = parseInt(document.getElementById('priceToFilter').value) || Infinity;
    
    filteredCars = allCars.filter(car => {
        const matchesSearch = searchQuery === '' || 
            car.brand.toLowerCase().includes(searchQuery) ||
            car.model.toLowerCase().includes(searchQuery);
        const matchesBrand = brand === '' || car.brand === brand;
        const matchesYear = car.year >= yearFrom && car.year <= yearTo;
        const matchesPrice = car.price >= priceFrom && car.price <= priceTo;
        
        return matchesSearch && matchesBrand && matchesYear && matchesPrice;
    });
    
    const sortValue = document.getElementById('sortSelect').value;
    sortCars(sortValue);
    updateResultsCount();
}

// Скинути фільтри
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('yearFromFilter').value = '';
    document.getElementById('yearToFilter').value = '';
    document.getElementById('priceFromFilter').value = '';
    document.getElementById('priceToFilter').value = '';
    document.getElementById('sortSelect').value = 'date-desc';
    
    filteredCars = [...allCars];
    displayCars(filteredCars);
    updateResultsCount();
}

// Сортування автомобілів
function sortCars(sortType) {
    switch(sortType) {
        case 'price-asc':
            filteredCars.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredCars.sort((a, b) => b.price - a.price);
            break;
        case 'year-asc':
            filteredCars.sort((a, b) => a.year - b.year);
            break;
        case 'year-desc':
            filteredCars.sort((a, b) => b.year - a.year);
            break;
        case 'mileage-asc':
            filteredCars.sort((a, b) => a.mileage - b.mileage);
            break;
        case 'mileage-desc':
            filteredCars.sort((a, b) => b.mileage - a.mileage);
            break;
        case 'date-asc':
            filteredCars.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'date-desc':
        default:
            filteredCars.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }
    
    displayCars(filteredCars);
}

// Оновити кількість результатів
function updateResultsCount() {
    document.getElementById('resultsCount').textContent = filteredCars.length;
}

// Форматування чисел
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
