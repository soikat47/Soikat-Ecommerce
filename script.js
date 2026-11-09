
const products = [
  {id:1,name:"Premium Headphones",category:"Electronics",price:4500,rating:4.9,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",badge:"BEST SELLER",description:"Premium wireless headphones with crystal clear sound."},
  {id:2,name:"Smart Watch Pro",category:"Electronics",price:6200,rating:4.8,image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",badge:"NEW",description:"Track your daily activities with a modern smartwatch."},
  {id:3,name:"Classic Sneakers",category:"Fashion",price:3200,rating:4.7,image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",badge:"POPULAR",description:"Premium sneakers with comfortable cushioning."},
  {id:4,name:"Premium Sunglasses",category:"Accessories",price:1800,rating:4.6,image:"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",badge:"",description:"Elegant sunglasses with modern design."},
  {id:5,name:"Modern Backpack",category:"Lifestyle",price:2500,rating:4.8,image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",badge:"TRENDING",description:"Durable backpack for everyday use."},
  {id:6,name:"Mechanical Keyboard",category:"Electronics",price:5500,rating:4.9,image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",badge:"HOT",description:"Premium mechanical keyboard."},
  {id:7,name:"Minimalist T-Shirt",category:"Fashion",price:950,rating:4.5,image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",badge:"",description:"Comfortable cotton t-shirt."},
  {id:8,name:"Luxury Desk Lamp",category:"Lifestyle",price:2100,rating:4.7,image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",badge:"NEW",description:"Elegant modern desk lamp."}
];

// APPLICATION STATE
function loadStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

let cart = loadStorage("nexoraCart", []);
let wishlist = loadStorage("nexoraWishlist", []);
let activeCategory = "All";
let searchTerm = "";
let sortMode = "default";
let wishlistOnly = false;
let discountRate = 0;

const $ = id => document.getElementById(id);
const money = amount => "৳" + Math.round(amount).toLocaleString("en-US");

function saveData() {
  localStorage.setItem("nexoraCart", JSON.stringify(cart));
  localStorage.setItem("nexoraWishlist", JSON.stringify(wishlist));
}

// TOAST NOTIFICATION
let toastTimer;

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2500);
}

// PRODUCT RENDER
function renderProducts() {
  let filtered = products.filter(p => {
    const categoryMatch = activeCategory === "All" || p.category === activeCategory;
    const searchMatch = (p.name + " " + p.category).toLowerCase().includes(searchTerm.toLowerCase());
    const wishMatch = !wishlistOnly || wishlist.includes(p.id);
    return categoryMatch && searchMatch && wishMatch;
  });

  if (sortMode === "low") filtered.sort((a,b) => a.price-b.price);
  if (sortMode === "high") filtered.sort((a,b) => b.price-a.price);
  if (sortMode === "rating") filtered.sort((a,b) => b.rating-a.rating);

  $("productGrid").innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
        <button class="wish-btn ${wishlist.includes(p.id) ? "liked" : ""}" data-action="wish" data-id="${p.id}">
          <i class="fa-${wishlist.includes(p.id) ? "solid" : "regular"} fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3>${p.name}</h3>
        <div class="rating">⭐ ${p.rating} <span>Customer rating</span></div>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="add-btn" data-action="add" data-id="${p.id}">+ Add</button>
        </div>
        <button data-action="details" data-id="${p.id}" style="margin-top:12px;background:none;border:0;color:#a855f7;">View Details →</button>
      </div>
    </article>
  `).join("");

  $("emptyMessage").hidden = filtered.length > 0;
}

// CART SYSTEM
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) existing.quantity++;
  else cart.push({id, quantity:1});

  saveData();
  renderCart();
  showToast(product.name + " added to cart!");
}

function changeQuantity(id, amount) {
  const item = cart.find(p => p.id === id);
  if (!item) return;

  item.quantity += amount;
  if (item.quantity <= 0) {
    cart = cart.filter(p => p.id !== id);
  }

  saveData();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(p => p.id !== id);
  saveData();
  renderCart();
  showToast("Product removed!");
}

function getSubtotal() {
  return cart.reduce((total,item) => {
    const product = products.find(p => p.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

// RENDER CART
function renderCart() {
  cart = cart.filter(item =>
    products.some(p => p.id === item.id) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );

  const count = cart.reduce((sum,item) => sum + item.quantity,0);

  $("cartCount").textContent = count;
  $("drawerCount").textContent = `(${count})`;

  if (cart.length === 0) {
    $("cartItems").innerHTML = `
      <div style="text-align:center;padding:60px 10px;color:#9292a6">
        <i class="fa-solid fa-bag-shopping" style="font-size:40px"></i>
        <h3>Your cart is empty</h3>
        <p>Start shopping now!</p>
      </div>`;
  } else {
    $("cartItems").innerHTML = cart.map(item => {
      const p = products.find(x => x.id === item.id);
      return `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}">
          <div>
            <h4>${p.name}</h4>
            <p>${money(p.price)}</p>
            <div class="qty-control">
              <button data-action="decrease" data-id="${p.id}">−</button>
              <span>${item.quantity}</span>
              <button data-action="increase" data-id="${p.id}">+</button>
            </div>
          </div>
          <button class="remove-btn" data-action="remove" data-id="${p.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>`;
    }).join("");
  }

  const subtotal = getSubtotal();
  const discount = Math.round(subtotal * discountRate);
  const total = subtotal - discount;

  $("subtotal").textContent = money(subtotal);
  $("discount").textContent = money(discount);
  $("total").textContent = money(total);
  $("checkoutTotal").textContent = money(total);

  $("checkoutBtn").disabled = cart.length === 0;
  $("checkoutBtn").style.opacity = cart.length === 0 ? ".5" : "1";

  saveData();
}

// WISHLIST
function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(x => x !== id);
    showToast("Removed from wishlist");
  } else {
    wishlist.push(id);
    showToast("Added to wishlist ❤️");
  }

  saveData();
  renderProducts();
  $("wishCount").textContent = wishlist.length;
}

// PRODUCT DETAILS
function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  $("modalBody").innerHTML = `
    <div class="quick-view">
      <img src="${p.image}" alt="${p.name}">
      <div>
        <span class="eyebrow">${p.category}</span>
        <h2>${p.name}</h2>
        <div class="rating">⭐ ${p.rating}</div>
        <div class="price">${money(p.price)}</div>
        <p>${p.description}</p>
        <button class="primary-btn" data-action="add" data-id="${p.id}">Add to Cart</button>
      </div>
    </div>`;

  $("productModal").classList.add("show");
}

// SEARCH
$("searchToggle").addEventListener("click", () => {
  $("searchPanel").classList.toggle("show");
  $("searchInput").focus();
});

$("searchClose").addEventListener("click", () => {
  $("searchPanel").classList.remove("show");
});

$("searchInput").addEventListener("input", e => {
  searchTerm = e.target.value.trim();
  renderProducts();
});

// CATEGORY FILTER
document.querySelectorAll(".category-card").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-card").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    activeCategory = button.dataset.category;
    wishlistOnly = false;
    renderProducts();
  });
});

// SORT
$("sortSelect").addEventListener("change", e => {
  sortMode = e.target.value;
  renderProducts();
});

// WISHLIST VIEW
$("wishlistBtn").addEventListener("click", () => {
  wishlistOnly = !wishlistOnly;
  activeCategory = "All";

  document.querySelectorAll(".category-card").forEach(b => {
    b.classList.toggle("active", b.dataset.category === "All");
  });

  renderProducts();
  $("products").scrollIntoView({behavior:"smooth"});
  showToast(wishlistOnly ? "Showing wishlist" : "Showing all products");
});

// EVENT DELEGATION
document.addEventListener("click", e => {
  const button = e.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (!Number.isInteger(id)) return;

  switch(action) {
    case "add": addToCart(id); break;
    case "wish": toggleWishlist(id); break;
    case "details": openProduct(id); break;
    case "increase": changeQuantity(id,1); break;
    case "decrease": changeQuantity(id,-1); break;
    case "remove": removeFromCart(id); break;
  }
});

// CART DRAWER
function openCart() {
  $("cartDrawer").classList.add("open");
  $("overlay").classList.add("show");
}

function closeCart() {
  $("cartDrawer").classList.remove("open");
  $("overlay").classList.remove("show");
}

$("cartToggle").addEventListener("click",openCart);
$("cartClose").addEventListener("click",closeCart);
$("overlay").addEventListener("click",closeCart);

// COUPON SYSTEM
$("couponApply").addEventListener("click", () => {
  const code = $("couponInput").value.trim().toUpperCase();

  if (code === "NEXORA10") {
    if (discountRate > 0) {
      showToast("Coupon already applied!");
      return;
    }

    if (cart.length === 0) {
      showToast("Add products first!");
      return;
    }

    discountRate = 0.10;
    renderCart();
    showToast("10% discount applied!");
  } else {
    showToast("Invalid coupon code!");
  }
});

// CHECKOUT
$("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;

  $("checkoutTotal").textContent =
    money(getSubtotal() * (1-discountRate));

  $("checkoutModal").classList.add("show");
});

$("checkoutClose").addEventListener("click", () => {
  $("checkoutModal").classList.remove("show");
});

$("modalClose").addEventListener("click", () => {
  $("productModal").classList.remove("show");
});

// MODAL BACKGROUND CLOSE
[$("productModal"),$("checkoutModal")].forEach(modal => {
  modal.addEventListener("click",e => {
    if(e.target === modal) modal.classList.remove("show");
  });
});

// PLACE ORDER
$("checkoutForm").addEventListener("submit",e => {
  e.preventDefault();

  if (!cart.length) {
    showToast("Your cart is empty!");
    return;
  }

  const formData = new FormData(e.target);

  const order = {
    orderId: "NX-" + Date.now(),
    customer: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    payment: formData.get("payment"),
    products: [...cart],
    total: Math.round(getSubtotal() * (1-discountRate)),
    createdAt: new Date().toISOString()
  };

  const orders = loadStorage("nexoraOrders",[]);
  orders.push(order);

  localStorage.setItem("nexoraOrders",JSON.stringify(orders));

  cart = [];
  discountRate = 0;

  $("couponInput").value = "";

  saveData();
  renderCart();

  e.target.reset();
  $("checkoutModal").classList.remove("show");
  closeCart();

  showToast("Order placed! " + order.orderId);
});

// NEWSLETTER
$("newsletterForm").addEventListener("submit",e => {
  e.preventDefault();
  showToast("Thanks for subscribing!");
  e.target.reset();
});

// INITIALIZE WEBSITE
function initializeApp() {
  $("wishCount").textContent = wishlist.length;
  renderProducts();
  renderCart();
  console.log("NEXORA Website Successfully Loaded!");
}

initializeApp();
