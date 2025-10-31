import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

class ProductModel {
  constructor() {
    this.product = this.loadProduct();
  }

  loadProduct() {
    const product =
      JSON.parse(localStorage.getItem(localStorageKeys.PRODUCT)) || {};

    return product;
  }

  getFormattedPrice() {
    return `R$ ${this.product.price.toFixed(2)}`;
  }

  getFormattedOfferType() {
    return this.product.offerType === "sale" ? "Venda" : "Doação";
  }

  getFormattedCategory() {
    return (
      this.product.category.charAt(0).toUpperCase() +
      this.product.category.slice(1)
    );
  }

  getFormattedExpirationDate() {
    return new Date(this.product.expirationDate).toLocaleDateString("pt-BR");
  }

  getCart() {
    return JSON.parse(localStorage.getItem(localStorageKeys.CART)) || [];
  }
}

export default ProductModel;
