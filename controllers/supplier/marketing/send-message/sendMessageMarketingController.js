import { SendMessageMarketingModel } from "../../../../models/supplier/marketing/send-message/sendMessageMarketingModel.js";
import { toastService } from "../../../../assets/js/utils/ToastService.js";

export class SendMessageMarketingController {
  constructor(sendButtonId) {
    this.model = new SendMessageMarketingModel();
    this.sendButton = document.getElementById(sendButtonId);
  }

  init() {
    $("#message").summernote({
      placeholder: "Digite sua mensagem de marketing...",
      tabsize: 2,
      height: 120,
      toolbar: [
        ["style", ["style"]],
        ["font", ["fontname", "bold", "underline", "clear"]],
        ["fontsize", ["fontsize"]],
        ["color", ["color"]],
        ["para", ["ul", "ol", "paragraph"]],
        ["table", ["table"]],
        ["insert", ["link", "picture"]],
        ["view", ["fullscreen", "codeview", "help"]],
      ],
      fontNames: [
        "Arial",
        "Arial Black",
        "Comic Sans MS",
        "Courier New",
        "Merriweather",
        "Tahoma",
        "Times New Roman",
        "Verdana",
      ],
    });

    this.sendButton.addEventListener("click", () => this.handleSend());
  }

  async handleSend() {
    this.sendButton.setAttribute("disabled", true);

    const data = this.model.getData();
    const validationErrors = this.model.validateData(data);

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        toastService.error({
          title: "Erro de validação",
          message: error,
          icon: "bi bi-exclamation-circle-fill",
        });
      });
      this.sendButton.removeAttribute("disabled");
      return;
    }

    try {
      await this.model.sendMessage(data);

      toastService.success({
        title: "Sucesso!",
        message: "Mensagem enviada com sucesso!",
        icon: "bi bi-check-circle-fill",
      });

      this.model.clearData();
    } catch (error) {
      toastService.error({
        title: "Erro ao enviar",
        message: error.message || "Ocorreu um erro ao enviar a mensagem.",
        icon: "bi bi-exclamation-circle-fill",
      });
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      this.sendButton.removeAttribute("disabled");
    }
  }
}
