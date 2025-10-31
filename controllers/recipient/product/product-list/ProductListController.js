import { localStorageKeys } from "../../../../assets/js/utils/Constantes.js";

// Controlador responsável por renderizar os cards de produtos na página view-products
export class ProductListController {
  constructor(containerId) {
    // Obtém o elemento do container pelo ID passado e inicia o processo de renderização dos produtos
    this.container = document.getElementById(containerId);
    this.filterInput = document.getElementById("product-filter-input");
    this.currentFilter = "";
    if (this.filterInput) {
      this.filterInput.addEventListener("input", (e) => {
        this.currentFilter = e.target.value;
        this.renderProducts();
      });
    }
    this.renderProducts();
  }

  // Busca a lista de produtos armazenada no localStorage
  async fetchProducts() {
    try {
      // Recupera e converte a lista de produtos do localStorage
      const products =
        JSON.parse(localStorage.getItem(localStorageKeys.PRODUCTS)) || [];
      const filteredProducts = products.filter(
        (product) =>
          product.supplierId ==
          JSON.parse(localStorage.getItem(localStorageKeys.SUPPLIER)).id
      );

      return filteredProducts;
    } catch (e) {
      // Caso haja erro na conversão, retorna lista vazia
      return [];
    }
  }

  // Renderiza todos os produtos no container
  async renderProducts() {
    if (!this.container) return; // Se o container não existir, não faz nada
    let products = await this.fetchProducts(); // Busca os produtos no localStorage
    if (this.currentFilter && this.currentFilter.trim() !== "") {
      const filter = this.currentFilter.trim().toLowerCase();
      products = products.filter(
        (product) =>
          (product.name && product.name.toLowerCase().includes(filter)) ||
          (product.description &&
            product.description.toLowerCase().includes(filter))
      );
    }
    if (products.length === 0) {
      // Se não houver produtos, exibe mensagem informativa
      if (this.currentFilter && this.currentFilter.trim() !== "") {
        this.container.innerHTML =
          '<div class="alert alert-info">Nenhum produto encontrado com esse filtro.</div>';
      } else {
        this.container.innerHTML =
          '<div class="alert alert-info">Nenhum produto encontrado.</div>';
      }
      return;
    }
    this.updateCartIndicators(); // Atualiza indicadores do carrinho
    this.container.innerHTML = products
      .map((product) => this.createCard(product))
      .join(""); // Renderiza cards

    await this.addClickableListeners(products); // Para mostrar detalhes do produto (productdetails)
    await this.addCartListeners(products);
  }

  // Garante que o carrinho seja sempre um array
  getCartArray() {
    try {
      const cartRaw = localStorage.getItem(localStorageKeys.CART);
      const parsed = cartRaw ? JSON.parse(cartRaw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  // Calcula o total de itens no carrinho
  getCartTotalQuantity() {
    const cart = this.getCartArray();
    return cart.reduce((sum, item) => sum + (item.quantityBuying || 0), 0);
  }

  // Calcula o valor total do carrinho
  getCartTotalValue() {
    const cart = this.getCartArray();
    return cart
      .reduce(
        (sum, item) =>
          sum + (item.quantityBuying || 0) * (Number(item.price) || 0),
        0
      )
      .toFixed(2);
  }

  // Atualiza os indicadores do carrinho na interface
  updateCartIndicators() {
    const quantityIndicator = document.getElementById("cart-total-quantity");
    const valueIndicator = document.getElementById("cart-total-value");
    const totalQuantity = this.getCartTotalQuantity();
    const totalValue = this.getCartTotalValue();
    if (quantityIndicator) quantityIndicator.textContent = totalQuantity;
    if (valueIndicator) valueIndicator.textContent = `R$ ${totalValue}`;
  }

  // Busca produto pelo ID
  findProductById(products, productId) {
    return products.find((p) => String(p.productId) === String(productId));
  }

  // Atualiza um produto em um array pelo productId
  updateProductInArray(array, updatedProduct) {
    const idx = array.findIndex(
      (p) => String(p.productId) === String(updatedProduct.productId)
    );
    if (idx !== -1) {
      array[idx] = { ...array[idx], ...updatedProduct };
    }
    return array;
  }

  // Atualiza o produto em products e cart no localStorage
  async updateProductInCartAndProducts(updatedProduct) {
    // Atualiza em products
    let allProducts = await this.fetchProducts();
    allProducts = this.updateProductInArray(allProducts, updatedProduct);
    localStorage.setItem(
      localStorageKeys.PRODUCTS,
      JSON.stringify(allProducts)
    );
    // Atualiza em cart
    let cart = this.getCartArray();
    cart = this.updateProductInArray(cart, updatedProduct);
    this.updateCart(cart);
  }

  // Atualiza o carrinho no localStorage
  updateCart(cart) {
    localStorage.setItem(localStorageKeys.CART, JSON.stringify(cart));
  }

  // Busca item do carrinho pelo productId
  getCartItem(cart, productId) {
    return cart.find((item) => String(item.productId) === String(productId));
  }

  // Calcula o preço total
  calculateTotalPrice(price, quantity) {
    return price && quantity > 0 ? (Number(price) * quantity).toFixed(2) : null;
  }

  // Renderiza botões do carrinho
  renderCartButtons(product, quantityInCart) {
    const isExpired = this.isProductExpired(product);
    const isMinusDisabled = quantityInCart === 0 || isExpired;
    const isPlusDisabled = product.quantity == 0 || isExpired;
    return `
            <div class="btn-group w-100 mt-3 cart-btn-group" role="group" aria-label="Cart actions">
                <button class="btn btn-cart-minus custom-cart-btn rounded-start-4 fw-semibold" data-id="${
                  product.productId
                }" ${isMinusDisabled ? "disabled" : ""}>-</button>
                <span class="cart-quantity-display">${quantityInCart}</span>
                <button class="btn btn-cart-plus custom-cart-btn rounded-end-4 fw-semibold" data-id="${
                  product.productId
                }" ${isPlusDisabled ? "disabled" : ""}>+</button>
            </div>
        `;
  }

  // Redireciona para a página de detalhes do produto
  redirectToProductDetails(product) {
    localStorage.setItem(localStorageKeys.PRODUCT, JSON.stringify(product));
    window.location.href = "#productDetailsRecipient";
  }

  async addClickableListeners(products) {
    const clickableCards = this.container.querySelectorAll(".clickable");
    clickableCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const productId = card.getAttribute("data-id");
        const product = this.findProductById(products, productId);
        if (!product) return;

        // Não redireciona se o target foi um botão (se remover isso fica impossível adicionar/remover ao carrinho e editar/excluir card)
        const targetClassList = e.target.classList;
        if (
          !targetClassList.contains("btn") &&
          !targetClassList.contains("btn-group")
        ) {
          this.redirectToProductDetails(product);
          return;
        }
      });
    });
  }

  // Adiciona listeners aos botões do carrinho
  async addCartListeners(products) {
    const addCartButtons = this.container.querySelectorAll(".btn-add-cart");
    addCartButtons.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.handleAddToCart(e, btn, products)
      );
    });
    const plusButtons = this.container.querySelectorAll(".btn-cart-plus");
    plusButtons.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.handlePlusCart(e, btn, products)
      );
    });
    const minusButtons = this.container.querySelectorAll(".btn-cart-minus");
    minusButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleMinusCart(e, btn));
    });
  }

  // Aumenta quantidade do produto no carrinho
  handlePlusCart(e, btn, products) {
    e.preventDefault();
    const productId = btn.getAttribute("data-id");
    const product = this.findProductById(products, productId);
    if (!product) return;
    let cart = this.getCartArray();
    let cartItem = this.getCartItem(cart, productId);
    const productsAlterQuantity = JSON.parse(
      localStorage.getItem(localStorageKeys.PRODUCTS)
    );
    if (cartItem) {
      cartItem.quantityBuying += 1;

      productsAlterQuantity.find(
        (item) => item.productId == cartItem.productId
      ).quantity -= 1;
    } else {
      cart.push({ ...product, quantityBuying: 1 });
      productsAlterQuantity.find(
        (item) => item.productId == cart[cart.length - 1].productId
      ).quantity -= 1;
    }
    this.updateCart(cart);

    localStorage.setItem(
      localStorageKeys.PRODUCTS,
      JSON.stringify(productsAlterQuantity)
    );

    this.renderProducts();
    this.updateCartIndicators();
  }

  // Diminui quantidade do produto no carrinho
  handleMinusCart(e, btn) {
    e.preventDefault();
    const productId = btn.getAttribute("data-id");
    let cart = this.getCartArray();
    let cartItem = this.getCartItem(cart, productId);
    if (cartItem) {
      cartItem.quantityBuying -= 1;
      if (cartItem.quantityBuying <= 0) {
        cart = cart.filter(
          (item) => String(item.productId) !== String(productId)
        );
      }
      this.updateCart(cart);
    }

    const productsAlterQuantity = JSON.parse(
      localStorage.getItem(localStorageKeys.PRODUCTS)
    );

    productsAlterQuantity.find(
      (item) => item.productId == cartItem.productId
    ).quantity += 1;
    localStorage.setItem(
      localStorageKeys.PRODUCTS,
      JSON.stringify(productsAlterQuantity)
    );

    this.renderProducts();
    this.updateCartIndicators();
  }

  // Helper to check if product is expired
  isProductExpired(product) {
    if (!product.expirationDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(product.expirationDate);
    expDate.setHours(0, 0, 0, 0);
    return expDate < today;
  }

  // Cria o card do produto
  createCard(product) {
    let cart = this.getCartArray();
    const cartItem = this.getCartItem(cart, product.productId);
    const quantityInCart = cartItem ? cartItem.quantityBuying : 0;
    const totalPrice = this.calculateTotalPrice(product.price, quantityInCart);
    const isExpired = this.isProductExpired(product);
    return `
      <div class="card mb-4 position-relative ${
        isExpired ? "expired-card border-dark" : "clickable"
      }" data-id="${product.productId}">
        ${
          isExpired
            ? `
          <div class="position-absolute top-0 start-0 translate-middle-y badge bg-danger border border-dark text-white px-4 py-2 shadow" style="z-index: 10;">
            PRODUTO VENCIDO
          </div>
        `
            : ""
        }

        <div class="position-relative text-center">
          <img src="${
            product.image ||
            "https://via.placeholder.com/300x200?text=Sem+Imagem"
          }" class="card-img-top product-square-img" alt="${product.name}">
        </div>

        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title font-montserrat mb-0">${product.name}</h5>
            <span class="badge ${
              product.offerType === "donation"
                ? "bg-green-leaf"
                : "bg-green-mint-soft text-dark"
            } text-uppercase ms-2">
              ${product.offerType === "donation" ? "Gratuito" : "À venda"}
            </span>
          </div>

          <p class="card-text text-justify product-description">${
            product.description
          }</p>

          <ul class="list-group list-group-flush mb-3">
            <li class="list-group-item"><strong>Categoria:</strong> ${
              product.category
            }</li>
            <li class="list-group-item"><strong>Quantidade disponível:</strong> ${
              product.quantity
            }</li>
            <li class="list-group-item"><strong>Validade:</strong> ${
              product.expirationDate
            }</li>
            ${
              isExpired
                ? `<li class="list-group-item text-danger unavailable-text"><strong>Produto indisponível por vencimento</strong></li>`
                : ""
            }
          </ul>

          <div class="d-flex justify-content-between align-items-center mt-auto mb-2">
            <span class="badge ${
              product.price ? "bg-brown-land" : "bg-green-leaf"
            } fs-6">
              ${
                product.price
                  ? "R$ " + Number(product.price).toFixed(2)
                  : "Grátis"
              }
            </span>
            ${
              totalPrice !== null && !isExpired
                ? `<span class="badge bg-green-leaf text-light fs-6 ms-2">Total: R$ ${totalPrice}</span>`
                : ""
            }
          </div>

          <div class="cart-actions mb-2">
            ${!isExpired ? this.renderCartButtons(product, quantityInCart) : ""}
          </div>
        </div>
      </div>
    `;
  }
}
