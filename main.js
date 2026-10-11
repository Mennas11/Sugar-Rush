const API_URL = "https://devsapihub.com/api-fast-food";
const DEAL_DISCOUNT = 0.15;
const DEALS_COUNT = 4;

const productsContainer = document.getElementById("products-container");
const dealsContainer = document.getElementById("deals-container");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");
const resultsCount = document.getElementById("results-count");

const cartButton = document.getElementById("cart-button");
const cartCount = document.getElementById("cart-count");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartButton = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const clearCartButton = document.getElementById("clear-cart");

const productModal = document.getElementById("product-modal");
const closeModalButton = document.getElementById("close-product-modal");
const modalAddButton = document.getElementById("modal-add-to-cart");

let allProducts = [];
let cart = loadCart();
let selectedProduct = null;
let toastTimer;

/* CURRENT YEAR */

document.getElementById("current-year").textContent =
  new Date().getFullYear();

/* CART STORAGE */

function loadCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("sugarRushCart") || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved
      .filter(item =>
        item &&
        item.id !== undefined &&
        Number.isFinite(Number(item.price)) &&
        Number(item.quantity) > 0
      )
      .map(item => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity)
      }));
  } catch (error) {
    console.warn("Could not read saved cart:", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("sugarRushCart", JSON.stringify(cart));
  } catch (error) {
    console.warn("Could not save cart:", error);
  }
}

/* HELPERS */

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}

function normalizeProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
}

function productPrice(product) {
  return Number(
    product.price ??
    product.cost ??
    product.priceValue ??
    0
  );
}

function getProductImage(product) {
  return (
    product.image ||
    product.imageUrl ||
    product.thumbnail ||
    ""
  );
}

function isDeal(product) {
  const index = allProducts.findIndex(
    item => String(item.id) === String(product.id)
  );

  return index >= 0 && index < DEALS_COUNT;
}

function finalPrice(product) {
  const price = productPrice(product);

  return isDeal(product)
    ? price * (1 - DEAL_DISCOUNT)
    : price;
}

/* LOAD PRODUCTS FROM API */

async function getProducts() {
  productsContainer.innerHTML =
    '<p class="loading">Freshly loading your treats...</p>';

  dealsContainer.innerHTML =
    '<p class="loading">Loading sweet deals...</p>';

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API request failed (${response.status})`);
    }

    const payload = await response.json();

    allProducts = normalizeProducts(payload).filter(product =>
      product &&
      product.id !== undefined &&
      product.name
    );

    if (!allProducts.length) {
      console.error("Unexpected API response:", payload);

      throw new Error(
        "The API response did not contain a recognized product list."
      );
    }

    // Refresh saved cart details using the latest API data.
    cart = cart.map(item => {
      const product = allProducts.find(
        p => String(p.id) === String(item.id)
      );

      if (!product) return item;

      return {
        ...item,
        name: product.name,
        image: getProductImage(product) || item.image,
        price: finalPrice(product)
      };
    });

    fillCategories();
    displayDeals();
    applyFilters();
    updateCart();

  } catch (error) {
    console.error("Error loading products:", error);

    productsContainer.innerHTML = `
      <p class="error-message">
        Sorry, we couldn't load the menu.
        Check your internet connection and refresh the page.
      </p>
    `;

    dealsContainer.innerHTML = `
      <p class="error-message">
        Sweet deals could not be loaded.
        Please refresh and try again.
      </p>
    `;

    resultsCount.textContent = "Menu unavailable";
  }
}

/* CATEGORY FILTER */

function fillCategories() {
  const currentCategory = categoryFilter.value;

  const categories = [
    ...new Set(
      allProducts
        .map(product => String(product.category || "Other").trim())
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b));

  categoryFilter.innerHTML =
    '<option value="all">All Categories</option>' +
    categories.map(category => `
      <option value="${escapeHTML(category)}">
        ${escapeHTML(
          category.charAt(0).toUpperCase() + category.slice(1)
        )}
      </option>
    `).join("");

  if (categories.includes(currentCategory)) {
    categoryFilter.value = currentCategory;
  }
}

/* PRODUCT CARD */

function productCard(product, dealSection = false) {
  const originalPrice = productPrice(product);
  const deal = isDeal(product);
  const image = getProductImage(product);

  const priceHTML = deal
    ? `
      <p class="deal-prices">
        <span class="old-price">${formatPrice(originalPrice)}</span>
        <span class="new-price">${formatPrice(finalPrice(product))}</span>
      </p>
    `
    : `
      <p class="product-price">${formatPrice(originalPrice)}</p>
    `;

  return `
    <article
      class="product-card"
      data-product-id="${escapeHTML(product.id)}"
      tabindex="0"
      aria-label="View ${escapeHTML(product.name)} details"
    >
      ${
        dealSection && deal
          ? '<span class="deal-badge">15% OFF</span>'
          : ""
      }

      <img
        class="product-image"
        src="${escapeHTML(image)}"
        alt="${escapeHTML(product.name)}"
        loading="lazy"
        onerror="this.style.visibility='hidden'"
      >

      <div class="product-info">
        <span class="product-category">
          ${escapeHTML(product.category || "Sweet treat")}
        </span>

        <h3>${escapeHTML(product.name)}</h3>

        ${priceHTML}

        <button
          class="add-to-cart"
          type="button"
          data-product-id="${escapeHTML(product.id)}"
        >
          Add to Cart ♡
        </button>
      </div>
    </article>
  `;
}

/* SPECIAL DEALS */

function displayDeals() {
  const deals = allProducts.slice(0, DEALS_COUNT);

  dealsContainer.innerHTML = deals.length
    ? deals.map(product => productCard(product, true)).join("")
    : '<p class="loading">No special deals available right now.</p>';
}

/* SEARCH, CATEGORY AND SORTING */

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sort = sortFilter.value;

  let filtered = allProducts.filter(product => {
    const name = String(product.name || "").toLowerCase();
    const productCategory = String(product.category || "Other");

    const matchesSearch =
      name.includes(query) ||
      productCategory.toLowerCase().includes(query);

    const matchesCategory =
      category === "all" ||
      productCategory === category;

    return matchesSearch && matchesCategory;
  });

  if (sort === "name") {
    filtered.sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  } else if (sort === "name-desc") {
    filtered.sort((a, b) =>
      String(b.name).localeCompare(String(a.name))
    );
  } else if (sort === "deals") {
    filtered.sort((a, b) =>
      Number(isDeal(b)) - Number(isDeal(a))
    );
  }

  resultsCount.textContent =
    `${filtered.length} ${
      filtered.length === 1 ? "treat" : "treats"
    } to love`;

  productsContainer.innerHTML = filtered.length
    ? filtered.map(product => productCard(product)).join("")
    : '<p class="loading">No treats found. Try another search or category.</p>';
}

/* TOAST MESSAGE */

function showToast(message) {
  const toast = document.getElementById("cart-toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

/* ADD TO CART */

function addToCart(product) {
  if (!product) return;

  const id = String(product.id);
  const existing = cart.find(item => String(item.id) === id);

  if (existing) {
    existing.quantity += 1;
    existing.price = finalPrice(product);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: finalPrice(product),
      image: getProductImage(product),
      quantity: 1
    });
  }

  updateCart();
  showToast(`${product.name} added to your bag!`);
}

/* UPDATE CART DISPLAY */

function updateCart() {
  saveCart();

  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  cartCount.textContent = totalItems;

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  cartTotal.textContent = formatPrice(total);

  if (!cart.length) {
    cartItems.innerHTML = `
      <p class="empty-cart">
        Your cart is empty. Add something sweet!
      </p>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img
        src="${escapeHTML(item.image || "")}"
        alt="${escapeHTML(item.name)}"
      >

      <div class="cart-item-info">
        <h3>${escapeHTML(item.name)}</h3>

        <p>
          ${formatPrice(item.price)} × ${Number(item.quantity)}
        </p>

        <div class="cart-item-actions">
          <button
            type="button"
            data-action="decrease"
            data-id="${escapeHTML(item.id)}"
            aria-label="Decrease quantity"
          >−</button>

          <span>${Number(item.quantity)}</span>

          <button
            type="button"
            data-action="increase"
            data-id="${escapeHTML(item.id)}"
            aria-label="Increase quantity"
          >+</button>

          <button
            type="button"
            data-action="remove"
            data-id="${escapeHTML(item.id)}"
          >Remove</button>
        </div>
      </div>
    </div>
  `).join("");
}

/* OPEN AND CLOSE CART */

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.hidden = false;

  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("lock-scroll");

  closeCartButton.focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.hidden = true;

  cartDrawer.setAttribute("aria-hidden", "true");

  if (productModal.hidden) {
    document.body.classList.remove("lock-scroll");
  }

  cartButton.focus();
}

/* PRODUCT DETAILS MODAL */

function openProductModal(product) {
  selectedProduct = product;

  const image = document.getElementById("modal-product-image");

  image.src = getProductImage(product);
  image.alt = product.name || "Sweet treat";
  image.onerror = () => {
    image.style.visibility = "hidden";
  };
  image.onload = () => {
    image.style.visibility = "visible";
  };

  document.getElementById("modal-product-name").textContent =
    product.name || "Sweet treat";

  document.getElementById("modal-product-category").textContent =
    product.category || "Sweet treat";

  document.getElementById("modal-product-price").textContent =
    isDeal(product)
      ? `${formatPrice(finalPrice(product))} — 15% off (regular ${formatPrice(productPrice(product))})`
      : formatPrice(productPrice(product));

  document.getElementById("modal-product-description").textContent =
    product.description ||
    product.details ||
    "A lovely treat for your next sweet moment.";

  productModal.hidden = false;
  document.body.classList.add("lock-scroll");

  closeModalButton.focus();
}

function closeProductModal() {
  productModal.hidden = true;
  selectedProduct = null;

  if (!cartDrawer.classList.contains("open")) {
    document.body.classList.remove("lock-scroll");
  }
}

/* PRODUCT CARD EVENTS */

function handleProductClick(event) {
  const addButton = event.target.closest(".add-to-cart");

  if (addButton) {
    event.stopPropagation();

    const product = allProducts.find(
      item => String(item.id) === String(addButton.dataset.productId)
    );

    addToCart(product);
    return;
  }

  const card = event.target.closest(".product-card");

  if (!card) return;

  const product = allProducts.find(
    item => String(item.id) === String(card.dataset.productId)
  );

  if (product) {
    openProductModal(product);
  }
}

productsContainer.addEventListener("click", handleProductClick);
dealsContainer.addEventListener("click", handleProductClick);

/* KEYBOARD SUPPORT FOR PRODUCT CARDS */

[productsContainer, dealsContainer].forEach(container => {
  container.addEventListener("keydown", event => {
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target.classList.contains("product-card")
    ) {
      event.preventDefault();

      const product = allProducts.find(
        item => String(item.id) === String(event.target.dataset.productId)
      );

      if (product) openProductModal(product);
    }
  });
});

/* FILTER EVENTS */

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
sortFilter.addEventListener("change", applyFilters);

/* CART EVENTS */

cartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

clearCartButton.addEventListener("click", () => {
  cart = [];
  updateCart();
  showToast("Your cart has been cleared.");
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const item = cart.find(
    entry => String(entry.id) === String(button.dataset.id)
  );

  if (!item) return;

  if (button.dataset.action === "increase") {
    item.quantity += 1;
  }

  if (button.dataset.action === "decrease") {
    item.quantity -= 1;
  }

  if (
    button.dataset.action === "remove" ||
    item.quantity <= 0
  ) {
    cart = cart.filter(
      entry => String(entry.id) !== String(button.dataset.id)
    );
  }

  updateCart();
});

/* MODAL EVENTS */

closeModalButton.addEventListener("click", closeProductModal);

productModal.addEventListener("click", event => {
  if (event.target.matches("[data-close-modal]")) {
    closeProductModal();
  }
});

modalAddButton.addEventListener("click", () => {
  if (!selectedProduct) return;

  addToCart(selectedProduct);
  closeProductModal();
});

/* ESCAPE KEY */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (!productModal.hidden) {
      closeProductModal();
    } else if (cartDrawer.classList.contains("open")) {
      closeCart();
    }
  }
});

/* INITIALIZE */

updateCart();
getProducts();