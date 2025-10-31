class ToastService {
  constructor() {
    this.toastContainer = this.createToastContainer();

    document.body.appendChild(this.toastContainer);
  }

  createToastContainer() {
    const container = document.createElement("div");

    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    container.style.zIndex = "1050";

    return container;
  }

  show(options) {
    const {
      title,
      message,
      type = "info",
      duration = 5000,
      position = "bottom-end",
      icon = null,
    } = options;

    const toast = document.createElement("div");

    toast.className = `toast align-items-center text-white bg-${this.getBackgroundClass(
      type
    )} border-0`;

    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    const toastHeader = document.createElement("div");

    toastHeader.className = "toast-header";

    if (icon) {
      const iconElement = document.createElement("i");

      iconElement.className = icon;
      iconElement.style.marginRight = "8px";

      toastHeader.appendChild(iconElement);
    }

    const strong = document.createElement("strong");

    strong.className = "me-auto";
    strong.textContent = title;

    toastHeader.appendChild(strong);

    const closeButton = document.createElement("button");

    closeButton.type = "button";
    closeButton.className = "btn-close btn-close-white";

    closeButton.setAttribute("data-bs-dismiss", "toast");
    closeButton.setAttribute("aria-label", "Close");
    toastHeader.appendChild(closeButton);

    const toastBody = document.createElement("div");

    toastBody.className = "toast-body";
    toastBody.textContent = message;

    toast.appendChild(toastHeader);
    toast.appendChild(toastBody);

    this.toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, {
      autohide: true,
      delay: duration,
    });

    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove();
    });

    bsToast.show();
  }

  getBackgroundClass(type) {
    const types = {
      info: "info",
      success: "success",
      warning: "warning",
      error: "danger",
    };

    return types[type] || "info";
  }

  success(options) {
    this.show({ ...options, type: "success" });
  }
  error(options) {
    this.show({ ...options, type: "error" });
  }
  warning(options) {
    this.show({ ...options, type: "warning" });
  }
  info(options) {
    this.show({ ...options, type: "info" });
  }
}

export const toastService = new ToastService();
