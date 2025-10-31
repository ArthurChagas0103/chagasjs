import { ProductModel } from "../../../models/supplier/Product/ProductModel.js";
import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

export class ProductController {
  // Inicializa o controller e configura eventos
  constructor(formId, submitButtonId) {
    this.form = document.getElementById(formId);
    this.submitButton = document.getElementById(submitButtonId);
    this._initEvents();
  }

  // Liga eventos ao formulário
  _initEvents() {
    if (!this.form) return;
    this.form.addEventListener("submit", (e) => this._onSubmit(e));
  }

  // Valida e processa o formulário
  async _validateAndBuildProduct() {
    const formData = new FormData(this.form);
    // Gera um ID único para o produto (não quis usar UUID pq não queria importar uma lib)
    const productId =
      "prod_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
    // Busca o ID do fornecedor (usuário logado) no localStorage -> preciso que o time finalize essa feature para q eu possa usar o sistema de autenticação
    let supplierId = null;
    try {
      const account = JSON.parse(
        localStorage.getItem(localStorageKeys.ACCOUNT)
      );
      if (account && account.id) supplierId = account.id;
    } catch (e) {}
    // Processa a imagem em Base64
    let imageBase64 = "";
    const imageFile = formData.get("image");
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      imageBase64 = await this._fileToBase64(imageFile);
    }
    // Obtém o preço e infere o tipo de oferta
    let price = formData.get("price");
    price =
      price !== null && price !== undefined && price !== "" ? Number(price) : 0;
    let offerType = price === 0 ? "donation" : "sale";
    // Cria o objeto do produto
    const product = new ProductModel({
      productId,
      supplierId,
      name: formData.get("name"),
      description: formData.get("description"),
      category: formData.get("category"),
      quantity: formData.get("quantity"),
      expirationDate: formData.get("expirationDate"),
      nutritionalInfo: formData.get("nutritionalInfo"),
      offerType,
      price,
      image: imageBase64,
    });
    // Validação do modelo
    const errors = product.validate();
    if (errors.length > 0) {
      alert(errors[0]);
      return null;
    }
    // Validação extra da imagem
    if (imageFile) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(imageFile.type)) {
        alert("A imagem deve ser dos tipos: JPG, PNG, GIF ou WEBP.");
        return null;
      }
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (imageFile.size > maxSize) {
        alert("A imagem deve ter no máximo 2MB.");
        return null;
      }
    }
    return product;
  }

  // Ao submeter o formulário, valida e salva o produto
  async _onSubmit(e) {
    e.preventDefault();
    const product = await this._validateAndBuildProduct();
    if (!product) return;
    try {
      if (!this.submitButton)
        throw new Error("Botão de submit não encontrado.");
      this.submitButton.disabled = true;
      // Salva o produto no localStorage
      let products =
        JSON.parse(localStorage.getItem(localStorageKeys.PRODUCTS)) || [];
      products.push(product.toJSON());
      localStorage.setItem(localStorageKeys.PRODUCTS, JSON.stringify(products));
      alert("Produto cadastrado com sucesso!");
      this.form.reset();
    } catch (error) {
      alert(
        "Erro ao cadastrar produto. Por favor, tente novamente.\n" +
          (error && error.message ? error.message : "")
      );
    } finally {
      if (this.submitButton) this.submitButton.disabled = false;
    }
  }

  // Converte imagem para Base64 (string enorme kk)
  async _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve("");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
