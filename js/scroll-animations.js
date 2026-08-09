// Scroll Animations - Анімації при прокрутці сторінки

// Intersection Observer для анімацій при скролі
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

// Функція для додавання класу "visible" при появі в viewport
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Опціонально: прибрати observer після анімації
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Запуск після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    // Елементи для анімації при скролі
    const animateOnScroll = document.querySelectorAll('.scroll-animate');
    
    animateOnScroll.forEach(el => {
        observer.observe(el);
    });

    // Лічильники (counter animation)
    const counters = document.querySelectorAll('.counter');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000; // 2 секунди
                const increment = target / (duration / 16); // 60 FPS
                
                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Прогрес бар при скролі
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }

    // Smooth reveal для секцій
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.setProperty('--animation-order', index);
    });

    // Hover 3D ефект для карток
    const cards = document.querySelectorAll('.car-card, .benefit-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Typed effect для hero title (опціонально)
    const typedElements = document.querySelectorAll('[data-typed]');
    typedElements.forEach(element => {
        const text = element.getAttribute('data-typed');
        element.textContent = '';
        let index = 0;
        
        const typeWriter = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Запускаємо через 500мс після завантаження
        setTimeout(typeWriter, 500);
    });

    // Fade in for images при завантаженні
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease-in';
        
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        }
    });

    // Stagger animation для grid items
    const gridItems = document.querySelectorAll('.cars-grid > *, .benefits-grid > *');
    gridItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
});

// Функція для ручного тригеру анімації
window.triggerAnimation = function(element) {
    element.classList.remove('visible');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('visible');
};

// Експорт функцій
window.scrollAnimations = {
    observer,
    triggerAnimation: window.triggerAnimation
};
