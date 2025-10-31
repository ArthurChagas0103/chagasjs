import SupplierListModel from "../../../models/supplier/supplier-list/SupplierListModel.js";
import { toastService } from "../../../assets/js/utils/ToastService.js";
import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

export class SupplierListController {
  constructor() {
    this.model = new SupplierListModel();
    this.filterInput = document.getElementById("supplierFilter");
    this.categoryFilter = document.getElementById("categoryFilter");
    this.locationFilter = document.getElementById("locationFilter");
    this.sortBy = document.getElementById("sortBy");
    this.sortBtn = document.querySelector(".sort-btn");
    this.grid = document.querySelector(".suppliers-grid");
    this.currentSort = { field: "nome", direction: "asc" };

    this.init();
  }

  init() {
    this.populateFilters();
    this.setupListeners();
    this.render();
  }

  setupListeners() {
    this.filterInput.addEventListener("input", () => this.render());
    this.categoryFilter.addEventListener("change", () => this.render());
    this.locationFilter.addEventListener("change", () => this.render());
    this.sortBy.addEventListener("change", () => {
      this.currentSort.field = this.sortBy.value;
      this.render();
    });
    this.sortBtn.addEventListener("click", () => {
      this.currentSort.direction =
        this.currentSort.direction === "asc" ? "desc" : "asc";
      this.updateSortIcon();
      this.render();
    });
    this.grid.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn")) {
        const supplierId = e.target.getAttribute("data-id");
        let supplier = this.model.getSupplierById(supplierId);

        if (!supplier) return;

        supplier = supplier[0];

        this.redirectToProductDetails(supplier);
      }
    });
  }

  updateSortIcon() {
    this.sortBtn.innerHTML = `<i class="bi bi-sort-alpha-${
      this.currentSort.direction === "asc" ? "down" : "up"
    }"></i>`;
  }

  populateFilters() {
    const allSuppliers = this.model.getAllSuppliers();
    const categories = new Set(allSuppliers.map((s) => s.categoria));
    const locations = new Set(allSuppliers.map((s) => s.endereco.cidade));

    categories.forEach((cat) => {
      const option = new Option(cat, cat);
      this.categoryFilter.appendChild(option);
    });

    locations.forEach((loc) => {
      const option = new Option(loc, loc);
      this.locationFilter.appendChild(option);
    });
  }

  render() {
    try {
      this.grid.innerHTML = "";

      let suppliers = this.model.filterSuppliers(
        this.filterInput.value,
        this.categoryFilter.value,
        this.locationFilter.value
      );

      suppliers = this.model.sortSuppliers(
        suppliers,
        this.currentSort.field,
        this.currentSort.direction
      );

      if (suppliers.length === 0) {
        this.grid.innerHTML =
          '<p class="text-center w-100">Nenhum fornecedor encontrado.</p>';
      }

      suppliers.forEach((s) => this.grid.appendChild(this.createCard(s)));
    } catch (error) {
      toastService.error({
        title: "Erro ao carregar fornecedores",
        message: error.message || "Ocorreu um erro ao buscar os fornecedores.",
        icon: "bi bi-exclamation-circle-fill",
      });
    }
  }

  createCard(supplier) {
    const card = document.createElement("div");

    card.className = "supplier-card";
    card.innerHTML = `
      <div class="supplier-info">
        <h3>${supplier.nome}</h3>
        <p>${supplier.descricao}</p>
        <div class="badges">
          <span class="badge">${supplier.categoria}</span>
          <span class="badge">${supplier.endereco.cidade}</span>
        </div>
        <button type="button" class="btn btn-success mt-4" data-id="${supplier.id}">Ver detalhes</button>
      </div>`;

    return card;
  }

  redirectToProductDetails(supplier) {
    localStorage.setItem(localStorageKeys.SUPPLIER, JSON.stringify(supplier));

    window.location.href = "#productListRecipient";
  }
}
