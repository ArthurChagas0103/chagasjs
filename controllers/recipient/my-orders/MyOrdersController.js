import MyOrdersModel from "../../../models/recipient/my-orders/MyOrdersModel.js";
import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

export class MyOrdersController {
  constructor() {
    this.model = new MyOrdersModel();
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
    const recipientOrders = this.model.getRecipientOrders();
    const filters = {
      status: this.statusFilter.value,
      period: this.periodFilter.value,
      search: this.searchInput.value.trim(),
    };
    const filteredOrders = this.model.filterOrders(recipientOrders, filters);

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
      const statusClass = this.getStatusClass(order.status);
      const statusText = this.getStatusText(order.status);
      const canCancel = order.status === "processando";
      const dataFormatada = new Date(order.createdAt).toLocaleDateString(
        "pt-BR"
      );
      const supplierName = JSON.parse(
        localStorage.getItem(localStorageKeys.REGISTERED_SUPPLIERS)
      ).find((supplier) => supplier.id == order.supplierId).nome;

      row.innerHTML = `
                <td>${order.orderCode}</td>
                <td>${dataFormatada}</td>
                <td>${supplierName}</td>
                <td>${order.items.length}</td>
                <td>R$ ${order.totalValue.toFixed(2)}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td class="acoes">
                    ${
                      canCancel
                        ? `
                        <button title="Cancelar" class="btn-cancelar" data-order-code="${
                          order.orderCode
                        }" data-supplier-id="${
                            order.supplierId
                          }" style="display: ${
                            canCancel ? "inline-block" : "none"
                          }"><i class="bi bi-x-circle"></i></button>
                    `
                        : ""
                    }
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

  getStatusClass(status) {
    const statusMap = {
      processando: "status-processing",
      transporte: "status-delivery",
      entregue: "status-delivered",
      cancelado: "status-canceled",
    };
    return statusMap[status] || "status-default";
  }

  getStatusText(status) {
    const statusMap = {
      processando: "Em Processamento",
      transporte: "Em Transporte",
      entregue: "Entregue",
      cancelado: "Cancelado",
    };
    return statusMap[status] || "Status desconhecido";
  }

  setupTableEventListeners() {
    document.querySelectorAll(".btn-cancelar").forEach((button) => {
      button.addEventListener("click", (e) => {
        const orderCode = e.currentTarget.dataset.orderCode;
        const supplierId = e.currentTarget.dataset.supplierId;

        bootbox.confirm({
          title: "Cancelar Pedido",
          message: "Tem certeza que deseja cancelar este pedido?",
          buttons: {
            confirm: {
              label: "Sim",
              className: "btn-success",
            },
            cancel: {
              label: "Não",
              className: "btn-danger",
            },
          },
          callback: (result) => {
            if (result) {
              this.handleCancelOrder(orderCode, supplierId);
            }
          },
        });
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

  handleCancelOrder(orderCode, supplierId) {
    this.model.updateOrderStatus(orderCode, supplierId, "cancelado");
    this.renderOrders();
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
    const recipientOrders = this.model.getRecipientOrders(account.id);
    const filteredOrders = this.model.filterOrders(recipientOrders, filters);
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
      "./views/recipient/my-orders/templates/OrderDetail.html"
    );
    const modalHTML = await response.text();
    const tempDiv = document.createElement("div");
    const dataFormatada = new Date(order.createdAt).toLocaleDateString("pt-BR");
    const supplier = JSON.parse(
      localStorage.getItem(localStorageKeys.REGISTERED_SUPPLIERS)
    ).find((supplier) => supplier.id == order.supplierId);

    tempDiv.innerHTML = modalHTML;
    tempDiv.querySelector("#detalhes-numero-pedido").textContent =
      order.orderCode;
    tempDiv.querySelector("#detalhes-data").textContent = dataFormatada;
    tempDiv.querySelector(
      "#detalhes-valor-total"
    ).textContent = `R$ ${order.totalValue.toFixed(2)}`;
    tempDiv.querySelector("#detalhes-status").textContent = this.getStatusText(
      order.status
    );
    tempDiv.querySelector("#detalhes-nome-fornecedor").textContent =
      supplier.nome;
    tempDiv.querySelector("#detalhes-email-fornecedor").textContent =
      supplier.email;
    tempDiv.querySelector("#detalhes-telefone-fornecedor").textContent =
      formatTelefone(supplier.telefone);
    tempDiv.querySelector("#detalhes-endereco-fornecedor").textContent =
      `${supplier.endereco.rua}, ${supplier.endereco.numero}, ${
        supplier.endereco.cidade
      } - ${supplier.endereco.estado}  - ${
        supplier.endereco.complemento ? supplier.endereco.complemento : ""
      } (${formatCEP(supplier.endereco.cep)})` || "Não informado";

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
