document.addEventListener('DOMContentLoaded', function() {
    // Cart System
    const cart = [];
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.querySelector('.total-price');
    const cartBtn = document.querySelector('.cart-btn');

    // Create cart counter element if it doesn't exist
    let cartCounter = document.querySelector('.cart-counter');
    if (!cartCounter) {
        cartCounter = document.createElement('span');
        cartCounter.className = 'cart-counter';
        cartBtn.appendChild(cartCounter);
    }

    // Toggle Cart Visibility
    function toggleCart() {
        cartModal.classList.toggle('hidden');
    }

    // Add to Cart Function
    function addToCart(productName, price) {
        const existingItem = cart.find(item => item.name === productName);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ 
                name: productName, 
                price,
                quantity: 1,
                id: Date.now() // Add unique ID
            });
        }
        updateCart();
    }

    // Update Cart Display
    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;
    
        cart.forEach((item) => {
            itemCount += item.quantity;
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-content">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-id="${item.id}" data-action="decrease">−</button>
                            <span class="cart-item-quantity">${item.quantity}</span>
                            <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                    </div>
                    <div class="cart-item-controls">
                        <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                        <button class="delete-item" data-id="${item.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="delete-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
        });
    
        // Update total and cart counter
        totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;
        cartCounter.textContent = itemCount;
        cartCounter.style.display = itemCount > 0 ? 'block' : 'none';
    }

    // Single event listener for cart items
    cartItemsContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Handle quantity controls
        const quantityBtn = e.target.closest('.quantity-btn');
        if (quantityBtn) {
            const itemId = quantityBtn.dataset.id;
            const action = quantityBtn.dataset.action;
            const itemIndex = cart.findIndex(item => item.id == itemId);
            
            if (itemIndex >= 0) {
                if (action === 'increase') {
                    cart[itemIndex].quantity++;
                } else if (action === 'decrease') {
                    if (cart[itemIndex].quantity > 1) {
                        cart[itemIndex].quantity--;
                    } else {
                        cart.splice(itemIndex, 1);
                    }
                }
                updateCart();
            }
            return;
        }

        // Handle delete items
        const deleteBtn = e.target.closest('.delete-item');
        if (deleteBtn) {
            const itemId = deleteBtn.dataset.id;
            const itemIndex = cart.findIndex(item => item.id == itemId);
            if (itemIndex >= 0) {
                cart.splice(itemIndex, 1);
                updateCart();
            }
            // Keep cart open
            cartModal.classList.remove('hidden');
        }
    });

    // Checkout Function
    function checkout() {
        if (cart.length === 0) {
            alert('Your cart is empty. Add some products before checking out.');
            return;
        }

        const confirmation = confirm(`Your total is ${totalPriceElement.textContent}. Proceed to checkout?`);
        if (confirmation) {
            cart.length = 0;
            updateCart();
            alert('Thank you for your purchase! Your order has been placed.');
            cartModal.classList.add('hidden');
        }
    }

    // Product Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const filterValue = this.dataset.filter;
            
            productCards.forEach(card => {
                card.style.display = (filterValue === 'all' || card.dataset.category === filterValue) 
                    ? 'block' 
                    : 'none';
            });
        });
    });

    // Add to Cart Buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const priceText = productCard.querySelector('.price').textContent;
            const price = parseFloat(priceText.replace(/[^0-9.]/g, '') || '0');

            addToCart(productName, price);

            // Button animation
            this.classList.add('added');
            setTimeout(() => this.classList.remove('added'), 1000);

            // Notification
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = `${productName} added to cart`;
            
            // Notification styles
            Object.assign(notification.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: '#7B341E',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '4px',
                zIndex: '1100', // Higher than modal
                opacity: '0',
                transform: 'translateY(20px)',
                transition: 'opacity 0.3s, transform 0.3s'
            });

            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateY(0)';
            }, 10);

            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        });
    });

    // Navigation Highlight
    const navLinks = document.querySelectorAll('nav ul li a');
    const currentLocation = location.pathname;
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentLocation) {
            link.style.color = '#7B341E';
        }
    });

    // Gallery Hover Effect
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            galleryItems.forEach(i => i !== item && (i.style.opacity = '0.8'));
        });
        item.addEventListener('mouseleave', () => {
            galleryItems.forEach(i => i.style.opacity = '1');
        });
    });

    // Cart Event Listeners
    cartBtn.addEventListener('click', toggleCart);
    document.querySelector('.close-cart').addEventListener('click', toggleCart);
    document.querySelector('.checkout-btn').addEventListener('click', checkout);

    // Close Cart When Clicking Outside
    document.addEventListener('click', (e) => {
        if (!cartModal.contains(e.target) && 
            !e.target.closest('.cart-btn') && 
            !cartModal.classList.contains('hidden')) {
            toggleCart();
        }
    });
});