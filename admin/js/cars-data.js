// Cars Data - Seed дані для тестування

const SEED_CARS = [
    {
        id: 'seed001',
        brand: 'Toyota',
        model: 'Camry',
        year: 2019,
        bodyType: 'sedan',
        engine: 2.5,
        fuelType: 'petrol',
        mileage: 85000,
        price: 450000,
        description: 'Відмінний стан, повна комплектація. Один власник, всі ТО пройдені вчасно. Шкіряний салон, клімат-контроль, мультимедійна система. Без ДТП, ідеальний варіант для сім\'ї.',
        photo: '',
        status: 'available',
        createdAt: '2026-01-15T10:00:00.000Z'
    },
    {
        id: 'seed002',
        brand: 'BMW',
        model: 'X5',
        year: 2020,
        bodyType: 'suv',
        engine: 3.0,
        fuelType: 'diesel',
        mileage: 65000,
        price: 890000,
        description: 'Преміум позашляховик у ідеальному стані. Повний привід xDrive, пневмопідвіска, панорамний дах. M-Sport пакет, шкіра Merino, камери 360°. Офіційне авто з повною історією обслуговування.',
        photo: '',
        status: 'available',
        createdAt: '2026-02-10T14:30:00.000Z'
    },
    {
        id: 'seed003',
        brand: 'Volkswagen',
        model: 'Passat',
        year: 2018,
        bodyType: 'sedan',
        engine: 1.8,
        fuelType: 'petrol',
        mileage: 120000,
        price: 380000,
        description: 'Надійний німецький седан. Економічний двигун 1.8 TSI, автоматична коробка DSG. Clima, круїз-контроль, парктронік. Регулярне обслуговування, свіжі ТО. Ідеальний для щоденних поїздок.',
        photo: '',
        status: 'reserved',
        createdAt: '2026-03-05T09:15:00.000Z'
    },
    {
        id: 'seed004',
        brand: 'Mercedes-Benz',
        model: 'E-Class',
        year: 2021,
        bodyType: 'sedan',
        engine: 2.0,
        fuelType: 'hybrid',
        mileage: 45000,
        price: 1150000,
        description: 'Гібридний Mercedes E 300de - економія та комфорт. Преміум обладнання: шкіра Nappa, Burmester, асистенти руху. Підігрів/вентиляція сидінь, панорама, ambient lighting. Офіційне авто, гарантія.',
        photo: '',
        status: 'available',
        createdAt: '2026-04-20T16:45:00.000Z'
    },
    {
        id: 'seed005',
        brand: 'Audi',
        model: 'A6',
        year: 2017,
        bodyType: 'sedan',
        engine: 2.0,
        fuelType: 'diesel',
        mileage: 150000,
        price: 520000,
        description: 'Бізнес-седан з економічним дизелем. Quattro повний привід, адаптивна підвіска, LED оптика. Шкіряний салон, віртуальна панель приладів, мультимедіа MMI. Один власник, дбайливе використання.',
        photo: '',
        status: 'sold',
        createdAt: '2026-05-12T11:20:00.000Z'
    }
];

// Ручне завантаження демо-даних у Firestore (НЕ запускається автоматично,
// щоб не засмічувати вашу реальну базу при кожному відкритті адмінки).
// Викликати з консолі браузера (F12) на сторінці admin/index.html,
// коли ви залогінені: seedDemoCars()
window.seedDemoCars = function () {
    if (typeof CarStorage === 'undefined') return;
    Promise.all(SEED_CARS.map(car => {
        const { id, ...data } = car;
        return CarStorage.addCar(data);
    })).then((added) => {
        console.log('✅ Демо-авто додано у Firestore:', added.length);
    }).catch((err) => {
        console.error('❌ Помилка завантаження демо-даних:', err);
    });
};
