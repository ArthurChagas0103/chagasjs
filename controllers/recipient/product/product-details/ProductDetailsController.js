import ProductModel from "../../../../models/recipient/product/ProductModel.js";
import { toastService } from "../../../../assets/js/utils/ToastService.js";
import { localStorageKeys } from "../../../../assets/js/utils/Constantes.js";

export class ProductDetailsController {
  constructor() {
    try {
      this.model = new ProductModel();

      if (Object.keys(this.model.product).length === 0) {
        const container = document.getElementById("productDetails");
        if (container) {
          container.innerHTML = `
            <div class="alert alert-warning text-center mt-5" role="alert">
              <i class="bi bi-exclamation-circle me-2"></i>
              Nenhum produto selecionado. Por favor, selecione um produto da lista para visualizar os detalhes.
            </div>
            <div class="text-center mt-4">
              <a href="#productListRecipient" class="btn btn-primary">
                <i class="bi bi-arrow-left me-2"></i>
                Voltar para a lista de produtos
              </a>
            </div>
          `;
        }

        return;
      }

      this.initializeElements();
      this.renderProduct();
      this.setupEventListeners();
    } catch (error) {
      toastService.error({
        title: "Erro",
        message: "Ocorreu um erro ao carregar os detalhes do produto.",
        icon: "bi bi-exclamation-triangle-fill",
      });
    }
  }

  initializeElements() {
    this.elements = {
      image: document.getElementById("productImage"),
      name: document.getElementById("productName"),
      description: document.getElementById("productDescription"),
      offerType: document.getElementById("productOfferType"),
      price: document.getElementById("productPrice"),
      category: document.getElementById("productCategory"),
      quantity: document.getElementById("productQuantity"),
      expirationDate: document.getElementById("productExpirationDate"),
      nutritionalInfo: document.getElementById("productNutritionalInfo"),
      backButton: document.querySelector(".btn-circle"),
      quantityInput: document.getElementById("productQuantityInput"),
      decreaseButton: document.getElementById("decreaseQuantity"),
      increaseButton: document.getElementById("increaseQuantity"),
      addToCartButton: document.getElementById("addToCartButton"),
    };
  }

  renderProduct() {
    this.elements.image.src = this.model.product.image;
    this.elements.name.textContent = this.model.product.name;
    this.elements.description.textContent = this.model.product.description;
    this.elements.offerType.textContent = this.model.getFormattedOfferType();
    this.elements.price.textContent = this.model.getFormattedPrice();
    this.elements.category.textContent = this.model.getFormattedCategory();
    this.elements.quantity.textContent = this.model.product.quantity;
    this.elements.expirationDate.textContent =
      this.model.getFormattedExpirationDate();
    this.elements.nutritionalInfo.textContent =
      this.model.product.nutritionalInfo;
  }

  async setupEventListeners() {
    this.elements.backButton.addEventListener("click", () => {
      localStorage.removeItem(localStorageKeys.PRODUCT);
      window.location.href = "#productListRecipient";
    });

    this.elements.decreaseButton.addEventListener("click", () => {
      const currentValue = parseInt(this.elements.quantityInput.value);
      if (currentValue > 1) {
        this.elements.quantityInput.value = currentValue - 1;
      }
    });

    this.elements.increaseButton.addEventListener("click", () => {
      const currentValue = parseInt(this.elements.quantityInput.value);
      if (currentValue < 10) {
        this.elements.quantityInput.value = currentValue + 1;
      }
    });

    this.elements.addToCartButton.addEventListener("click", () => {
      const quantity = parseInt(this.elements.quantityInput.value);
      let cart = this.model.getCart();
      const cartItem = {
        ...this.model.product,
        quantityBuying: quantity,
        total: this.model.product.price * quantity,
      };
      const existingItemIndex = cart.findIndex(
        (item) => item.id === cartItem.id
      );

      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantityBuying += quantity;
        cart[existingItemIndex].total =
          cart[existingItemIndex].price *
          cart[existingItemIndex].quantityBuying;
      } else {
        cart.push(cartItem);
      }

      const productQuantity = JSON.parse(
        localStorage.getItem(localStorageKeys.PRODUCTS)
      ).find((item) => item.productId == cartItem.productId).quantity;
      if (cartItem.quantityBuying > productQuantity) {
        toastService.error({
          title: "Erro",
          message: "Você não pode adicionar mais itens do que há em estoque.",
          icon: "bi bi-cart-x-fill",
        });

        return;
      }

      const itensInCart = cart.filter((item) => item.id == cartItem.id);
      const supplierId = itensInCart[0].supplierId;
      if (supplierId !== this.model.product.supplierId) {
        toastService.error({
          title: "Erro",
          message:
            "Você não pode adicionar produtos de diferentes fornecedores ao carrinho.",
          icon: "bi bi-cart-x-fill",
        });

        return;
      }

      localStorage.setItem(localStorageKeys.CART, JSON.stringify(cart));
      toastService.success({
        title: "Sucesso",
        message: `Produto adicionado ao carrinho (${quantity} unidades)`,
        icon: "bi bi-cart-check-fill",
      });
      localStorage.removeItem(localStorageKeys.PRODUCT);

      const products = JSON.parse(
        localStorage.getItem(localStorageKeys.PRODUCTS)
      );
      products.find((item) => item.productId == cartItem.productId).quantity -=
        quantity;
      localStorage.setItem(localStorageKeys.PRODUCTS, JSON.stringify(products));

      window.location.href = "#productListRecipient";
    });
  }
}
