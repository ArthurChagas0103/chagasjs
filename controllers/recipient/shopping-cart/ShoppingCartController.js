import ShoppingCartModel from "../../../models/recipient/shopping-cart/ShoppingCartModel.js";
import { SendEmail } from "../../../assets/js/utils/SendEmail.js";
import { toastService } from "../../../assets/js/utils/ToastService.js";
import config from "../../../assets/js/utils/Config.js";
import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

export class ShoppingCartController {
  constructor() {
    this.model = new ShoppingCartModel();
    this.initializeEventListeners();
    this.renderCart();
  }

  initializeEventListeners() {
    this.setupRemoveItemListener();
    this.setupCouponListener();
    this.setupFinalizeListener();
  }

  setupRemoveItemListener() {
    document.getElementById("cart-items").addEventListener("click", (e) => {
      const cartItemElement = e.target.closest(".cart-item");
      if (cartItemElement) {
        const index = parseInt(cartItemElement.getAttribute("data-index"), 10);

        this.model.removeItem(index);
        this.renderCart();
      }
    });
  }

  setupCouponListener() {
    document.getElementById("apply-coupon").addEventListener("click", () => {
      const code = document
        .getElementById("coupon-code")
        .value.trim()
        .toUpperCase();

      if (this.model.cart.length === 0) {
        toastService.error({
          title: "Erro",
          message:
            "O carrinho está vazio. Adicione produtos para aplicar um cupom.",
          icon: "bi bi-cart-x-fill",
        });
        return;
      }

      if (this.model.applyCoupon(code)) {
        toastService.success({
          title: "Sucesso!",
          message: `Cupom ${code} aplicado com sucesso!`,
          icon: "bi bi-check-circle-fill",
        });

        this.renderCart();
      } else {
        toastService.error({
          title: "Erro",
          message: `Cupom ${code} inválido ou expirado.`,
          icon: "bi bi-exclamation-triangle-fill",
        });
      }
    });
  }

  setupFinalizeListener() {
    document.getElementById("finalize").addEventListener("click", async () => {
      try {
        if (this.model.cart.length === 0) {
          toastService.error({
            title: "Erro",
            message:
              "O carrinho está vazio. Adicione produtos para finalizar a compra.",
            icon: "bi bi-cart-x-fill",
          });
          return;
        }

        const account = JSON.parse(
          localStorage.getItem(localStorageKeys.ACCOUNT)
        );
        const recipients = JSON.parse(
          localStorage.getItem(localStorageKeys.REGISTERED_RECIPIENTS)
        );
        const suppliers = JSON.parse(
          localStorage.getItem(localStorageKeys.REGISTERED_SUPPLIERS)
        );

        const orders = this.createOrders(account);

        await this.sendOrderConfirmation(
          recipients.filter((recipient) => recipient.id == account.id)[0],
          suppliers.filter(
            (supplier) => supplier.id == orders[0].supplierId
          )[0],
          orders
        );

        toastService.success({
          title: "Sucesso!",
          message: "Pedido finalizado com sucesso!",
          icon: "bi bi-check-circle-fill",
        });

        this.model.clearCoupon();
        this.model.cart = [];
        this.model.saveCart();
        this.renderCart();
      } catch (error) {
        console.error("Error creating orders:", error);
        toastService.error({
          title: "Erro",
          message: "Ocorreu um erro ao finalizar a compra. Tente novamente.",
          icon: "bi bi-exclamation-triangle-fill",
        });
      }
    });
  }

  createOrders(account) {
    const groupedBySupplier = this.model.getItemsBySupplier();
    const discountRate = this.model.getDiscountPercentage() / 100;

    return Object.entries(groupedBySupplier).map(([supplierId, items]) => {
      const totalValue = items.reduce(
        (total, item) => total + item.price * item.quantityBuying,
        0
      );
      const discount = totalValue * discountRate;
      const finalTotal = totalValue - discount;

      return {
        orderCode: this.generateOrderCode(),
        supplierId,
        items,
        totalValue,
        discount,
        finalTotal,
        couponCode: this.model.appliedCoupon,
        recipientId: account.id,
        status: "processando",
        createdAt: new Date().toISOString(),
      };
    });
  }

  generateOrderCode() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let orderCode = "";

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      orderCode += characters.charAt(randomIndex);
    }

    return orderCode;
  }

  clearCart() {
    this.model.clearCoupon();
    this.model.cart = [];
    this.model.saveCart();
  }

  async sendOrderConfirmation(recipient, supplier, orders) {
    try {
      const totalValueNum = orders.reduce(
        (sum, order) => sum + order.totalValue,
        0
      );
      const finalValueNum = orders.reduce(
        (sum, order) => sum + order.finalTotal,
        0
      );
      const savedAmountNum = totalValueNum - finalValueNum;
      const itensEmail = orders
        .flatMap((order) => order.items)
        .map(
          (item) => `
            <tr>
              <td>${item.name} - ${item.quantityBuying}</td>
              <td>R$ ${(item.price * item.quantityBuying).toFixed(2)}</td>
            </tr>
          `
        )
        .join("");

      const response = await fetch(
        "./views/recipient/shopping-cart/templates/OrderConfirmationEmail.html"
      );
      const responseSupplier = await fetch(
        "./views/recipient/shopping-cart/templates/OrderConfirmationEmailSupplier.html"
      );
      const template = await response.text();
      const templateSupplier = await responseSupplier.text();
      let processedTemplate = template
        .replace(/{{name}}/g, recipient.nome)
        .replace(/{{itens}}/g, itensEmail)
        .replace(/{{totalValueNum}}/g, totalValueNum.toFixed(2))
        .replace(/{{finalValueNum}}/g, finalValueNum.toFixed(2))
        .replace(/{{savedAmountNum}}/g, savedAmountNum.toFixed(2));

      const hasDiscount = this.model.getDiscountPercentage() > 0;
      if (!hasDiscount) {
        processedTemplate = processedTemplate
          .replace(/{{#if hasDiscount}}/g, "<!--")
          .replace(/{{\/if}}/g, "-->");
      } else {
        processedTemplate = processedTemplate
          .replace(/{{#if hasDiscount}}/g, "")
          .replace(/{{\/if}}/g, "");
      }

      const sendEmail = new SendEmail(
        config.ENDPOINTS.SEND_EMAIL,
        config.EMAIL_CONFIG.TEMPLATE_ID.GENERIC_EMAIL,
        config.EMAIL_CONFIG.SERVICE_ID,
        config.EMAIL_CONFIG.USER_ID,
        {
          email: recipient.email,
          subject: "Pedido Realizado",
          message: processedTemplate,
        }
      );

      const emailResponse = await sendEmail.send();
      if (!emailResponse) {
        throw new Error("Erro ao enviar o email!");
      }

      let processedTemplateSupplier = templateSupplier
        .replace(/{{name}}/g, supplier.nome)
        .replace(/{{itens}}/g, itensEmail)
        .replace(/{{totalValueNum}}/g, totalValueNum.toFixed(2))
        .replace(/{{finalValueNum}}/g, finalValueNum.toFixed(2))
        .replace(/{{savedAmountNum}}/g, savedAmountNum.toFixed(2));

      if (!hasDiscount) {
        processedTemplateSupplier = processedTemplateSupplier
          .replace(/{{#if hasDiscount}}/g, "<!--")
          .replace(/{{\/if}}/g, "-->");
      } else {
        processedTemplateSupplier = processedTemplateSupplier
          .replace(/{{#if hasDiscount}}/g, "")
          .replace(/{{\/if}}/g, "");
      }

      const sendEmailSupplier = new SendEmail(
        config.ENDPOINTS.SEND_EMAIL,
        config.EMAIL_CONFIG.TEMPLATE_ID.GENERIC_EMAIL,
        config.EMAIL_CONFIG.SERVICE_ID,
        config.EMAIL_CONFIG.USER_ID,
        {
          email: supplier.email,
          subject: "Pedido Realizado",
          message: processedTemplateSupplier,
        }
      );

      const emailResponseSupplier = await sendEmailSupplier.send();
      if (!emailResponseSupplier) {
        throw new Error("Erro ao enviar o email!");
      }

      this.model.saveOrders(orders);
    } catch (error) {
      console.error("Erro ao enviar confirmação de pedido:", error);
      throw error;
    }
  }

  async renderCart() {
    const container = document.getElementById("cart-items");
    const oldPriceEl = document.getElementById("old-price");
    const newPriceEl = document.getElementById("new-price");
    const couponInput = document.getElementById("coupon-code");
    const couponMsg = document.getElementById("coupon-message");

    container.innerHTML = "";

    let total = 0;

    try {
      const [emptyTemplate, itemTemplate] = await Promise.all([
        fetch(
          "./views/recipient/shopping-cart/templates/EmptyCartMessage.html"
        ),
        fetch("./views/recipient/shopping-cart/templates/CartItem.html"),
      ]);

      const [emptyHtml, itemHtml] = await Promise.all([
        emptyTemplate.text(),
        itemTemplate.text(),
      ]);

      if (this.model.cart.length === 0) {
        container.innerHTML = emptyHtml;
      } else {
        const itemsHtml = this.model.cart
          .map((item, index) => {
            let itemContent = itemHtml;
            itemContent = itemContent.replace("{{index}}", index);
            itemContent = itemContent.replace("{{image}}", item.image);
            itemContent = itemContent.replace("{{name}}", item.name);
            itemContent = itemContent.replace(
              "{{price}}",
              item.price.toFixed(2)
            );
            itemContent = itemContent.replace(
              "{{quantity}}",
              item.quantityBuying
            );
            return itemContent;
          })
          .join("");

        container.innerHTML = itemsHtml;
      }

      total = this.model.cart.reduce(
        (sum, item) => sum + item.price * item.quantityBuying,
        0
      );
      oldPriceEl.textContent = `R$ ${total.toFixed(2)}`;
      newPriceEl.textContent = `R$ ${this.model.getFinalTotal().toFixed(2)}`;

      if (this.model.appliedCoupon) {
        const discount = this.model.getDiscountPercentage();
        couponMsg.textContent = `Cupom aplicado: ${this.model.appliedCoupon} (${discount}% de desconto)`;
      } else {
        couponMsg.textContent = "";
      }

      couponInput.value = "";
    } catch (error) {
      console.error("Error loading cart templates:", error);
    }

    const discount = total * (this.model.getDiscountPercentage() / 100);
    const finalTotal = total - discount;

    if (discount > 0) {
      oldPriceEl.textContent = `Total: R$ ${total.toFixed(2)}`;
      oldPriceEl.style.display = "inline";
      newPriceEl.textContent = `(-${this.model.getDiscountPercentage()}% cupom) R$ ${finalTotal.toFixed(
        2
      )}`;
      newPriceEl.style.color = "green";
    } else {
      oldPriceEl.textContent = "";
      oldPriceEl.style.display = "none";
      newPriceEl.textContent = `Total: R$ ${finalTotal.toFixed(2)}`;
      newPriceEl.style.color = "";
    }

    if (couponInput) couponInput.value = this.model.appliedCoupon;
    if (couponMsg) {
      const appliedCoupon =
        this.model.coupons[this.model.appliedCoupon.toUpperCase()];
      if (appliedCoupon && this.model.isCouponExpired(appliedCoupon)) {
        couponMsg.textContent = "Cupom expirado.";
        couponMsg.classList.add("text-danger");
        this.model.clearCoupon();
      } else if (appliedCoupon) {
        couponMsg.textContent = `Código '${this.model.appliedCoupon}' aplicado!`;
        couponMsg.classList.remove("text-danger");
        couponMsg.classList.add("text-success");
      } else {
        couponMsg.textContent = "";
      }
    }
  }
}
