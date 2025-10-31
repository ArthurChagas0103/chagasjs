import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";
import { verifyPassword } from "../../../assets/js/utils/PasswordUtils.js";
import { toastService } from "../../../assets/js/utils/ToastService.js";

export class LoginController {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.userTypeRecipientRadio = document.getElementById("userTypeRecipient");
    this.userTypeSupplierRadio = document.getElementById("userTypeSupplier");
    this.forgotPasswordLink = document.getElementById("forgotPasswordLink");
    this.initEventListeners();
    this.updateForgotPasswordLink(); // Seta o link para reset de passoword a depender od usertype
  }

  initEventListeners() {
    if (this.form) {
      this.form.addEventListener("submit", this.handleSubmit.bind(this));
    }
    if (this.userTypeRecipientRadio) {
      this.userTypeRecipientRadio.addEventListener(
        "change",
        this.updateForgotPasswordLink.bind(this)
      );
    }
    if (this.userTypeSupplierRadio) {
      this.userTypeSupplierRadio.addEventListener(
        "change",
        this.updateForgotPasswordLink.bind(this)
      );
    }
  }

  updateForgotPasswordLink() {
    if (this.userTypeRecipientRadio && this.userTypeRecipientRadio.checked) {
      this.forgotPasswordLink.href = "#forgotPasswordRecipient";
    } else if (
      this.userTypeSupplierRadio &&
      this.userTypeSupplierRadio.checked
    ) {
      this.forgotPasswordLink.href = "#forgotPasswordSupplier";
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const userType = this.userTypeRecipientRadio.checked
      ? "recipient"
      : "supplier";

    if (!email || !senha) {
      toastService.error({
        title: "Erro de Validação",
        message: "Por favor, preencha todos os campos.",
        icon: "bi bi-exclamation-triangle-fill",
      });

      return;
    }

    let users = [];
    let usersKey = "";
    let accountType = "";

    if (userType === "recipient") {
      usersKey = localStorageKeys.REGISTERED_RECIPIENTS;
      accountType = "recipient";
    } else if (userType === "supplier") {
      usersKey = localStorageKeys.REGISTERED_SUPPLIERS;
      accountType = "supplier";
    } else {
      toastService.error({
        title: "Erro de Validação",
        message: "Tipo de usuário inválido.",
        icon: "bi bi-exclamation-triangle-fill",
      });

      return;
    }

    users = JSON.parse(localStorage.getItem(usersKey)) || [];

    if (!users || users.length === 0) {
      toastService.error({
        title: "Erro de Validação",
        message: `Este email NÃO está registrado como ${accountType}.`,
        icon: "bi bi-exclamation-triangle-fill",
      });

      return;
    }

    const foundUser = users.find((u) => u.email === email);
    if (!foundUser) {
      toastService.error({
        title: "Erro de Validação",
        message: `Este email NÃO está registrado como ${accountType}.`,
        icon: "bi bi-exclamation-triangle-fill",
      });

      return;
    }

    try {
      const isPasswordValid = verifyPassword(senha, foundUser.senha);
      if (!isPasswordValid) {
        toastService.error({
          title: "Erro de Validação",
          message: "Senha incorreta.",
          icon: "bi bi-exclamation-triangle-fill",
        });

        return;
      }

      localStorage.setItem(
        localStorageKeys.ACCOUNT,
        JSON.stringify({
          id: foundUser.id,
          username: foundUser.nome,
          type: accountType,
        })
      );
      toastService.success({
        title: "Sucesso!",
        message: `Login efetuado com sucesso para: ${foundUser.nome}`,
        icon: "bi bi-check-circle-fill",
      });

      // Redireciona após o login para a tela adequada para o userType.
      if (userType === "recipient") window.location.href = `#supplierList`;
      if (userType === "supplier") window.location.href = `#viewProducts`;
    } catch (error) {
      console.error("Erro ao verificar senha: ", error);
      toastService.error({
        title: "Erro de Validação",
        message: "Senha incorreta.",
        icon: "bi bi-exclamation-triangle-fill",
      });
      return;
    }
  }
}
