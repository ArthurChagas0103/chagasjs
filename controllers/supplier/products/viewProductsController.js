import { EditProductController } from "./editProductController.js";
import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

// Controlador responsável por renderizar os cards de produtos na página view-products
export class ViewProductsController {
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
      const products = localStorage.getItem(localStorageKeys.PRODUCTS);
      const supplierId = JSON.parse(
        localStorage.getItem(localStorageKeys.ACCOUNT)
      ).id;

      return JSON.parse(products).filter(
        (product) => product.supplierId === supplierId
      );
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
    this.container.innerHTML = products
      .map((product) => this.createCard(product))
      .join(""); // Renderiza cards

    await this.addClickableListeners(products); // Para mostrar detalhes do produto (productdetails)
    await this.addDeleteListeners();
    await this.addEditListeners(products);
  }

  // Adiciona listeners aos botões de deletar produto
  async addDeleteListeners() {
    const deleteButtons = this.container.querySelectorAll(
      '[data-action="delete"]'
    );
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const productId = btn.getAttribute("data-id");
        let products = await this.fetchProducts();
        products = products.filter(
          (p) => String(p.productId) !== String(productId)
        );
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        localStorage.setItem(
          localStorageKeys.PRODUCTS,
          JSON.stringify(products)
        );
        await this.renderProducts();
      });
    });
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

  // Atualiza o produto em products no localStorage
  async updateProductInProducts(updatedProduct) {
    // Atualiza em products
    let allProducts = await this.fetchProducts();
    allProducts = this.updateProductInArray(allProducts, updatedProduct);
    localStorage.setItem("products", JSON.stringify(allProducts));
  }

  // Calcula o preço total
  calculateTotalPrice(price, quantity) {
    return price && quantity > 0 ? (Number(price) * quantity).toFixed(2) : null;
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
          this.showProductInfo(product);

          return;
        }
      });
    });
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
          </div>

          <div class="d-flex justify-content-end gap-2 mt-2">
            <button class="btn btn-outline-secondary btn-sm" data-action="edit" data-id="${
              product.productId
            }">
              <i class="bi bi-pencil-square"></i> Editar
            </button>
            <button class="btn btn-outline-danger btn-sm" data-action="delete" data-id="${
              product.productId
            }">
              <i class="bi bi-trash"></i> Excluir
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Adiciona listeners para editar produtos
  async addEditListeners(products) {
    const editButtons = this.container.querySelectorAll('[data-action="edit"]');
    editButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const productId = btn.getAttribute("data-id");
        const product = products.find(
          (p) => String(p.productId) === String(productId)
        );
        if (!product) return;
        const panel = new EditProductController(async (updatedProduct) => {
          await this.updateProductInProducts(updatedProduct);
          await this.renderProducts();
        });
        panel.open(product);
      });
    });
  }

  showProductInfo(product) {
    bootbox.dialog({
      title: "Informações do Produto",
      message: `
        <p><strong>Nome:</strong> ${product.name}</p>
        <p><strong>Descrição:</strong> ${product.description}</p>
        <p><strong>Categoria:</strong> ${product.category}</p>
        <p><strong>Quantidade:</strong> ${product.quantity}</p>
        <p><strong>Data de Validade:</strong> ${product.expirationDate}</p>
        <p><strong>Informações Nutricionais:</strong> ${product.nutritionalInfo}</p>
        <p><strong>Preço:</strong> R$ ${product.price}</p>
        <p><strong>Tipo de Oferta:</strong> ${product.offerType}</p>
      `,
      buttons: {
        main: {
          label: "Fechar",
          className: "btn btn-success",
        },
      },
    });
  }
}
