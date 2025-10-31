export class ProductModel {
  constructor({
    productId = null,
    supplierId,
    name,
    description,
    category,
    quantity,
    expirationDate,
    nutritionalInfo,
    offerType,
    price,
    image
  }) {
    this.productId = productId || ProductModel.generateProductId();
    this.supplierId = supplierId;
    this.name = name.trim();
    this.description = description.trim();
    this.category = category;
    this.quantity = Number(quantity);
    this.expirationDate = expirationDate;
    this.nutritionalInfo = nutritionalInfo ? nutritionalInfo.trim() : "";
    this.offerType = offerType;
    this.price = Number(price);
    this.image = image;
  }

  static generateProductId() {
    return 'prod_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
  }
  
  validate() {
    const errors = [];

    // Validação do nome do produto (mínimo de 3 caracteres)
    if (!this.name || this.name.length < 3) {
      errors.push("O nome do produto deve ter pelo menos 3 caracteres.");
    }

    // Validação da descrição (mínimo de 10 caracteres)
    if (!this.description || this.description.length < 10) {
      errors.push("A descrição deve ter pelo menos 10 caracteres.");
    }

    // Validação da categoria (campo obrigatório)
    if (!this.category) {
      errors.push("A categoria é obrigatória.");
    }

    // Validação da quantidade (deve ser número maior que zero)
    if (isNaN(this.quantity) || this.quantity < 1) {
      errors.push("A quantidade deve ser maior que zero.");
    }

    // Validação da data de validade (campo obrigatório e não pode ser anterior à data atual)
    if (!this.expirationDate) {
      errors.push("A data de validade é obrigatória.");
    } else {
      const today = new Date();
      const expiration = new Date(this.expirationDate);
      today.setHours(0,0,0,0); // Zera horas para comparar apenas datas (YYYY-MM-DD)
      expiration.setHours(0,0,0,0);
      if (expiration < today) {
        errors.push("A data de validade não pode ser anterior à data atual.");
      }
    }

    // Validação do tipo de oferta (campo obrigatório)
    if (!this.offerType) {
      errors.push("O tipo de oferta é obrigatório.");
    }

    // Validação do preço
    if (this.offerType === "sale") {
      // Para venda, preço deve ser informado e maior que zero
      if (!this.price || isNaN(this.price) || this.price <= 0) {
        errors.push("Informe um preço válido (maior que zero) para produtos à venda.");
      }
    } else if (this.price && this.price > 0) {
      // Para doação, não deve haver preço
      errors.push("Produtos gratuitos não devem ter preço.");
    }

    // Validação da imagem é feita controller

    return errors;
  }

  // função usada no controller para salvar no localstorage
  toJSON() {
    return {
      productId: this.productId,
      supplierId: this.supplierId,
      name: this.name,
      description: this.description,
      category: this.category,
      quantity: this.quantity,
      expirationDate: this.expirationDate,
      nutritionalInfo: this.nutritionalInfo,
      offerType: this.offerType,
      price: this.price,
      image: this.image
    };
  }
}