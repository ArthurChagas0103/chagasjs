import { ContactController } from "../../../controllers/landing-page/contact/ContactController.js";
import { ViewProductsController } from "../../../controllers/supplier/products/viewProductsController.js";
import { ProductController } from "../../../controllers/supplier/products/productController.js";
import { CouponsController } from "../../../controllers/supplier/coupons/couponsController.js";
import { ForgotPasswordRecipientController } from "../../../controllers/recipient/forgot-password/ForgotPasswordController.js";
import { ForgotPasswordSupplierController } from "../../../controllers/supplier/forgot-password/ForgotPasswordController.js";
import { SendMessageMarketingController } from "../../../controllers/supplier/marketing/send-message/sendMessageMarketingController.js";
import { SentMessagesMarketingController } from "../../../controllers/supplier/marketing/sent-messages/sentMessagesMarketingController.js";
import { TestimonialController } from "../../../controllers/landing-page/user-testimonial/UserTestimonialController.js";
import { RegistrationController } from "../../../controllers/shared/registration/registration.js";
import { LoginController } from "../../../controllers/shared/login/login.js";
import { OrdersListController } from "../../../controllers/supplier/orders-list/OrdersListController.js";
import { MyOrdersController } from "../../../controllers/recipient/my-orders/MyOrdersController.js";
import { SupplierListController } from "../../../controllers/recipient/supplier-list/SupplierListController.js";
import { ShoppingCartController } from "../../../controllers/recipient/shopping-cart/ShoppingCartController.js";
import { ProductDetailsController } from "../../../controllers/recipient/product/product-details/ProductDetailsController.js";
import { ProductListController } from "../../../controllers/recipient/product/product-list/ProductListController.js";
import { EditionController } from "../../../controllers/shared/edition/edition.js";

const routes = {
  // Landing Page
  home: {
    html: "views/landing-page/home/Home.html",
    css: "assets/css/landing-page/home/Home.css",
    js: null,
    extrasCSS: [],
    action: null,
    type: "default",
    profile: "default",
  },
  aboutUs: {
    html: "views/landing-page/about-us/AboutUs.html",
    css: "assets/css/landing-page/about-us/AboutUs.css",
    js: null,
    extrasCSS: [],
    action: null,
    type: "default",
    profile: "default",
  },
  contact: {
    html: "views/landing-page/contact/Contact.html",
    css: "assets/css/landing-page/contact/Contact.css",
    js: "controllers/landing-page/contact/ContactController.js",
    extrasCSS: [],
    action: () => new ContactController("contactForm", "sendMessageButton"),
    type: "module",
    profile: "default",
  },
  features: {
    html: "views/landing-page/features/Features.html",
    css: "assets/css/landing-page/features/Features.css",
    js: null,
    extrasCSS: [],
    action: null,
    type: "default",
    profile: "default",
  },
  userTestimonial: {
    html: "views/landing-page/user-testimonial/UserTestimonial.html",
    css: "assets/css/landing-page/user-testimonial/UserTestimonial.css",
    js: "controllers/landing-page/user-testimonial/UserTestimonialController.js",
    extrasCSS: [],
    action: () => new TestimonialController(),
    type: "module",
    profile: "default",
  },

  // Common
  termUse: {
    html: "views/partials/term-use.html",
    css: null,
    js: null,
    extrasCSS: [],
    action: null,
    type: "default",
    profile: "none",
  },
  privacyPolicy: {
    html: "views/partials/privacy-policy.html",
    css: null,
    js: null,
    extrasCSS: [],
    action: null,
    type: "default",
    profile: "none",
  },

  // Supplier - Products
  createProduct: {
    html: "views/supplier/products/create-product.html",
    css: "assets/css/supplier/products/create-products.css",
    js: "controllers/supplier/products/productController.js",
    extrasCSS: [],
    action: () => new ProductController("productForm", "createProductButton"),
    type: "module",
    profile: "supplier",
  },
  viewProducts: {
    html: "views/supplier/products/view-products.html",
    css: "assets/css/supplier/products/view-products.css",
    js: "controllers/supplier/products/viewProductsController.js",
    extrasCSS: ["assets/css/supplier/products/edit-product.css"],
    action: () => new ViewProductsController("products-list"),
    type: "module",
    profile: "supplier",
  },

  // Recipient - Shopping Cart
  shoppingCart: {
    html: "views/recipient/shopping-cart/ShoppingCart.html",
    css: "assets/css/recipient/shopping-cart/ShoppingCart.css",
    js: "controllers/recipient/shopping-cart/ShoppingCartController.js",
    extrasCSS: [],
    action: () => new ShoppingCartController(),
    type: "module",
    profile: "recipient",
  },  

  // Supplier - Orders
  orderList: {
    html: "views/supplier/orders-list/OrdersList.html",
    css: "assets/css/supplier/orders-list/OrdersList.css",
    js: "controllers/supplier/orders-list/OrdersListController.js",
    extrasCSS: [],
    action: () => new OrdersListController(),
    type: "module",
    profile: "supplier",
  },

  // Recipient - Orders
  myOrders: {
    html: "views/recipient/my-orders/MyOrders.html",
    css: "assets/css/recipient/my-orders/MyOrders.css",
    js: "controllers/recipient/my-orders/MyOrdersController.js",
    extrasCSS: [],
    action: () => new MyOrdersController(),
    type: "module",
    profile: "recipient",
  },

  // Login - Shared
  login: {
    html: "views/shared/login/login.html",
    css: "assets/css/shared/login/login.css",
    js: "controllers/shared/login/login.js",
    extrasCSS: [],
    action: () => new LoginController("login-form"),
    type: "module",
    profile: "default",
  },

  // Recipient - Supplier List
  supplierList: {
    html: "views/recipient/supplier-list/SupplierList.html",
    css: "assets/css/recipient/supplier-list/SupplierList.css",
    js: "controllers/recipient/supplier-list/SupplierListController.js",
    extrasCSS: [],
    action: () => new SupplierListController(),
    type: "module",
    profile: "recipient",
  },

  // Registration
  registration: {
    html: "views/shared/registration/registration.html",
    css: "assets/css/shared/registration/registration.css",
    js: "controllers/shared/registration/registration.js",
    extrasCSS: [],
    action: () => new RegistrationController("registration-form", "user-type"),
    type: "module",
    profile: "default",
  },

  // Edition - Recipient
  editionRecipient: {
    html: "views/recipient/edition/edition.html",
    css: "assets/css/shared/edit_profile/edition.css",
    js: "controllers/shared/edition/edition.js",
    extrasCSS: [],
    action: () => new EditionController("recipient"),
    type: "module",
    profile: "recipient",
  },

  // Edition - Supplier
  editionSupplier: {
    html: "views/supplier/edition/edition.html",
    css: "assets/css/shared/edit_profile/edition.css",
    js: "controllers/shared/edition/edition.js",
    extrasCSS: [],
    action: () => new EditionController("supplier"),
    type: "module",
    profile: "supplier",
  },

  // Coupons
  coupons: {
    html: "views/supplier/coupons/coupons.html",
    css: "assets/css/supplier/coupons/coupons.css",
    js: "controllers/supplier/coupons/couponsController.js",
    extrasCSS: [],
    action: () => new CouponsController("couponForm", "couponTableBody"),
    type: "module",
    profile: "supplier",
  },

  // Forgot Password
  forgotPasswordRecipient: {
    html: "views/recipient/forgot-password/forgot-password.html",
    css: "assets/css/recipient/forgot-password/forgot-password.css",
    js: "controllers/recipient/forgot-password/ForgotPasswordController.js",
    extrasCSS: [],
    action: () =>
      new ForgotPasswordRecipientController(
        "buttonSendCode",
        "buttonVerifyCode",
        "buttonUpdatePassword",
        "buttonBackToEmail",
        "buttonBackToCode"
      ),
    type: "module",
    profile: "none",
  },
  forgotPasswordSupplier: {
    html: "views/supplier/forgot-password/forgot-password.html",
    css: "assets/css/supplier/forgot-password/forgot-password.css",
    js: "controllers/supplier/forgot-password/ForgotPasswordController.js",
    extrasCSS: [],
    action: () =>
      new ForgotPasswordSupplierController(
        "buttonSendCode",
        "buttonVerifyCode",
        "buttonUpdatePassword",
        "buttonBackToEmail",
        "buttonBackToCode"
      ),
    type: "module",
    profile: "none",
  },

  // Marketing - Supplier
  sendMessageMarketing: {
    html: "views/supplier/marketing/send-message/send-message.html",
    css: "assets/css/supplier/marketing/send-message/send-message.css",
    js: "controllers/supplier/marketing/send-message/sendMessageMarketingController.js",
    extrasCSS: [],
    action: () => new SendMessageMarketingController("sendBtn").init(),
    type: "module",
    profile: "supplier",
  },
  sentMessagesMarketing: {
    html: "views/supplier/marketing/sent-messages/sent-messages.html",
    css: "assets/css/supplier/marketing/sent-messages/sent-messages.css",
    js: "controllers/supplier/marketing/sent-messages/sentMessagesMarketingController.js",
    extrasCSS: [],
    action: () => new SentMessagesMarketingController().loadEmails(),
    type: "module",
    profile: "supplier",
  },

  //Product Details - Recipient
  productDetailsRecipient: {
    html: "views/recipient/product/product-details/ProductDetails.html",
    css: "assets/css/recipient/product/product-details/ProductDetails.css",
    js: "controllers/recipient/product/product-details/ProductDetailsController.js",
    extrasCSS: [],
    action: () => new ProductDetailsController(),
    type: "module",
    profile: "recipient",
  },

  // Product List - Recipient
  productListRecipient: {
    html: "views/recipient/product/product-list/product-list.html",
    css: "assets/css/recipient/product/product-list/product-list.css",
    js: "controllers/recipient/product/product-list/ProductListController.js",
    extrasCSS: [],
    action: () => new ProductListController("products-list"),
    type: "module",
    profile: "recipient",
  },
};

export { routes };
