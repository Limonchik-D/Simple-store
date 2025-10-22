// Функция для загрузки JSON-файлов (данных о товарах и т.д.)
async function loadJSON(file) {
    try {
        const response = await fetch(`data/${file}.json`);
        return await response.json();
    } catch (error) {
        console.error(`Ошибка загрузки ${file}:`, error);
        return {};
    }
}

// Функция для показа нужной секции (каталог или карточка товара)
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Глобальные переменные: данные и корзина
let categories, products, prices, characteristics;
let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Инициализация: загружаем данные и настраиваем фильтр
async function initCatalog() {
    categories = await loadJSON('categories');
    products = await loadJSON('products');
    prices = await loadJSON('prices');
    characteristics = await loadJSON('characteristics');

    const filter = document.getElementById('category-filter');
    for (const [code, name] of Object.entries(categories)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        filter.appendChild(option);
    }

    filter.addEventListener('change', renderProducts);
    renderProducts();
    updateCartCount();
}

// Отрисовка списка товаров в каталоге
function renderProducts() {
    const filterValue = document.getElementById('category-filter').value;
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    for (const [code, product] of Object.entries(products)) {
        if (!filterValue || product.categoryCode === filterValue) {
            const div = document.createElement('div');
            div.className = 'product-card';
            div.innerHTML = `
                <img src="image/${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Цена: ${prices[code] || 'N/A'} ₽</p>
                <button onclick="showProduct('${code}')">Подробнее</button>
            `;
            productList.appendChild(div);
        }
    }
}

// Показ карточки товара
function showProduct(productCode) {
    const productSection = document.getElementById('product');
    const product = products[productCode];
    const price = prices[productCode];
    const chars = characteristics[productCode] || {};

    let charsList = '';
    for (const [key, value] of Object.entries(chars)) {
        charsList += `<li>${key}: ${value}</li>`;
    }

    productSection.innerHTML = `
        <div class="product-card">
            <img src="image/${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>Категория: ${categories[product.categoryCode]}</p>
            <p>Цена: ${price || 'N/A'} ₽</p>
            <h3>Характеристики:</h3>
            <ul>${charsList}</ul>
            <button onclick="addToCart('${productCode}')">Добавить в корзину</button>
            <button onclick="showSection('catalog')">Назад</button>
        </div>
    `;
    showSection('product');
}

// Добавление товара в корзину
function addToCart(productCode) {
    cart[productCode] = (cart[productCode] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartDropdown();
    alert('Товар добавлен в корзину!');
}

// Обновление счётчика корзины в заголовке
function updateCartCount() {
    let count = 0;
    for (const qty of Object.values(cart)) {
        count += qty;
    }
    document.getElementById('cart-count').textContent = count;
}

// Отрисовка выпадающей корзины
function renderCartDropdown() {
    const cartDropdown = document.getElementById('cart-dropdown');
    cartDropdown.innerHTML = `
        <h2>Корзина</h2>
        <div id="cart-items"></div>
        <p id="cart-total">Итого: 0 ₽</p>
        <button id="clear-cart">Очистить корзину</button>
    `;
    let total = 0;

    for (const [code, qty] of Object.entries(cart)) {
        const product = products[code];
        const price = prices[code] || 0;
        const itemTotal = price * qty;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${product.name} (x${qty})</span>
            <span>${itemTotal} ₽</span>
        `;
        document.getElementById('cart-items').appendChild(div);
    }

    document.getElementById('cart-total').textContent = `Итого: ${total} ₽`;

    // Обработчик для кнопки "Очистить корзину" внутри функции
    document.getElementById('clear-cart').addEventListener('click', () => {
        cart = {};
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCartDropdown(); // Перерисовываем корзину после очистки
    });
}

// Обработчики событий
document.getElementById('cart-button').addEventListener('click', () => {
    const cartDropdown = document.getElementById('cart-dropdown');
    cartDropdown.classList.toggle('active');
    if (cartDropdown.classList.contains('active')) {
        renderCartDropdown();
    }
});

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', initCatalog);