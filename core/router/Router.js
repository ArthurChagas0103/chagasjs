import DefaultModule from "../modules/DefaultModule.js";
import { localStorageKeys } from "../../assets/js/utils/Constantes.js";
import { toastService } from "../../assets/js/utils/ToastService.js";

class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentModule = null;
  }

  async handleRoute() {
    const hash = window.location.hash.replace("#", "");
    const validHash = this.routes[hash] ? hash : "home";
    const route = this.routes[validHash];

    if (!route) {
      console.error(`Route not found for hash: ${validHash}`);

      return;
    }

    if (this.currentModule?.destroy instanceof Function) {
      this.currentModule.destroy();
      this.currentModule = null;
    }

    const userType = JSON.parse(localStorage.getItem(localStorageKeys.ACCOUNT));
    if (
      route.profile === "recipient" &&
      (!userType || userType.type !== "recipient")
    ) {
      toastService.error({
        title: "Erro",
        message: "Você não tem permissão para acessar esta página.",
        icon: "bi bi-exclamation-triangle-fill",
      });
      window.location.href = "#home";

      return;
    }
    if (
      route.profile === "supplier" &&
      (!userType || userType.type !== "supplier")
    ) {
      toastService.error({
        title: "Erro",
        message: "Você não tem permissão para acessar esta página.",
        icon: "bi bi-exclamation-triangle-fill",
      });
      window.location.href = "#home";

      return;
    }

    await this.loadTemplate(route.html, route.profile);

    const moduleConfig = {};

    if (route.js) {
      moduleConfig.controllerScript = route.js;
    }
    if (route.css) {
      moduleConfig.controllerStyle = route.css;
    }
    if (route.extrasCSS && route.extrasCSS.length > 0) {
      moduleConfig.requiredStyles = route.extrasCSS;
    }
    if (route.type) {
      moduleConfig.type = route.type;
    }

    this.currentModule = new DefaultModule(moduleConfig);
    if (this.currentModule) {
      await this.currentModule.init();
    }

    if (route.action) {
      route.action();
    }
  }

  async loadTemplate(url, profile) {
    try {
      scrollToTop();

      if (profile === "default") {
        configHeaderAndFooter(
          "views/landing-page/partials/header.html",
          "views/landing-page/partials/Footer.html"
        );
      } else if (profile === "recipient") {
        configHeaderAndFooter(
          "views/recipient/partials/header.html",
          "views/recipient/partials/footer.html"
        );
      } else if (profile === "supplier") {
        configHeaderAndFooter(
          "views/supplier/partials/header.html",
          "views/supplier/partials/footer.html"
        );
      } else {
        removeNavbarAndFooter();
      }

      if (
        document.getElementById("sidebar") &&
        document.getElementById("sidebar").classList.contains("expanded")
      ) {
        toggleSidebar();
      }

      const response = await fetch(url);
      const html = response.ok
        ? await response.text()
        : "<p>Página não encontrada.</p>";

      document.getElementById("app").innerHTML = html;
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  }
}

export default Router;
