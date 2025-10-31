import { DependencyManager } from "../../core/utils/DependencyManager.js";
import Router from "../../core/router/Router.js";
import { routes } from "./utils/Routes.js";

const deps = new DependencyManager();

deps.register("router", new Router(routes));
document.addEventListener("DOMContentLoaded", () => {
  deps.get("router").handleRoute();
});
window.addEventListener("popstate", () => {
  deps.get("router").handleRoute();
});
