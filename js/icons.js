// SVG Icons Helper - Заміна emoji на SVG іконки

// Функція для створення SVG іконки
function createIcon(iconName, className = 'icon-svg') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');
    
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `images/icons.svg#icon-${iconName}`);
    
    svg.appendChild(use);
    return svg;
}

// Заміна emoji на SVG після завантаження DOM
document.addEventListener('DOMContentLoaded', function() {
    // Завантажуємо SVG спрайт
    fetch('images/icons.svg')
        .then(response => response.text())
        .then(svg => {
            const div = document.createElement('div');
            div.innerHTML = svg;
            div.style.display = 'none';
            document.body.insertBefore(div, document.body.firstChild);
        })
        .catch(err => console.warn('Не вдалося завантажити SVG-спрайт іконок:', err));

    // Заміна emoji в логотипі
    const logoIcons = document.querySelectorAll('.logo-icon');
    logoIcons.forEach(icon => {
        if (icon.textContent.includes('🚗')) {
            icon.innerHTML = '';
            icon.appendChild(createIcon('car', 'icon-svg'));
        }
    });

    // Заміна emoji в кнопках пошуку
    const searchBtns = document.querySelectorAll('.search-btn');
    searchBtns.forEach(btn => {
        if (btn.textContent.includes('🔍')) {
            btn.innerHTML = '';
            btn.appendChild(createIcon('search', 'icon-svg'));
        }
    });

    // Заміна іконок benefits (якщо є)
    const benefitIcons = document.querySelectorAll('.benefit-icon');
    benefitIcons.forEach((icon, index) => {
        const iconMap = ['shield', 'speed', 'users', 'star'];
        icon.innerHTML = '';
        icon.appendChild(createIcon(iconMap[index] || 'check', 'icon-svg icon-svg-large'));
    });

    // Заміна іконок у контактах (футер)
    const footerContacts = document.querySelectorAll('.footer-contacts li');
    footerContacts.forEach(contact => {
        const text = contact.textContent;
        if (text.includes('📞')) {
            contact.innerHTML = '';
            contact.appendChild(createIcon('phone', 'icon-svg'));
            contact.appendChild(document.createTextNode(text.replace('📞', '').trim()));
        } else if (text.includes('✉️')) {
            contact.innerHTML = '';
            contact.appendChild(createIcon('email', 'icon-svg'));
            contact.appendChild(document.createTextNode(text.replace('✉️', '').trim()));
        } else if (text.includes('📍')) {
            contact.innerHTML = '';
            contact.appendChild(createIcon('location', 'icon-svg'));
            contact.appendChild(document.createTextNode(text.replace('📍', '').trim()));
        }
    });

    // Заміна іконки empty state
    const emptyIcons = document.querySelectorAll('.empty-icon');
    emptyIcons.forEach(icon => {
        if (icon.textContent.includes('🔍')) {
            icon.innerHTML = '';
            icon.appendChild(createIcon('search', 'icon-svg icon-svg-large'));
        }
    });

    // Заміна × на SVG close icon в модалках
    const modalCloses = document.querySelectorAll('.modal-close');
    modalCloses.forEach(close => {
        if (close.textContent === '×') {
            close.innerHTML = '';
            close.appendChild(createIcon('close', 'icon-svg'));
        }
    });
});

// Експорт для використання в інших скриптах
window.createIcon = createIcon;
