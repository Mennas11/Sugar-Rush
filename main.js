
const API_URL = "https://devsapihub.com/api-fast-food"; // declare constant
const DEAL_DISCOUNT = 0.15; // declare constant
const DEALS_COUNT = 4; // declare constant

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

const wishlistButton = document.getElementById("wishlist-nav-btn"); 
const wishlistCount = document.getElementById("wishlist-count"); 
const wishlistDrawer = document.getElementById("wishlist-drawer"); 
const closeWishlistButton = document.getElementById("close-wishlist"); 
const wishlistItems = document.getElementById("wishlist-items"); 
const clearWishlistButton = document.getElementById("clear-wishlist"); 

const themeToggleBtn = document.getElementById("theme-toggle-btn");

const productModal = document.getElementById("product-modal"); 
const closeModalButton = document.getElementById("close-product-modal");
const modalAddButton = document.getElementById("modal-add-to-cart"); 

const authModal = document.getElementById("auth-modal"); 
const closeAuthButton = document.getElementById("close-auth-modal"); 
const authNavBtn = document.getElementById("auth-nav-btn"); 
const loginView = document.getElementById("login-view");
const registerView = document.getElementById("register-view");
const switchToRegister = document.getElementById("switch-to-register"); 
const switchToLogin = document.getElementById("switch-to-login"); 
const loginForm = document.getElementById("login-form"); 
const registerForm = document.getElementById("register-form"); 
const loginError = document.getElementById("login-error");
const registerError = document.getElementById("register-error"); 

const starPicker = document.getElementById("star-picker"); 
const reviewForm = document.getElementById("review-form");
const reviewInput = document.getElementById("review-text"); 
const modalRatingAvg = document.getElementById("modal-rating-avg"); 
const modalReviewsCount = document.getElementById("modal-reviews-count"); 

let allProducts = []; // declare variable
let cart = loadCart(); // declare variable
let wishlist = loadWishlist(); // declare variable
let selectedProduct = null; // declare variable
let selectedRating = 5; // declare variable

let productReviews =
  JSON.parse(localStorage.getItem("sugarRushReviews")) || {}; // read from localStorage

let toastTimer; // declare variable

let currentUser =
  JSON.parse(localStorage.getItem("sugarRushCurrentUser")) || null; // read from localStorage

const PROMO_CODE = "SUGARRUSH20"; // declare constant
const PROMO_DISCOUNT = 0.20; // declare constant

let appliedPromo =
  localStorage.getItem("sugarRushPromo") === PROMO_CODE; // read from localStorage

const promoInput = document.getElementById("promo-input"); // get element by id
const promoApplyBtn = document.getElementById("promo-apply-btn"); // get element by id
const promoMessage = document.getElementById("promo-message"); // get element by id
const promoRemoveBtn = document.getElementById("promo-remove-btn"); // get element by id
const cartSubtotal = document.getElementById("cart-subtotal"); // get element by id
const cartDiscountRow = document.getElementById("cart-discount-row"); // get element by id
const cartDiscount = document.getElementById("cart-discount"); // get element by id

const FREE_DELIVERY_AT = 100; // declare constant

const freeDelivery = document.getElementById("free-delivery"); // get element by id
const freeDeliveryText = document.getElementById("free-delivery-text"); // get element by id
const freeDeliveryFill = document.getElementById("free-delivery-fill"); // get element by id

const bnavCartBtn = document.getElementById("bnav-cart"); // get element by id
const bnavWishBtn = document.getElementById("bnav-wishlist"); // get element by id
const bnavCart = document.getElementById("bnav-cart-count"); // get element by id
const bnavWish = document.getElementById("bnav-wishlist-count"); // get element by id

const orderSuccess = document.getElementById("order-success"); // get element by id

document.getElementById("current-year").textContent =
  new Date().getFullYear();

// ==============================
// Theme Management
// ==============================
// Purpose: Light/dark mode: restores the saved theme and animates the switch.

function initTheme() { // function: restore saved theme
  const savedTheme =
    localStorage.getItem("sugarRushTheme") || "light"; // read from localStorage
  document.documentElement.setAttribute("data-theme", savedTheme); // set attribute
  themeToggleBtn.textContent =
    savedTheme === "dark" ? "🌙" : "☀️";
}

themeToggleBtn.addEventListener("click", () => { // attach event listener
  const root = document.documentElement; // declare constant
  const newTheme =
    root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  const applyTheme = () => { // declare constant
    root.setAttribute("data-theme", newTheme); // set attribute
    localStorage.setItem("sugarRushTheme", newTheme); // save to localStorage
    themeToggleBtn.textContent =
      newTheme === "dark" ? "🌙" : "☀️";
  };
  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Browsers without the View Transitions API (or reduced motion): instant switch
  if (!document.startViewTransition || reduceMotion) { // condition
    applyTheme(); // call apply theme
    return; // exit function
  }
  // Circle expands from the toggle button
  const rect = themeToggleBtn.getBoundingClientRect(); // declare constant
  const x = rect.left + rect.width / 2; // declare constant
  const y = rect.top + rect.height / 2; // declare constant
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  root.classList.add("theme-switching"); // add class
  const transition = document.startViewTransition(applyTheme); // declare constant
  transition.ready.then(() => { // start of function/callback
    root.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration: 750,
        easing: "cubic-bezier(.4, 0, .2, 1)",
        pseudoElement: "::view-transition-new(root)"
      }
    );
  }).catch(() => {});
  transition.finished.finally(() => { // start of function/callback
    root.classList.remove("theme-switching"); // remove class
  }); // close callback
}); // close callback

initTheme(); // call: restore saved theme

// ==============================
// Cart Local Storage
// ==============================
// Purpose: Saves/loads each user's cart so it survives page reloads.

// Per-user storage key: each account keeps its own cart and wishlist
function userStorageKey(base) { // function: user storage key
  try { // try safely
    const user = JSON.parse(localStorage.getItem("sugarRushCurrentUser")); // read from localStorage
    return user && user.email ? `${base}:${user.email}` : null; // null = guest
  } catch (error) { // handle error
    return null; // return result
  }
}

function loadCart() { // function: read cart from storage
  try { // try safely
    const key = userStorageKey("sugarRushCart"); // define key
    if (!key) return []; // guests have no saved cart
    const saved = JSON.parse(
      localStorage.getItem(key) || "[]"
    );
    if (!Array.isArray(saved)) return []; // condition
    return saved
      .filter(item =>
        item &&
        item.id !== undefined &&
        Number.isFinite(Number(item.price)) &&
        Number(item.quantity) > 0
      )
      .map(item => ({ // transform each item
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity)
      }));
  } catch (error) { // handle error
    console.warn("Could not read saved cart:", error); // log warning/error
    return []; // return result
  }
}

function saveCart() { // function: save cart to storage
  try { // try safely
    const key = userStorageKey("sugarRushCart"); // define key
    if (!key) return; // never save a guest cart
    localStorage.setItem(
      key,
      JSON.stringify(cart)
    );
  } catch (error) { // handle error
    console.warn("Could not save cart:", error); // log warning/error
  }
}

// ==============================
// Wishlist Local Storage
// ==============================
// Purpose: Saves/loads each user's wishlist.

function loadWishlist() { // function: read wishlist from storage
  try { // try safely
    const key = userStorageKey("sugarRushWishlist"); // define key
    if (!key) return []; // guests have no saved wishlist
    const saved = JSON.parse(
      localStorage.getItem(key) || "[]"
    );
    return Array.isArray(saved) ? saved : []; // return result
  } catch (error) { // handle error
    console.warn("Could not read saved wishlist:", error); // log warning/error
    return []; // return result
  }
}

function saveWishlist() { // function: save wishlist to storage
  try { // try safely
    const key = userStorageKey("sugarRushWishlist"); // define key
    if (!key) return; // never save a guest wishlist
    localStorage.setItem(
      key,
      JSON.stringify(wishlist)
    );
  } catch (error) { // handle error
    console.warn("Could not save wishlist:", error); // log warning/error
  }
}

// ==============================
// Authentication Navigation
// ==============================
// Purpose: Switches the navbar button between Log In and Log Out.

function updateAuthNav() { // function: update login/logout button
  if (currentUser) { // condition
    authNavBtn.textContent =
      `Log Out (${currentUser.name.split(" ")[0]})`;
    authNavBtn.onclick = () => { // assign/update value
      if (confirm("Are you sure you want to log out?")) { // condition
        currentUser = null; // assign/update value
        localStorage.removeItem("sugarRushCurrentUser"); // remove from localStorage
        appliedPromo = false; // assign/update value
        localStorage.removeItem("sugarRushPromo"); // remove from localStorage
        promoInput.value = ""; // set value
        setPromoMessage(""); // call: show promo code message
        cart = []; // clear on-screen cart only (saved data stays under the user's key)
        wishlist = []; // clear on-screen wishlist only
        updateCart(); // call: refresh cart UI and totals
        updateWishlist(); // refresh wishlist UI
        applyFilters(); // refresh heart icons
        displayDeals(); // refresh heart icons in deals
        updateAuthNav(); // call: update login/logout button
        closeCart(); // call: close cart drawer
        closeWishlist(); // call: close wishlist drawer
        showToast("Logged out successfully."); // call: show short toast message
      }
    };
  } else { // else branch
    authNavBtn.textContent = "Log In"; // set text
    authNavBtn.onclick = () => openAuthModal("login"); // assign/update value
  }
}

// ==============================
// Open Authentication Modal
// ==============================
// Purpose: Shows the login or register popup.

function openAuthModal(view = "login") { // function: open login/register modal
  if (view === "login") { // condition
    loginView.hidden = false; // show/hide element
    registerView.hidden = true; // show/hide element
    loginError.hidden = true; // show/hide element
    loginForm.reset(); // reset form
  } else { // else branch
    loginView.hidden = true; // show/hide element
    registerView.hidden = false; // show/hide element
    registerError.hidden = true; // show/hide element
    registerForm.reset(); // reset form
  }
  authModal.hidden = false; // show/hide element
  document.body.classList.add("lock-scroll"); // add class
}

// ==============================
// Close Authentication Modal
// ==============================
// Purpose: Hides the auth popup and unlocks page scroll.

function closeAuthModal() { // function: close login/register modal
  authModal.hidden = true; // show/hide element
  if (
    !cartDrawer.classList.contains("open") &&
    !wishlistDrawer.classList.contains("open") &&
    productModal.hidden
  ) {
    document.body.classList.remove("lock-scroll"); // remove class
  }
}

// ==============================
// Toggle Password Visibility
// ==============================
// Purpose: Eye button that shows/hides the typed password.

document.querySelectorAll(".toggle-password").forEach(button => { // loop over items
  button.addEventListener("click", () => { // attach event listener
    const inputId = button.getAttribute("data-target"); // declare constant
    const input = document.getElementById(inputId); // get element by id
    if (input) { // condition
      if (input.type === "password") { // condition
        input.type = "text"; // assign/update value
        button.textContent = "👁"; // set text
      } else { // else branch
        input.type = "password"; // assign/update value
        button.textContent = "👁️‍🗨️"; // set text
      }
    }
  }); // close callback
}); // close callback

// ==============================
// Star Rating Picker
// ==============================
// Purpose: Lets the user pick 1-5 stars for a review.

starPicker.addEventListener("click", (e) => { // attach event listener
  const star = e.target.closest("span"); // declare constant
  if (!star) return; // guard: early exit
  selectedRating = Number(star.dataset.value); // assign/update value
  const stars = starPicker.querySelectorAll("span"); // declare constant
  stars.forEach(s => { // loop over items
    if (Number(s.dataset.value) <= selectedRating) { // condition
      s.classList.add("active"); // add class
    } else { // else branch
      s.classList.remove("active"); // remove class
    }
  }); // close callback
}); // close callback

// ==============================
// Submit Product Review
// ==============================
// Purpose: Saves a new review and updates the rating.

reviewForm.addEventListener("submit", (e) => { // attach event listener
  e.preventDefault(); // prevent default behavior
  if (!currentUser) { // condition
    showToast("Please log in first to leave a review!"); // call: show short toast message
    openAuthModal("login"); // call: open login/register modal
    return; // exit function
  }
  if (!selectedProduct) return; // guard: early exit
  const productId = String(selectedProduct.id); // declare constant
  if (!productReviews[productId]) { // condition
    const seed = Number(productId) || 1; // declare constant
    const initialCount = 40 + (seed * 17) % 150; // declare constant
    const initialAvg = Number(
      (3.5 + ((seed * 3) % 15) / 10).toFixed(1)
    );
    productReviews[productId] = { // assign/update value
      totalScore: initialAvg * initialCount,
      count: initialCount,
      list: []
    };
  }
  const revData = productReviews[productId]; // declare constant
  revData.count += 1; // assign/update value
  revData.totalScore += selectedRating; // assign/update value
  revData.list.push({
    user: currentUser.name,
    rating: selectedRating,
    comment: reviewInput.value.trim()
  }); // close callback
  localStorage.setItem(
    "sugarRushReviews",
    JSON.stringify(productReviews)
  );
  updateProductModalReviews(selectedProduct); // call: update product rating summary
  reviewInput.value = ""; // set value
  showToast("Thank you for your review!"); // call: show short toast message
}); // close callback

// ==============================
// Update Product Review Summary
// ==============================
// Purpose: Shows the average rating and review count in the modal.

function updateProductModalReviews(product) { // function: update product rating summary
  const productId = String(product.id); // declare constant
  if (!productReviews[productId]) { // condition
    const seed = Number(productId) || 1; // declare constant
    const initialCount = 40 + (seed * 17) % 150; // declare constant
    const initialAvg = Number(
      (3.5 + ((seed * 3) % 15) / 10).toFixed(1)
    );
    productReviews[productId] = { // assign/update value
      totalScore: initialAvg * initialCount,
      count: initialCount,
      list: []
    };
  }
  const data = productReviews[productId]; // declare constant
  const avg = (data.totalScore / data.count).toFixed(1); // declare constant
  modalRatingAvg.textContent = avg; // set text
  modalReviewsCount.textContent =
    `(${data.count} reviews)`;
}

// ==============================
// Escape HTML
// ==============================
// Purpose: Prevents HTML injection by escaping special characters.

function escapeHTML(value) { // function: escape HTML special characters
  return String(value ?? "").replace(/[&<>"']/g, character => ({ // return result
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// ==============================
// Format Price
// ==============================
// Purpose: Formats any number as a 2-decimal price.

function formatPrice(value) { // function: format price with 2 decimals
  return Number(value || 0).toFixed(2); // return result
}

// ==============================
// Normalize API Products
// ==============================
// Purpose: Accepts different API response shapes and returns a product array.

function normalizeProducts(payload) { // function: normalize API product data
  if (Array.isArray(payload)) return payload; // condition
  if (Array.isArray(payload?.data)) return payload.data; // condition
  if (Array.isArray(payload?.products)) return payload.products; // condition
  if (Array.isArray(payload?.items)) return payload.items; // condition
  return []; // return result
}

// ==============================
// Product Price
// ==============================
// Purpose: Reads the price from whichever field the API uses.

function productPrice(product) { // function: get product price
  return Number(
    product.price ??
    product.cost ??
    product.priceValue ??
    0
  );
}

// ==============================
// Product Image
// ==============================
// Purpose: Reads the image URL from whichever field the API uses.

function getProductImage(product) { // function: get product image
  return (
    product.image ||
    product.imageUrl ||
    product.thumbnail ||
    ""
  );
}

// ==============================
// Check Product Deal
// ==============================
// Purpose: Tells whether a product is one of the discounted deals.

function isDeal(product) { // function: is the product a deal?
  const index = allProducts.findIndex(
    item => String(item.id) === String(product.id)
  );
  return index >= 0 && index < DEALS_COUNT; // return result
}

// ==============================
// Final Product Price
// ==============================
// Purpose: Price after the deal discount (if any).

function finalPrice(product) { // function: final price after discount
  const price = productPrice(product); // declare constant
  return isDeal(product)
    ? price * (1 - DEAL_DISCOUNT)
    : price;
}

// ==============================
// Fetch Products from API
// ==============================
// Purpose: Loads the menu from the API and renders the whole store.

async function getProducts() { // function: fetch products from API
  productsContainer.innerHTML = skeletonCards(8); // set inner HTML
  dealsContainer.innerHTML = skeletonCards(4); // set inner HTML
  try { // try safely
    const response = await fetch(API_URL); // declare constant
    if (!response.ok) { // condition
      throw new Error(
        `API request failed (${response.status})`
      );
    }
    const payload = await response.json(); // declare constant
    allProducts = normalizeProducts(payload).filter(product =>
      product &&
      product.id !== undefined &&
      product.name
    );
    if (!allProducts.length) { // condition
      console.error("Unexpected API response:", payload); // log warning/error
      throw new Error(
        "The API response did not contain a recognized product list."
      );
    }
    cart = cart.map(item => { // transform each item
      const product = allProducts.find(
        p => String(p.id) === String(item.id)
      );
      if (!product) return item; // condition
      return { // return result
        ...item,
        name: product.name,
        image: getProductImage(product) || item.image,
        price: finalPrice(product)
      };
    }); // close callback
    animateCards = true; // assign/update value
    revealCounter = 0; // assign/update value
    fillCategories(); // call: fill category dropdown
    displayDeals(); // call: render deals section
    applyFilters(); // call: apply search, filter and sort
    updateCart(); // call: refresh cart UI and totals
    updateWishlist(); // call: refresh wishlist UI
    observeReveals(); // call: reveal elements on scroll
    animateCards = false; // assign/update value
  } catch (error) { // handle error
    console.error("Error loading products:", error); // log warning/error
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
    resultsCount.textContent = "Menu unavailable"; // set text
  }
}

// ==============================
// Fill Category Filter
// ==============================
// Purpose: Builds the category dropdown and chips from the products.

function fillCategories() { // function: fill category dropdown
  const currentCategory = categoryFilter.value; // declare constant
  const categories = [
    ...new Set(
      allProducts
        .map(product => String(product.category || "Other").trim())
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b)); // sort items
  categoryFilter.innerHTML =
    '<option value="all">🍽️ All Categories</option>' +
    categories.map(category => `
      <option value="${escapeHTML(category)}">
        ${categoryEmoji(category)}
        ${escapeHTML(
          category.charAt(0).toUpperCase() + category.slice(1)
        )}
      </option>
    `).join("");
  if (categories.includes(currentCategory)) { // condition
    categoryFilter.value = currentCategory; // set value
  }
  renderCategoryChips(categories); // call: render category chips
}

let animateCards = false; // declare variable
let revealCounter = 0; // declare variable
let revealObserver = null; // declare variable

// ==============================
// Scroll Reveal Animation
// ==============================
// Purpose: Fades elements in when they scroll into view.

function observeReveals() { // function: reveal elements on scroll
  const items = document.querySelectorAll(".reveal:not(.in)"); // declare constant
  if (!("IntersectionObserver" in window)) { // condition
    items.forEach(el => el.classList.add("in")); // add class
    return; // exit function
  }
  if (!revealObserver) { // condition
    revealObserver = new IntersectionObserver(entries => { // assign/update value
      entries.forEach(entry => { // loop over items
        if (entry.isIntersecting) { // condition
          entry.target.classList.add("in"); // add class
          revealObserver.unobserve(entry.target); // call unobserve
        }
      }); // close callback
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }); // close callback
  }
  items.forEach(el => revealObserver.observe(el)); // loop over items
}

// ==============================
// Skeleton Loading Cards
// ==============================
// Purpose: Placeholder cards shown while products load.

function skeletonCards(count = 4) { // function: placeholder loading cards
  return Array.from({ length: count }, () => `

    <div class="skeleton-card" aria-hidden="true">

      <div class="sk sk-img"></div>

      <div class="sk-body">

        <div class="sk sk-line sk-short"></div>

        <div class="sk sk-line"></div>

        <div class="sk sk-line sk-short"></div>

        <div class="sk sk-btn"></div>

      </div>
    </div>

  `).join("");
}

// ==============================
// Category Emoji
// ==============================
// Purpose: Picks an emoji that matches a category name.

function categoryEmoji(name) { // function: emoji for each category
  const n = String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const map = [
    ["hamburguesa", "🍔"], ["burger", "🍔"], ["pizza", "🍕"],
    ["papas", "🍟"], ["fries", "🍟"], ["nugget", "🍗"],
    ["wing", "🍗"], ["alitas", "🍗"], ["pollo", "🍗"],
    ["chicken", "🍗"], ["sandwich", "🥪"], ["bocadillo", "🥪"],
    ["wrap", "🌯"], ["burrito", "🌯"], ["shawarma", "🌯"],
    ["kebab", "🍢"], ["hot dog", "🌭"], ["hotdog", "🌭"],
    ["perrito", "🌭"], ["taco", "🌮"], ["pasta", "🍝"],
    ["espagueti", "🍝"], ["noodle", "🍜"], ["fideo", "🍜"],
    ["soup", "🍲"], ["sopa", "🍲"], ["rice", "🍚"],
    ["arroz", "🍚"], ["sushi", "🍣"], ["fish", "🐟"],
    ["pescado", "🐟"], ["seafood", "🦐"], ["marisco", "🦐"],
    ["steak", "🥩"], ["meat", "🥩"], ["carne", "🥩"],
    ["grill", "🔥"], ["parrilla", "🔥"], ["salad", "🥗"],
    ["ensalada", "🥗"], ["veg", "🥬"], ["egg", "🍳"],
    ["huevo", "🍳"], ["breakfast", "🥞"], ["desayuno", "🥞"],
    ["pancake", "🥞"], ["waffle", "🧇"],
    ["donut", "🍩"], ["doughnut", "🍩"], ["dona", "🍩"],
    ["rosquilla", "🍩"], ["cookie", "🍪"], ["galleta", "🍪"],
    ["biscuit", "🍪"], ["cupcake", "🧁"], ["magdalena", "🧁"],
    ["muffin", "🧁"], ["pastel", "🍰"], ["cake", "🍰"],
    ["tarta", "🍰"], ["torta", "🍰"], ["pie", "🥧"],
    ["dessert", "🍮"], ["postre", "🍮"], ["flan", "🍮"],
    ["chocolate", "🍫"], ["candy", "🍭"], ["caramelo", "🍭"],
    ["dulce", "🍬"], ["sweet", "🍬"], ["croissant", "🥐"],
    ["pastry", "🥐"], ["bakery", "🥐"], ["panaderia", "🥐"],
    ["bread", "🥐"],
    ["juice", "🧃"], ["jugo", "🧃"], ["zumo", "🧃"],
    ["helado", "🍦"], ["ice", "🍦"], ["shake", "🥤"],
    ["batido", "🥤"], ["smoothie", "🥤"], ["milk", "🥛"],
    ["leche", "🥛"], ["coffee", "☕"], ["cafe", "☕"],
    ["espresso", "☕"], ["tea", "🍵"], ["infusion", "🍵"],
    ["drink", "🥤"], ["bebida", "🥤"], ["beverage", "🥤"],
    ["soda", "🥤"], ["refresco", "🥤"],
    ["snack", "🍿"], ["botana", "🍿"], ["aperitivo", "🍿"],
    ["side", "🍟"], ["acompan", "🍟"], ["combo", "🎁"],
    ["menu", "🍱"], ["meal", "🍱"], ["kid", "🧸"],
    ["nino", "🧸"], ["spicy", "🌶️"], ["picante", "🌶️"],
    ["sauce", "🥫"], ["salsa", "🥫"], ["offer", "🏷️"],
    ["deal", "🏷️"], ["oferta", "🏷️"], ["pan", "🥖"]
  ];
  const hit = map.find(([key]) => n.includes(key)); // find an item
  return hit ? hit[1] : "🍽️"; // return result
}

// ==============================
// Render Category Chips
// ==============================
// Purpose: Draws the clickable category buttons.

function renderCategoryChips(categories) { // function: render category chips
  const wrap = document.getElementById("category-chips"); // get element by id
  if (!wrap) return; // guard: early exit
  const items = ["all", ...categories]; // declare constant
  wrap.innerHTML = items.map(category => `

    <button
      type="button"
      class="category-chip ${
        categoryFilter.value === category ? "active" : ""
      }"
      data-category="${escapeHTML(category)}"
    >

      <span class="chip-emoji">
        ${category === "all" ? "✨" : categoryEmoji(category)}
      </span>

      <span>
        ${category === "all" ? "All Treats" : escapeHTML(category)}
      </span>

    </button>

  `).join("");
}

function syncCategoryChips() { // function: sync active category chip
  document.querySelectorAll(".category-chip").forEach(chip => { // loop over items
    chip.classList.toggle(
      "active",
      chip.dataset.category === categoryFilter.value
    );
  }); // close callback
}

// ==============================
// Product Badge
// ==============================
// Purpose: Chooses the 'Best Seller' / 'New' tag for a card.

function productBadge(product) { // function: product badge (Best Seller/New)
  const index = allProducts.findIndex(
    item => String(item.id) === String(product.id)
  );
  if (index < DEALS_COUNT) return ""; // condition
  if (index % 5 === 0) return "Best Seller"; // condition
  if (index % 7 === 1) return "New"; // condition
  return ""; // return result
}

// ==============================
// Product Card
// ==============================
// Purpose: Builds the HTML for one product card.

function productCard(product, dealSection = false) { // function: build product card HTML
  const originalPrice = productPrice(product); // declare constant
  const deal = isDeal(product); // declare constant
  const image = getProductImage(product); // declare constant
  const isWishlisted = wishlist.some(
    item => String(item.id) === String(product.id)
  );
  const tag = productBadge(product); // declare constant
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
  const badgeHTML = dealSection && deal
    ? '<span class="deal-badge">15% OFF</span>'
    : (
      tag
        ? `<span class="tag-badge">${escapeHTML(tag)}</span>`
        : ""
    );
  const revealClass = animateCards ? " reveal" : ""; // declare constant
  const revealStyle = animateCards
    ? ` style="--d:${(revealCounter++ % 4) * 90}ms"`
    : "";
  return `

    <article
      class="product-card${revealClass}"${revealStyle}
      data-product-id="${escapeHTML(product.id)}"
      tabindex="0"
      aria-label="View ${escapeHTML(product.name)} details"
    >

      <button
        class="wishlist-card-btn ${isWishlisted ? "active" : ""}"
        type="button"
        data-action="toggle-wishlist"
        data-product-id="${escapeHTML(product.id)}"
        aria-label="Save to wishlist"
      >
        ${isWishlisted ? "♥" : "♡"}
      </button>

      ${badgeHTML}

      <div class="product-media${image ? "" : " no-image"}">

        ${image ? `
          <img
            class="product-image"
            src="${escapeHTML(image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            onerror="this.parentElement.classList.add('no-image');this.remove()"
          >
        ` : ""}

      </div>

      <div class="product-info">

        <span class="product-category">
          ${escapeHTML(product.category || "Sweet treat")}
        </span>

        <h3>${escapeHTML(product.name)}</h3>

        ${priceHTML}

        <div class="card-actions">

          <button
            class="add-to-cart"
            type="button"
            data-product-id="${escapeHTML(product.id)}"
          >
            Add to Cart ♡
          </button>

          <button
            class="view-details-btn"
            type="button"
            data-action="view-details"
            data-product-id="${escapeHTML(product.id)}"
          >
            View Details
          </button>

        </div>

      </div>

    </article>

  `;
}

// ==============================
// Display Deals
// ==============================
// Purpose: Renders the special-deals section.

function displayDeals() { // function: render deals section
  const deals = allProducts.slice(0, DEALS_COUNT); // declare constant
  dealsContainer.innerHTML = deals.length
    ? deals.map(product => productCard(product, true)).join("")
    : '<p class="loading">No special deals available right now.</p>';
}

// ==============================
// Search, Filter and Sort
// ==============================
// Purpose: Filters by search/category, sorts, and re-renders the grid.

function applyFilters() { // function: apply search, filter and sort
  const query = searchInput.value.trim().toLowerCase(); // declare constant
  const category = categoryFilter.value; // declare constant
  const sort = sortFilter.value; // declare constant
  syncCategoryChips(); // call: sync active category chip
  let filtered = allProducts.filter(product => { // filter items
    const name = String(product.name || "").toLowerCase(); // declare constant
    const productCategory = String(product.category || "Other"); // declare constant
    const matchesSearch =
      name.includes(query) ||
      productCategory.toLowerCase().includes(query);
    const matchesCategory =
      category === "all" ||
      productCategory === category;
    return matchesSearch && matchesCategory; // return result
  }); // close callback
  if (sort === "name") { // condition
    filtered.sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );
  } else if (sort === "name-desc") { // else-if condition
    filtered.sort((a, b) =>
      String(b.name).localeCompare(String(a.name))
    );
  } else if (sort === "deals") { // else-if condition
    filtered.sort(
      (a, b) => Number(isDeal(b)) - Number(isDeal(a))
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

// ==============================
// Toast Notification
// ==============================
// Purpose: Small popup message that disappears by itself.

function showToast(message) { // function: show short toast message
  const toast = document.getElementById("cart-toast"); // get element by id
  toast.textContent = message; // set text
  toast.classList.add("show"); // add class
  clearTimeout(toastTimer); // cancel timer
  toastTimer = setTimeout(() => { // run after delay
    toast.classList.remove("show"); // remove class
  }, 2300);
}

// ==============================
// Toggle Wishlist
// ==============================
// Purpose: Adds or removes a product from the wishlist.

function toggleWishlist(product) { // function: add/remove from wishlist
  if (!product) return; // guard: early exit
  if (!currentUser) { // wishlist requires an account
    showToast("Please log in to add items to your wishlist."); // show a notification
    openAuthModal("login"); // call open auth modal
    return; // stop here
  }
  const id = String(product.id); // declare constant
  const index = wishlist.findIndex(
    item => String(item.id) === id
  );
  if (index >= 0) { // condition
    wishlist.splice(index, 1); // call splice
    showToast(`${product.name} removed from wishlist.`); // call: show short toast message
  } else { // else branch
    wishlist.push({
      id: product.id,
      name: product.name,
      price: finalPrice(product),
      image: getProductImage(product),
      category: product.category
    }); // close callback
    showToast(`${product.name} added to your wishlist ♥`); // call: show short toast message
  }
  saveWishlist(); // call: save wishlist to storage
  updateWishlist(); // call: refresh wishlist UI
  applyFilters(); // call: apply search, filter and sort
  displayDeals(); // call: render deals section
}

// ==============================
// Update Wishlist
// ==============================
// Purpose: Re-renders the wishlist drawer and its counters.

function updateWishlist() { // function: refresh wishlist UI
  saveWishlist(); // call: save wishlist to storage
  wishlistCount.textContent = wishlist.length; // set text
  bnavWish.textContent = wishlist.length; // set text
  bnavWish.hidden = wishlist.length === 0; // show/hide element
  if (!wishlist.length) { // condition
    wishlistItems.innerHTML = `
${emptyStateHTML("wishlist")}
    `;
    return; // exit function
  }
  wishlistItems.innerHTML = wishlist.map(item => `

    <div class="cart-item">

      <img
        src="${escapeHTML(item.image || "")}"
        alt="${escapeHTML(item.name)}"
      >

      <div class="cart-item-info">

        <h3>${escapeHTML(item.name)}</h3>

        <p>${formatPrice(item.price)}</p>

        <div class="cart-item-actions">

          <button
            type="button"
            data-action="wishlist-to-cart"
            data-id="${escapeHTML(item.id)}"
          >
            Add to Cart
          </button>

          <button
            type="button"
            data-action="remove-wishlist"
            data-id="${escapeHTML(item.id)}"
          >
            Remove
          </button>

        </div>

      </div>

    </div>

  `).join("");
}

// ==============================
// Open Wishlist
// ==============================
// Purpose: Opens the wishlist drawer.

function openWishlist() { // function: open wishlist drawer
  wishlistDrawer.classList.add("open"); // add class
  cartOverlay.hidden = false; // show/hide element
  wishlistDrawer.setAttribute("aria-hidden", "false"); // set attribute
  document.body.classList.add("lock-scroll"); // add class
  closeWishlistButton.focus(); // move focus
}

// ==============================
// Close Wishlist
// ==============================
// Purpose: Closes the wishlist drawer.

function closeWishlist() { // function: close wishlist drawer
  wishlistDrawer.classList.remove("open"); // remove class
  if (!cartDrawer.classList.contains("open")) { // condition
    cartOverlay.hidden = true; // show/hide element
  }
  wishlistDrawer.setAttribute("aria-hidden", "true"); // set attribute
  if (
    productModal.hidden &&
    authModal.hidden &&
    !cartDrawer.classList.contains("open")
  ) {
    document.body.classList.remove("lock-scroll"); // remove class
  }
  wishlistButton.focus(); // move focus
}

// ==============================
// Add Product to Cart
// ==============================
// Purpose: Adds a product (requires login) or increases its quantity.

function addToCart(product) { // function: add product to cart
  if (!product) return; // guard: early exit
  if (!currentUser) { // condition
    showToast("Please log in or register first to add items!"); // call: show short toast message
    openAuthModal("login"); // call: open login/register modal
    return; // exit function
  }
  const id = String(product.id); // declare constant
  const existing = cart.find(
    item => String(item.id) === id
  );
  if (existing) { // condition
    existing.quantity += 1; // assign/update value
    existing.price = finalPrice(product); // assign/update value
  } else { // else branch
    cart.push({
      id: product.id,
      name: product.name,
      price: finalPrice(product),
      image: getProductImage(product),
      quantity: 1
    }); // close callback
  }
  updateCart(); // call: refresh cart UI and totals
  bumpCart(); // call: bump animation on cart button
  try { playAddToCartEffect(product); } catch (err) { /* never block the cart */ }
  showToast(`${product.name} added to your bag!`); // call: show short toast message
}

// ==============================
// Update Cart
// ==============================
// Purpose: Recalculates totals/discount/free-delivery and re-renders the cart.

function updateCart() { // function: refresh cart UI and totals
  saveCart(); // call: save cart to storage
  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
  cartCount.textContent = totalItems; // set text
  bnavCart.textContent = totalItems; // set text
  bnavCart.hidden = totalItems === 0; // show/hide element
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  // The promo only counts for logged-in users
  const promoActive = appliedPromo && !!currentUser; // declare constant
  const discount = promoActive
    ? subtotal * PROMO_DISCOUNT
    : 0;
  const total = subtotal - discount; // declare constant
  cartSubtotal.textContent = formatPrice(subtotal); // set text
  cartDiscountRow.hidden = !promoActive; // show/hide element
  cartDiscount.textContent = "-" + formatPrice(discount); // set text
  cartTotal.textContent = formatPrice(total); // set text
  if (!cart.length) { // condition
    freeDelivery.hidden = true; // show/hide element
  } else { // else branch
    const remaining = FREE_DELIVERY_AT - total; // declare constant
    freeDelivery.hidden = false; // show/hide element
    freeDelivery.classList.toggle("done", remaining <= 0); // toggle class
    freeDeliveryText.textContent = remaining > 0
      ? `Add ${formatPrice(remaining)} more for free delivery 🚚`
      : "🎉 You've unlocked free delivery!";
    freeDeliveryFill.style.width =
      Math.min(100, (total / FREE_DELIVERY_AT) * 100) + "%";
  }
  if (!cart.length) { // condition
    cartItems.innerHTML = `
${emptyStateHTML("cart")}
    `;
    return; // exit function
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
          >
            −
          </button>

          <span>${Number(item.quantity)}</span>

          <button
            type="button"
            data-action="increase"
            data-id="${escapeHTML(item.id)}"
            aria-label="Increase quantity"
          >
            +
          </button>

          <button
            type="button"
            data-action="remove"
            data-id="${escapeHTML(item.id)}"
          >
            Remove
          </button>

        </div>

      </div>

    </div>

  `).join("");
  const inCart = new Set(
    cart.map(item => String(item.id))
  );
  const suggestions = [...allProducts]
    .reverse()
    .filter(product => !inCart.has(String(product.id)))
    .slice(0, 2);
  if (suggestions.length) { // condition
    cartItems.insertAdjacentHTML("beforeend", `

      <div class="cart-upsell">

        <h4>People also ordered ♡</h4>

        ${suggestions.map(product => `
          <div class="upsell-item">
            <img
              src="${escapeHTML(getProductImage(product))}"
              alt="${escapeHTML(product.name)}"
              onerror="this.style.visibility='hidden'"
            >
            <div>
              <h5>${escapeHTML(product.name)}</h5>
              <span>${formatPrice(finalPrice(product))}</span>
            </div>
            <button
              type="button"
              data-action="upsell-add"
              data-id="${escapeHTML(product.id)}"
            >
              + Add
            </button>
          </div>
        `).join("")}

      </div>

    `);
  }
}

// ==============================
// Animate Cart Button
// ==============================
// Purpose: Small bump animation on the cart button.

function bumpCart() { // function: bump animation on cart button
  [cartButton, bnavCartBtn].forEach(el => { // loop over items
    el.classList.remove("bump"); // remove class
    void el.offsetWidth;
    el.classList.add("bump"); // add class
  }); // close callback
}

// ==============================
// Open Cart
// ==============================
// Purpose: Opens the cart drawer (requires login).

function openCart() { // function: open cart drawer
  if (!currentUser) { // condition
    showToast("Please log in first to view your cart!"); // call: show short toast message
    openAuthModal("login"); // call: open login/register modal
    return; // exit function
  }
  cartDrawer.classList.add("open"); // add class
  cartOverlay.hidden = false; // show/hide element
  cartDrawer.setAttribute("aria-hidden", "false"); // set attribute
  document.body.classList.add("lock-scroll"); // add class
  closeCartButton.focus(); // move focus
}

// ==============================
// Close Cart
// ==============================
// Purpose: Closes the cart drawer.

function closeCart() { // function: close cart drawer
  cartDrawer.classList.remove("open"); // remove class
  if (!wishlistDrawer.classList.contains("open")) { // condition
    cartOverlay.hidden = true; // show/hide element
  }
  cartDrawer.setAttribute("aria-hidden", "true"); // set attribute
  if (
    productModal.hidden &&
    authModal.hidden &&
    !wishlistDrawer.classList.contains("open")
  ) {
    document.body.classList.remove("lock-scroll"); // remove class
  }
  cartButton.focus(); // move focus
}

// ==============================
// Open Product Details
// ==============================
// Purpose: Fills and opens the product details popup.

function openProductModal(product) { // function: open product details
  selectedProduct = product; // assign/update value
  const image = document.getElementById("modal-product-image"); // get element by id
  image.src = getProductImage(product); // assign/update value
  image.alt = product.name || "Sweet treat"; // assign/update value
  image.onerror = () => { // assign/update value
    image.style.visibility = "hidden"; // set inline style
  };
  image.onload = () => { // assign/update value
    image.style.visibility = "visible"; // set inline style
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
  updateProductModalReviews(product); // call: update product rating summary
  productModal.hidden = false; // show/hide element
  document.body.classList.add("lock-scroll"); // add class
  closeModalButton.focus(); // move focus
}

// ==============================
// Close Product Details
// ==============================
// Purpose: Closes the product details popup.

function closeProductModal() { // function: close product details
  productModal.hidden = true; // show/hide element
  selectedProduct = null; // assign/update value
  if (
    !cartDrawer.classList.contains("open") &&
    !wishlistDrawer.classList.contains("open") &&
    authModal.hidden
  ) {
    document.body.classList.remove("lock-scroll"); // remove class
  }
}

// ==============================
// Product Click Events
// ==============================
// Purpose: Connects clicks on product grids to the handler below.

productsContainer.addEventListener("click", handleProductClick); // attach event listener

dealsContainer.addEventListener("click", handleProductClick); // attach event listener

// ==============================
// Wishlist heart: pulse + burst of little hearts
// ==============================
// Purpose: Heart animation when a product is wishlisted; also the central click handler for cards.

function celebrateWishlist(productId, rect) { // function: heart burst effect
  // pulse every heart button of this product (cards are re-rendered, so query again)
  document
    .querySelectorAll(".wishlist-card-btn")
    .forEach(btn => { // loop over items
      if (String(btn.dataset.productId) === String(productId)) { // condition
        btn.classList.add("heart-pop"); // add class
        setTimeout(() => btn.classList.remove("heart-pop"), 700); // remove class
      }
    }); // close callback
  // nav wishlist button bumps too
  if (wishlistButton) { // condition
    wishlistButton.classList.remove("bump"); // remove class
    void wishlistButton.offsetWidth;
    wishlistButton.classList.add("bump"); // add class
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // guard: early exit
  const cx = rect.left + rect.width / 2; // declare constant
  const cy = rect.top + rect.height / 2; // declare constant
  const colors = ["#e74c3c", "#ff6b81", "#f7a8b8", "#e8998d", "#ff8fa3"]; // declare constant
  const COUNT = 9; // declare constant
  for (let i = 0; i < COUNT; i++) { // loop
    const heart = document.createElement("span"); // declare constant
    const angle = (Math.PI * 2 * i) / COUNT + (Math.random() - 0.5) * 0.6; // declare constant
    const dist = 38 + Math.random() * 34; // declare constant
    heart.className = "heart-burst"; // assign/update value
    heart.textContent = "♥"; // set text
    heart.setAttribute("aria-hidden", "true"); // set attribute
    heart.style.setProperty("--x", cx + "px"); // set inline style
    heart.style.setProperty("--y", cy + "px"); // set inline style
    heart.style.setProperty("--dx", Math.cos(angle) * dist + "px"); // set inline style
    heart.style.setProperty("--dy", Math.sin(angle) * dist - 14 + "px"); // set inline style
    heart.style.setProperty("--rot", (Math.random() * 60 - 30).toFixed(0) + "deg"); // set inline style
    heart.style.setProperty("--fs", (10 + Math.random() * 10).toFixed(0) + "px"); // set inline style
    heart.style.setProperty("--hc", colors[i % colors.length]); // set inline style
    document.body.appendChild(heart); // append element
    setTimeout(() => heart.remove(), 900); // run after delay
  }
}

function handleProductClick(event) { // function: handle clicks inside product cards
  const wishlistBtn = event.target.closest(
    "[data-action='toggle-wishlist']"
  );
  if (wishlistBtn) { // condition
    event.stopPropagation(); // stop event bubbling
    const product = allProducts.find(
      item =>
        String(item.id) === String(wishlistBtn.dataset.productId)
    );
    if (product) { // condition
      const rect = wishlistBtn.getBoundingClientRect(); // declare constant
      const wasActive = wishlistBtn.classList.contains("active"); // declare constant
      toggleWishlist(product); // call: add/remove from wishlist
      if (!wasActive) celebrateWishlist(product.id, rect); // condition
    }
    return; // exit function
  }
  const detailsBtn = event.target.closest(
    "[data-action='view-details']"
  );
  if (detailsBtn) { // condition
    event.stopPropagation(); // stop event bubbling
    const product = allProducts.find(
      item =>
        String(item.id) === String(detailsBtn.dataset.productId)
    );
    if (product) openProductModal(product); // condition
    return; // exit function
  }
  const addButton = event.target.closest(".add-to-cart"); // declare constant
  if (addButton) { // condition
    event.stopPropagation(); // stop event bubbling
    const product = allProducts.find(
      item =>
        String(item.id) === String(addButton.dataset.productId)
    );
    addToCart(product); // call: add product to cart
    return; // exit function
  }
  const card = event.target.closest(".product-card"); // declare constant
  if (!card) return; // guard: early exit
  const product = allProducts.find(
    item =>
      String(item.id) === String(card.dataset.productId)
  );
  if (product) { // condition
    openProductModal(product); // call: open product details
  }
}

// ==============================
// Keyboard Access for Products
// ==============================
// Purpose: Enter/Space opens a focused product card (accessibility).

[productsContainer, dealsContainer].forEach(container => { // loop over items
  container.addEventListener("keydown", event => { // attach event listener
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target.classList.contains("product-card")
    ) {
      event.preventDefault(); // prevent default behavior
      const product = allProducts.find(
        item =>
          String(item.id) === String(event.target.dataset.productId)
      );
      if (product) openProductModal(product); // condition
    }
  }); // close callback
}); // close callback

// ==============================
// Search and Filter Events
// ==============================
// Purpose: Re-filters products when the controls change.

searchInput.addEventListener("input", applyFilters); // attach event listener

categoryFilter.addEventListener("change", applyFilters); // attach event listener

sortFilter.addEventListener("change", applyFilters); // attach event listener

// ==============================
// Cart and Wishlist Events
// ==============================
// Purpose: Open/close buttons for the cart and wishlist drawers.

cartButton.addEventListener("click", openCart); // attach event listener

closeCartButton.addEventListener("click", closeCart); // attach event listener

wishlistButton.addEventListener("click", openWishlist); // attach event listener

closeWishlistButton.addEventListener("click", closeWishlist); // attach event listener

cartOverlay.addEventListener("click", () => { // attach event listener
  closeCart(); // call: close cart drawer
  closeWishlist(); // call: close wishlist drawer
}); // close callback

// ==============================
// Clear Cart
// ==============================
// Purpose: Empties the cart.

clearCartButton.addEventListener("click", () => { // attach event listener
  cart = []; // assign/update value
  updateCart(); // call: refresh cart UI and totals
  showToast("Your cart has been cleared."); // call: show short toast message
}); // close callback

// ==============================
// Clear Wishlist
// ==============================
// Purpose: Empties the wishlist.

clearWishlistButton.addEventListener("click", () => { // attach event listener
  wishlist = []; // assign/update value
  updateWishlist(); // call: refresh wishlist UI
  applyFilters(); // call: apply search, filter and sort
  displayDeals(); // call: render deals section
  showToast("Your wishlist has been cleared."); // call: show short toast message
}); // close callback

// ==============================
// Cart Item Actions
// ==============================
// Purpose: Handles +, -, remove and upsell buttons inside the cart.

cartItems.addEventListener("click", event => { // attach event listener
  const button = event.target.closest("button[data-action]"); // declare constant
  if (!button) return; // guard: early exit
  if (button.dataset.action === "upsell-add") { // condition
    const suggested = allProducts.find(
      p => String(p.id) === String(button.dataset.id)
    );
    addToCart(suggested); // call: add product to cart
    return; // exit function
  }
  const item = cart.find(
    entry => String(entry.id) === String(button.dataset.id)
  );
  if (!item) return; // guard: early exit
  if (button.dataset.action === "increase") { // condition
    item.quantity += 1; // assign/update value
  }
  if (button.dataset.action === "decrease") { // condition
    item.quantity -= 1; // assign/update value
  }
  if (
    button.dataset.action === "remove" ||
    item.quantity <= 0
  ) {
    cart = cart.filter(
      entry => String(entry.id) !== String(button.dataset.id)
    );
  }
  updateCart(); // call: refresh cart UI and totals
}); // close callback

// ==============================
// Wishlist Item Actions
// ==============================
// Purpose: Handles add-to-cart / remove buttons inside the wishlist.

wishlistItems.addEventListener("click", event => { // attach event listener
  const button = event.target.closest("button[data-action]"); // declare constant
  if (!button) return; // guard: early exit
  const id = button.dataset.id; // declare constant
  const item = wishlist.find(
    entry => String(entry.id) === String(id)
  );
  if (!item) return; // guard: early exit
  if (button.dataset.action === "wishlist-to-cart") { // condition
    addToCart(item); // call: add product to cart
  } else if (button.dataset.action === "remove-wishlist") { // else-if condition
    wishlist = wishlist.filter(
      entry => String(entry.id) !== String(id)
    );
    saveWishlist(); // call: save wishlist to storage
    updateWishlist(); // call: refresh wishlist UI
    applyFilters(); // call: apply search, filter and sort
    displayDeals(); // call: render deals section
    showToast("Removed from wishlist."); // call: show short toast message
  }
}); // close callback

// ==============================
// Product Modal Events
// ==============================
// Purpose: Close and add-to-cart buttons of the product popup.

closeModalButton.addEventListener("click", closeProductModal); // attach event listener

productModal.addEventListener("click", event => { // attach event listener
  if (event.target.matches("[data-close-modal]")) { // condition
    closeProductModal(); // call: close product details
  }
}); // close callback

modalAddButton.addEventListener("click", () => { // attach event listener
  if (!selectedProduct) return; // guard: early exit
  addToCart(selectedProduct); // call: add product to cart
  closeProductModal(); // call: close product details
}); // close callback

// ==============================
// Authentication Modal Events
// ==============================
// Purpose: Close and switch (login/register) actions of the auth popup.

closeAuthButton.addEventListener("click", closeAuthModal); // attach event listener

authModal.addEventListener("click", event => { // attach event listener
  if (event.target.matches("[data-close-auth]")) { // condition
    closeAuthModal(); // call: close login/register modal
  }
}); // close callback

switchToRegister.addEventListener("click", () => { // attach event listener
  openAuthModal("register"); // call: open login/register modal
}); // close callback

switchToLogin.addEventListener("click", () => { // attach event listener
  openAuthModal("login"); // call: open login/register modal
}); // close callback

// ==============================
// Register Form
// ==============================
// Purpose: Creates a new account and logs the user in.

registerForm.disableSelection = false; // assign/update value

registerForm.addEventListener("submit", event => { // attach event listener
  event.preventDefault(); // prevent default behavior
  const name =
    document.getElementById("reg-name").value.trim();
  const email =
    document.getElementById("reg-email").value.trim().toLowerCase();
  const password =
    document.getElementById("reg-password").value;
  let users =
    JSON.parse(localStorage.getItem("sugarRushUsers")) || []; // read from localStorage
  const existingUser = users.find(u => u.email === email); // find an item
  if (existingUser) { // condition
    registerError.textContent =
      "Email is already registered! Please log in.";
    registerError.hidden = false; // show/hide element
    return; // exit function
  }
  const newUser = { // declare constant
    name,
    email,
    password
  };
  users.push(newUser); // call push
  localStorage.setItem(
    "sugarRushUsers",
    JSON.stringify(users)
  );
  // Do NOT log in automatically: send the user to the login form instead
  openAuthModal("login"); // call: open login/register modal
  document.getElementById("login-email").value = email; // prefill email
  showToast("Account created! Please log in to continue."); // show a notification
}); // close callback

// ==============================
// Login Form
// ==============================
// Purpose: Checks credentials and logs the user in.

loginForm.addEventListener("submit", event => { // attach event listener
  event.preventDefault(); // prevent default behavior
  const email =
    document.getElementById("login-email").value.trim().toLowerCase();
  const password =
    document.getElementById("login-password").value;
  let users =
    JSON.parse(localStorage.getItem("sugarRushUsers")) || []; // read from localStorage
  const user = users.find(
    u => u.email === email && u.password === password
  );
  if (!user) { // condition
    loginError.textContent =
      "Invalid email or password. Please try again.";
    loginError.hidden = false; // show/hide element
    return; // exit function
  }
  currentUser = user; // assign/update value
  localStorage.setItem(
    "sugarRushCurrentUser",
    JSON.stringify(currentUser)
  );
  cart = loadCart(); // restore this user's saved cart
  wishlist = loadWishlist(); // restore this user's saved wishlist
  updateCart(); // call: refresh cart UI and totals
  updateWishlist(); // refresh wishlist UI
  applyFilters(); // refresh heart icons
  displayDeals(); // refresh heart icons in deals
  closeAuthModal(); // call: close login/register modal
  updateAuthNav(); // call: update login/logout button
  showToast(`Welcome back, ${user.name}!`); // call: show short toast message
}); // close callback

// ==============================
// Escape Key Handling
// ==============================
// Purpose: Esc closes the top-most open popup or drawer.

document.addEventListener("keydown", event => { // attach event listener
  if (event.key === "Escape") { // condition
    if (!productModal.hidden) { // condition
      closeProductModal(); // call: close product details
    } else if (!authModal.hidden) { // else-if condition
      closeAuthModal(); // call: close login/register modal
    } else if (cartDrawer.classList.contains("open")) { // else-if condition
      closeCart(); // call: close cart drawer
    } else if (wishlistDrawer.classList.contains("open")) { // else-if condition
      closeWishlist(); // call: close wishlist drawer
    }
  }
}); // close callback

// ==============================
// Order Success Popup
// ==============================
// Purpose: Shows the 'Order placed' confirmation.

function showOrderSuccess(order) { // function: show order success popup
  const firstName = currentUser
    ? currentUser.name.split(" ")[0]
    : "";
  const freeDeliveryNote =
    order.total >= FREE_DELIVERY_AT
      ? " Free delivery included 🎉"
      : "";
  document.getElementById("success-text").textContent =
    `Thank you, ${firstName}! Your sweet treats are on their way. Total: ${formatPrice(order.total)}.${freeDeliveryNote}`;
  document.getElementById("success-order-id").textContent =
    `Order ${order.id}`;
  document.getElementById("success-hearts").innerHTML =
    Array.from({ length: 16 }, (_, i) => `
      <span
        class="heart-float"
        style="
          left:${Math.random() * 100}%;
          animation-delay:${(Math.random() * 1.6).toFixed(2)}s;
          font-size:${Math.round(14 + Math.random() * 16)}px
        "
      >
        ${i % 2 ? "♥" : "♡"}
      </span>
    `).join("");
  orderSuccess.hidden = false; // show/hide element
  document.body.classList.add("lock-scroll"); // add class
  document.getElementById("success-close").focus(); // move focus
}

function closeOrderSuccess() { // function: close order success popup
  orderSuccess.hidden = true; // show/hide element
  if (
    !cartDrawer.classList.contains("open") &&
    !wishlistDrawer.classList.contains("open") &&
    productModal.hidden &&
    authModal.hidden
  ) {
    document.body.classList.remove("lock-scroll"); // remove class
  }
}

document.getElementById("success-close").addEventListener("click", () => { // attach event listener
  closeOrderSuccess(); // call: close order success popup
  document.getElementById("products").scrollIntoView({ // smooth scroll to section
    behavior: "smooth",
    block: "start"
  }); // close callback
}); // close callback

orderSuccess.addEventListener("click", event => { // attach event listener
  if (event.target.matches("[data-close-success]")) { // condition
    closeOrderSuccess(); // call: close order success popup
  }
}); // close callback

document.addEventListener("keydown", event => { // attach event listener
  if (event.key === "Escape" && !orderSuccess.hidden) { // condition
    closeOrderSuccess(); // call: close order success popup
  }
}); // close callback

// ==============================
// Place Order
// ==============================
// Purpose: Validates the cart, saves the order, and shows success.

const placeOrderBtn = document.getElementById("place-order-btn"); // get element by id

placeOrderBtn.addEventListener("click", () => { // attach event listener
  if (!currentUser) { // condition
    showToast("Please log in first to place an order!"); // call: show short toast message
    openAuthModal("login"); // call: open login/register modal
    return; // exit function
  }
  if (!cart.length) { // condition
    showToast("Your cart is empty. Add something sweet first!"); // call: show short toast message
    return; // exit function
  }
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const discount = appliedPromo
    ? subtotal * PROMO_DISCOUNT
    : 0;
  const total = subtotal - discount; // declare constant
  const order = { // declare constant
    id: "SR-" + Date.now().toString().slice(-6),
    email: currentUser.email,
    date: new Date().toISOString(),
    items: cart.map(item => ({ // transform each item
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    subtotal,
    promo: appliedPromo ? PROMO_CODE : null,
    discount,
    total
  };
  try { // try safely
    const orders =
      JSON.parse(localStorage.getItem("sugarRushOrders")) || []; // read from localStorage
    orders.push(order); // call push
    localStorage.setItem(
      "sugarRushOrders",
      JSON.stringify(orders)
    );
  } catch (error) { // handle error
    console.warn("Could not save order:", error); // log warning/error
  }
  // Promo code is single-use per order
  appliedPromo = false; // assign/update value
  localStorage.removeItem("sugarRushPromo"); // remove from localStorage
  setPromoMessage(""); // call: show promo code message
  cart = []; // assign/update value
  updateCart(); // call: refresh cart UI and totals
  closeCart(); // call: close cart drawer
  showOrderSuccess(order); // call: show order success popup
}); // close callback

// ==============================
// Promo Code
// ==============================
// Purpose: Validates and applies/removes the discount code.

function setPromoMessage(text, type = "") { // function: show promo code message
  promoMessage.textContent = text; // set text
  promoMessage.className = "promo-message " + type; // assign/update value
  promoMessage.hidden = !text; // show/hide element
}

function applyPromoCode() { // function: apply promo code
  const code = promoInput.value.trim().toUpperCase(); // declare constant
  if (!currentUser) { // condition
    setPromoMessage(
      "Please log in or register to use a promo code.",
      "error"
    );
    showToast("Please log in first to use a promo code!"); // call: show short toast message
    openAuthModal("login"); // call: open login/register modal
    return; // exit function
  }
  if (!code) { // condition
    setPromoMessage("Please enter a promo code.", "error"); // call: show promo code message
    return; // exit function
  }
  if (code !== PROMO_CODE) { // condition
    setPromoMessage("Invalid promo code.", "error"); // call: show promo code message
    return; // exit function
  }
  if (appliedPromo) { // condition
    setPromoMessage("This code is already applied.", "error"); // call: show promo code message
    return; // exit function
  }
  appliedPromo = true; // assign/update value
  localStorage.setItem("sugarRushPromo", PROMO_CODE); // save to localStorage
  promoInput.value = ""; // set value
  setPromoMessage(
    "Code applied! You got 20% off.",
    "success"
  );
  updateCart(); // call: refresh cart UI and totals
  showToast("Promo code applied: 20% off!"); // call: show short toast message
}

promoApplyBtn.addEventListener("click", applyPromoCode); // attach event listener

promoInput.addEventListener("keydown", event => { // attach event listener
  if (event.key === "Enter") { // condition
    event.preventDefault(); // prevent default behavior
    applyPromoCode(); // call: apply promo code
  }
}); // close callback

promoRemoveBtn.addEventListener("click", () => { // attach event listener
  appliedPromo = false; // assign/update value
  localStorage.removeItem("sugarRushPromo"); // remove from localStorage
  setPromoMessage(""); // call: show promo code message
  updateCart(); // call: refresh cart UI and totals
  showToast("Promo code removed."); // call: show short toast message
}); // close callback

// ==============================
// Promo Bar
// ==============================
// Purpose: Closes the top banner / opens register from it.

const promoBar = document.getElementById("promo-bar"); // get element by id

document.getElementById("promo-close").addEventListener("click", () => { // attach event listener
  promoBar.hidden = true; // show/hide element
}); // close callback

document.getElementById("promo-register-link").addEventListener("click", () => { // attach event listener
  openAuthModal("register"); // call: open login/register modal
}); // close callback

// ==============================
// Category Chips
// ==============================
// Purpose: Clicking a chip filters the menu and scrolls to it.

document.getElementById("category-chips").addEventListener("click", event => { // attach event listener
  const chip = event.target.closest(".category-chip"); // declare constant
  if (!chip) return; // guard: early exit
  categoryFilter.value = chip.dataset.category; // set value
  applyFilters(); // call: apply search, filter and sort
  document.getElementById("products").scrollIntoView({ // smooth scroll to section
    behavior: "smooth",
    block: "start"
  }); // close callback
}); // close callback

// ==============================
// Mobile Bottom Navigation
// ==============================
// Purpose: Cart and wishlist buttons of the mobile bar.

bnavCartBtn.addEventListener("click", openCart); // attach event listener

bnavWishBtn.addEventListener("click", openWishlist); // attach event listener

// ==============================
// Newsletter Subscription
// ==============================
// Purpose: Stores the subscriber email.

document.getElementById("newsletter-form").addEventListener("submit", event => { // attach event listener
  event.preventDefault(); // prevent default behavior
  const input = document.getElementById("newsletter-email"); // get element by id
  const email = input.value.trim().toLowerCase(); // declare constant
  try { // try safely
    const list =
      JSON.parse(localStorage.getItem("sugarRushNewsletter")) || []; // read from localStorage
    if (!list.includes(email)) { // condition
      list.push(email); // call push
    }
    localStorage.setItem(
      "sugarRushNewsletter",
      JSON.stringify(list)
    );
  } catch (error) { // handle error
    console.warn("Could not save subscription:", error); // log warning/error
  }
  input.value = ""; // set value
  showToast("Thanks for subscribing! Sweet news is on its way ♡"); // call: show short toast message
}); // close callback

// ==============================
// Scroll Reveal for Static Sections
// ==============================
// Purpose: Adds reveal-on-scroll to fixed page sections, then runs the startup calls.

[
  ".section-heading",
  ".story-content",
  ".story-card",
  ".step-card",
  ".testimonial-card",
  ".newsletter"
].forEach(selector => { // loop over items
  document.querySelectorAll(selector).forEach((el, i) => { // loop over items
    el.classList.add("reveal"); // add class
    el.style.setProperty(
      "--d",
      (i % 4) * 110 + "ms"
    );
  }); // close callback
}); // close callback

observeReveals(); // call: reveal elements on scroll

updateAuthNav(); // call: update login/logout button

updateCart(); // call: refresh cart UI and totals

updateWishlist(); // call: refresh wishlist UI

getProducts(); // call: fetch products from API

// ===== PRELOADER =====
// Purpose: loading screen that hides once the page has loaded.
(function () { // self-invoking function (IIFE)
  const preloader = document.getElementById("preloader"); // get element by id
  if (!preloader) return; // guard: early exit
  const MIN_SHOW_MS = 900; // declare constant
  const startedAt = performance.now(); // declare constant
  function hidePreloader() { // function: hide preloader
    const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - startedAt)); // declare constant
    setTimeout(() => { // run after delay
      preloader.classList.add("is-hidden"); // add class
      setTimeout(() => preloader.remove(), 700); // run after delay
    }, wait);
  }
  if (document.readyState === "complete") { // condition
    hidePreloader(); // call: hide preloader
  } else { // else branch
    window.addEventListener("load", hidePreloader, { once: true }); // attach event listener
  }
})(); // end of IIFE

// ===== VISUAL EXTRAS =====
// Purpose: decorative effects (progress bar, split headings, sprinkles, card tilt).
// scroll progress, split headings, hero sprinkles + parallax, custom cursor, 3D card tilt
(function visualExtras() { // self-invoking function (IIFE)
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; // declare constant
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches; // declare constant
  /* ---------- 1) Scroll progress bar ---------- */
  function scrollProgress() { // function: scroll progress bar
    const bar = document.getElementById("scroll-progress"); // get element by id
    if (!bar) return; // guard: early exit
    const fill = bar.querySelector(".scroll-progress-fill"); // declare constant
    const donut = bar.querySelector(".scroll-donut"); // declare constant
    const EDGE = 11; // keep the donut fully inside the screen
    let ticking = false; // declare variable
    function update() { // function: update
      const doc = document.documentElement; // declare constant
      const max = doc.scrollHeight - doc.clientHeight; // declare constant
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0; // declare constant
      const x = EDGE + p * (window.innerWidth - EDGE * 2); // declare constant
      if (fill) fill.style.width = x + "px"; // set inline style
      if (donut) { // condition
        donut.style.left = x + "px"; // set inline style
        donut.style.transform = reduceMotion
          ? "translate(-50%, -50%)"
          : "translate(-50%, -50%) rotate(" + (window.scrollY / 6).toFixed(1) + "deg)";
      }
      ticking = false; // assign/update value
    }
    window.addEventListener("scroll", () => { // attach event listener
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update); // attach event listener
    update(); // call update
  }
  /* ---------- 2) Headings that reveal letter by letter ---------- */
  function splitHeadings() { // function: split headings into animated letters
    const heads = document.querySelectorAll(".section-heading h2, .story-content h2"); // declare constant
    if (!heads.length) return; // guard: early exit
    heads.forEach(h => { // loop over items
      const label = h.textContent.replace(/\s+/g, " ").trim(); // declare constant
      const total = Array.from(label.replace(/\s/g, "")).length; // declare constant
      let idx = 0; // declare variable
      h.setAttribute("aria-label", label); // set attribute
      (function walk(node) { // self-invoking function (IIFE)
        Array.from(node.childNodes).forEach(child => { // loop over items
          if (child.nodeType === 3) { // condition
            const frag = document.createDocumentFragment(); // declare constant
            child.textContent.split(/(\s+)/).forEach(part => { // loop over items
              if (!part) return; // guard: early exit
              if (/^\s+$/.test(part)) { // condition
                frag.appendChild(document.createTextNode(" ")); // append element
                return; // exit function
              }
              const word = document.createElement("span"); // declare constant
              word.className = "word"; // assign/update value
              word.setAttribute("aria-hidden", "true"); // set attribute
              Array.from(part).forEach(c => { // loop over items
                const ch = document.createElement("span"); // declare constant
                ch.className = "ch"; // assign/update value
                ch.textContent = c; // set text
                ch.style.setProperty("--i", idx); // set inline style
                ch.style.setProperty("--p", (idx / Math.max(1, total - 1)).toFixed(3)); // set inline style
                idx++;
                word.appendChild(ch); // append element
              }); // close callback
              frag.appendChild(word); // append element
            }); // close callback
            node.replaceChild(frag, child); // call replaceChild
          } else if (child.nodeType === 1) { // else-if condition
            walk(child); // call walk
          }
        }); // close callback
      })(h);
      h.classList.add("split"); // add class
    }); // close callback
    if (reduceMotion || !("IntersectionObserver" in window)) { // condition
      heads.forEach(h => h.classList.add("split-in")); // add class
      return; // exit function
    }
    const io = new IntersectionObserver(entries => { // declare constant
      entries.forEach(entry => { // loop over items
        if (entry.isIntersecting) { // condition
          entry.target.classList.add("split-in"); // add class
          io.unobserve(entry.target); // call unobserve
        }
      }); // close callback
    }, { threshold: 0.4 });
    heads.forEach(h => io.observe(h)); // loop over items
  }
  /* ---------- 3) Floating sprinkles + mouse parallax in the hero ---------- */
  function heroSprinkles() { // function: floating sprinkles in hero
    const hero = document.querySelector(".hero"); // declare constant
    if (!hero) return; // guard: early exit
    const layer = document.createElement("div"); // declare constant
    layer.className = "hero-sprinkles"; // assign/update value
    layer.setAttribute("aria-hidden", "true"); // set attribute
    const colors = ["#e8998d", "#f4c7b8", "#c98b7e", "#f2c94c", "#ffffff", "#b67568", "#f7a8b8"]; // declare constant
    const shapes = ["bar", "bar", "bar", "dot", "heart"]; // declare constant
    const count = window.innerWidth < 780 ? 14 : 28; // declare constant
    const rand = (a, b) => a + Math.random() * (b - a); // declare constant
    const wraps = []; // declare constant
    for (let i = 0; i < count; i++) { // loop
      const wrap = document.createElement("span"); // declare constant
      wrap.className = "sprinkle"; // assign/update value
      wrap.style.setProperty("--x", rand(2, 96).toFixed(1) + "%"); // set inline style
      wrap.style.setProperty("--y", rand(4, 92).toFixed(1) + "%"); // set inline style
      wrap.dataset.depth = rand(10, 55).toFixed(1); // assign/update value
      const inner = document.createElement("i"); // declare constant
      inner.className = "sp-" + shapes[Math.floor(Math.random() * shapes.length)]; // assign/update value
      inner.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]); // set inline style
      inner.style.setProperty("--s", rand(11, 22).toFixed(0) + "px"); // set inline style
      inner.style.setProperty("--r", rand(0, 180).toFixed(0) + "deg"); // set inline style
      inner.style.setProperty("--t", rand(6, 11).toFixed(1) + "s"); // set inline style
      inner.style.setProperty("--dl", "-" + rand(0, 8).toFixed(1) + "s"); // set inline style
      if (inner.className === "sp-heart") inner.textContent = "♥"; // set text
      wrap.appendChild(inner); // append element
      layer.appendChild(wrap); // append element
      wraps.push(wrap); // call push
    }
    hero.insertBefore(layer, hero.firstChild); // call insertBefore
    if (!finePointer) return; // guard: early exit
    let raf = null; // declare variable
    let nx = 0, ny = 0; // declare variable
    function apply() { // function: apply
      wraps.forEach(w => { // loop over items
        const d = parseFloat(w.dataset.depth); // declare constant
        w.style.transform = "translate(" + (nx * d).toFixed(1) + "px," + (ny * d).toFixed(1) + "px)"; // set inline style
      }); // close callback
      raf = null; // assign/update value
    }
    hero.addEventListener("mousemove", e => { // attach event listener
      const r = hero.getBoundingClientRect(); // declare constant
      nx = (e.clientX - r.left) / r.width - 0.5; // assign/update value
      ny = (e.clientY - r.top) / r.height - 0.5; // assign/update value
      if (!raf) raf = requestAnimationFrame(apply); // condition
    }); // close callback
    hero.addEventListener("mouseleave", () => { // attach event listener
      nx = 0; ny = 0; // assign/update value
      if (!raf) raf = requestAnimationFrame(apply); // condition
    }); // close callback
  }
  /* ---------- 5) 3D tilt + glare on product cards ---------- */
  function cardTilt() { // function: 3D tilt on cards
    let active = null; // declare variable
    function reset(card) { // function: reset
      card.style.removeProperty("--rx"); // set inline style
      card.style.removeProperty("--ry"); // set inline style
    }
    document.addEventListener("mousemove", e => { // attach event listener
      const card = e.target.closest ? e.target.closest(".product-card") : null; // declare constant
      if (active && active !== card) reset(active); // condition
      active = card; // assign/update value
      if (!card) return; // guard: early exit
      const r = card.getBoundingClientRect(); // declare constant
      const px = (e.clientX - r.left) / r.width; // declare constant
      const py = (e.clientY - r.top) / r.height; // declare constant
      card.style.setProperty("--ry", ((px - 0.5) * 10).toFixed(2) + "deg"); // set inline style
      card.style.setProperty("--rx", ((0.5 - py) * 8).toFixed(2) + "deg"); // set inline style
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%"); // set inline style
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%"); // set inline style
    }); // close callback
    document.addEventListener("mouseout", e => { // attach event listener
      if (!e.relatedTarget && active) { // condition
        reset(active); // call reset
        active = null; // assign/update value
      }
    }); // close callback
  }
  scrollProgress(); // call: scroll progress bar
  splitHeadings(); // call: split headings into animated letters
  if (!reduceMotion) heroSprinkles(); // condition
  if (finePointer && !reduceMotion) { // condition
    cardTilt(); // call: 3D tilt on cards
  }
})(); // end of IIFE

// ===== ADD TO CART: sprinkles burst + product flies to the cart =====
// Purpose: visual feedback when adding to the cart.
let lastAddClick = { el: null, t: 0 }; // declare variable

document.addEventListener("click", event => { // attach event listener
  lastAddClick = { el: event.target, t: performance.now() }; // assign/update value
}, true);

function playAddToCartEffect(product) { // function: add-to-cart effect
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // guard: early exit
  const clickedRecently = performance.now() - lastAddClick.t < 1000; // declare constant
  const clicked = clickedRecently && lastAddClick.el && lastAddClick.el.closest
    ? lastAddClick.el
    : null;
  const button = clicked ? (clicked.closest("button") || clicked) : null; // declare constant
  // where the cart currently is on screen (desktop navbar or mobile bottom bar)
  const target = [cartButton, bnavCartBtn].find(el => { // find an item
    if (!el) return false; // condition
    const r = el.getBoundingClientRect(); // declare constant
    return r.width > 0 && r.height > 0; // return result
  }); // close callback
  // ----- find the product picture to throw -----
  let imgEl = null; // declare variable
  let node = button; // declare variable
  for (let i = 0; i < 6 && node && !imgEl; i++) { // loop
    node = node.parentElement; // assign/update value
    const found = node && node.querySelector ? node.querySelector("img") : null; // declare constant
    if (found && found.getBoundingClientRect().width > 0) imgEl = found; // condition
  }
  const imgSrc = (imgEl && (imgEl.currentSrc || imgEl.src)) || getProductImage(product); // declare constant
  let startRect = null; // declare variable
  if (imgEl) { // condition
    startRect = imgEl.getBoundingClientRect(); // assign/update value
  } else if (button && button.isConnected) { // else-if condition
    const b = button.getBoundingClientRect(); // declare constant
    startRect = { // assign/update value
      left: b.left + b.width / 2 - 36,
      top: b.top + b.height / 2 - 36,
      width: 72,
      height: 72
    };
  }
  // ----- sprinkles from the button -----
  if (button && button.isConnected) { // condition
    const b = button.getBoundingClientRect(); // declare constant
    const cx = b.left + b.width / 2; // declare constant
    const cy = b.top + b.height / 2; // declare constant
    const colors = ["#e8998d", "#f4c7b8", "#f2c94c", "#ff6b81", "#b67568", "#f7a8b8", "#ffffff"]; // declare constant
    const COUNT = 16; // declare constant
    for (let i = 0; i < COUNT; i++) { // loop
      const bit = document.createElement("span"); // declare constant
      const angle = (Math.PI * 2 * i) / COUNT + (Math.random() - 0.5) * 0.5; // declare constant
      const dist = 34 + Math.random() * 40; // declare constant
      bit.className = "sprinkle-pop " + (i % 3 === 0 ? "sp-dotty" : "sp-barry"); // assign/update value
      bit.setAttribute("aria-hidden", "true"); // set attribute
      bit.style.setProperty("--x", cx + "px"); // set inline style
      bit.style.setProperty("--y", cy + "px"); // set inline style
      bit.style.setProperty("--dx", Math.cos(angle) * dist + "px"); // set inline style
      bit.style.setProperty("--dy", Math.sin(angle) * dist - 10 + "px"); // set inline style
      bit.style.setProperty("--rot", (Math.random() * 360).toFixed(0) + "deg"); // set inline style
      bit.style.setProperty("--hc", colors[i % colors.length]); // set inline style
      document.body.appendChild(bit); // append element
      setTimeout(() => bit.remove(), 800); // run after delay
    }
  }
  // ----- the picture flying to the cart -----
  if (!target || !startRect || !imgSrc) return; // guard: early exit
  const size = Math.min(startRect.width, 96); // declare constant
  const sx = startRect.left + startRect.width / 2; // declare constant
  const sy = startRect.top + startRect.height / 2; // declare constant
  const t = target.getBoundingClientRect(); // declare constant
  const dx = t.left + t.width / 2 - sx; // declare constant
  const dy = t.top + t.height / 2 - sy; // declare constant
  const fly = document.createElement("div"); // declare constant
  fly.className = "fly-img"; // assign/update value
  fly.setAttribute("aria-hidden", "true"); // set attribute
  fly.style.width = size + "px"; // set inline style
  fly.style.height = size + "px"; // set inline style
  fly.style.left = sx - size / 2 + "px"; // set inline style
  fly.style.top = sy - size / 2 + "px"; // set inline style
  fly.style.backgroundImage = "url(\"" + String(imgSrc).replace(/"/g, "%22") + "\")"; // set inline style
  document.body.appendChild(fly); // append element
  const animation = fly.animate([
    { transform: "translate(0, 0) scale(1)", opacity: 1, borderRadius: "18px" },
    { transform: "translate(" + dx * 0.45 + "px, " + (dy * 0.45 - 90) + "px) scale(.62)", opacity: 1, borderRadius: "30%", offset: 0.5 },
    { transform: "translate(" + dx + "px, " + dy + "px) scale(.12)", opacity: .55, borderRadius: "50%" }
  ], { duration: 850, easing: "cubic-bezier(.45, .05, .55, .95)" });
  animation.onfinish = () => { // assign/update value
    fly.remove(); // remove element
    target.classList.remove("cart-hit"); // remove class
    void target.offsetWidth;
    target.classList.add("cart-hit"); // add class
    setTimeout(() => target.classList.remove("cart-hit"), 600); // remove class
  };
}

// ===== EMPTY STATES (cart + wishlist) =====
// Purpose: friendly empty-cart/wishlist screen and its button.
function emptyStateHTML(kind) { // function: empty cart/wishlist markup
  const copy = kind === "wishlist"
    ? {
        title: "Your wishlist is waiting to be filled",
        text: "Tap the ♡ on any treat you love and it will wait for you here.",
        cta: "Find something sweet"
      }
    : {
        title: "Your box is waiting to be filled",
        text: "Add a little something sweet and we'll pack it with love.",
        cta: "Browse the menu"
      };
  return `
    <div class="empty-state">
      <svg class="empty-box" viewBox="0 0 140 112" aria-hidden="true">
        <ellipse class="eb-shadow" cx="70" cy="104" rx="42" ry="6"></ellipse>
        <path class="eb-flap" d="M40 44 L22 16 H56 L64 44 Z"></path>
        <path class="eb-flap" d="M100 44 L118 16 H84 L76 44 Z"></path>
        <path class="eb-inside" d="M26 62 L40 44 H100 L114 62 Z"></path>
        <rect class="eb-front" x="26" y="62" width="88" height="38" rx="7"></rect>
        <rect class="eb-ribbon" x="62" y="62" width="16" height="38"></rect>
        <path class="eb-heart" d="M70 90c-7-4.5-10.5-8.2-10.5-11.7 0-2.7 2.1-4.8 4.8-4.8 2.3 0 4.2 1.4 5.7 3.1 1.5-1.7 3.4-3.1 5.7-3.1 2.7 0 4.8 2.1 4.8 4.8 0 3.5-3.5 7.2-10.5 11.7z"></path>
        <path class="eb-star s1" d="M20 40 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"></path>
        <path class="eb-star s2" d="M116 34 l1.6 4.6 4.6 1.6 -4.6 1.6 -1.6 4.6 -1.6 -4.6 -4.6 -1.6 4.6 -1.6z"></path>
        <path class="eb-star s3" d="M70 6 l1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 4 -1.4z"></path>
      </svg>
      <h3>${copy.title}</h3>
      <p>${copy.text}</p>
      <a href="#products" class="empty-cta" data-empty-cta>${copy.cta}</a>
    </div>
  `;
}

document.addEventListener("click", event => { // attach event listener
  const cta = event.target.closest ? event.target.closest("[data-empty-cta]") : null; // declare constant
  if (!cta) return; // guard: early exit
  event.preventDefault(); // prevent default behavior
  closeCart(); // call: close cart drawer
  closeWishlist(); // call: close wishlist drawer
  const products = document.getElementById("products"); // get element by id
  if (products) products.scrollIntoView({ behavior: "smooth", block: "start" }); // smooth scroll to section
}); // close callback