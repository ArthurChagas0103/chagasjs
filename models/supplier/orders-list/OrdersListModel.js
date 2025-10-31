import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

class OrdersListModel {
  constructor() {
    this.localStorageKey = localStorageKeys.PURCHASED_ITEMS;
    this.accountKey = localStorageKeys.ACCOUNT;
  }

  getAllOrders() {
    return JSON.parse(localStorage.getItem(this.localStorageKey)) || [];
  }

  getSupplierOrders(supplierId) {
    const allOrders = this.getAllOrders();
    return allOrders.filter((order) => order.supplierId == supplierId);
  }

  saveOrders(orders) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(orders));
  }

  getCurrentAccount() {
    return JSON.parse(localStorage.getItem(this.accountKey)) || {};
  }

  updateOrderStatus(orderCode, supplierId, newStatus) {
    const allOrders = this.getAllOrders();
    const orderIndex = allOrders.findIndex(
      (order) => order.orderCode == orderCode && order.supplierId == supplierId
    );

    if (orderIndex !== -1) {
      allOrders[orderIndex].status = newStatus.toLowerCase();
      this.saveOrders(allOrders);
      return true;
    }
    return false;
  }

  deleteOrder(orderCode, supplierId) {
    return this.updateOrderStatus(orderCode, supplierId, "cancelado");
  }

  filterOrders(orders, filters = {}) {
    let filtered = [...orders];

    if (filters.status && filters.status !== "todos") {
      filtered = filtered.filter(
        (order) => order.status.toLowerCase() == filters.status.toLowerCase()
      );
    }
    if (filters.period) {
      const now = new Date();
      let days = 0;

      switch (filters.period) {
        case "7-dias":
          days = 7;
          break;
        case "30-dias":
          days = 30;
          break;
        case "todos":
          days = 365;
          break;
      }

      const startDate = new Date(now);

      startDate.setDate(startDate.getDate() - days);

      filtered = filtered.filter(
        (order) => new Date(order.createdAt) >= startDate
      );
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();

      filtered = filtered.filter((order) => {
        const recipient = JSON.parse(
          localStorage.getItem(localStorageKeys.REGISTERED_RECIPIENTS)
        ).find((recipient) => recipient.id == order.recipientId);

        return (
          order.orderCode.includes(searchTerm) ||
          recipient.nome.toLowerCase().includes(searchTerm)
        );
      });
    }

    return filtered;
  }

  sortOrders(orders, sortBy, ascending = true) {
    const sortMap = {
      "Nº do Pedido": "orderCode",
      Data: "createdAt",
      Cliente: "recipientId",
      "Valor Total": "totalValue",
    };

    const sortKey = sortMap[sortBy];
    if (!sortKey) return orders;

    return [...orders].sort((a, b) => {
      if (typeof a[sortKey] === "string") {
        return ascending
          ? a[sortKey].localeCompare(b[sortKey])
          : b[sortKey].localeCompare(a[sortKey]);
      }
      return ascending ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
    });
  }
}

export default OrdersListModel;
