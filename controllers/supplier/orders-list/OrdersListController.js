import OrdersListModel from "../../../models/supplier/orders-list/OrdersListModel.js";
import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

export class OrdersListController {
  constructor() {
    this.model = new OrdersListModel();
    this.initializeElements();
    this.initializeEventListeners();
    this.renderOrders();
  }

  initializeElements() {
    this.table = document.getElementById("tabelaPedidos");
    this.statusFilter = document.querySelector("select:nth-of-type(1)");
    this.periodFilter = document.querySelector("select:nth-of-type(2)");
    this.searchInput = document.querySelector("input[type='text']");
    this.headers = document.querySelectorAll("thead th");
  }

  initializeEventListeners() {
    this.statusFilter.addEventListener("change", () => this.renderOrders());
    this.periodFilter.addEventListener("change", () => this.renderOrders());
    this.searchInput.addEventListener("input", () => this.renderOrders());
    this.headers.forEach((header) =>
      header.addEventListener("click", () => this.sortOrders(header))
    );
  }

  renderOrders() {
    const account = this.model.getCurrentAccount();
    const supplierOrders = this.model.getSupplierOrders(account.id);
    const filters = {
      status: this.statusFilter.value,
      period: this.periodFilter.value,
      search: this.searchInput.value.trim(),
    };
    const filteredOrders = this.model.filterOrders(supplierOrders, filters);

    this.renderTable(filteredOrders);
  }

  renderTable(orders) {
    this.table.innerHTML = "";

    const emptyState = document.querySelector(".empty-state");
    const emptyStateMessage = document.querySelector(".empty-state-message");

    if (orders.length === 0) {
      emptyState.style.display = "block";
      emptyStateMessage.textContent =
        "Nenhum pedido encontrado com os filtros aplicados.";

      return;
    } else {
      emptyState.style.display = "none";
    }

    orders.forEach((order, index) => {
      const row = document.createElement("tr");
      const dataFormatada = new Date(order.createdAt).toLocaleDateString(
        "pt-BR"
      );
      const recipientName = JSON.parse(
        localStorage.getItem(localStorageKeys.REGISTERED_RECIPIENTS)
      ).find((recipient) => recipient.id == order.recipientId).nome;

      row.innerHTML = `
                <td>${order.orderCode}</td>
                <td>${dataFormatada}</td>
                <td>${recipientName}</td>
                <td>${order.items.length}</td>
                <td>R$ ${order.totalValue.toFixed(2)}</td>
                <td>
                    <select class="status-select" data-order-code="${
                      order.orderCode
                    }" data-supplier-id="${order.supplierId}">
                        <option value="processando" ${
                          order.status === "processando" ? "selected" : ""
                        }>Em Processamento</option>
                        <option value="transporte" ${
                          order.status === "transporte" ? "selected" : ""
                        }>Em Transporte</option>
                        <option value="entregue" ${
                          order.status === "entregue" ? "selected" : ""
                        }>Entregue</option>
                        <option value="cancelado" ${
                          order.status === "cancelado" ? "selected" : ""
                        }>Cancelado</option>
                    </select>
                </td>
                <td class="acoes">
                    <button title="Excluir" class="btn-excluir" data-order-code="${
                      order.orderCode
                    }" data-supplier-id="${
        order.supplierId
      }"><i class="bi bi-trash"></i></button>
                    <button title="Ver detalhes" class="btn-detalhes" data-order-code="${
                      order.orderCode
                    }" data-supplier-id="${
        order.supplierId
      }"><i class="bi bi-eye"></i></button>
                </td>
            `;
      this.table.appendChild(row);
    });

    this.setupTableEventListeners();
  }

  setupTableEventListeners() {
    document.querySelectorAll(".btn-excluir").forEach((button) => {
      button.addEventListener("click", (e) => {
        const orderCode = e.currentTarget.dataset.orderCode;
        const supplierId = e.currentTarget.dataset.supplierId;

        this.handleDeleteOrder(orderCode, supplierId);
      });
    });

    document.querySelectorAll(".status-select").forEach((select) => {
      select.addEventListener("change", (e) => {
        const orderCode = e.target.dataset.orderCode;
        const supplierId = e.target.dataset.supplierId;

        this.handleStatusChange(orderCode, supplierId, e.target.value);
      });
    });

    document.querySelectorAll(".btn-detalhes").forEach((button) => {
      button.addEventListener("click", (e) => {
        const orderCode = e.currentTarget.dataset.orderCode;
        const supplierId = e.currentTarget.dataset.supplierId;

        this.showOrderDetails(orderCode, supplierId);
      });
    });
  }

  handleDeleteOrder(orderCode, supplierId) {
    this.model.deleteOrder(orderCode, supplierId);
    this.renderOrders();
  }

  handleStatusChange(orderCode, supplierId, newStatus) {
    this.model.updateOrderStatus(orderCode, supplierId, newStatus);
    this.renderOrders();
  }

  sortOrders(header) {
    const filters = {
      status: this.statusFilter.value,
      period: this.periodFilter.value,
      search: this.searchInput.value.trim(),
    };
    const account = this.model.getCurrentAccount();
    const supplierOrders = this.model.getSupplierOrders(account.id);
    const filteredOrders = this.model.filterOrders(supplierOrders, filters);
    const sortKey = header.innerText.trim();
    const sortedOrders = this.model.sortOrders(
      filteredOrders,
      sortKey,
      header.dataset.sortDirection !== "desc"
    );

    header.dataset.sortDirection =
      header.dataset.sortDirection === "desc" ? "asc" : "desc";

    this.renderTable(sortedOrders);
  }

  async showOrderDetails(orderCode, supplierId) {
    const allOrders = this.model.getAllOrders();
    const order = allOrders.find(
      (o) => o.orderCode === orderCode && o.supplierId === supplierId
    );

    if (!order) return;

    const response = await fetch(
      "./views/supplier/orders-list/templates/OrderDetail.html"
    );
    const modalHTML = await response.text();
    const tempDiv = document.createElement("div");
    const dataFormatada = new Date(order.createdAt).toLocaleDateString("pt-BR");
    const recipient = JSON.parse(
      localStorage.getItem(localStorageKeys.REGISTERED_RECIPIENTS)
    ).find((recipient) => recipient.id == order.recipientId);

    tempDiv.innerHTML = modalHTML;

    tempDiv.querySelector("#detalhes-numero-pedido").textContent =
      order.orderCode;
    tempDiv.querySelector("#detalhes-data").textContent = dataFormatada;
    tempDiv.querySelector("#detalhes-nome-cliente").textContent =
      recipient.name;
    tempDiv.querySelector(
      "#detalhes-valor-total"
    ).textContent = `R$ ${order.totalValue.toFixed(2)}`;
    tempDiv.querySelector("#detalhes-status").textContent = this.getStatusText(
      order.status
    );
    tempDiv.querySelector("#detalhes-email").textContent =
      recipient.email || "Não informado";
    tempDiv.querySelector("#detalhes-telefone").textContent =
      formatTelefone(recipient.telefone) || "Não informado";
    tempDiv.querySelector("#detalhes-endereco").textContent =
      `${recipient.endereco.rua}, ${recipient.endereco.numero}, ${
        recipient.endereco.cidade
      } - ${recipient.endereco.estado}  - ${
        recipient.endereco.complemento ? recipient.endereco.complemento : ""
      } (${formatCEP(recipient.endereco.cep)})` || "Não informado";

    const itensElement = tempDiv.querySelector("#detalhes-itens");

    itensElement.innerHTML = "";

    const itensList = document.createElement("ul");

    itensList.className = "list-unstyled";

    const itemListHTML = order.items
      .map((item) => {
        return `
                  <li class="detalhes-item">
                      ${item.name} - R$ ${item.price.toFixed(2)} - Qtd: ${
          item.quantity
        }
                  </li>
              `;
      })
      .join("");

    itensList.innerHTML = itemListHTML;

    itensElement.appendChild(itensList);

    bootbox.alert({
      message: tempDiv.innerHTML,
      title: "Detalhes do Pedido",
      size: "large",
      callback: () => {
        tempDiv.remove();
      },
    });
  }

  getStatusText(status) {
    const statusMap = {
      processando: "Em processamento",
      transporte: "Em Transporte",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };
    return statusMap[status] || status;
  }
}
