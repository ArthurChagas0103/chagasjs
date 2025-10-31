import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

class SupplierListModel {
  constructor() {
    this.suppliers = [];
    this.loadSuppliers();
  }

  loadSuppliers() {
    const saved = localStorage.getItem(localStorageKeys.REGISTERED_SUPPLIERS);

    this.suppliers = saved ? JSON.parse(saved) : [];
  }

  getSupplierById(id) {
    return this.suppliers.filter((s) => s.id == id);
  }

  getAllSuppliers() {
    return [...this.suppliers];
  }

  filterSuppliers(text = "", category = "", location = "") {
    return this.suppliers.filter((s) => {
      const matchText =
        s.nome.toLowerCase().includes(text.toLowerCase()) ||
        s.descricao.toLowerCase().includes(text.toLowerCase());

      const matchCategory = !category || s.categoria === category;
      const matchLocation = !location || s.endereco.cidade === location;

      return matchText && matchCategory && matchLocation;
    });
  }

  sortSuppliers(list, field, direction) {
    return [...list].sort((a, b) => {
      const A = a[field]?.toLowerCase?.() ?? a[field];
      const B = b[field]?.toLowerCase?.() ?? b[field];

      return direction === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });
  }
}

export default SupplierListModel;
