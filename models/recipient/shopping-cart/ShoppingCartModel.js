import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

class ShoppingCartModel {
  constructor() {
    this.cart = this.loadCart();
    this.coupons = this.loadCoupons();
    this.appliedCoupon = this.loadAppliedCoupon();
  }

  loadCart() {
    const cart = JSON.parse(localStorage.getItem(localStorageKeys.CART)) || [];

    return cart;
  }

  loadCoupons() {
    const coupons =
      JSON.parse(localStorage.getItem(localStorageKeys.COUPONS)) || [];

    return coupons.reduce((acc, coupon) => {
      acc[coupon.code.toUpperCase()] = coupon;

      return acc;
    }, {});
  }

  loadAppliedCoupon() {
    return localStorage.getItem(localStorageKeys.APPLIED_COUPON) || "";
  }

  saveCart() {
    localStorage.setItem(localStorageKeys.CART, JSON.stringify(this.cart));
  }

  addItem(item) {
    const existingItem = this.cart.find(
      (cartItem) =>
        cartItem.supplierId === item.supplierId && cartItem.name === item.name
    );

    if (existingItem) {
      existingItem.quantityBuying += item.quantityBuying;
    } else {
      this.cart.push(item);
    }

    this.saveCart();
  }

  removeItem(index) {
    if (this.cart[index].quantityBuying > 1) {
      this.cart[index].quantityBuying -= 1;
    } else {
      this.cart.splice(index, 1);
    }

    this.saveCart();
  }

  calculateTotal() {
    return this.cart.reduce(
      (total, item) => total + item.price * item.quantityBuying,
      0
    );
  }

  applyCoupon(code) {
    const coupon = this.coupons[code.toUpperCase()];
    if (coupon && !this.isCouponExpired(coupon)) {
      this.appliedCoupon = code;

      localStorage.setItem(localStorageKeys.APPLIED_COUPON, code);

      return true;
    }

    return false;
  }

  clearCoupon() {
    this.appliedCoupon = "";

    localStorage.removeItem(localStorageKeys.APPLIED_COUPON);
  }

  isCouponExpired(coupon) {
    if (!coupon || !coupon.expirationDate) return true;

    return new Date(coupon.expirationDate) < new Date();
  }

  getDiscountPercentage() {
    const coupon = this.coupons[this.appliedCoupon.toUpperCase()];

    return coupon ? coupon.discount : 0;
  }

  getFinalTotal() {
    const total = this.calculateTotal();
    const discount = total * (this.getDiscountPercentage() / 100);

    return total - discount;
  }

  getItemsBySupplier() {
    return this.cart.reduce((acc, item) => {
      if (!acc[item.supplierId]) {
        acc[item.supplierId] = [];
      }
      acc[item.supplierId].push(item);

      return acc;
    }, {});
  }

  saveOrders(orders) {
    const allOrders =
      JSON.parse(localStorage.getItem(localStorageKeys.PURCHASED_ITEMS)) || [];

    allOrders.push(...orders);
    localStorage.setItem(
      localStorageKeys.PURCHASED_ITEMS,
      JSON.stringify(allOrders)
    );
  }
}

export default ShoppingCartModel;
