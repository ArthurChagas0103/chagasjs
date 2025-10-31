import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";
import {
  createPasswordHash,
  isStrongPassword,
} from "../../../assets/js/utils/PasswordUtils.js";
import { toastService } from "../../../assets/js/utils/ToastService.js";

export class RegistrationController {
  constructor(formId, userTypeInputId) {
    this.form = document.getElementById(formId);
    this.userTypeInput = document.getElementById(userTypeInputId);
    this.cpfField = document.getElementById("cpf-field");
    this.cnpjField = document.getElementById("cnpj-field");
    this.categoriaField = document.getElementById("categoria-field");
    this.descricaoField = document.getElementById("descricao-field");

    this.initEventListeners();
    this.initialDisplay();
  }

  initEventListeners() {
    if (!this.form) return;

    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    document
      .getElementById("userTypeRecipient")
      .addEventListener("change", this.handleUserTypeChange.bind(this));
    document
      .getElementById("userTypeSupplier")
      .addEventListener("change", this.handleUserTypeChange.bind(this));

    document
      .getElementById("cep")
      .addEventListener("blur", this.handleCepLookup.bind(this));

    const telefoneInput = document.getElementById("telefone");
    const cpfInput = document.getElementById("cpf");
    const cnpjInput = document.getElementById("cnpj");
    const cepInput = document.getElementById("cep");
    const numeroInput = document.getElementById("numero");

    if (telefoneInput)
      telefoneInput.addEventListener("input", () =>
        this.applyPhoneMask(telefoneInput)
      );

    if (cpfInput)
      cpfInput.addEventListener("input", () =>
        this.applyCpfCnpjMask(cpfInput, "cpf")
      );

    if (cnpjInput)
      cnpjInput.addEventListener("input", () =>
        this.applyCpfCnpjMask(cnpjInput, "cnpj")
      );

    if (cepInput) {
      cepInput.addEventListener("input", () => {
        this.applyCepMask(cepInput);
      });
    }
    if (numeroInput)
      numeroInput.addEventListener("input", () => {
        numeroInput.value = numeroInput.value.replace(/\D/g, "");
      });
  }

  initialDisplay() {
    if (document.getElementById("userTypeRecipient").checked) {
      this.cpfField.style.display = "block";
      this.cnpjField.style.display = "none";
      this.categoriaField.style.display = "none";
      this.descricaoField.style.display = "none";
      document.getElementById("cpf").required = true;
      document.getElementById("cnpj").required = false;
      document.getElementById("categoria").required = false;
      document.getElementById("descricao").required = false;
    } else if (document.getElementById("userTypeSupplier").checked) {
      this.cpfField.style.display = "none";
      this.cnpjField.style.display = "block";
      this.categoriaField.style.display = "block";
      this.descricaoField.style.display = "block";
      document.getElementById("cpf").required = false;
      document.getElementById("cnpj").required = true;
      document.getElementById("categoria").required = true;
      document.getElementById("descricao").required = true;
    }
  }

  handleUserTypeChange(event) {
    const selectedUserType = event.target.value;
    this.userTypeInput.value = selectedUserType;

    if (selectedUserType === "recipient") {
      this.cpfField.style.display = "block";
      this.cnpjField.style.display = "none";
      this.categoriaField.style.display = "none";
      this.descricaoField.style.display = "none";
      document.getElementById("cpf").required = true;
      document.getElementById("cnpj").required = false;
      document.getElementById("cnpj").value = "";
      document.getElementById("nome-label").textContent = "Nome Completo";
    } else if (selectedUserType === "supplier") {
      this.cpfField.style.display = "none";
      this.cnpjField.style.display = "block";
      this.categoriaField.style.display = "block";
      this.descricaoField.style.display = "block";
      document.getElementById("cpf").required = false;
      document.getElementById("cnpj").required = true;
      document.getElementById("cpf").value = "";
      document.getElementById("nome-label").textContent = "Nome da Empresa";
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const userType = this.userTypeInput.value;
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmaSenha").value;
    const telefoneRaw = document.getElementById("telefone").value.trim();

    const rua = document.getElementById("rua").value.trim();
    const numeroRaw = document.getElementById("numero").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const estado = document.getElementById("estado").value;
    const cepRaw = document.getElementById("cep").value.trim();

    const termosAceitos = document.getElementById("terms").checked;

    let identifierRaw = "";
    let usersKey = "";
    let accountType = "";

    if (userType === "recipient") {
      identifierRaw = document.getElementById("cpf").value.trim();
      usersKey = localStorageKeys.REGISTERED_RECIPIENTS;
      accountType = "recipient";
    } else if (userType === "supplier") {
      identifierRaw = document.getElementById("cnpj").value.trim();
      usersKey = localStorageKeys.REGISTERED_SUPPLIERS;
      accountType = "supplier";

      if (
        !document.getElementById("categoria").value ||
        !document.getElementById("descricao").value
      ) {
        toastService.error({
          title: "Erro de Validação",
          message:
            "Por favor, preencha todos os campos obrigatórios para empresas.",
          icon: "bi bi-exclamation-triangle-fill",
        });

        return;
      }
    } else {
      toastService.error({
        title: "Erro de Validação",
        message: "Tipo de usuário inválido.",
        icon: "bi bi-exclamation-triangle-fill",
      });
      return;
    }

    if (
      !nome ||
      !identifierRaw ||
      !email ||
      !senha ||
      !confirmarSenha ||
      !telefoneRaw ||
      !rua ||
      !numeroRaw ||
      !bairro ||
      !cidade ||
      !estado ||
      !cepRaw
    ) {
      toastService.error({
        title: "Erro de Validação",
        message: "Por favor, preencha todos os campos obrigatórios.",
        icon: "bi bi-exclamation-triangle-fill",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toastService.error({
        title: "Erro de Validação",
        message: "Por favor, insira um endereço de e-mail válido.",
        icon: "bi bi-exclamation-triangle-fill",
      });
      return;
    }

    if (senha !== confirmarSenha) {
      toastService.error({
        title: "Erro de Validação",
        message: "As senhas não coincidem.",
        icon: "bi bi-exclamation-triangle-fill",
      });
      return;
    }

    if (!termosAceitos) {
      toastService.error({
        title: "Erro de Validação",
        message: "Você precisa aceitar os termos e condições.",
        icon: "bi bi-exclamation-triangle-fill",
      });
      return;
    }

    const passwordStrength = isStrongPassword(senha);
    if (!passwordStrength.valid) {
      toastService.error({
        title: "Erro de Validação",
        message: passwordStrength.message,
        icon: "bi bi-exclamation-triangle-fill",
      });
      return;
    }

    const telefone = telefoneRaw.replace(/\D/g, "");
    const numero = numeroRaw.replace(/\D/g, "");
    const cep = cepRaw.replace(/\D/g, "");
    const identifier = identifierRaw.replace(/\D/g, "");
    const users = JSON.parse(localStorage.getItem(usersKey)) || [];

    const emailExistente = users.find((u) => u.email === email);
    if (emailExistente) {
      toastService.error({
        title: "Erro de Validação",
        message: "Este EMAIL já está registrado.",
        icon: "bi bi-exclamation-triangle-fill",
      });
      return;
    }

    const hashedPassword = createPasswordHash(senha);
    const newUser = {
      id: users.length + 1,
      nome,
      [userType === "recipient" ? "cpf" : "cnpj"]: identifier,
      email,
      senha: hashedPassword,
      telefone,
      endereco: {
        rua,
        numero,
        bairro,
        cidade,
        estado,
        cep,
      },
    };

    if (userType === "supplier") {
      newUser.categoria = document.getElementById("categoria").value;
      newUser.descricao = document.getElementById("descricao").value;
    }

    users.push(newUser);
    localStorage.setItem(usersKey, JSON.stringify(users));
    localStorage.setItem(
      localStorageKeys.ACCOUNT,
      JSON.stringify({
        id: newUser.id,
        username: newUser.nome,
        type: accountType,
      })
    );

    toastService.success({
      title: "Sucesso",
      message: "Cadastro realizado com sucesso!",
      icon: "bi bi-check-circle-fill",
    });

    if (userType === "recipient") window.location.href = `#supplierList`;
    if (userType === "supplier") window.location.href = `#viewProducts`;
  }

  async handleCepLookup() {
    const cepInput = document.getElementById("cep").value;
    const cep = cepInput.replace(/\D/g, "");

    if (cep.length !== 8) {
      toastService.error({
        title: "Erro de Validação",
        message: "CEP inválido. Deve conter 8 dígitos.",
        icon: "bi bi-exclamation-triangle-fill",
      });

      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toastService.error({
          title: "Erro de Validação",
          message: "CEP não encontrado.",
          icon: "bi bi-exclamation-triangle-fill",
        });

        return;
      }

      document.getElementById("rua").value = data.logradouro;
      document.getElementById("bairro").value = data.bairro;
      document.getElementById("cidade").value = data.localidade;
      document.getElementById("estado").value = data.uf;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toastService.error({
        title: "Erro de Validação",
        message: "Erro ao buscar o endereço do CEP.",
        icon: "bi bi-exclamation-triangle-fill",
      });
    }
  }

  applyPhoneMask(input) {
    let value = input.value.replace(/\D/g, "");

    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d{5})(\d{4})$/, "$1-$2");
    input.value = value;
  }

  applyCepMask(input) {
    let value = input.value.replace(/\D/g, "");
    value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    input.value = value;
  }

  applyCpfCnpjMask(input, type) {
    let value = input.value.replace(/\D/g, "");

    if (type === "cpf") {
      if (value.length > 11) value = value.slice(0, 11);

      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else if (type === "cnpj") {
      if (value.length > 14) value = value.slice(0, 14);

      value = value.replace(/^(\d{2})(\d)/, "$1.$2");
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
    }

    input.value = value;
  }
}
