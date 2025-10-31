import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";
import {
  createPasswordHash,
  isStrongPassword,
} from "../../../assets/js/utils/PasswordUtils.js";
import { toastService } from "../../../assets/js/utils/ToastService.js";

export class EditionController {
  constructor(userType) {
    this.userType = userType;
    this.form = document.getElementById("formPerfil");
    this.currentUser = null;
    this.usersKey =
      userType === "recipient"
        ? localStorageKeys.REGISTERED_RECIPIENTS
        : localStorageKeys.REGISTERED_SUPPLIERS;

    this.initEventListeners();
    this.loadUserData();
  }

  initEventListeners() {
    if (this.form) {
      this.form.addEventListener("submit", this.handleSubmit.bind(this));
    }

    document
      .getElementById("cep")
      .addEventListener("input", this.handleCepLookup.bind(this));

    const telefoneInput = document.getElementById("telefone");
    const cpfInput = document.getElementById("cpf");
    const cnpjInput = document.getElementById("cnpj");
    const cepInput = document.getElementById("cep");
    const numeroInput = document.getElementById("numero");

    if (telefoneInput) {
      telefoneInput.addEventListener("input", () =>
        this.applyPhoneMask(telefoneInput)
      );
    }

    if (cpfInput) {
      cpfInput.addEventListener("input", () =>
        this.applyCpfCnpjMask(cpfInput, "cpf")
      );
    }

    if (cnpjInput) {
      cnpjInput.addEventListener("input", () =>
        this.applyCpfCnpjMask(cnpjInput, "cnpj")
      );
    }

    if (cepInput) {
      cepInput.addEventListener("input", () => this.applyCepMask(cepInput));
    }
    if (numeroInput) {
      numeroInput.addEventListener("input", () => {
        numeroInput.value = numeroInput.value.replace(/\D/g, "");
      });
    }
  }

  loadUserData() {
    const account = JSON.parse(localStorage.getItem(localStorageKeys.ACCOUNT));
    if (!account) {
      toastService.error({
        title: "Erro",
        message: "Nenhum usuário logado.",
        icon: "bi bi-exclamation-triangle-fill",
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
    this.currentUser = users.find((u) => u.id === account.id);

    if (this.currentUser) {
      document.getElementById("nome").value = this.currentUser.nome || "";
      document.getElementById("email").value = this.currentUser.email || "";
      const telefoneInput = document.getElementById("telefone");
      telefoneInput.value = this.currentUser.telefone || "";
      this.applyPhoneMask(telefoneInput);

      if (this.userType === "recipient") {
        const cpfInput = document.getElementById("cpf");
        cpfInput.value = this.currentUser.cpf || "";
        this.applyCpfCnpjMask(cpfInput, "cpf");
      } else if (this.userType === "supplier") {
        const cnpjInput = document.getElementById("cnpj");
        cnpjInput.value = this.currentUser.cnpj || "";
        this.applyCpfCnpjMask(cnpjInput, "cnpj");
        document.getElementById("categoria").value =
          this.currentUser.categoria || "";
        document.getElementById("descricao").value =
          this.currentUser.descricao || "";
      }

      if (this.currentUser.endereco) {
        document.getElementById("rua").value =
          this.currentUser.endereco.rua || "";
        document.getElementById("numero").value =
          this.currentUser.endereco.numero || "";
        document.getElementById("bairro").value =
          this.currentUser.endereco.bairro || "";
        document.getElementById("cidade").value =
          this.currentUser.endereco.cidade || "";
        document.getElementById("estado").value =
          this.currentUser.endereco.estado || "";
        document.getElementById("estado").setAttribute("disabled", "true");
        document.getElementById("estado").classList.add("bg-disabled");
        const cepInput = document.getElementById("cep");
        cepInput.value = this.currentUser.endereco.cep || "";
        this.applyCepMask(cepInput);

        document.getElementById("rua").setAttribute("disabled", "true");
        document.getElementById("rua").classList.add("bg-disabled");
        document.getElementById("bairro").setAttribute("disabled", "true");
        document.getElementById("bairro").classList.add("bg-disabled");
        document.getElementById("cidade").setAttribute("disabled", "true");
        document.getElementById("cidade").classList.add("bg-disabled");
      }
    } else {
      toastService.error({
        title: "Erro",
        message: "Dados do usuário não encontrados.",
        icon: "bi bi-exclamation-triangle-fill",
      });
    }
  }

  async handleSubmit(e) {
    console.log("teste")
    e.preventDefault();
    this.form.classList.add('was-validated');

    const nome = document.getElementById("nome").value.trim();
    const emailInput = document.getElementById("email");
    const email = emailInput.value.trim();
    console.log(email)

    // Clear previous validation states
    emailInput.classList.remove("is-invalid");
    const telefoneRaw = document.getElementById("telefone").value.trim();
    const rua = document.getElementById("rua").value.trim();
    const numeroRaw = document.getElementById("numero").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const estado = document.getElementById("estado").value;
    const cepRaw = document.getElementById("cep").value.trim();

    let identifierRaw = "";
    if (this.userType === "recipient") {
      identifierRaw = document.getElementById("cpf").value.trim();
    } else if (this.userType === "supplier") {
      identifierRaw = document.getElementById("cnpj").value.trim();
    }

    if (
      !nome ||
      !identifierRaw ||
      !email ||
      !telefoneRaw ||
      !rua ||
      !numeroRaw ||
      !bairro ||
      !cidade ||
      !estado ||
      !cepRaw
    ) {
      return;
    }

    if (!isValidEmail(email)) {
      emailInput.classList.add("is-invalid");
    } else {
      emailInput.classList.remove("is-invalid");
    }

    const senhaAtual = document.getElementById("senhaAtual").value;
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (senhaAtual || novaSenha || confirmarSenha) {
      let hashedPassword;
      try {
        hashedPassword = createPasswordHash(senhaAtual);
      } catch (error) {
        toastService.error({
          title: "Erro de Validação",
          message: error.message,
          icon: "bi bi-exclamation-triangle-fill",
        });
        return;
      }

      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        toastService.error({
          title: "Erro de Validação",
          message: "Para alterar a senha, preencha todos os campos de senha.",
          icon: "bi bi-exclamation-triangle-fill",
        });
        return;
      }

      if (hashedPassword !== this.currentUser.senha) {
        toastService.error({
          title: "Erro de Validação",
          message: "Senha atual incorreta.",
          icon: "bi bi-exclamation-triangle-fill",
        });
        return;
      }

      if (novaSenha !== confirmarSenha) {
        toastService.error({
          title: "Erro de Validação",
          message: "As novas senhas não coincidem.",
          icon: "bi bi-exclamation-triangle-fill",
        });
        return;
      }

      const passwordStrength = isStrongPassword(novaSenha);
      if (!passwordStrength.valid) {
        toastService.error({
          title: "Erro de Validação",
          message: passwordStrength.message,
          icon: "bi bi-exclamation-triangle-fill",
        });
        return;
      }
    }

    const telefone = telefoneRaw.replace(/\D/g, "");
    const numero = numeroRaw.replace(/\D/g, "");
    const cep = cepRaw.replace(/\D/g, "");
    const identifier = identifierRaw.replace(/\D/g, "");

    const users = JSON.parse(localStorage.getItem(this.usersKey)) || [];
    const userIndex = users.findIndex((u) => u.id === this.currentUser.id);

    if (userIndex !== -1) {
      const updatedUser = { ...this.currentUser };
      updatedUser.nome = nome;
      updatedUser.email = email;
      updatedUser.telefone = telefone;
      updatedUser.endereco = {
        rua,
        numero,
        bairro,
        cidade,
        estado,
        cep,
      };

      if (this.userType === "recipient") {
        updatedUser.cpf = identifier;
      } else if (this.userType === "supplier") {
        updatedUser.cnpj = identifier;
        updatedUser.categoria = document.getElementById("categoria").value;
        updatedUser.descricao = document.getElementById("descricao").value;
      }

      if (novaSenha) {
        updatedUser.senha = createPasswordHash(novaSenha);
      }

      users[userIndex] = updatedUser;
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      localStorage.setItem(
        localStorageKeys.ACCOUNT,
        JSON.stringify({
          id: updatedUser.id,
          username: updatedUser.email,
          type: this.userType,
        })
      );

      toastService.success({
        title: "Sucesso",
        message: "Perfil atualizado com sucesso!",
        icon: "bi bi-check-circle-fill",
      });

      // Optionally redirect or refresh
      // window.location.reload();
    } else {
      toastService.error({
        title: "Erro",
        message: "Usuário não encontrado para atualização.",
        icon: "bi bi-exclamation-triangle-fill",
      });
    }
  }

  async handleCepLookup() {
    const cepInput = document.getElementById("cep").value;
    const cep = cepInput.replace(/\D/g, "");

    if (cep.length !== 8) {
      document.getElementById("rua").value = "";
      document.getElementById("rua").removeAttribute("disabled");
      document.getElementById("rua").classList.remove("bg-disabled");
      document.getElementById("bairro").value = "";
      document.getElementById("bairro").removeAttribute("disabled");
      document.getElementById("bairro").classList.remove("bg-disabled");
      document.getElementById("cidade").value = "";
      document.getElementById("cidade").removeAttribute("disabled");
      document.getElementById("cidade").classList.remove("bg-disabled");
      document.getElementById("estado").value = "";
      document.getElementById("estado").removeAttribute("disabled");
      document.getElementById("estado").classList.remove("bg-disabled");
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        document.getElementById("rua").value = "";
        document.getElementById("rua").removeAttribute("disabled");
        document.getElementById("rua").classList.remove("bg-disabled");
        document.getElementById("bairro").value = "";
        document.getElementById("bairro").removeAttribute("disabled");
        document.getElementById("bairro").classList.remove("bg-disabled");
        document.getElementById("cidade").value = "";
        document.getElementById("cidade").removeAttribute("disabled");
        document.getElementById("cidade").classList.remove("bg-disabled");
        document.getElementById("estado").value = "";
        document.getElementById("estado").removeAttribute("disabled");
        document.getElementById("estado").classList.remove("bg-disabled");
        toastService.error({
          title: "Erro de Validação",
          message: "CEP não encontrado.",
          icon: "bi bi-exclamation-triangle-fill",
        });

        return;
      }

      document.getElementById("rua").value = data.logradouro;
      document.getElementById("rua").setAttribute("disabled", "true");
      document.getElementById("rua").classList.add("bg-disabled");
      document.getElementById("bairro").value = data.bairro;
      document.getElementById("bairro").setAttribute("disabled", "true");
      document.getElementById("bairro").classList.add("bg-disabled");
      document.getElementById("cidade").value = data.localidade;
      document.getElementById("cidade").setAttribute("disabled", "true");
      document.getElementById("cidade").classList.add("bg-disabled");
      document.getElementById("estado").value = data.uf;
      document.getElementById("estado").setAttribute("disabled", "true");
      document.getElementById("estado").classList.add("bg-disabled");
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
