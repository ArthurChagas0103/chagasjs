import {
  UserTestimonial,
  TestimonialStorage,
} from "../../../models/landing-page/user-testimonial/UserTestimonialModel.js";
import { toastService } from "../../../assets/js/utils/ToastService.js";

export class TestimonialController {
  constructor() {
    this.storage = new TestimonialStorage();
    this.carouselInner = document.querySelector(".carousel-inner");
    this.init();
  }

  init() {
    this.setupStars();
    this.loadTestimonials();
    this.setupForm();

    const carousel = new bootstrap.Carousel(
      document.getElementById("depoimentosCarousel"),
      {
        interval: 5000,
        wrap: true,
      }
    );

    const carouselElement = document.getElementById("depoimentosCarousel");
    let isScrolling = false;
    let startX = 0;
    let startY = 0;

    carouselElement.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = false;
    });

    carouselElement.addEventListener("touchmove", (e) => {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);

      if (diffY > diffX) {
        isScrolling = true;
        e.preventDefault();
      }
    });

    carouselElement.addEventListener("touchend", (e) => {
      if (!isScrolling) {
        const currentX = e.changedTouches[0].clientX;
        const diffX = currentX - startX;

        if (Math.abs(diffX) > 50) {
          if (diffX > 0) {
            carousel.prev();
          } else {
            carousel.next();
          }
        }
      }
    });
  }

  setupStars() {
    const estrelasContainer = document.getElementById("avaliacaoEstrelas");
    const avaliacaoInput = document.getElementById("avaliacao");

    for (let i = 1; i <= 5; i++) {
      const estrela = document.createElement("i");

      estrela.className = "bi bi-star text-secondary";
      estrela.dataset.valor = i;

      estrela.addEventListener("mouseenter", () => this.updateStars(i));
      estrela.addEventListener("mouseleave", () =>
        this.updateStars(parseInt(avaliacaoInput.value))
      );
      estrela.addEventListener("click", () => {
        avaliacaoInput.value = i;
        this.updateStars(i);
      });

      estrelasContainer.appendChild(estrela);
    }

    this.updateStars(5);
  }

  updateStars(n) {
    const estrelas = document
      .getElementById("avaliacaoEstrelas")
      .querySelectorAll("i");

    estrelas.forEach((el, index) => {
      el.className =
        index < n
          ? "bi bi-star-fill text-warning"
          : "bi bi-star text-secondary";
    });
  }

  loadTestimonials() {
    this.carouselInner.innerHTML = "";
    const placeholder = document.querySelector(".no-testimonials-placeholder");
    const testimonials = this.storage.getAll();

    if (testimonials.length === 0) {
      placeholder.classList.remove("d-none");
    } else {
      placeholder.classList.add("d-none");
      testimonials.forEach((testimonial, index) => {
        this.addTestimonialToCarousel(testimonial, index === 0);
      });
    }
  }

  addTestimonialToCarousel(testimonial, isActive = false) {
    const item = document.createElement("div");

    item.className =
      "carousel-item d-flex justify-content-center align-items-center";

    if (isActive) item.classList.add("active");

    item.innerHTML = `
        <div class="text-center">
          <div class="mb-3">
            ${Array(testimonial.avaliacao)
              .fill('<i class="bi bi-star-fill text-warning"></i>')
              .join("")}
          </div>
          <p class="font-open-sans mb-4 mx-auto">
            "${testimonial.comentario}"
          </p>
          <div class="user-icon mb-3">
            <i class="bi bi-person-circle fs-1 text-success"></i>
          </div>
          <h5 class="font-montserrat">${testimonial.nome}</h5>
        </div>
      `;

    this.carouselInner.appendChild(item);
  }

  setupForm() {
    const form = document.getElementById("depoimentoForm");
    const comentario = document.getElementById("comentario");
    const MAX_LENGTH = 671;

    comentario.setAttribute("maxlength", MAX_LENGTH);

    const contador = document.createElement("small");

    contador.className = "text-muted d-block mt-1";
    contador.id = "contador";
    comentario.parentElement.appendChild(contador);
    comentario.addEventListener("input", () => {
      contador.textContent = `${comentario.value.length} / ${MAX_LENGTH}`;
    });
    form.addEventListener("submit", (e) => this.handleSubmit(e, form));
  }

  handleSubmit(e, form) {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const comentario = document.getElementById("comentario").value.trim();
    const avaliacao = parseInt(document.getElementById("avaliacao").value);

    if (!nome || !comentario) return;

    if (nome.length < 3) {
      toastService.error({
        title: "Erro!",
        message: "O nome deve ter pelo menos 3 caracteres.",
        icon: "bi bi-exclamation-circle-fill",
      });
      return;
    } else if (nome.length > 50) {
      toastService.error({
        title: "Erro!",
        message: "O nome deve ter no máximo 50 caracteres.",
        icon: "bi bi-exclamation-circle-fill",
      });
      return;
    } else if (comentario.length > 671) {
      toastService.error({
        title: "Erro!",
        message: "Seu comentário ultrapassa o limite de 671 caracteres.",
        icon: "bi bi-exclamation-circle-fill",
      });
      return;
    }

    const testimonial = new UserTestimonial(nome, comentario, avaliacao);
    const MAX_LENGTH = 671;

    this.storage.save(testimonial);
    this.loadTestimonials();

    form.reset();
    this.updateStars(5);
    document.getElementById("avaliacao").value = 5;
    document.getElementById("contador").textContent = `${0} / ${MAX_LENGTH}`;

    toastService.success({
      title: "Sucesso!",
      message: "Depoimento enviado com sucesso!",
      icon: "bi bi-check-circle-fill",
    });
  }
}
