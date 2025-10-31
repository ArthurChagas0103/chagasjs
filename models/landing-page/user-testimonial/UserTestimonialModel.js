import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

class UserTestimonial {
  constructor(nome, comentario, avaliacao) {
    this.nome = nome;
    this.comentario = comentario;
    this.avaliacao = avaliacao;
    this.id = Date.now();
  }

  static fromJSON(json) {
    return new UserTestimonial(json.nome, json.comentario, json.avaliacao);
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      comentario: this.comentario,
      avaliacao: this.avaliacao,
    };
  }
}

class TestimonialStorage {
  constructor() {
    this.storageKey = localStorageKeys.TESTIMONIALS;
  }

  getAll() {
    return JSON.parse(localStorage.getItem(this.storageKey) || "[]").map(
      (testimonial) => UserTestimonial.fromJSON(testimonial)
    );
  }

  save(testimonial) {
    const testimonials = this.getAll();

    testimonials.push(testimonial);
    localStorage.setItem(this.storageKey, JSON.stringify(testimonials));
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}

export { UserTestimonial, TestimonialStorage };
