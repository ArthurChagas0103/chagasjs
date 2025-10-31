import { ContactModel } from "../../../models/landing-page/contact/ContactModel.js";
import { toastService } from "../../../assets/js/utils/ToastService.js";
import { SendEmail } from "../../../assets/js/utils/SendEmail.js";
import config from "../../../assets/js/utils/Config.js";

export class ContactController {
  constructor(formId, sendButtonId) {
    this.form = document.getElementById(formId);
    this.sendButton = document.getElementById(sendButtonId);

    this.sendButton.addEventListener("click", () => this.handleSubmit());
  }

  async handleSubmit() {
    const formData = new FormData(this.form);
    const contact = new ContactModel(
      formData.get("name"),
      formData.get("email"),
      formData.get("subject"),
      formData.get("message")
    );

    const errors = contact.validate();
    if (errors.length > 0) {
      toastService.error({
        title: "Erro de Validação",
        message: errors[0],
        icon: "bi bi-exclamation-triangle-fill",
      });

      return;
    }

    try {
      this.sendButton.disabled = true;

      const sendEmail = new SendEmail(
        config.ENDPOINTS.SEND_EMAIL,
        config.EMAIL_CONFIG.TEMPLATE_ID.CONTACT,
        config.EMAIL_CONFIG.SERVICE_ID,
        config.EMAIL_CONFIG.USER_ID,
        contact.toJSON()
      );
      const response = await sendEmail.send();

      if (!response) {
        throw new Error("Erro ao enviar o formulário.");
      }

      toastService.success({
        title: "Sucesso!",
        message: "Mensagem enviada com sucesso!",
        icon: "bi bi-check-circle-fill",
      });

      this.form.reset();
    } catch (error) {
      console.error("Erro:", error);
      toastService.error({
        title: "Erro",
        message: "Ocorreu um erro ao enviar a mensagem. Tente novamente.",
        icon: "bi bi-exclamation-triangle-fill",
      });
    } finally {
      this.sendButton.disabled = false;
    }
  }
}
