// Main.js - JavaScript для головної сторінки

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Завантажити та відобразити останні авто у секції "Популярні пропозиції"
function loadPopularCars() {
    const grid = document.getElementById('popularCarsGrid');
    if (!grid) return;

    CarStorage.getCars().then(cars => {
        if (cars.length === 0) {
            grid.innerHTML = '<p class="loading-state">Наразі немає доданих автомобілів. Скоро тут з\'являться перші пропозиції!</p>';
            return;
        }

        const latest = cars.slice(0, 6);
        grid.innerHTML = latest.map(car => `
            <article class="car-card">
                <div class="car-image">
                    <img src="${car.photo || 'images/placeholder.svg'}" alt="${car.brand} ${car.model}">
                </div>
                <div class="car-info">
                    <h3 class="car-title">${car.brand} ${car.model}</h3>
                    <p class="car-details">${car.year} • ${formatNumber(car.mileage)} км</p>
                    <div class="car-footer">
                        <span class="car-price">${formatNumber(car.price)} грн</span>
                        <a href="catalog.html" class="btn btn-small">Детальніше</a>
                    </div>
                </div>
            </article>
        `).join('');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadPopularCars();

    // Мобільне меню
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // Плавна прокрутка до секцій
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Закрити мобільне меню після кліку
                    if (nav.classList.contains('active')) {
                        nav.classList.remove('active');
                    }
                }
            }
        });
    });

    // Анімація появи елементів при скролі
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Застосувати анімацію до карток
    document.querySelectorAll('.car-card, .benefit-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
