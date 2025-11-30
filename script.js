// Dados dos produtos
const products = [
    {
        id: 1,
        name: "Jujutsu Kaisen Vol. 1",
        category: "manga",
        price: 49.90,
        image: "img/77309a91-9c98-4c52-9e25-0c2d046865f5.jpg",
        description: "Mangá de ação e sobrenatural"
    },
    {
        id: 2,
        name: "Attack on Titan Vol. 1",
        category: "manga",
        price: 54.90,
        image: "img/2246c51d-efc0-4c33-a83e-c89bd73aec1e.jpg",
        description: "Mangá épico de fantasia"
    },
    {
        id: 3,
        name: "Spider-Man Clássico",
        category: "hq",
        price: 59.90,
        image: "img/06870229-93ef-4557-800a-31c5122252e8.jpg",
        description: "HQ clássica dos quadrinhos"
    },
    {
        id: 4,
        name: "Spider-Man Coleção",
        category: "hq",
        price: 89.90,
        image: "img/ab5b992e-16b6-4155-940c-6016693d3088.jpg",
        description: "Coleção completa de Spider-Man"
    },
    {
        id: 5,
        name: "Graphic Novel Especial",
        category: "graphic",
        price: 79.90,
        image: "img/2c3ff821-74d3-4f3d-9ea4-f5269db53a9e.jpg",
        description: "Graphic novel de alta qualidade"
    },
    {
        id: 6,
        name: "Universo HQs - Coleção",
        category: "graphic",
        price: 99.90,
        image: "img/8f06646f-c3fc-42c2-a0c2-30a4cdd44a91.jpg",
        description: "Coleção especial da loja"
    }
];

// Estado do carrinho
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'todos';

// Elementos do DOM
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const closeCartBtn = document.getElementById('closeCartBtn');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const backToCartBtn = document.getElementById('backToCartBtn');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const mobileMenuBtn = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
    setupEventListeners();
});

// Renderizar produtos
function renderProducts() {
    const filteredProducts = currentFilter === 'todos' 
        ? products 
        : products.filter(p => p.category === currentFilter);

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                <div class="product-footer">
                    <input type="number" class="quantity-input" value="1" min="1" data-product-id="${product.id}">
                    <button class="add-to-cart-btn" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Adicionar
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Adicionar event listeners aos botões de adicionar ao carrinho
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });
}

// Adicionar ao carrinho
function addToCart(e) {
    const productId = parseInt(e.target.closest('.add-to-cart-btn').dataset.productId);
    const quantityInput = e.target.closest('.product-footer').querySelector('.quantity-input');
    const quantity = parseInt(quantityInput.value) || 1;
    
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }

    saveCart();
    updateCartCount();
    showNotification('Produto adicionado ao carrinho!');
}

// Atualizar contagem do carrinho
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Salvar carrinho no localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Renderizar itens do carrinho
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">R$ ${item.price.toFixed(2)}</p>
                <div class="cart-item-controls">
                    <button onclick="decreaseQuantity(${item.id})">−</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
                    <button onclick="increaseQuantity(${item.id})">+</button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remover</button>
        </div>
    `).join('');

    updateCartTotal();
}

// Aumentar quantidade
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity++;
        saveCart();
        renderCartItems();
        updateCartCount();
    }
}

// Diminuir quantidade
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item && item.quantity > 1) {
        item.quantity--;
        saveCart();
        renderCartItems();
        updateCartCount();
    }
}

// Atualizar quantidade
function updateQuantity(productId, newQuantity) {
    const quantity = parseInt(newQuantity) || 1;
    const item = cart.find(item => item.id === productId);
    if (item && quantity > 0) {
        item.quantity = quantity;
        saveCart();
        renderCartItems();
        updateCartCount();
    }
}

// Remover do carrinho
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
    updateCartCount();
    showNotification('Produto removido do carrinho');
}

// Atualizar total do carrinho
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = `R$ ${total.toFixed(2)}`;
}

// Renderizar resumo do pedido
function renderOrderSummary() {
    const orderItemsContainer = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');

    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.name} x${item.quantity}</span>
            <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotal.textContent = `R$ ${total.toFixed(2)}`;
}

// Configurar event listeners
function setupEventListeners() {
    // Abrir/fechar carrinho
    cartBtn.addEventListener('click', () => {
        renderCartItems();
        cartModal.classList.add('show');
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('show');
    });

    // Abrir checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Adicione produtos ao carrinho primeiro!', 'error');
            return;
        }
        renderOrderSummary();
        cartModal.classList.remove('show');
        checkoutModal.classList.add('show');
    });

    // Voltar para carrinho
    backToCartBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('show');
        cartModal.classList.add('show');
    });

    // Fechar checkout
    closeCheckoutBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('show');
    });

    // Confirmar pedido
    confirmOrderBtn.addEventListener('click', confirmOrder);

    // Filtros de categoria
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderProducts();
        });
    });

    // Menu mobile
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });

    // Fechar menu ao clicar em link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('show');
        }
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('show');
        }
    });
}

// Confirmar pedido
function confirmOrder(e) {
    e.preventDefault();

    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;

    if (!name || !email || !phone || !address) {
        showNotification('Preencha todos os campos!', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = {
        id: Date.now(),
        customer: { name, email, phone, address },
        items: cart,
        total: total,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR')
    };

    // Salvar pedido (em um projeto real, seria enviado para um servidor)
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Limpar carrinho e formulário
    cart = [];
    saveCart();
    updateCartCount();
    document.getElementById('checkoutForm').reset();

    // Fechar modal e mostrar mensagem
    checkoutModal.classList.remove('show');
    showNotification('Pedido realizado com sucesso! Número do pedido: ' + order.id, 'success');

    // Limpar carrinho após 2 segundos
    setTimeout(() => {
        renderCartItems();
    }, 2000);
}

// Mostrar notificação
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideUp 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
