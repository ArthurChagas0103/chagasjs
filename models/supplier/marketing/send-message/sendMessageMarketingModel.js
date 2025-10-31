import { SendEmail } from "../../../../assets/js/utils/SendEmail.js";
import config from "../../../../assets/js/utils/Config.js";
import { localStorageKeys } from "../../../../assets/js/utils/Constantes.js";

export class SendMessageMarketingModel {
  getData() {
    return {
      subject: document.getElementById("subject").value.trim(),
      message: $("#message").summernote("code").trim(),
    };
  }

  validateData(data) {
    const errors = [];

    if (!data.subject) {
      errors.push("O campo ASSUNTO está vazio.");
    }

    if (!data.message) {
      errors.push("O campo MENSAGEM está vazio.");
    }

    return errors;
  }

  getRecipients() {
    const raw = localStorage.getItem(localStorageKeys.REGISTERED_RECIPIENTS);

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (r) =>
          typeof r === "object" &&
          typeof r.email === "string" &&
          r.email.trim() !== ""
      );
    } catch {
      return [];
    }
  }

  async sendMessage(data) {
    const recipients = this.getRecipients();

    if (recipients.length === 0) {
      throw new Error("Nenhum beneficiário válido com e-mail encontrado.");
    }

    const selectedRecipients =
      recipients.length > 5
        ? recipients.sort(() => 0.5 - Math.random()).slice(0, 5)
        : recipients;

    for (const recipient of selectedRecipients) {
      const sendEmail = new SendEmail(
        config.ENDPOINTS.SEND_EMAIL,
        config.EMAIL_CONFIG.TEMPLATE_ID.GENERIC_EMAIL,
        config.EMAIL_CONFIG.SERVICE_ID,
        config.EMAIL_CONFIG.USER_ID,
        {
          email: recipient.email,
          subject: data.subject,
          message: data.message,
        }
      );

      const response = await sendEmail.send();
      if (!response) {
        throw new Error(`Erro ao enviar e-mail para ${recipient.email}`);
      }
    }

    const sentEmails =
      JSON.parse(localStorage.getItem(localStorageKeys.SENT_EMAILS)) || [];
    sentEmails.push({
      id: crypto.randomUUID(),
      subject: data.subject,
      message: data.message,
      sentDate: new Date().toISOString(),
    });
    localStorage.setItem(
      localStorageKeys.SENT_EMAILS,
      JSON.stringify(sentEmails)
    );
  }

  clearData() {
    document.getElementById("subject").value = "";
    $("#message").summernote("code", "");
  }
}
